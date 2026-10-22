import type { TierId } from '../../game/types.ts';

/**
 * Additional accepted answers for one prompt, bucketed by scoring tier.
 *
 * Extras are appended after the prompt's original answers. If an extra is
 * already present in an earlier tier, the original (more common) tier wins.
 */
export type ExtraAnswers = Partial<Record<TierId, readonly string[]>>;
