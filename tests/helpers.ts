import type { Prompt, TierId } from '../src/game/types.ts';
import { TIER_ORDER } from '../src/game/tiers.ts';

interface PromptOptions {
  id?: string;
  category?: string;
  aliases?: Record<string, string>;
}

/** Builds a tiny prompt fixture with empty buckets for anything not supplied. */
export function makePrompt(
  buckets: Partial<Record<TierId, string[]>>,
  options: PromptOptions = {},
): Prompt {
  const answers = {} as Record<TierId, string[]>;
  for (const tier of TIER_ORDER) answers[tier] = [...(buckets[tier] ?? [])];

  return {
    id: options.id ?? 'fixture',
    text: 'A test prompt',
    category: options.category ?? 'Test',
    hint: 'A test hint',
    answers,
    aliases: options.aliases ?? {},
  };
}

export function tierAnswer(prompt: Prompt, tier: TierId): string {
  const answer = prompt.answers[tier][0];
  if (!answer) throw new Error(`Fixture has no answer in tier "${tier}"`);
  return answer;
}
