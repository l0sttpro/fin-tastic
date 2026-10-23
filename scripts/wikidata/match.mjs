import { candidatesFor, compact, keysFor, normalise } from '../../src/game/scoring.ts';

/**
 * Build lookups for Wikidata items by the same keys the game uses for answers.
 *
 * Labels are expanded with `keysFor` so plural forms match. Aliases are kept
 * as exact normalised spellings, mirroring how `candidatesFor` adds aliases,
 * with compact keys added for missing-space input.
 */
export function buildItemIndex(items) {
  const exact = new Map();
  const compactLookup = new Map();
  const byQid = new Map();

  const add = (map, key, item) => {
    if (!key) return;
    const previous = map.get(key);
    if (!previous || item.sitelinks > previous.sitelinks) {
      map.set(key, item);
    } else if (
      previous &&
      item.sitelinks === previous.sitelinks &&
      item.qid.localeCompare(previous.qid) < 0
    ) {
      map.set(key, item);
    }
  };

  for (const item of items) {
    const exactKeys = new Set(keysFor(item.label));
    for (const alias of item.aliases) {
      const key = normalise(alias);
      if (key) exactKeys.add(key);
    }

    const compactKeys = new Set();
    for (const key of exactKeys) {
      add(exact, key, item);
      compactKeys.add(compact(key));
    }
    for (const key of compactKeys) add(compactLookup, key, item);

    byQid.set(item.qid, { exactKeys, compactKeys });
  }

  return { exact, compact: compactLookup, byQid };
}

/** Find the Wikidata item matching an existing answer, if any. */
export function matchAnswer(index, answer) {
  for (const key of keysFor(answer)) {
    const item = index.exact.get(key);
    if (item) return item;
  }

  const compactKey = compact(answer);
  return compactKey ? index.compact.get(compactKey) ?? null : null;
}

/** The keys the game already accepts for a prompt, including aliases. */
export function acceptedKeysForPrompt(prompt) {
  const exact = new Set();
  const compactKeys = new Set();
  for (const candidate of candidatesFor(prompt)) {
    for (const key of candidate.keys) exact.add(key);
    for (const key of candidate.compactKeys) compactKeys.add(key);
  }
  return { exact, compact: compactKeys };
}

/** Whether a Wikidata item is already represented by the prompt's answers. */
export function isItemAccepted(index, item, acceptedKeys) {
  const entry = index.byQid.get(item.qid);
  if (!entry) return false;
  for (const key of entry.exactKeys) {
    if (acceptedKeys.exact.has(key)) return true;
  }
  for (const key of entry.compactKeys) {
    if (acceptedKeys.compact.has(key)) return true;
  }
  return false;
}
