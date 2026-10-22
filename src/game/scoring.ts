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
    .replace(/#/g, ' sharp ') // keep C# and F# distinct from C and F
    .replace(/\+/g, ' plus ') // C++ and Google+ survive normalisation
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** A space-free key, used for "greatwhite" / "Great White" style input. */
export function compact(input: string): string {
  return normalise(input).replace(/ /g, '');
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

export interface AnswerCandidate {
  answer: string;
  tier: TierId;
  /** Every exact-match key: canonical spelling, plurals, and aliases. */
  keys: Set<string>;
  /** Space-free variants for missing-space input. */
  compactKeys: Set<string>;
}

const CANDIDATE_CACHE = new WeakMap<Prompt, AnswerCandidate[]>();

/**
 * Pre-computes the exact-match keys for every accepted answer of a prompt,
 * including its aliases. Cached because a prompt is immutable at runtime.
 */
export function candidatesFor(prompt: Prompt): AnswerCandidate[] {
  const cached = CANDIDATE_CACHE.get(prompt);
  if (cached) return cached;

  const aliasKeys = buildAliasKeys(prompt);
  const candidates: AnswerCandidate[] = [];

  for (const tier of TIER_ORDER) {
    for (const answer of prompt.answers[tier]) {
      const keys = keysFor(answer);
      const aliases = aliasKeys.get(answer);
      if (aliases) for (const key of aliases) keys.add(key);
      const compactKeys = new Set<string>();
      for (const key of keys) compactKeys.add(key.replace(/ /g, ''));
      candidates.push({ answer, tier, keys, compactKeys });
    }
  }

  CANDIDATE_CACHE.set(prompt, candidates);
  return candidates;
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
    // Aliases are hand-written exact spellings. Expanding them into plural
    // forms creates accidents such as the Greek-letter alias "p" claiming
    // "ps" before the real alias for psi can match it.
    const key = normalise(alias);
    if (key) keys.add(key);
  }
  return map;
}

/**
 * How many edits we are willing to forgive, by the length of the longer
 * string. Short answers stay strict; long answers tolerate a small typo.
 */
export function fuzzyDistanceLimit(length: number): number {
  if (length < 4) return 0;
  if (length <= 12) return 1;
  if (length <= 20) return 2;
  return 3;
}

/**
 * Bounded Levenshtein distance. Returns `max + 1` as soon as it is clear the
 * strings are further apart than we care about.
 */
export function boundedLevenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (max <= 0) return max + 1;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMinimum = i;
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, substitution);
      current[j] = value;
      if (value < rowMinimum) rowMinimum = value;
    }
    if (rowMinimum > max) return max + 1;
    previous = current;
  }

  return previous[b.length]!;
}

interface FuzzyMatch {
  candidate: AnswerCandidate;
  distance: number;
}

function findFuzzyCandidates(inputNorm: string, prompt: Prompt): FuzzyMatch[] {
  if (inputNorm.length < 4) return [];
  const inputCompact = inputNorm.replace(/ /g, '');
  const best: FuzzyMatch[] = [];

  for (const candidate of candidatesFor(prompt)) {
    let distance = Infinity;

    for (const key of candidate.keys) {
      if (key === inputNorm) continue;
      const limit = fuzzyDistanceLimit(Math.max(inputNorm.length, key.length));
      if (limit === 0) continue;
      const next = boundedLevenshtein(inputNorm, key, limit);
      if (next <= limit && next < distance) distance = next;
    }

    // A typo in a missing-space answer ("greatwhit") should still resolve.
    if (inputCompact.length >= 4) {
      for (const key of candidate.compactKeys) {
        if (key === inputCompact) continue;
        const limit = fuzzyDistanceLimit(Math.max(inputCompact.length, key.length));
        if (limit === 0) continue;
        const next = boundedLevenshtein(inputCompact, key, limit);
        if (next <= limit && next < distance) distance = next;
      }
    }

    if (Number.isFinite(distance)) best.push({ candidate, distance });
  }

  return best;
}

export interface GradeResult {
  accepted: boolean;
  tier: TierId | null;
  /** The canonical accepted answer text. */
  answer: string | null;
  /** True when the answer was already used in an earlier prompt this run. */
  repeat: boolean;
  /** True when the answer was resolved through a spelling correction. */
  corrected?: boolean;
}

function accept(candidate: AnswerCandidate, usedAnswers: Set<string>, corrected = false): GradeResult {
  return {
    accepted: true,
    tier: candidate.tier,
    answer: candidate.answer,
    repeat: usedAnswers.has(normalise(candidate.answer)),
    corrected,
  };
}

/**
 * Grades a player's answer against a prompt's accepted list.
 *
 * Matching is intentionally conservative:
 *   1. Exact normalised match (including plural and article variants).
 *   2. Exact alias match.
 *   3. Exact space-free match ("greatwhite" / "great white").
 *   4. A single unambiguous spelling correction.
 *
 * A fuzzy match is only accepted when one candidate is clearly closest. Ties
 * are refused rather than guessed.
 */
export function gradeAnswer(
  prompt: Prompt,
  input: string,
  usedAnswers: Set<string> = new Set(),
): GradeResult {
  const inputNorm = normalise(input);
  if (!inputNorm) {
    return { accepted: false, tier: null, answer: null, repeat: false };
  }

  const inputKeys = keysFor(input);
  if (inputKeys.size === 0) {
    return { accepted: false, tier: null, answer: null, repeat: false };
  }

  const candidates = candidatesFor(prompt);

  for (const candidate of candidates) {
    if (matches(inputKeys, candidate.keys)) return accept(candidate, usedAnswers);
  }

  const inputCompact = inputNorm.replace(/ /g, '');
  if (inputCompact) {
    for (const candidate of candidates) {
      if (candidate.compactKeys.has(inputCompact)) return accept(candidate, usedAnswers);
    }
  }

  const fuzzy = findFuzzyCandidates(inputNorm, prompt);
  if (fuzzy.length === 0) {
    return { accepted: false, tier: null, answer: null, repeat: false };
  }

  const shortest = Math.min(...fuzzy.map((match) => match.distance));
  const closest = fuzzy.filter((match) => match.distance === shortest);
  const uniqueAnswers = new Set(closest.map((match) => match.candidate.answer));
  if (uniqueAnswers.size !== 1) {
    return { accepted: false, tier: null, answer: null, repeat: false };
  }

  return accept(closest[0]!.candidate, usedAnswers, true);
}

/**
 * Picks a helpful nudge for a refused answer. We reveal the tier the player's
 * answer *sounds* like it belongs to without giving the answer away.
 */
export function refusalHint(prompt: Prompt): string {
  return `Stay inside the category: ${prompt.hint}. The obvious answer is worth almost nothing here.`;
}

/**
 * The tier a hint reveals an example of — and the ceiling it puts on what
 * the prompt can be worth. A hint is a trade: you buy a sense of direction
 * with the top of the scoreboard.
 */
export const HINT_TIER: TierId = 'jawsome';

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
