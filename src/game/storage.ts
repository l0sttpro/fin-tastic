import type {
  AttemptOutcome,
  PlayerStats,
  PromptResult,
  RunState,
  SavedAttempt,
  SavedRun,
  TierId,
} from './types';
import { TIERS, TIER_ORDER } from './tiers.ts';

const STATS_KEY = 'fin-tastic.stats.v1';
const RUN_KEY = 'fin-tastic.run.v1';

/**
 * Tier ids that existed before the scoring system moved to five tiers. Saves
 * and lifetime stats written by the old build are mapped onto their nearest
 * new tier instead of being thrown away.
 */
const LEGACY_TIER_IDS: Record<string, TierId> = {
  clever: 'plankton',
  schooler: 'reef-rookie',
  rare: 'jawsome',
  deepcut: 'fin-omenal',
};

function toTierId(value: unknown): TierId | null {
  if (typeof value !== 'string') return null;
  if (TIER_ORDER.includes(value as TierId)) return value as TierId;
  return LEGACY_TIER_IDS[value] ?? null;
}

export function emptyStats(): PlayerStats {
  return {
    dives: 0,
    endlessRuns: 0,
    totalPrompts: 0,
    bestDepth: 0,
    bestScore: 0,
    bestEndlessDepth: 0,
    tierCounts: Object.fromEntries(TIER_ORDER.map((tier) => [tier, 0])) as Record<
      TierId,
      number
    >,
    usedAnswers: [],
    dailyStreak: 0,
    lastDailyPlayed: null,
  };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStats(): PlayerStats {
  const base = emptyStats();
  if (typeof localStorage === 'undefined') return base;
  const stored = safeParse<Partial<PlayerStats>>(localStorage.getItem(STATS_KEY), {});

  // Rebuild the tally from whatever keys are stored, folding legacy tiers
  // into their replacements. Unknown keys are ignored.
  const tierCounts = { ...base.tierCounts };
  for (const [id, count] of Object.entries(stored.tierCounts ?? {})) {
    const tier = toTierId(id);
    if (tier && typeof count === 'number' && Number.isFinite(count)) {
      tierCounts[tier] += count;
    }
  }

  return {
    ...base,
    ...stored,
    tierCounts,
    usedAnswers: stored.usedAnswers ?? [],
  };
}

export function saveStats(stats: PlayerStats): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* storage full or blocked — the game still works, it just forgets. */
  }
}

export function recordRun(stats: PlayerStats, run: {
  mode: 'dive' | 'endless';
  depth: number;
  score: number;
  tiers: Partial<Record<TierId, number>>;
  answered: string[];
}): PlayerStats {
  const next: PlayerStats = {
    ...stats,
    tierCounts: { ...stats.tierCounts },
    usedAnswers: [...stats.usedAnswers],
  };

  if (run.mode === 'dive') {
    next.dives += 1;
    next.bestDepth = Math.max(next.bestDepth, run.depth);
    next.bestScore = Math.max(next.bestScore, run.score);
  } else {
    next.endlessRuns += 1;
    next.bestEndlessDepth = Math.max(next.bestEndlessDepth, run.depth);
  }

  next.totalPrompts += run.answered.length;

  for (const tier of TIER_ORDER) {
    const count = run.tiers[tier] ?? 0;
    if (count) next.tierCounts[tier] = (next.tierCounts[tier] ?? 0) + count;
  }

  const known = new Set(next.usedAnswers);
  for (const answer of run.answered) known.add(answer);
  next.usedAnswers = [...known].slice(-600);

  return next;
}

export function recordDailyPlay(stats: PlayerStats, today: string): PlayerStats {
  if (stats.lastDailyPlayed === today) return stats;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  const streak = stats.lastDailyPlayed === yesterdayKey ? stats.dailyStreak + 1 : 1;
  return { ...stats, dailyStreak: streak, lastDailyPlayed: today };
}

/**
 * Strips a result down to the bits worth keeping in localStorage. Only the
 * prompt *id* is stored — the prompt itself is looked up in the bank when the
 * run is restored, so a saved run stays tiny even after hundreds of answers.
 */
