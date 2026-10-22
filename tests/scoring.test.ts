import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  boundedLevenshtein,
  fuzzyDistanceLimit,
  gradeAnswer,
  hintAnswer,
  HINT_TIER,
  normalise,
  phraseVariants,
  wordVariants,
} from '../src/game/scoring.ts';
import { makePrompt } from './helpers.ts';

test('normalise folds case, accents, apostrophes and punctuation', () => {
  assert.equal(normalise('  Café déjà-vu!  '), 'cafe deja vu');
  assert.equal(normalise("O'Keeffe"), 'okeeffe');
  assert.equal(normalise('THE   Beatles!!!'), 'the beatles');
  assert.equal(normalise('C#'), 'c sharp');
  assert.equal(normalise('C++'), 'c plus plus');
});

test('word variants handle plurals without collapsing whole phrases', () => {
  assert.ok(wordVariants('tomato').has('tomatoes'));
  assert.ok(wordVariants('wolf').has('wolves'));
  assert.ok(wordVariants('hero').has('heroes'));

  const variants = phraseVariants('great white shark');
  assert.ok(variants.has('great white sharks'));
  assert.ok(!variants.has('shark'));
});

test('exact answers grade into the tier that owns them', () => {
  const prompt = makePrompt({ plankton: ['red'], jawsome: ['crimson'] });

  const common = gradeAnswer(prompt, '  RED! ');
  assert.deepEqual(
    { accepted: common.accepted, tier: common.tier, answer: common.answer },
    { accepted: true, tier: 'plankton', answer: 'red' },
  );

  const obscure = gradeAnswer(prompt, 'Crimson');
  assert.equal(obscure.tier, 'jawsome');
  assert.equal(obscure.answer, 'crimson');
});

test('aliases resolve to their canonical answer', () => {
  const prompt = makePrompt(
    { plankton: ['red'], jawsome: ['crimson'] },
    { aliases: { scarlet: 'crimson' } },
  );

  const result = gradeAnswer(prompt, 'Scarlet!');
  assert.equal(result.accepted, true);
  assert.equal(result.tier, 'jawsome');
  assert.equal(result.answer, 'crimson');
  assert.equal(result.corrected, false);
});

test('short aliases do not pluralise into each other', () => {
  const prompt = makePrompt(
    { plankton: ['pi'], 'reef-rookie': ['psi'] },
    { aliases: { p: 'pi', ps: 'psi' } },
  );

  assert.equal(gradeAnswer(prompt, 'p').answer, 'pi');
  assert.equal(gradeAnswer(prompt, 'ps').answer, 'psi');
});

test('leading articles and plural forms are accepted', () => {
  const prompt = makePrompt({
    'reef-rookie': ['the beatles'],
    jawsome: ['tomato'],
  });

  assert.equal(gradeAnswer(prompt, 'Beatles').answer, 'the beatles');
  assert.equal(gradeAnswer(prompt, 'THE BEATLES').tier, 'reef-rookie');
  assert.equal(gradeAnswer(prompt, 'tomatoes').tier, 'jawsome');
  assert.equal(gradeAnswer(prompt, 'tomato').tier, 'jawsome');
});

test('missing spaces are accepted as an exact compact match', () => {
  const prompt = makePrompt({ jawsome: ['great white shark'] });

  const result = gradeAnswer(prompt, 'greatwhiteshark');
  assert.equal(result.accepted, true);
  assert.equal(result.answer, 'great white shark');
  assert.equal(result.corrected, false);
});

test('a unique one-edit typo is corrected, but not a short answer', () => {
  const prompt = makePrompt({
    plankton: ['cat'],
    'fin-omenal': ['chameleon'],
  });

  const typo = gradeAnswer(prompt, 'chameleonn');
  assert.equal(typo.accepted, true);
  assert.equal(typo.tier, 'fin-omenal');
  assert.equal(typo.answer, 'chameleon');
  assert.equal(typo.corrected, true);

  assert.equal(gradeAnswer(prompt, 'cta').accepted, false);
});

test('fuzzy corrections are refused when two answers are equally close', () => {
  const prompt = makePrompt({ jawsome: ['lizard', 'wizard'] });

  const result = gradeAnswer(prompt, 'izard');
  assert.equal(result.accepted, false);
  assert.equal(result.tier, null);
  assert.equal(result.answer, null);
});

test('repeats are flagged without changing the grade', () => {
  const prompt = makePrompt({ plankton: ['red'] });
  const result = gradeAnswer(prompt, 'Red', new Set([normalise('red')]));

  assert.equal(result.accepted, true);
  assert.equal(result.tier, 'plankton');
  assert.equal(result.repeat, true);
});

test('fuzzy distance limits are conservative and bounded', () => {
  assert.equal(fuzzyDistanceLimit(3), 0);
  assert.equal(fuzzyDistanceLimit(4), 1);
  assert.equal(fuzzyDistanceLimit(12), 1);
  assert.equal(fuzzyDistanceLimit(13), 2);
  assert.equal(fuzzyDistanceLimit(21), 3);

  assert.equal(boundedLevenshtein('kitten', 'sitting', 3), 3);
  assert.equal(boundedLevenshtein('kitten', 'sitting', 2), 3);
});

test('hints reveal a jawsome example and cap the prompt', () => {
  const prompt = makePrompt({ jawsome: ['crimson'] });
  const hint = hintAnswer(prompt);

  assert.equal(hint.cappedTier, HINT_TIER);
  assert.match(hint.text, /crimson/);

  const empty = hintAnswer(makePrompt({ plankton: ['red'] }));
  assert.equal(empty.cappedTier, null);
});
