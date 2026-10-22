import type { Prompt, TierId } from './types.ts';
import { TIERS, TIER_ORDER } from './tiers.ts';

/**
 * Normalises free text so that "The  Beatles", "beatles!" and "BEATLES" all
 * resolve to the same answer.
 */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/['\u2019]/g, '') // drop apostrophes: "birds' beaks" -> "birds beaks"
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Irregular plurals worth special-casing. Both directions are listed. */
const IRREGULAR_PLURALS: Record<string, string> = {
  octopus: 'octopi',
  octopi: 'octopus',
  octopuses: 'octopi',
  cactus: 'cacti',
  cacti: 'cactus',
  cactuses: 'cacti',
  fungus: 'fungi',
  fungi: 'fungus',
  mouse: 'mice',
  mice: 'mouse',
  child: 'children',
  children: 'child',
  person: 'people',
  people: 'person',
  goose: 'geese',
  geese: 'goose',
  tooth: 'teeth',
  teeth: 'tooth',
  foot: 'feet',
  feet: 'foot',
  sheep: 'sheep',
  fish: 'fish',
  series: 'series',
  species: 'species',
  aircraft: 'aircraft',
  half: 'halves',
  knife: 'knives',
  leaf: 'leaves',
  loaf: 'loaves',
  shelf: 'shelves',
  wolf: 'wolves',
  dwarf: 'dwarves',
  thief: 'thieves',
  life: 'lives',
  wife: 'wives',
  hero: 'heroes',
  potato: 'potatoes',
  tomato: 'tomatoes',
  piano: 'pianos',
  radio: 'radios',
  photo: 'photos',
  zoo: 'zoos',
};

const LEADING_ARTICLES = new Set(['the', 'a', 'an']);

/** Words that never get pluralised or singularised on their own. */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'from',
  'by', 'with', 'as', 'its', 'is', 'it', 'de', 'la', 'le', 'el',
]);

/**
 * Singular/plural variants of a single word.
 *
 * Only ever applied to one-word answers and to the individual words of a
 * longer phrase — never to a whole phrase, because "tiger shark" and
 * "hammerhead shark" must not collapse into each other.
 */
export function wordVariants(word: string): Set<string> {
  const out = new Set<string>([word]);

  const irregular = IRREGULAR_PLURALS[word];
  if (irregular) out.add(irregular);

  // plural -> singular
  if (word.length > 3 && word.endsWith('ies')) {
    out.add(`${word.slice(0, -3)}y`);
  }
  if (word.length > 4 && /(ches|shes|xes|zes|oes|ses)$/.test(word)) {
    out.add(word.slice(0, -2));
  } else if (word.length > 2 && word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    out.add(word.slice(0, -1));
  }

  // singular -> plural
  if (!word.endsWith('s')) {
    out.add(`${word}s`);
    if (word.length > 2 && word.endsWith('y')) {
      out.add(`${word.slice(0, -1)}ies`);
    }
    if (/(ch|sh|x|z|o)$/.test(word)) {
      out.add(`${word}es`);
    }
    if (word.endsWith('f')) {
      out.add(`${word.slice(0, -1)}ves`);
    }
  }

  return out;
}

/**
 * Variants of a multi-word phrase. The whole phrase has to match: a player
 * who answers "shark" has not answered "tiger shark". Only light touches
 * are allowed — dropping a leading article and inflecting the content
 * words.
 */
export function phraseVariants(phrase: string): Set<string> {
  const words = phrase.split(' ').filter(Boolean);
  if (words.length === 0) return new Set();
  if (words.length === 1) return wordVariants(words[0]!);

  const out = new Set<string>([words.join(' ')]);

  // Leading article: "the beatles" <-> "beatles".
  if (LEADING_ARTICLES.has(words[0]!)) {
    out.add(words.slice(1).join(' '));
  }

  // Inflect each content word in turn: "tiger sharks" <-> "tiger shark".
  words.forEach((word, index) => {
    if (word.length <= 3 || STOPWORDS.has(word)) return;
    for (const variant of wordVariants(word)) {
      if (variant === word) continue;
      const next = [...words];
      next[index] = variant;
      out.add(next.join(' '));
    }
  });

  return out;
}

