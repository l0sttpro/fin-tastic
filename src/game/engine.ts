import type {
  GameMode,
  Prompt,
  PromptResult,
  RunEnding,
  RunState,
  SavedAttempt,
  SavedRun,
  TierId,
} from './types.ts';
import { PROMPT_BY_ID, PROMPTS_SANITISED } from '../data/promptBank.ts';
import { gradeAnswer, hintAnswer, normalise } from './scoring.ts';
import {
  METRES_PER_POINT,
  PROMPTS_PER_DIVE,
  SECONDS_PER_PROMPT,
  STARTING_AIR,
  TIERS,
  TIER_ORDER,
  tierIndex,
} from './tiers.ts';
import { dailySeed, mulberry32, randomSeed } from './rng.ts';
import { selectDiveQueue, selectEndlessPrompt } from './selection.ts';
import { zoneForDepth } from './zones.ts';

export const MAX_AIR = 5;

/** Seconds burned per hint. */
export const HINT_SECOND_COST = 8;

export type EngineEvent =
  | { type: 'run-start'; state: RunState }
  | { type: 'prompt-start'; prompt: Prompt; index: number; total: number; remaining: number }
  | { type: 'tick'; remaining: number; fraction: number }
  | { type: 'graded'; result: PromptResult; accepted: boolean }
  | { type: 'hint'; text: string; cappedTier: TierId | null }
  | { type: 'timeout'; prompt: Prompt }
  | { type: 'state'; state: RunState }
  | { type: 'run-end'; state: RunState; ending: RunEnding };

type Listener = (event: EngineEvent) => void;

/**
 * Average tier weight of a prompt's answer list. Higher means the prompt
 * pushes players toward more obscure answers.
 */
function difficultyOf(prompt: Prompt): number {
  let total = 0;
  let count = 0;
  for (const tier of TIER_ORDER) {
    const weight = tierIndex(tier) + 1;
    for (const _ of prompt.answers[tier]) {
      total += weight;
      count += 1;
    }
  }
  return count === 0 ? 0 : total / count;
}

const DIFFICULTY = new Map<string, number>(
  PROMPTS_SANITISED.map((prompt) => [prompt.id, difficultyOf(prompt)]),
);

export class GameEngine {
  private listeners: Listener[] = [];
  private state: RunState;
  private rng: () => number;
  /** Prompt queue for the current run. */
  private queue: Prompt[] = [];
  /** Prompts already used in this run. */
  private usedPromptIds = new Set<string>();
  /** Normalised answers already given in this run. */
  private usedAnswers = new Set<string>();
  private timer: number | null = null;
  private deadline = 0;
  private startedAt = 0;
  /** True while a confirmation is open; the clock is frozen. */
  private paused = false;
  private pauseStartedAt = 0;
  /** Tier ceiling imposed by a spent hint. */
  private tierCap: TierId | null = null;
  /** Whether the current prompt has already been graded (accepted). */
  private locked = false;
  /** Last prompt dealt, used to avoid immediate repeats. */
  private lastPromptId: string | null = null;
  private lastCategory: string | null = null;

  constructor() {
    const seed = randomSeed();
    this.rng = mulberry32(seed);
    this.state = {
      mode: 'dive',
      runId: 0,
      seed,
      index: 0,
      results: [],
      attempts: [],
      score: 0,
      depth: 0,
      air: STARTING_AIR,
      finished: false,
    };
  }

