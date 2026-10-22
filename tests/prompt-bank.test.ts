import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allAnswers,
  PROMPTS_SANITISED,
  PROMPT_BY_ID,
  TOTAL_ANSWERS,
} from '../src/data/promptBank.ts';
import { TIER_ORDER } from '../src/game/tiers.ts';
import { candidatesFor, gradeAnswer, normalise } from '../src/game/scoring.ts';

test('the prompt bank is large, varied and uniquely identified', () => {
  assert.ok(PROMPTS_SANITISED.length >= 100);
  assert.ok(TOTAL_ANSWERS >= 6000);

  const ids = new Set(PROMPTS_SANITISED.map((prompt) => prompt.id));
  const texts = new Set(PROMPTS_SANITISED.map((prompt) => prompt.text));
  assert.equal(ids.size, PROMPTS_SANITISED.length);
  assert.equal(texts.size, PROMPTS_SANITISED.length);
  assert.equal(PROMPT_BY_ID.size, PROMPTS_SANITISED.length);

  const categories = new Set(PROMPTS_SANITISED.map((prompt) => prompt.category));
  assert.ok(categories.size >= 15);
});

test('every prompt is populated and every answer is clean data', () => {
  for (const prompt of PROMPTS_SANITISED) {
    assert.ok(prompt.id.trim().length > 0, prompt.id);
    assert.ok(prompt.text.trim().length > 0, prompt.id);
    assert.ok(prompt.category.trim().length > 0, prompt.id);
    assert.ok(prompt.hint.trim().length > 0, prompt.id);

    const byTier = new Map<string, Set<string>>();
    let total = 0;

    for (const tier of TIER_ORDER) {
      const bucket = prompt.answers[tier];
      assert.ok(bucket.length >= 5, `${prompt.id}: ${tier} has too few answers`);
      total += bucket.length;

      const seen = new Set<string>();
      for (const answer of bucket) {
        assert.equal(answer, answer.trim(), `${prompt.id}: "${answer}" has padding`);
        assert.equal(answer, answer.toLowerCase(), `${prompt.id}: "${answer}" is not lowercase`);
        assert.match(answer, /^[\x20-\x7e]+$/, `${prompt.id}: "${answer}" is not ASCII`);
        assert.ok(!answer.includes('?'), `${prompt.id}: "${answer}" contains "?"`);
        assert.ok(!seen.has(answer), `${prompt.id}: duplicate answer "${answer}" in ${tier}`);
        seen.add(answer);
      }
      byTier.set(tier, seen);
    }

    assert.ok(total >= 30, `${prompt.id} has only ${total} answers`);

    // An answer may not appear in two tiers, even with different punctuation.
    const normalised = new Map<string, string>();
    for (const tier of TIER_ORDER) {
      for (const answer of prompt.answers[tier]) {
        const key = normalise(answer);
        const previous = normalised.get(key);
        assert.equal(
          previous,
          undefined,
          `${prompt.id}: "${answer}" in ${tier} duplicates the ${previous ?? 'other'} tier`,
        );
        normalised.set(key, tier);
      }
    }
  }
});

test('aliases point at real answers and resolve cleanly', () => {
  for (const prompt of PROMPTS_SANITISED) {
    const answers = new Set(allAnswers(prompt));
    for (const [alias, target] of Object.entries(prompt.aliases ?? {})) {
      assert.equal(alias, alias.toLowerCase(), `${prompt.id}: alias "${alias}" is not lowercase`);
      assert.ok(answers.has(target), `${prompt.id}: alias "${alias}" targets missing "${target}"`);

      const result = gradeAnswer(prompt, alias);
      assert.equal(result.accepted, true, `${prompt.id}: alias "${alias}" was refused`);
      assert.equal(result.answer, target, `${prompt.id}: alias "${alias}" resolved to another answer`);
    }
  }
});

test('every accepted answer grades back to its own tier', () => {
  for (const prompt of PROMPTS_SANITISED) {
    for (const tier of TIER_ORDER) {
      for (const answer of prompt.answers[tier]) {
        const result = gradeAnswer(prompt, answer);
        assert.equal(result.accepted, true, `${prompt.id}: "${answer}" was refused`);
        assert.equal(result.tier, tier, `${prompt.id}: "${answer}" landed in the wrong tier`);
        assert.equal(
          normalise(result.answer ?? ''),
          normalise(answer),
          `${prompt.id}: "${answer}" resolved to another answer`,
        );
      }
    }
  }
});

test('answer keys never collide within a prompt', () => {
  for (const prompt of PROMPTS_SANITISED) {
    const owners = new Map<string, string>();

    for (const candidate of candidatesFor(prompt)) {
      const keys = [
        ...[...candidate.keys].map((key) => `key:${key}`),
        ...[...candidate.compactKeys].map((key) => `compact:${key}`),
      ];
      for (const key of keys) {
        const owner = owners.get(key);
        assert.equal(
          owner,
          undefined,
          `${prompt.id}: ${key} belongs to both "${owner ?? 'another answer'}" and "${candidate.answer}"`,
        );
        owners.set(key, candidate.answer);
      }
    }
  }
});
