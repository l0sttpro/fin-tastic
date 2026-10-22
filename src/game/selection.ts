import type { Prompt } from './types.ts';
import { mulberry32 } from './rng.ts';

/**
 * Prompt selection lives here so it can be tested without a browser, a timer,
 * or an engine instance.
 */

function countCategories(prompts: readonly Prompt[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const prompt of prompts) {
    counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1);
  }
  return counts;
}

function leastUsedCategory(
  candidates: readonly Prompt[],
  counts: ReadonlyMap<string, number>,
): string[] {
  const minimum = Math.min(
    ...candidates.map((prompt) => counts.get(prompt.category) ?? 0),
  );
  return candidates
    .filter((prompt) => (counts.get(prompt.category) ?? 0) === minimum)
    .map((prompt) => prompt.id);
}

function choose(
  candidates: readonly Prompt[],
  rng: () => number,
  usedCategories: ReadonlyMap<string, number>,
  lastCategory: string | null,
  lastPromptId: string | null,
): Prompt {
  let pool = [...candidates];
  if (pool.length === 0) throw new Error('No prompt candidates available');

  // Never repeat the immediately previous prompt if there is any alternative.
  if (pool.length > 1 && lastPromptId) {
    const withoutLast = pool.filter((prompt) => prompt.id !== lastPromptId);
    if (withoutLast.length > 0) pool = withoutLast;
  }

  // Prefer a category that has appeared least in this run.
  if (pool.length > 1) {
    const leastUsed = new Set(leastUsedCategory(pool, usedCategories));
    const balanced = pool.filter((prompt) => leastUsed.has(prompt.id));
    if (balanced.length > 0) pool = balanced;
  }

  // Then avoid running two prompts from the same category back to back.
  if (pool.length > 1 && lastCategory) {
    const different = pool.filter((prompt) => prompt.category !== lastCategory);
    if (different.length > 0) pool = different;
  }

  return pool[Math.floor(rng() * pool.length)]!;
}

/**
 * Builds the seven-prompt queue for a dive. The seed makes it reproducible;
 * the category balancing keeps a single run from becoming a one-topic quiz.
 */
export function selectDiveQueue(
  prompts: readonly Prompt[],
  seed: number,
  count: number,
): Prompt[] {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const usedIds = new Set<string>();
  const usedCategories = new Map<string, number>();
  const chosen: Prompt[] = [];
  let lastCategory: string | null = null;
  let lastPromptId: string | null = null;

  while (chosen.length < count && chosen.length < prompts.length) {
    const candidates = prompts.filter((prompt) => !usedIds.has(prompt.id));
    if (candidates.length === 0) break;
    const next = choose(candidates, rng, usedCategories, lastCategory, lastPromptId);
    chosen.push(next);
    usedIds.add(next.id);
    usedCategories.set(next.category, (usedCategories.get(next.category) ?? 0) + 1);
    lastCategory = next.category;
    lastPromptId = next.id;
  }

  return chosen;
}

export interface EndlessSelectionOptions {
  prompts: readonly Prompt[];
  rng: () => number;
  usedPromptIds: ReadonlySet<string>;
  /**
   * How often each category has actually been served this run. Repeats matter
   * here: once the hard pool is exhausted, unique prompt ids no longer change,
   * so a count derived from them would freeze and stop balancing categories.
   */
  categoryCounts?: ReadonlyMap<string, number>;
  lastPromptId: string | null;
  lastCategory: string | null;
  minDifficulty: number;
  difficultyOf: (prompt: Prompt) => number;
}

/** How many hard prompts endless mode keeps available at once. */
const ENDLESS_POOL_SIZE = 80;
/** A soft cap keeps one category from filling the whole hard pool. */
const ENDLESS_CATEGORY_CAP = 5;

/**
 * Builds a hard pool that still spans categories.
 *
 * Taking the forty-eight hardest prompts alone can leave endless mode cycling
 * through three or four topics, especially once the depth threshold is high.
 * This takes the hardest prompts first but limits how many can come from one
 * category, then fills any remaining slots with the next hardest prompts.
 */
function buildEndlessPool(
  prompts: readonly Prompt[],
  minDifficulty: number,
  difficultyOf: (prompt: Prompt) => number,
): Prompt[] {
  const ranked = prompts
    .slice()
    .sort(
      (a, b) =>
        difficultyOf(b) - difficultyOf(a) || a.id.localeCompare(b.id),
    );
  const preferred = ranked.filter(
    (prompt) => difficultyOf(prompt) >= minDifficulty,
  );
  const target = Math.min(ENDLESS_POOL_SIZE, prompts.length);
  const picked: Prompt[] = [];
  const pickedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();

  const take = (candidates: readonly Prompt[], cap: number): void => {
    for (const prompt of candidates) {
      if (picked.length >= target) return;
      if (pickedIds.has(prompt.id)) continue;
      const count = categoryCounts.get(prompt.category) ?? 0;
      if (count >= cap) continue;
      picked.push(prompt);
      pickedIds.add(prompt.id);
      categoryCounts.set(prompt.category, count + 1);
    }
  };

  // Spread the hardest eligible prompts across categories first, then widen
  // through the full ranked bank if those eligible prompts are concentrated.
  take(preferred, ENDLESS_CATEGORY_CAP);
  take(ranked, ENDLESS_CATEGORY_CAP);
  // Fill any remaining slots difficulty-first.
  take(preferred, Infinity);
  take(ranked, Infinity);

  return picked;
}

/**
 * Chooses the next endless prompt. Prefers fresh, hard prompts; when the bank
 * is exhausted it recycles the hard pool rather than ending the run.
 */
export function selectEndlessPrompt({
  prompts,
  rng,
  usedPromptIds,
  categoryCounts,
  lastPromptId,
  lastCategory,
  minDifficulty,
  difficultyOf,
}: EndlessSelectionOptions): Prompt {
  const hardPool = buildEndlessPool(prompts, minDifficulty, difficultyOf);
  const fresh = hardPool.filter((prompt) => !usedPromptIds.has(prompt.id));
  const candidates = fresh.length > 0 ? fresh : hardPool;

  const usedCategories =
    categoryCounts ??
    countCategories(prompts.filter((prompt) => usedPromptIds.has(prompt.id)));

  return choose(candidates, rng, usedCategories, lastCategory, lastPromptId);
}
