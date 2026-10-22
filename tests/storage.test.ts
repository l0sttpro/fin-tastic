import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import type { RunState } from '../src/game/types.ts';
import { clearRun, loadRun, loadStats, saveRun } from '../src/game/storage.ts';

const memory = new Map<string, string>();
const fakeStorage: Storage = {
  get length() {
    return memory.size;
  },
  clear() {
    memory.clear();
  },
  getItem(key) {
    return memory.get(key) ?? null;
  },
  key(index) {
    return [...memory.keys()][index] ?? null;
  },
  removeItem(key) {
    memory.delete(key);
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: fakeStorage,
});

beforeEach(() => {
  memory.clear();
});

function runState(): RunState {
  return {
    mode: 'dive',
    runId: 1,
    seed: 42,
    index: 2,
    results: [],
    attempts: [],
    score: 4,
    depth: 40,
    air: 3,
    finished: false,
  };
}

test('new saves preserve the exact prompt queue', () => {
  saveRun(runState(), ['bird', 'fruit', 'metal']);

  const loaded = loadRun();
  assert.ok(loaded);
  assert.equal(loaded.mode, 'dive');
  assert.equal(loaded.index, 2);
  assert.equal(loaded.score, 4);
  assert.deepEqual(loaded.promptIds, ['bird', 'fruit', 'metal']);
});

test('legacy saves with embedded prompts and refused flags still load', () => {
  memory.set(
    'fin-tastic.run.v1',
    JSON.stringify({
      mode: 'endless',
      seed: 7,
      index: 1,
      score: 4,
      air: 2,
      savedAt: Date.now(),
      results: [
        {
          prompt: { id: 'bird' },
          raw: 'eagle',
          answer: 'eagle',
          tier: 'plankton',
          points: 4,
          secondsUsed: 3.2,
          hinted: false,
        },
      ],
      attempts: [
        {
          promptId: 'bird',
          raw: 'nope',
          refused: true,
          secondsUsed: 1.5,
        },
      ],
    }),
  );

  const loaded = loadRun();
  assert.ok(loaded);
  assert.equal(loaded.mode, 'endless');
  assert.equal(loaded.promptIds, undefined);
  assert.equal(loaded.results[0]?.promptId, 'bird');
  assert.equal(loaded.results[0]?.outcome, 'accepted');
  assert.equal(loaded.results[0]?.points, 15);
  assert.equal(loaded.score, 15);
  assert.equal(loaded.attempts?.[0]?.outcome, 'refused');
  assert.equal(loaded.attempts?.[0]?.answer, null);
});

test('runs older than a week are discarded', () => {
  memory.set(
    'fin-tastic.run.v1',
    JSON.stringify({
      mode: 'dive',
      seed: 1,
      index: 0,
      score: 0,
      air: 3,
      results: [],
      attempts: [],
      savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    }),
  );

  assert.equal(loadRun(), null);
  assert.equal(memory.has('fin-tastic.run.v1'), false);
});

test('clearRun removes the active save', () => {
  saveRun(runState(), ['bird']);
  assert.ok(memory.has('fin-tastic.run.v1'));
  clearRun();
  assert.equal(loadRun(), null);
});

test('legacy tier tallies are folded into the five-tier counts', () => {
  memory.set(
    'fin-tastic.stats.v1',
    JSON.stringify({
      dives: 3,
      tierCounts: {
        plankton: 2,
        clever: 1,
        schooler: 4,
        rare: 3,
        deepcut: 5,
        fintastic: 1,
      },
    }),
  );

  const stats = loadStats();
  assert.equal(stats.tierCounts.plankton, 3);
  assert.equal(stats.tierCounts['reef-rookie'], 4);
  assert.equal(stats.tierCounts.jawsome, 3);
  assert.equal(stats.tierCounts['fin-omenal'], 5);
  assert.equal(stats.tierCounts.fintastic, 1);
});
