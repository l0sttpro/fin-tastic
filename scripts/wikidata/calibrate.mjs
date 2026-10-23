import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROMPT_BY_ID } from '../../src/data/promptBank.ts';
import { TIER_ORDER, tierIndex } from '../../src/game/tiers.ts';
import { normalise } from '../../src/game/scoring.ts';
import { buildItemIndex, matchAnswer } from './match.mjs';

/**
 * Cutoffs are cumulative shares of the verified answer weight, in tier order.
 * Keep all tuning in this one constant so the proposed thresholds are easy to
 * compare and adjust.
 */
export const TIER_THRESHOLDS = [
  { maxShare: 0.6, tier: 'plankton' },
  { maxShare: 0.8, tier: 'reef-rookie' },
  { maxShare: 0.9, tier: 'jawsome' },
  { maxShare: 0.97, tier: 'fin-omenal' },
  { maxShare: 1, tier: 'fintastic' },
];

const promptId = process.argv[2];
if (!promptId) {
  console.error('Usage: node --experimental-strip-types scripts/wikidata/calibrate.mjs <prompt-id>');
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

const overridesPath = path.join('data', 'overrides.json');
let allOverrides = {};
try {
  allOverrides = JSON.parse(await readFile(overridesPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (allOverrides === null || typeof allOverrides !== 'object' || Array.isArray(allOverrides)) {
  throw new Error(`${overridesPath}: expected an object keyed by prompt id`);
}

const promptOverrides = allOverrides[promptId] ?? {};
if (
  promptOverrides === null ||
  typeof promptOverrides !== 'object' ||
  Array.isArray(promptOverrides)
) {
  throw new Error(`${overridesPath}: overrides for "${promptId}" must be an object`);
}

const overrideByKey = new Map();
for (const [answer, tier] of Object.entries(promptOverrides)) {
  if (!TIER_ORDER.includes(tier)) {
    throw new Error(`${overridesPath}: "${answer}" has unknown tier "${tier}"`);
  }
  const key = normalise(answer);
  if (!key) throw new Error(`${overridesPath}: "${answer}" is not a usable answer key`);
  overrideByKey.set(key, tier);
}

const index = buildItemIndex(cache.items);
const verified = [];
const unverified = [];

for (const currentTier of TIER_ORDER) {
  for (const answer of prompt.answers[currentTier] ?? []) {
    const item = matchAnswer(index, answer);
    if (item) {
      verified.push({ answer, currentTier, item });
    } else {
      unverified.push({ answer, currentTier });
    }
  }
}

const totalWeight = verified.reduce(
  (sum, entry) => sum + Math.log(1 + entry.item.sitelinks),
  0,
);

verified.sort(
  (a, b) =>
    Math.log(1 + b.item.sitelinks) - Math.log(1 + a.item.sitelinks) ||
    b.item.sitelinks - a.item.sitelinks ||
    a.answer.localeCompare(b.answer),
);

let cumulative = 0;
const proposed = verified.map((entry) => {
  const weight = Math.log(1 + entry.item.sitelinks);
  cumulative += weight;
  const share = totalWeight > 0 ? cumulative / totalWeight : 1;
  const calculatedTier =
    TIER_THRESHOLDS.find((threshold) => share <= threshold.maxShare)?.tier ??
    TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1].tier;
  const overrideTier = overrideByKey.get(normalise(entry.answer));
  return {
    answer: entry.answer,
    qid: entry.item.qid,
    sitelinks: entry.item.sitelinks,
    currentTier: entry.currentTier,
    proposedTier: overrideTier ?? calculatedTier,
    overridden: Boolean(overrideTier),
    weight,
  };
});

const usedOverrideKeys = new Set(
  proposed.filter((entry) => entry.overridden).map((entry) => normalise(entry.answer)),
);
const unusedOverrides = [...overrideByKey.keys()].filter((key) => !usedOverrideKeys.has(key));

const proposal = proposed.map(({ answer, qid, sitelinks, currentTier, proposedTier }) => ({
  answer,
  qid,
  sitelinks,
  currentTier,
  proposedTier,
}));

const outputPath = path.join('data', 'generated', 'proposals', `${promptId}.json`);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(proposal, null, 2)}\n`, 'utf8');

const changes = proposed
  .filter((entry) => entry.currentTier !== entry.proposedTier)
  .sort(
    (a, b) =>
      Math.abs(tierIndex(b.proposedTier) - tierIndex(b.currentTier)) -
        Math.abs(tierIndex(a.proposedTier) - tierIndex(a.currentTier)) ||
      a.answer.localeCompare(b.answer),
  );

const counts = Object.fromEntries(TIER_ORDER.map((tier) => [tier, 0]));
for (const entry of proposed) counts[entry.proposedTier] += 1;

console.log(`${prompt.text} (${promptId})`);
console.log(
  `verified ${verified.length} · unverified ${unverified.length} · total weight ${totalWeight.toFixed(2)}`,
);
console.log(
  `proposed tiers: ${TIER_ORDER.map((tier) => `${tier} ${counts[tier]}`).join(' · ')}`,
);
console.log(`\nThresholds: ${TIER_THRESHOLDS.map((t) => `${t.tier} ≤ ${t.maxShare * 100}%`).join(' · ')}`);

console.log(`\nTier changes (${changes.length}):`);
if (changes.length === 0) {
  console.log('  none');
} else {
  console.log('  answer                      current → proposed       jump  qid        sitelinks');
  for (const entry of changes) {
    const jump = tierIndex(entry.proposedTier) - tierIndex(entry.currentTier);
    console.log(
      `  ${entry.answer.padEnd(27)} ${entry.currentTier.padEnd(12)} → ${entry.proposedTier.padEnd(12)} ${String(jump).padStart(3)}  ${entry.qid.padEnd(10)} ${entry.sitelinks}`,
    );
  }
}

if (unverified.length > 0) {
  console.log(`\nUnchanged, unverified (${unverified.length}):`);
  for (const entry of unverified) console.log(`  ${entry.currentTier.padEnd(12)} ${entry.answer}`);
}

if (unusedOverrides.length > 0) {
  console.log(`\nOverrides that matched no verified answer (${unusedOverrides.length}):`);
  for (const key of unusedOverrides) console.log(`  ${key}`);
}

console.log(`\nProposal: ${outputPath}`);
