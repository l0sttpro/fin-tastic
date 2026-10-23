import type { ExtraAnswers } from './extras/types.ts';
import { BATCH_1_EXTRAS } from './extras/batch1.ts';
import { BATCH_2_EXTRAS } from './extras/batch2.ts';
import { BATCH_3_EXTRAS } from './extras/batch3.ts';
import { BATCH_4_EXTRAS } from './extras/batch4.ts';
import { BATCH_5_EXTRAS } from './extras/batch5.ts';
import { BATCH_6_EXTRAS } from './extras/batch6.ts';
import { BATCH_7_EXTRAS } from './extras/batch7.ts';
import { EXTRA_ALIASES } from './extras/aliases.ts';

/**
 * Long-tail answers for the prompt bank.
 *
 * Keeping these separate from the original curated data makes the expansion
 * easy to audit. They are appended after the original answers, so if an
 * answer already exists its original (usually easier) tier still wins.
 */
export const EXTRA_ANSWERS: Record<string, ExtraAnswers> = mergeBatches(
  BATCH_1_EXTRAS,
  BATCH_2_EXTRAS,
  BATCH_3_EXTRAS,
  BATCH_4_EXTRAS,
  BATCH_5_EXTRAS,
  BATCH_6_EXTRAS,
  BATCH_7_EXTRAS,
);

/**
 * Merge batches per prompt and tier. A plain object spread would replace a
 * whole prompt entry when two batches mention the same prompt, silently
 * discarding the earlier batch's answers.
 */
function mergeBatches(
  ...batches: Record<string, ExtraAnswers>[]
): Record<string, ExtraAnswers> {
  const merged: Record<string, ExtraAnswers> = {};

  for (const batch of batches) {
    for (const [promptId, extra] of Object.entries(batch)) {
      const target = (merged[promptId] ??= {});

      for (const [tier, answers] of Object.entries(extra) as [
        keyof ExtraAnswers,
        readonly string[],
      ][]) {
        target[tier] = [...(target[tier] ?? []), ...answers];
      }
    }
  }

  return merged;
}

export { EXTRA_ALIASES };