/**
 * Produces a set of "keys" for a phrase.
 *
 * Single words get singular/plural variants, so "eagles" matches "eagle".
 * Multi-word phrases are matched whole, so "shark" does *not* match
 * "tiger shark" and the player has to earn the points they want.
 */
export function keysFor(phrase: string): Set<string> {
  const base = normalise(phrase);
  if (!base) return new Set();

  const words = base.split(' ').filter(Boolean);
  if (words.length === 0) return new Set();
  if (words.length === 1) return wordVariants(words[0]!);
  return phraseVariants(base);
}

/** Does the player's answer match an accepted answer? */
function matches(inputKeys: Set<string>, acceptedKeys: Set<string>): boolean {
  for (const k of inputKeys) {
    if (acceptedKeys.has(k)) return true;
  }
  return false;
}

export interface GradeResult {
  accepted: boolean;
  tier: TierId | null;
  /** The canonical accepted answer text. */
  answer: string | null;
  /** True when the answer was already used in an earlier prompt this run. */
  repeat: boolean;
}

/**
 * Grades a player's answer against a prompt's accepted list.
 *
 * `usedAnswers` holds normalised answers already spent in this run so we can
 * flag repeats (and, optionally, refuse them).
 */
export function gradeAnswer(
  prompt: Prompt,
  input: string,
  usedAnswers: Set<string> = new Set(),
): GradeResult {
  const inputKeys = keysFor(input);
  if (inputKeys.size === 0) {
    return { accepted: false, tier: null, answer: null, repeat: false };
  }

  const aliasKeys = buildAliasKeys(prompt);

  for (const tier of TIER_ORDER) {
    for (const accepted of prompt.answers[tier]) {
      const acceptedKeys = keysFor(accepted);
      // Aliases can point a different spelling at this canonical answer.
      const extra = aliasKeys.get(accepted);
      if (extra) {
        for (const k of extra) acceptedKeys.add(k);
      }
      if (matches(inputKeys, acceptedKeys)) {
        const norm = normalise(accepted);
        return {
          accepted: true,
          tier,
          answer: accepted,
          repeat: usedAnswers.has(norm),
        };
      }
    }
  }

  return { accepted: false, tier: null, answer: null, repeat: false };
}

/**
 * Pre-computes the key sets for every alias of a prompt, grouped by the
 * canonical answer they point at.
 */
function buildAliasKeys(prompt: Prompt): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const [alias, target] of Object.entries(prompt.aliases ?? {})) {
    let keys = map.get(target);
    if (!keys) {
      keys = new Set<string>();
      map.set(target, keys);
    }
    for (const key of keysFor(alias)) keys.add(key);
  }
  return map;
}

/**
 * Picks a helpful nudge for a refused answer. We reveal the tier the player's
 * answer *sounds* like it belongs to without giving the answer away.
 */
export function refusalHint(prompt: Prompt, input: string): string {
  const hints: string[] = [];
  const text = input.toLowerCase();

  // Keyword nudges: if the player drifted into a neighbouring category.
  const keys = Object.keys(prompt.aliases ?? {});
  for (const alias of keys) {
    if (text.includes(alias.toLowerCase())) {
      hints.push(`"${alias}" is not an accepted answer for this prompt.`);
      break;
    }
  }

  hints.push(
    `Stay inside the category: ${prompt.hint}. The obvious answer is worth almost nothing here.`,
  );

  return hints.join(' ');
}

/**
 * The tier a hint reveals an example of — and the ceiling it puts on what
 * the prompt can be worth. A hint is a trade: you buy a sense of direction
 * with the top of the scoreboard.
 */
export const HINT_TIER: TierId = 'rare';

/**
 * Suggests a nearby-but-lower-tier answer for the hint system.
 */
export function hintAnswer(prompt: Prompt): {
  text: string;
  cappedTier: TierId | null;
} {
  const pool = prompt.answers[HINT_TIER] ?? [];
  const example = pool[0];
  if (!example) {
    return { text: 'No examples left to reveal — trust your instinct.', cappedTier: null };
  }
  const meta = TIERS[HINT_TIER];
  return {
    text: `A ${meta.name} answer looks like: “${example}”. Scoring is capped at ${meta.name} for this prompt.`,
    cappedTier: HINT_TIER,
  };
}
