import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROMPTS_SANITISED } from '../src/data/promptBank.ts';
import { dailySeed, mulberry32 } from '../src/game/rng.ts';
import { selectDiveQueue, selectEndlessPrompt } from '../src/game/selection.ts';
import { makePrompt } from './helpers.ts';

test('dive queues are deterministic, unique and category-balanced', () => {
  const first = selectDiveQueue(PROMPTS_SANITISED, 123456, 7);
  const second = selectDiveQueue(PROMPTS_SANITISED, 123456, 7);

  assert.deepEqual(
    first.map((prompt) => prompt.id),
    second.map((prompt) => prompt.id),
  );
  assert.equal(first.length, 7);
  assert.equal(new Set(first.map((prompt) => prompt.id)).size, 7);
  assert.equal(new Set(first.map((prompt) => prompt.category)).size, 7);

  for (let i = 1; i < first.length; i++) {
    assert.notEqual(first[i]!.category, first[i - 1]!.category);
  }
});

test('dive selection avoids immediate repeats', () => {
  const prompts = ['a', 'b', 'c'].map((id) =>
    makePrompt({ plankton: [id] }, { id }),
  );
  const queue = selectDiveQueue(prompts, 77, 3);

  assert.equal(queue.length, 3);
  for (let i = 1; i < queue.length; i++) {
    assert.notEqual(queue[i]!.id, queue[i - 1]!.id);
  }
});

test('a small two-category bank is split evenly', () => {
  const prompts = [
    ...['a1', 'a2', 'a3'].map((id) =>
      makePrompt({ plankton: [id] }, { id, category: 'Alpha' }),
    ),
    ...['b1', 'b2', 'b3'].map((id) =>
      makePrompt({ plankton: [id] }, { id, category: 'Beta' }),
    ),
  ];
  const queue = selectDiveQueue(prompts, 9, 4);
  const counts = new Map<string, number>();
  for (const prompt of queue) {
    counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1);
  }

  assert.equal(counts.get('Alpha'), 2);
  assert.equal(counts.get('Beta'), 2);
});

test('endless selection keeps going after the bank is exhausted', () => {
  const prompts = Array.from({ length: 12 }, (_, index) =>
    makePrompt(
      { plankton: [`answer-${index}`] },
      { id: `endless-${index}`, category: `Category ${index % 3}` },
    ),
  );
  const rng = mulberry32(4242);
  const used = new Set<string>();
  let lastPromptId: string | null = null;
  let lastCategory: string | null = null;

  for (let step = 0; step < 40; step++) {
    const chosen = selectEndlessPrompt({
      prompts,
      rng,
      usedPromptIds: used,
      lastPromptId,
      lastCategory,
      minDifficulty: 2,
      difficultyOf: () => 3,
    });

    assert.ok(prompts.includes(chosen));
    if (lastPromptId !== null && used.size < prompts.length) {
      assert.notEqual(chosen.id, lastPromptId);
    }

    used.add(chosen.id);
    lastPromptId = chosen.id;
    lastCategory = chosen.category;
  }

  assert.equal(used.size, prompts.length);
});

test('endless selection keeps categories balanced after the bank is exhausted', () => {
  const prompts = Array.from({ length: 24 }, (_, index) =>
    makePrompt(
      { plankton: [`answer-${index}`] },
      { id: `balanced-${index}`, category: `Category ${index % 6}` },
    ),
  );
  const rng = mulberry32(2026);
  const used = new Set<string>();
  const categoryCounts = new Map<string, number>();
  let lastPromptId: string | null = null;
  let lastCategory: string | null = null;

  for (let step = 0; step < 60; step++) {
    const chosen = selectEndlessPrompt({
      prompts,
      rng,
      usedPromptIds: used,
      categoryCounts,
      lastPromptId,
      lastCategory,
      minDifficulty: 4,
      difficultyOf: () => 3,
    });

    used.add(chosen.id);
    categoryCounts.set(
      chosen.category,
      (categoryCounts.get(chosen.category) ?? 0) + 1,
    );
    lastPromptId = chosen.id;
    lastCategory = chosen.category;
  }

  assert.equal(used.size, prompts.length);
  const counts = [...categoryCounts.values()];
  assert.equal(counts.length, 6);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
});

test('daily seeds depend on the date, not the clock time', () => {
  const morning = dailySeed(new Date(2026, 9, 22, 6, 30));
  const evening = dailySeed(new Date(2026, 9, 22, 21, 45));
  const nextDay = dailySeed(new Date(2026, 9, 23, 6, 30));

  assert.equal(morning, evening);
  assert.notEqual(morning, nextDay);
});
