import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROMPTS_SANITISED } from '../src/data/promptBank.ts';
import { GameEngine, type EngineEvent } from '../src/game/engine.ts';
import type { SavedAttempt, SavedRun } from '../src/game/types.ts';

test('a save taken after the last dive answer resumes as a finished run', () => {
  const prompts = PROMPTS_SANITISED.slice(0, 7);
  const results: SavedAttempt[] = prompts.map((prompt) => ({
    promptId: prompt.id,
    raw: prompt.answers.plankton[0] ?? '',
    answer: prompt.answers.plankton[0] ?? '',
    tier: 'plankton',
    points: 15,
    outcome: 'accepted',
    secondsUsed: 4,
    hinted: false,
    repeat: false,
  }));
  const saved: SavedRun = {
    mode: 'dive',
    seed: 1234,
    index: 6,
    score: 105,
    air: 3,
    results,
    promptIds: prompts.map((prompt) => prompt.id),
    savedAt: Date.now(),
  };

  const engine = new GameEngine();
  const events: EngineEvent[] = [];
  engine.on((event) => events.push(event));
  engine.restore(saved);

  assert.equal(engine.current.finished, true);
  assert.deepEqual(engine.current.ending, { kind: 'complete' });
  assert.equal(engine.current.index, 7);
  assert.equal(engine.current.results.length, 7);
  assert.equal(
    events.some((event) => event.type === 'prompt-start'),
    false,
  );
  assert.equal(events.at(-1)?.type, 'run-end');
});

test('restoring a save resumes at the exact next prompt in its queue', () => {
  const prompts = PROMPTS_SANITISED.slice(0, 7);
  const saved: SavedRun = {
    mode: 'dive',
    seed: 99,
    index: 3,
    score: 0,
    air: 3,
    results: [],
    promptIds: prompts.map((prompt) => prompt.id),
    savedAt: Date.now(),
  };

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      setInterval: () => 1,
      clearInterval: () => undefined,
    },
  });

  try {
    const engine = new GameEngine();
    engine.restore(saved);

    assert.equal(engine.currentPrompt?.id, prompts[3]!.id);
    assert.equal(engine.current.index, 3);
    assert.deepEqual(engine.queueIds, prompts.map((prompt) => prompt.id));
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

function installFakeWindow(): void {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      setInterval: () => 1,
      clearInterval: () => undefined,
    },
  });
}

test('pausing freezes the prompt clock and resuming gives the time back', async () => {
  installFakeWindow();
  try {
    const engine = new GameEngine();
    engine.start('dive');

    engine.pauseTimer();
    const frozen = engine.remainingSeconds;
    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(engine.remainingSeconds, frozen);
    assert.equal(engine.useHint(), null);

    engine.resumeTimer();
    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.ok(engine.remainingSeconds < frozen);
    assert.ok(engine.remainingSeconds > frozen - 1);
    engine.abort();
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

test('a confirmed canonical answer submits once and pause time is not charged', async () => {
  installFakeWindow();
  try {
    const engine = new GameEngine();
    engine.start('dive');
    const prompt = engine.currentPrompt;
    assert.ok(prompt);
    const answer = prompt.answers.plankton[0];
    assert.ok(answer);

    engine.pauseTimer();
    await new Promise((resolve) => setTimeout(resolve, 30));

    const result = engine.submit(answer);
    assert.ok(result);
    assert.equal(result.outcome, 'accepted');
    assert.equal(result.answer, answer);
    assert.ok(result.secondsUsed < 1);
    assert.equal(engine.current.results.length, 1);

    // A second submission cannot score the same prompt while the card is up.
    assert.equal(engine.submit(answer), null);
    assert.equal(engine.current.results.length, 1);
    engine.abort();
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
  }
});
