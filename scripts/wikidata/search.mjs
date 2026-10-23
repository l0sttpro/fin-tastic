import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requestJson } from './http.mjs';

const term = process.argv.slice(2).join(' ').trim();
if (!term) {
  console.error('Usage: node scripts/wikidata/search.mjs <search term>');
  process.exit(1);
}

const endpoint = new URL('https://www.wikidata.org/w/api.php');
endpoint.search = new URLSearchParams({
  action: 'wbsearchentities',
  search: term,
  language: 'en',
  uselang: 'en',
  format: 'json',
  limit: '10',
}).toString();

const response = await requestJson(endpoint, { accept: 'application/json' });

const candidates = (response.search ?? []).map((result) => ({
  qid: result.id,
  label: result.label ?? '',
  description: result.description ?? '',
  aliases: result.aliases ?? [],
  match: result.match ?? null,
}));

const slug = term
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
const outputPath = path.join('data', 'generated', 'wikidata', `search-${slug}.json`);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      search: term,
      fetchedAt: new Date().toISOString(),
      candidates,
      raw: response,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(`Candidates for "${term}" (${candidates.length})`);
for (const candidate of candidates) {
  console.log(
    `${candidate.qid.padEnd(10)} ${candidate.label} — ${candidate.description || '(no description)'}`,
  );
}
console.log(`\nCached: ${outputPath}`);