export function toSavedAttempt(result: PromptResult): SavedAttempt {
  return {
    promptId: result.prompt.id,
    raw: result.raw,
    answer: result.answer,
    tier: result.tier,
    points: result.points,
    outcome: result.outcome,
    secondsUsed: Math.round(result.secondsUsed * 10) / 10,
    hinted: result.hinted,
    repeat: result.repeat,
  };
}

export function saveRun(state: RunState, promptIds: string[] = []): void {
  if (typeof localStorage === 'undefined') return;
  const run: SavedRun = {
    mode: state.mode,
    seed: state.seed,
    index: state.index,
    score: state.score,
    air: state.air,
    results: state.results.map(toSavedAttempt),
    attempts: state.attempts.map(toSavedAttempt),
    promptIds,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(run));
  } catch {
    /* ignore */
  }
}

const OUTCOMES: AttemptOutcome[] = ['accepted', 'refused', 'timeout'];

/**
 * Normalises one entry of a saved run. Handles older saves, which embedded
 * the whole prompt object and used a `refused` flag instead of an outcome.
 */
function normaliseAttempt(raw: unknown): SavedAttempt | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;

  const embedded = entry.prompt as { id?: unknown } | undefined;
  const promptId =
    typeof entry.promptId === 'string'
      ? entry.promptId
      : typeof embedded?.id === 'string'
        ? embedded.id
        : null;
  if (!promptId) return null;

  const rawText = typeof entry.raw === 'string' ? entry.raw : '';
  const answer = typeof entry.answer === 'string' ? entry.answer : null;
  const tierId = toTierId(entry.tier);

  let outcome: AttemptOutcome;
  if (OUTCOMES.includes(entry.outcome as AttemptOutcome)) {
    outcome = entry.outcome as AttemptOutcome;
  } else if (entry.refused === true) {
    outcome = 'refused';
  } else if (tierId) {
    outcome = 'accepted';
  } else if (rawText) {
    outcome = 'refused';
  } else {
    outcome = 'timeout';
  }

  return {
    promptId,
    raw: rawText,
    answer,
    tier: tierId,
    // Recompute from the tier so saves from the old scoring scale resume on
    // the current one.
    points: tierId ? TIERS[tierId].points : 0,
    outcome,
    secondsUsed: typeof entry.secondsUsed === 'number' ? entry.secondsUsed : 0,
    hinted: entry.hinted === true,
    repeat: entry.repeat === true,
  };
}

export function loadRun(): SavedRun | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = safeParse<Record<string, unknown> | null>(localStorage.getItem(RUN_KEY), null);
  if (!raw) return null;

  // Runs older than a week are not worth resuming.
  if (typeof raw.savedAt !== 'number' || Date.now() - raw.savedAt > 7 * 24 * 60 * 60 * 1000) {
    clearRun();
    return null;
  }

  const results = Array.isArray(raw.results)
    ? raw.results.map(normaliseAttempt).filter((a): a is SavedAttempt => a !== null)
    : [];
  const attempts = Array.isArray(raw.attempts)
    ? raw.attempts.map(normaliseAttempt).filter((a): a is SavedAttempt => a !== null)
    : results;

  // The score is the sum of the resolved prompts. Recomputing it keeps runs
  // created under the old point scale consistent with the five-tier system.
  const resolvedScore = results.reduce(
    (total, result) => total + (result.outcome === 'accepted' ? result.points : 0),
    0,
  );
  const score =
    results.length > 0
      ? resolvedScore
      : typeof raw.score === 'number'
        ? raw.score
        : 0;

  return {
    mode: raw.mode === 'endless' || raw.mode === 'daily' ? raw.mode : 'dive',
    seed: typeof raw.seed === 'number' ? raw.seed : 1,
    index: typeof raw.index === 'number' ? raw.index : 0,
    score,
    air: typeof raw.air === 'number' ? raw.air : 3,
    results,
    attempts,
    promptIds: Array.isArray(raw.promptIds)
      ? raw.promptIds.filter((id): id is string => typeof id === 'string')
      : undefined,
    savedAt: raw.savedAt,
  };
}

export function clearRun(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(RUN_KEY);
}