  on(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: EngineEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  get current(): RunState {
    return this.state;
  }

  /** The prompt the player is looking at right now, if any. */
  get currentPrompt(): Prompt | null {
    return this.queue[this.state.index] ?? null;
  }

  /** The full prompt queue, used by storage to restore the exact order. */
  get queueIds(): string[] {
    return this.queue.map((prompt) => prompt.id);
  }

  // -- lifecycle ---------------------------------------------------------

  start(mode: GameMode): void {
    const seed = mode === 'daily' ? dailySeed() : randomSeed();
    this.stopTimer();
    this.paused = false;
    this.rng = mulberry32(seed);
    this.usedPromptIds.clear();
    this.usedAnswers.clear();
    this.tierCap = null;
    this.lastPromptId = null;
    this.lastCategory = null;

    this.state = {
      mode,
      runId: this.state.runId + 1,
      seed,
      index: 0,
      results: [],
      attempts: [],
      score: 0,
      depth: 0,
      air: STARTING_AIR,
      finished: false,
    };

    this.queue = mode === 'endless' ? [this.nextEndlessPrompt()] : this.buildDiveQueue(seed);
    this.state.promptIds = this.queue.map((prompt) => prompt.id);
    this.emit({ type: 'run-start', state: this.state });
    this.beginPrompt();
  }

  /**
   * Rebuilds a saved run so the player can pick up where they left off.
   *
   * The saved run only carries prompt *ids*; the prompts themselves are
   * looked up in the bank again, so a restored run always grades against the
   * current data.
   *
   * Newer saves carry the exact prompt queue for both modes. Older saves have
   * no queue: a dive is rebuilt from its seed, while an endless run is rebuilt
   * from the prompts already played and dealt a fresh one on top.
   */
  restore(snapshot: SavedRun): void {
    this.stopTimer();
    this.paused = false;
    this.rng = mulberry32(snapshot.seed);
    this.usedPromptIds.clear();
    this.usedAnswers.clear();
    this.tierCap = null;
    this.locked = false;
    this.lastPromptId = null;
    this.lastCategory = null;

    const results = snapshot.results
      .map((attempt) => this.resolveAttempt(attempt))
      .filter((result): result is PromptResult => result !== null);
    const attempts = (snapshot.attempts ?? snapshot.results)
      .map((attempt) => this.resolveAttempt(attempt))
      .filter((result): result is PromptResult => result !== null);

    // A run can be saved between answering a prompt and moving on, so the
    // saved index can point at an already-resolved prompt. Resume at the
    // first prompt that has not been resolved yet.
    const resumeIndex = Math.max(snapshot.index, results.length);

    this.state = {
      mode: snapshot.mode,
      runId: this.state.runId + 1,
      seed: snapshot.seed,
      index: resumeIndex,
      results,
      attempts,
      score: snapshot.score,
      depth: snapshot.score * METRES_PER_POINT,
      air: snapshot.air,
      finished: false,
    };

    for (const result of results) {
      this.usedPromptIds.add(result.prompt.id);
      if (result.answer) this.usedAnswers.add(normalise(result.answer));
    }

    const savedQueue = (snapshot.promptIds ?? [])
      .map((id) => PROMPT_BY_ID.get(id))
      .filter((prompt): prompt is Prompt => prompt !== undefined);

    if (savedQueue.length > 0) {
      // New saves carry the exact queue, so the next prompt is always the one
      // the player was looking at when they closed the tab.
      this.queue = savedQueue;
    } else if (snapshot.mode === 'endless') {
      // Older saves had no queue. Rebuild from the prompts already played and
      // deal a fresh one on top.
      this.queue = results.map((result) => result.prompt).slice(0, resumeIndex);
      while (this.queue.length < resumeIndex) {
        this.queue.push(this.nextEndlessPrompt());
      }
      this.queue.push(this.nextEndlessPrompt());
    } else {
      this.queue = this.buildDiveQueue(snapshot.seed);
    }

    const lastKnown = this.queue[this.queue.length - 1];
    this.lastPromptId = lastKnown?.id ?? null;
    this.lastCategory = lastKnown?.category ?? null;

    if (snapshot.mode === 'endless') {
      while (this.queue.length <= this.state.index) {
        this.queue.push(this.nextEndlessPrompt());
      }
      if (this.queue.length === this.state.index) {
        this.queue.push(this.nextEndlessPrompt());
      }
    } else {
      // Fill any missing tail with fresh balanced picks. Older saves may have
      // fewer than seven ids.
      while (this.queue.length < PROMPTS_PER_DIVE) {
        const known = new Set(this.queue.map((prompt) => prompt.id));
        const extra = selectDiveQueue(
          PROMPTS_SANITISED.filter((prompt) => !known.has(prompt.id)),
          snapshot.seed + this.queue.length,
          PROMPTS_PER_DIVE - this.queue.length,
        );
        if (extra.length === 0) break;
        this.queue.push(...extra);
      }
      // Safety net: never point past the end of the queue.
      if (this.state.index >= this.queue.length) {
        this.state.index = Math.max(0, this.queue.length - 1);
      }
    }

    for (const prompt of this.queue) this.usedPromptIds.add(prompt.id);
    const current = this.queue[this.state.index] ?? this.queue[this.queue.length - 1];
    this.lastPromptId = current?.id ?? null;
    this.lastCategory = current?.category ?? null;
    this.state.promptIds = this.queue.map((prompt) => prompt.id);

    // A dive can be saved after its final answer but before the player hits
    // Continue. There is no next prompt to restore, so finish the run cleanly
    // instead of re-asking an already-resolved prompt.
    if (snapshot.mode !== 'endless' && results.length >= PROMPTS_PER_DIVE) {
      this.state.index = PROMPTS_PER_DIVE;
      this.state.finished = true;
      this.state.ending = { kind: 'complete' };
      this.emit({ type: 'run-start', state: this.state });
      this.emit({
        type: 'run-end',
        state: this.state,
        ending: { kind: 'complete' },
      });
      return;
    }

    this.emit({ type: 'run-start', state: this.state });
    this.beginPrompt();
  }

  /** Rebuilds a full result from a saved one, looking the prompt up by id. */
  private resolveAttempt(attempt: SavedAttempt): PromptResult | null {
    const prompt = PROMPT_BY_ID.get(attempt.promptId);
    if (!prompt) return null;
    return {
      prompt,
      raw: attempt.raw ?? '',
      answer: attempt.answer ?? null,
      tier: attempt.tier ?? null,
      points: attempt.points ?? 0,
      outcome: attempt.outcome ?? (attempt.tier ? 'accepted' : 'timeout'),
      secondsUsed: attempt.secondsUsed ?? 0,
      hinted: Boolean(attempt.hinted),
      repeat: Boolean(attempt.repeat),
    };
  }

  private buildDiveQueue(seed: number): Prompt[] {
    return selectDiveQueue(PROMPTS_SANITISED, seed, PROMPTS_PER_DIVE);
  }

  /**
   * Chooses the next endless prompt. Deeper water means harder prompts: we
   * require a minimum difficulty that grows with depth.
   */
  private nextEndlessPrompt(): Prompt {
    const depth = this.state.depth;
    const minDifficulty = 1.6 + Math.min(2.6, depth / 9000);
    const categoryCounts = new Map<string, number>();
    for (const result of this.state.results) {
      const category = result.prompt.category;
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
    const chosen = selectEndlessPrompt({
      prompts: PROMPTS_SANITISED,
      rng: this.rng,
      usedPromptIds: this.usedPromptIds,
      categoryCounts,
      lastPromptId: this.lastPromptId,
      lastCategory: this.lastCategory,
      minDifficulty,
      difficultyOf: (prompt) => DIFFICULTY.get(prompt.id) ?? 0,
    });
    this.usedPromptIds.add(chosen.id);
    this.lastPromptId = chosen.id;
    this.lastCategory = chosen.category;
    return chosen;
  }

  private beginPrompt(): void {
    const prompt = this.currentPrompt;
    if (!prompt) return;
    this.locked = false;
    this.tierCap = null;
    this.paused = false;
    this.startedAt = performance.now();
    this.deadline = this.startedAt + SECONDS_PER_PROMPT * 1000;
    this.emit({
      type: 'prompt-start',
      prompt,
      index: this.state.index,
      total: this.state.mode === 'endless' ? Infinity : PROMPTS_PER_DIVE,
      remaining: SECONDS_PER_PROMPT,
    });
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = window.setInterval(() => {
      if (this.paused) return;
      const remaining = Math.max(0, (this.deadline - performance.now()) / 1000);
      this.emit({ type: 'tick', remaining, fraction: remaining / SECONDS_PER_PROMPT });
      if (remaining <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 100);
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Seconds already spent on the current prompt. */
  get secondsUsed(): number {
    const now = this.paused ? this.pauseStartedAt : performance.now();
    return (now - this.startedAt) / 1000;
  }

  get remainingSeconds(): number {
    const now = this.paused ? this.pauseStartedAt : performance.now();
    return Math.max(0, (this.deadline - now) / 1000);
  }

  /**
   * Freezes the prompt clock, e.g. while a typo confirmation is open. Time
   * spent deciding whether to accept a correction should not cost the player.
   */
  pauseTimer(): void {
    if (this.paused || this.locked || this.state.finished) return;
    this.paused = true;
    this.pauseStartedAt = performance.now();
    this.stopTimer();
  }

  /** Resumes a clock frozen by `pauseTimer`, without charging for the pause. */
  resumeTimer(): void {
    if (!this.paused) return;
    this.settlePause();
    if (this.locked || this.state.finished) return;
    this.startTimer();
  }

  /**
   * Folds paused wall-clock time out of the active timer. Called by resume and
   * by submit so a caller cannot accidentally charge the player for a pause.
   */
  private settlePause(): void {
    if (!this.paused) return;
    const pausedFor = performance.now() - this.pauseStartedAt;
    this.deadline += pausedFor;
    this.startedAt += pausedFor;
    this.paused = false;
  }

  // -- actions -----------------------------------------------------------

  /**
   * Submits an answer. A refused answer costs only the seconds it took and
   * leaves the prompt open; the player can try again with what's left.
   */
  submit(raw: string): PromptResult | null {
    if (this.state.finished || this.locked) return null;
    const prompt = this.currentPrompt;
    if (!prompt) return null;

    this.settlePause();
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const graded = gradeAnswer(prompt, trimmed, this.usedAnswers);
    const secondsUsed = Math.min(SECONDS_PER_PROMPT, this.secondsUsed);

    if (!graded.accepted) {
      const refused: PromptResult = {
        prompt,
        raw: trimmed,
        answer: null,
        tier: null,
        points: 0,
        outcome: 'refused',
        secondsUsed,
        hinted: this.tierCap !== null,
        repeat: false,
      };
      // Refusals are logged, but the prompt stays open: the player can try
      // again with whatever is left of the clock.
      this.state.attempts.push(refused);
      this.emit({ type: 'graded', result: refused, accepted: false });
      // Save straight away so the refusal survives a refresh.
      this.emit({ type: 'state', state: this.state });
      return refused;
    }

    let tier = graded.tier!;
    if (this.tierCap !== null) {
      const capIndex = tierIndex(this.tierCap);
      const actualIndex = tierIndex(tier);
      if (actualIndex > capIndex) tier = this.tierCap;
    }

    const points = TIERS[tier].points;

    const result: PromptResult = {
      prompt,
      raw: trimmed,
      answer: graded.answer,
      tier,
      points,
      outcome: 'accepted',
      secondsUsed,
      hinted: this.tierCap !== null,
      repeat: graded.repeat,
    };

    this.usedAnswers.add(normalise(graded.answer!));
    this.state.attempts.push(result);
    this.state.results.push(result);
    this.state.score += points;
    this.state.depth = this.state.score * METRES_PER_POINT;

    if (this.state.mode === 'endless') {
      if (tier === 'fintastic') {
        this.state.air = Math.min(MAX_AIR, this.state.air + 1);
      }
    }

    this.locked = true;
    this.stopTimer();
    this.emit({ type: 'graded', result, accepted: true });
    this.emit({ type: 'state', state: this.state });
    return result;
  }

  /** Spends time (and a tier) to reveal a nudge. */
  useHint(): { text: string; cappedTier: TierId | null } | null {
    if (this.state.finished || this.locked || this.paused) return null;
    const prompt = this.currentPrompt;
    if (!prompt) return null;
    if (this.tierCap !== null) return null; // one hint per prompt

    const remaining = this.remainingSeconds;
    if (remaining <= HINT_SECOND_COST) return null;

    const hint = hintAnswer(prompt);
    this.tierCap = hint.cappedTier;
    this.deadline -= HINT_SECOND_COST * 1000;

    this.emit({ type: 'hint', text: hint.text, cappedTier: hint.cappedTier });
    return hint;
  }

  private handleTimeout(): void {
    if (this.paused) return;
    const prompt = this.currentPrompt;
    if (!prompt || this.locked) return;

    const result: PromptResult = {
      prompt,
      raw: '',
      answer: null,
      tier: null,
      points: 0,
      outcome: 'timeout',
      secondsUsed: SECONDS_PER_PROMPT,
      hinted: this.tierCap !== null,
      repeat: false,
    };
    this.state.attempts.push(result);
    this.state.results.push(result);
    this.locked = true;
    this.emit({ type: 'timeout', prompt });
    this.emit({ type: 'graded', result, accepted: false });

    if (this.state.mode === 'endless') {
      this.state.air -= 1;
      if (this.state.air <= 0) {
        this.finish({ kind: 'out-of-air', fatalPrompt: prompt });
        return;
      }
    }

    // The prompt is over, but the player still gets to see the card and
    // decide when to carry on.
    this.emit({ type: 'state', state: this.state });
  }

  /** Moves to the next prompt. */
  advance(): void {
    if (this.state.finished) return;

    if (this.state.mode === 'endless') {
      this.state.index += 1;
      this.queue.push(this.nextEndlessPrompt());
      this.state.promptIds = this.queue.map((prompt) => prompt.id);
      this.emit({ type: 'state', state: this.state });
      this.beginPrompt();
      return;
    }

    this.state.index += 1;
    if (this.state.index >= PROMPTS_PER_DIVE) {
      this.finish({ kind: 'complete' });
      return;
    }
    this.emit({ type: 'state', state: this.state });
    this.beginPrompt();
  }

  /** Ends the run early. */
  abort(): void {
    if (this.state.finished) return;
    this.stopTimer();
    this.finish({ kind: 'aborted' });
  }

  private finish(ending: RunEnding): void {
    this.stopTimer();
    this.paused = false;
    this.state.finished = true;
    this.state.ending = ending;
    this.emit({ type: 'state', state: this.state });
    this.emit({ type: 'run-end', state: this.state, ending });
  }

  // -- reporting ---------------------------------------------------------

  get zone() {
    return zoneForDepth(this.state.depth);
  }

  get tierCounts(): Record<TierId, number> {
    const counts = Object.fromEntries(TIER_ORDER.map((tier) => [tier, 0])) as Record<
      TierId,
      number
    >;
    for (const result of this.state.results) {
      if (result.tier) counts[result.tier] += 1;
    }
    return counts;
  }

  get acceptedCount(): number {
    return this.state.results.filter((r) => r.tier !== null).length;
  }

  get refusedCount(): number {
    return this.state.attempts.filter((r) => r.outcome === 'refused').length;
  }
}

export { PROMPTS_SANITISED };
