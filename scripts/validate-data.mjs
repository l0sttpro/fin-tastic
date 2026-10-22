/**
 * Data validator. Run with `npm run validate`.
 *
 * Checks the prompt bank for structural problems: missing tiers, duplicate
 * answers, dangling aliases and stray non-ASCII characters. It also replays
 * every accepted answer through the real scoring code, so an answer that
 * can never be reached (because a lower tier shadows it) is caught here
 * rather than by a confused player.
 */
import { PROMPTS, TIER_IDS, allAnswers } from '../src/data/promptBank.ts';
import { gradeAnswer, normalise } from '../src/game/scoring.ts';

let problems = 0;

function fail(message) {
  problems += 1;
  console.error(`  ✗ ${message}`);
}

console.log(`Checking ${PROMPTS.length} prompts…\n`);

const seenPromptIds = new Set();
const report = [];

for (const prompt of PROMPTS) {
  const label = prompt.id;

  if (seenPromptIds.has(prompt.id)) fail(`duplicate prompt id "${label}"`);
  seenPromptIds.add(prompt.id);

  const counts = {};
  for (const tier of TIER_IDS) {
    const bucket = prompt.answers[tier] ?? [];
    counts[tier] = bucket.length;
    if (bucket.length === 0) fail(`${label}: tier "${tier}" is empty`);
    for (const answer of bucket) {
      if (!answer.trim()) fail(`${label}: empty answer in "${tier}"`);
      if (!/^[\x20-\x7e]+$/.test(answer)) {
        fail(`${label}: non-ASCII answer "${answer}" in "${tier}"`);
      }
      if (answer !== answer.toLowerCase()) {
        fail(`${label}: answer "${answer}" in "${tier}" is not lowercase`);
      }
      if (answer.includes('?')) {
        fail(`${label}: answer "${answer}" in "${tier}" still contains "?"`);
      }
    }
  }
  report.push({ label, counts, total: allAnswers(prompt).length });

  // No answer should appear in two tiers.
  const seen = new Map();
  for (const tier of TIER_IDS) {
    for (const answer of prompt.answers[tier]) {
      const key = normalise(answer);
      if (seen.has(key)) {
        fail(`${label}: "${answer}" appears in both "${seen.get(key)}" and "${tier}"`);
      } else {
        seen.set(key, tier);
      }
    }
  }

  // Aliases must point at an answer that exists.
  const answers = new Set(allAnswers(prompt));
  for (const [alias, target] of Object.entries(prompt.aliases ?? {})) {
    if (!answers.has(target)) {
      fail(`${label}: alias "${alias}" points at missing answer "${target}"`);
    }
  }

  const total = allAnswers(prompt).length;
  if (total < 30) fail(`${label}: only ${total} answers — a bit thin`);

  // Every accepted answer must actually score, and it must score in the
  // tier it was filed under. A lower tier that shadows it makes the answer
  // unreachable.
  for (const tier of TIER_IDS) {
    for (const answer of prompt.answers[tier]) {
      const graded = gradeAnswer(prompt, answer);
      if (!graded.accepted) {
        fail(`${label}: "${answer}" (${tier}) does not match itself`);
      } else if (graded.tier !== tier) {
        fail(
          `${label}: "${answer}" (${tier}) is shadowed by "${graded.answer}" (${graded.tier})`,
        );
      }
    }
  }
}

const ids = new Set(PROMPTS.map((p) => p.id));
if (ids.size !== PROMPTS.length) fail('prompt ids are not unique');

const totalAnswers = PROMPTS.reduce((sum, p) => sum + allAnswers(p).length, 0);

console.log('per-prompt tier counts');
for (const row of report) {
  const counts = TIER_IDS.map((t) => `${row.counts[t]}`).join('/');
  const flag = row.total < 34 ? '  <-- thin' : '';
  console.log(`  ${row.label.padEnd(20)} ${counts.padEnd(24)} total ${row.total}${flag}`);
}

if (problems === 0) {
  console.log(`\n✓ all good — ${PROMPTS.length} prompts, ${totalAnswers} accepted answers\n`);
  process.exit(0);
} else {
  console.error(`\n✗ ${problems} problem(s) found\n`);
  process.exit(1);
}
