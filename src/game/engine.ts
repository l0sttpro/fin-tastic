import type {
  GameMode,
  Prompt,
  PromptResult,
  RunEnding,
  RunState,
  SavedAttempt,
  SavedRun,
  TierId,
} from './types';
import { PROMPT_BY_ID, PROMPTS_SANITISED } from '../data/promptBank';
import { gradeAnswer, hintAnswer, normalise } from './scoring';
import {
  METRES_PER_POINT,
  PROMPTS_PER_DIVE,
  SECONDS_PER_PROMPT,
  STARTING_AIR,
  TIER_ORDER,
  tierIndex,
} from './tiers';
import { dailySeed, mulberry32, randomSeed, shuffle } from './rng';
import { zoneForDepth } from './zones';

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

const BY_DIFFICULTY = PROMPTS_SANITISED.slice().sort(
  (a, b) => (DIFFICULTY.get(a.id) ?? 0) - (DIFFICULTY.get(b.id) ?? 0),
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
  /** Tier ceiling imposed by a spent hint. */
  private tierCap: TierId | null = null;
  /** Whether the current prompt has already been graded (accepted). */
  private locked = false;

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

  // -- lifecycle ---------------------------------------------------------

  start(mode: GameMode): void {
    const seed = mode === 'daily' ? dailySeed() : randomSeed();
    this.rng = mulberry32(seed);
    this.usedPromptIds.clear();
    this.usedAnswers.clear();
    this.tierCap = null;

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
   * The prompt order for a dive is derived purely from the seed, so it can be
   * reproduced exactly. The endless queue grows one prompt at a time and
   * cannot be reproduced, so it is rebuilt from the prompts already played
   * and a fresh one is dealt.
   */
  restore(snapshot: SavedRun): void {
    this.rng = mulberry32(snapshot.seed);
    this.usedPromptIds.clear();
    this.usedAnswers.clear();
    this.tierCap = null;
    this.locked = false;

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

    if (snapshot.mode === 'endless') {
      // The endless queue cannot be reproduced from the seed, so the prompts
      // already played are replayed and a fresh one is dealt on top.
      this.queue = results.map((result) => result.prompt).slice(0, resumeIndex);
      while (this.queue.length < resumeIndex) {
        this.queue.push(this.nextEndlessPrompt());
      }
      this.queue.push(this.nextEndlessPrompt());
    } else {
      this.queue = this.buildDiveQueue(snapshot.seed);
      // Safety net: never point past the end of the queue.
      if (this.state.index >= this.queue.length) {
        this.state.index = this.queue.length - 1;
      }
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
    const rng = mulberry32(seed ^ 0x9e3779b9);
    return shuffle(PROMPTS_SANITISED, rng).slice(0, PROMPTS_PER_DIVE);
  }

  /**
   * Chooses the next endless prompt. Deeper water means harder prompts: we
   * require a minimum difficulty that grows with depth.
   */
  private nextEndlessPrompt(): Prompt {
    const depth = this.state.depth;
    const minDifficulty = 1.6 + Math.min(2.6, depth / 9000);
    const hard = BY_DIFFICULTY.filter(
      (prompt) => (DIFFICULTY.get(prompt.id) ?? 0) >= minDifficulty,
    );
    const pool = hard.length >= 6 ? hard : BY_DIFFICULTY.slice(-8);
    const fresh = pool.filter((prompt) => !this.usedPromptIds.has(prompt.id));
    const candidates = fresh.length > 0 ? fresh : pool;
    const chosen = candidates[Math.floor(this.rng() * candidates.length)]!;
    this.usedPromptIds.add(chosen.id);
    return chosen;
  }

  private beginPrompt(): void {
    const prompt = this.currentPrompt;
    if (!prompt) return;
    this.locked = false;
    this.tierCap = null;
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
    return (performance.now() - this.startedAt) / 1000;
  }

  get remainingSeconds(): number {
    return Math.max(0, (this.deadline - performance.now()) / 1000);
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

    const points = { plankton: 4, clever: 8, schooler: 16, rare: 32, deepcut: 64, krillion: 100 }[tier];

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
      if (tier === 'krillion') {
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
    if (this.state.finished || this.locked) return null;
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
    const counts = {
      plankton: 0,
      clever: 0,
      schooler: 0,
      rare: 0,
      deepcut: 0,
      krillion: 0,
    } as Record<TierId, number>;
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
