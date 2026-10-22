import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confirmationFor } from '../src/game/confirmation.ts';
import { makePrompt } from './helpers.ts';

const prompt = makePrompt(
  {
    plankton: ['red', 'great white shark'],
    jawsome: ['crimson', 'chameleon'],
    'fin-omenal': ['lizard', 'wizard'],
  },
  { aliases: { scarlet: 'crimson', greatwhite: 'great white shark' } },
);

test('exact and normalised answers never need confirmation', () => {
  assert.equal(confirmationFor(prompt, 'red'), null);
  assert.equal(confirmationFor(prompt, '  RED!  '), null);
  assert.equal(confirmationFor(prompt, 'reds'), null); // plural variant
  assert.equal(confirmationFor(prompt, 'greatwhiteshark'), null); // compact
});

test('aliases submit directly rather than asking for confirmation', () => {
  assert.equal(confirmationFor(prompt, 'Scarlet!'), null);
  assert.equal(confirmationFor(prompt, 'great white shark'), null);
});

test('a unique typo returns one canonical answer for confirmation', () => {
  const match = confirmationFor(prompt, 'chameleonn');
  assert.ok(match);
  assert.equal(match.answer, 'chameleon');
  assert.equal(match.typed, 'chameleonn');
  assert.equal(match.prompt.id, prompt.id);
  assert.equal(match.grade.corrected, true);
});

test('the canonical answer is what gets submitted, not the typo', () => {
  const match = confirmationFor(prompt, 'Crims0n');
  assert.ok(match);
  assert.equal(match.answer, 'crimson');
  assert.notEqual(match.answer, match.typed);
});

test('ambiguous corrections do not pick an arbitrary answer', () => {
  assert.equal(confirmationFor(prompt, 'izard'), null);
});

test('short answers and weak matches are not over-corrected', () => {
  assert.equal(confirmationFor(prompt, 'cta'), null);
  assert.equal(confirmationFor(prompt, 'zzzzzzzzzzzzzzzzzzzzzzzz'), null);
  assert.equal(confirmationFor(prompt, '   '), null);
});

test('exact words that merely resemble another answer stay exact', () => {
  const match = confirmationFor(prompt, 'red');
  assert.equal(match, null);
});
