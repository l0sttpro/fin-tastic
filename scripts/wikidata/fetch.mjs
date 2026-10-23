import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requestJson } from './http.mjs';
import { SOURCES } from './sources.mjs';

const promptId = process.argv[2];

if (!promptId) {
  console.error('Usage: node scripts/wikidata/fetch.mjs <prompt-id>');
  console.error(`Known prompts: ${Object.keys(SOURCES).join(', ')}`);
  process.exit(1);
}

const source = SOURCES[promptId];
if (!source) {
  console.error(`No Wikidata source configured for "${promptId}".`);
  console.error(`Known prompts: ${Object.keys(SOURCES).join(', ')}`);
  process.exit(1);
}

const endpoint = new URL('https://query.wikidata.org/sparql');
endpoint.search = new URLSearchParams({
  query: source.sparql,
  format: 'json',
}).toString();

console.log(`Fetching ${promptId} from Wikidata…`);
const response = await requestJson(endpoint, {
  accept: 'application/sparql-results+json',
});

const bindings = response.results?.bindings;
if (!Array.isArray(bindings)) {
  throw new Error('Unexpected SPARQL response: missing results.bindings');
}

const items = bindings.map((binding) => {
  const itemUri = binding.item?.value;
  if (!itemUri) throw new Error('SPARQL row is missing ?item');
  const aliases = (binding.aliases?.value ?? '')
    .split('|')
    .map((alias) => alias.trim())
    .filter(Boolean);

  return {
    qid: itemUri.split('/').pop(),
    label: binding.itemLabel?.value ?? '',
    aliases: [...new Set(aliases)].sort((a, b) => a.localeCompare(b)),
    sitelinks: Number(binding.sitelinks?.value ?? 0),
  };
});

items.sort((a, b) => b.sitelinks - a.sitelinks || a.label.localeCompare(b.label));

const outputPath = path.join('data', 'generated', 'wikidata', `${promptId}.json`);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      promptId,
      fetchedAt: new Date().toISOString(),
      query: source.sparql,
      items,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(`\n${items.length} items cached in ${outputPath}`);
console.log('\nTop 10 by sitelinks:');
for (const item of items.slice(0, 10)) {
  console.log(`${String(item.sitelinks).padStart(4)}  ${item.qid.padEnd(10)} ${item.label}`);
}
