/**
 * Core type definitions for the Krillion Dive game.
 */

/** The six rarity tiers an accepted answer can land in, worst first. */
export type TierId =
  | 'plankton'
  | 'clever'
  | 'schooler'
  | 'rare'
  | 'deepcut'
  | 'krillion';

export interface TierMeta {
  id: TierId;
  name: string;
  points: number;
  /** Depth in metres gained per answer in this tier. */
  metres: number;
  /** Short flavour text shown on the result card. */
  blurb: string;
  /** Approximate share of the crowd that gives an answer in this tier. */
  crowdShare: string;
  /** Accent colour (CSS colour) used for the tier glow. */
  color: string;
  /** Emblem glyph. */
  emblem: string;
}

export interface Prompt {
  id: string;
  /** The prompt text shown to the player. */
  text: string;
  /** Broad category, shown as a chip before you use a hint. */
  category: string;
  /** Narrower category revealed by the hint. */
  hint: string;
  /** Accepted answers, bucketed by rarity tier. */
  answers: Record<TierId, string[]>;
  /**
   * Alternative spellings / abbreviations that should resolve to a canonical
   * answer. Keys are matched against the normalised player input.
   */
  aliases?: Record<string, string>;
}

/** How a single attempt at a prompt ended. */
export type AttemptOutcome = 'accepted' | 'refused' | 'timeout';

/** A single answered prompt inside a run. */
export interface PromptResult {
  prompt: Prompt;
  /** Exactly what the player typed. */
  raw: string;
  /** Canonical accepted answer, when the answer was accepted. */
  answer: string | null;
  tier: TierId | null;
  points: number;
  /** How the attempt ended. */
  outcome: AttemptOutcome;
  /** Seconds burned on this prompt, including refusals. */
  secondsUsed: number;
  /** Whether a hint was spent. */
  hinted: boolean;
  /** True when the player had already used this answer earlier in the run. */
  repeat: boolean;
}

export type GameMode = 'dive' | 'endless' | 'daily';

export interface RunState {
  mode: GameMode;
  /** Monotonic identifier for this run (dive number). */
  runId: number;
  /** Seed for the prompt order, so a run can be replayed exactly. */
  seed: number;
  index: number;
  /** One entry per resolved prompt, in prompt order (accepted or timed out). */
  results: PromptResult[];
  /** Every attempt the player made, refused answers included, in order. */
  attempts: PromptResult[];
  score: number;
  /** Depth in metres. */
  depth: number;
  /** Endless mode: remaining tanks of air. */
  air: number;
  /** True once the run is over. */
  finished: boolean;
  /** Set when the run ends, for the summary screen. */
  ending?: RunEnding;
}

export interface RunEnding {
  kind: 'complete' | 'out-of-air' | 'aborted';
  /** The prompt the player died on, if any. */
  fatalPrompt?: Prompt;
}

export interface PlayerStats {
  dives: number;
  endlessRuns: number;
  totalPrompts: number;
  bestDepth: number;
  bestScore: number;
  bestEndlessDepth: number;
  /** Count of each tier ever landed on. */
  tierCounts: Record<TierId, number>;
  /** Answers the player has already used, so we can flag repeats. */
  usedAnswers: string[];
  /** ISO date strings of days the daily was played. */
  dailyStreak: number;
  lastDailyPlayed: string | null;
}

/**
 * A lightweight record of an attempt. Only the prompt *id* is stored, so a
 * saved run stays small in localStorage even with hundreds of answers.
 */
export interface SavedAttempt {
  promptId: string;
  raw: string;
  answer: string | null;
  tier: TierId | null;
  points: number;
  outcome: AttemptOutcome;
  secondsUsed: number;
  hinted: boolean;
  repeat: boolean;
}

export interface SavedRun {
  mode: GameMode;
  seed: number;
  index: number;
  score: number;
  air: number;
  results: SavedAttempt[];
  /** Every attempt, refused answers included. */
  attempts?: SavedAttempt[];
  savedAt: number;
}
