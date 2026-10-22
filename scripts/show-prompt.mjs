/**
 * Prints a prompt from the bank. Run with `npm run show -- <id> [<id>…]`.
 *
 * Shows the *sanitised* prompt — the one the game actually uses — so the
 * tier lists here are the tier lists in play.
 */
import { PROMPTS_SANITISED, TIER_IDS } from '../src/data/promptBank.ts';

const ids = process.argv.slice(2);

if (ids.length === 0) {
  console.log('usage: node --experimental-strip-types scripts/show-prompt.mjs <id>…');
  console.log('\navailable prompts:');
  console.log(PROMPTS_SANITISED.map((p) => `  ${p.id}`).join('\n'));
  process.exit(0);
}

for (const id of ids) {
  const prompt = PROMPTS_SANITISED.find((p) => p.id === id);
  if (!prompt) {
    console.log(`=== ${id}: NOT FOUND ===`);
    continue;
  }
  console.log(`=== ${prompt.id} ===`);
  console.log(`  Q: ${prompt.text}`);
  console.log(`  category: ${prompt.category}`);
  console.log(`  hint: ${prompt.hint}`);
  for (const tier of TIER_IDS) {
    const bucket = prompt.answers[tier] ?? [];
    console.log(`  ${tier.padEnd(10)} (${bucket.length}) ${bucket.join(', ')}`);
  }
  const aliases = Object.entries(prompt.aliases ?? {});
  if (aliases.length > 0) {
    console.log(`  aliases: ${aliases.map(([a, t]) => `${a} -> ${t}`).join(', ')}`);
  }
  console.log('');
}
