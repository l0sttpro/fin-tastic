import type { ExtraAnswers } from './extras/types.ts';
import { BATCH_1_EXTRAS } from './extras/batch1.ts';
import { BATCH_2_EXTRAS } from './extras/batch2.ts';
import { BATCH_3_EXTRAS } from './extras/batch3.ts';
import { BATCH_4_EXTRAS } from './extras/batch4.ts';
import { BATCH_5_EXTRAS } from './extras/batch5.ts';

/**
 * Long-tail answers for the existing prompt bank.
 *
 * Keeping these separate from the original curated data makes the expansion
 * easy to audit. They are appended after the original answers, so if an
 * answer already exists its original (usually easier) tier still wins.
 */
export const EXTRA_ANSWERS: Record<string, ExtraAnswers> = {
  ...BATCH_1_EXTRAS,
  ...BATCH_2_EXTRAS,
  ...BATCH_3_EXTRAS,
  ...BATCH_4_EXTRAS,
  ...BATCH_5_EXTRAS,
};
