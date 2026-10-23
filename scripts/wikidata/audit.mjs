import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROMPT_BY_ID, allAnswers } from '../../src/data/promptBank.ts';
import { TIER_ORDER } from '../../src/game/tiers.ts';
import {
  acceptedKeysForPrompt,
  buildItemIndex,
  isItemAccepted,
  matchAnswer,
} from './match.mjs';

const promptId = process.argv[2];
if (!promptId) {
  console.error('Usage: node --experimental-strip-types scripts/wikidata/audit.mjs <prompt-id>');
  process.exit(1);
}

const prompt = PROMPT_BY_ID.get(promptId);
if (!prompt) {
  console.error(`Unknown prompt "${promptId}".`);
  process.exit(1);
}

const cachePath = path.join('data', 'generated', 'wikidata', `${promptId}.json`);
let cache;
try {
  cache = JSON.parse(await readFile(cachePath, 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`No Wikidata cache at ${cachePath}. Run: node scripts/wikidata/fetch.mjs ${promptId}`);
    process.exit(1);
  }
  throw error;
}

if (!Array.isArray(cache.items)) {
  console.error(`Cache at ${cachePath} does not contain an items array.`);
  process.exit(1);
}

const escapeCell = (value) => String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

const index = buildItemIndex(cache.items);
const acceptedKeys = acceptedKeysForPrompt(prompt);

const verified = [];
const unverified = [];

for (const tier of TIER_ORDER) {
  for (const answer of prompt.answers[tier] ?? []) {
    const item = matchAnswer(index, answer);
    if (item) {
      verified.push({ answer, tier, item });
    } else {
      unverified.push({ answer, tier });
    }
  }
}

const topPopular = [...cache.items]
  .sort((a, b) => b.sitelinks - a.sitelinks)
  .slice(0, 25);
const missingPopular = topPopular.filter((item) => !isItemAccepted(index, item, acceptedKeys));

const lines = [];
lines.push(`# Wikidata audit: ${prompt.id}`, '');
lines.push(`**Prompt:** ${prompt.text}`);
lines.push(`**Fetched:** ${cache.fetchedAt}`);
lines.push(`**Wikidata items:** ${cache.items.length}`);
lines.push(`**Existing answers:** ${allAnswers(prompt).length}`);
lines.push(`**VERIFIED:** ${verified.length}`);
lines.push(`**UNVERIFIED:** ${unverified.length}`);
lines.push(`**MISSING_POPULAR (top 25):** ${missingPopular.length}`);
lines.push('');
lines.push('## VERIFIED', '');
lines.push('| Answer | Tier | QID | Sitelinks | Wikidata label |');
lines.push('| --- | --- | --- | ---: | --- |');
for (const { answer, tier, item } of verified) {
  lines.push(
    `| ${escapeCell(answer)} | ${tier} | ${item.qid} | ${item.sitelinks} | ${escapeCell(item.label)} |`,
  );
}
lines.push('');
lines.push('## UNVERIFIED', '');
if (unverified.length === 0) {
  lines.push('None.');
} else {
  lines.push('| Answer | Tier |');
  lines.push('| --- | --- |');
  for (const { answer, tier } of unverified) {
    lines.push(`| ${escapeCell(answer)} | ${tier} |`);
  }
}
lines.push('');
lines.push('## MISSING_POPULAR', '');
lines.push('Top 25 Wikidata items by sitelinks that are not accepted by this prompt.');
lines.push('');
if (missingPopular.length === 0) {
  lines.push('None.');
} else {
  lines.push('| QID | Label | Sitelinks | Aliases |');
  lines.push('| --- | --- | ---: | --- |');
  for (const item of missingPopular) {
    lines.push(
      `| ${item.qid} | ${escapeCell(item.label)} | ${item.sitelinks} | ${escapeCell(item.aliases.join('; ') || '—')} |`,
    );
  }
}
lines.push('');

const outputPath = path.join('data', 'generated', 'reports', `${promptId}.md`);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`${prompt.text} (${promptId})`);
console.log(
  `items ${cache.items.length} · answers ${allAnswers(prompt).length} · verified ${verified.length} · unverified ${unverified.length} · missing popular ${missingPopular.length}`,
);
if (unverified.length > 0) {
  console.log('\nUNVERIFIED:');
  for (const { answer, tier } of unverified) console.log(`  ${tier.padEnd(12)} ${answer}`);
}
if (missingPopular.length > 0) {
  console.log('\nMISSING_POPULAR (top 25):');
  for (const item of missingPopular.slice(0, 10)) {
    console.log(`  ${String(item.sitelinks).padStart(4)}  ${item.qid.padEnd(10)} ${item.label}`);
  }
  if (missingPopular.length > 10) console.log(`  … and ${missingPopular.length - 10} more`);
}
console.log(`\nReport: ${outputPath}`);
