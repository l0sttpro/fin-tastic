import type { GameMode, Prompt, PromptResult, RunState, TierId } from '../game/types';
import { TIERS, TIER_ORDER, formatDepth, formatPoints } from '../game/tiers';
import { zoneForDepth, ZONES } from '../game/zones';
import type { GameEngine } from '../game/engine';
import { HINT_SECOND_COST } from '../game/engine';
import { refusalHint } from '../game/scoring';
import { el, svgEl, clear } from './dom';
import { sfx } from './audio';

export interface GameScreenDeps {
  engine: GameEngine;
  /** Fired when the player lands a One in a Krillion answer. */
  onKrillion?: () => void;
}

/**
 * Where the submersible sits on the gauge. The scale is piecewise so the
 * shallow zones stay legible even though they are only a few hundred metres.
 */
function gaugePosition(depth: number): number {
  const stops: [number, number][] = [
    [0, 0],
    [200, 0.06],
    [1000, 0.18],
    [4000, 0.4],
    [6000, 0.6],
    [10935, 0.82],
    [250000, 1],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [from, fromPos] = stops[i]!;
    const [to, toPos] = stops[i + 1]!;
    if (depth <= to) {
      const span = to - from;
      const ratio = span === 0 ? 0 : (depth - from) / span;
      return fromPos + (toPos - fromPos) * ratio;
    }
  }
  return 1;
}

/** Small letterbox panel used by the header. */
function stat(label: string, value: string, accent?: string): HTMLElement {
  return el('div', { class: 'stat' }, [
    el('span', { class: 'stat-label', text: label }),
    el('span', { class: 'stat-value', text: value, style: accent ? `color:${accent}` : '' }),
  ]);
}

export function renderGame(root: HTMLElement, deps: GameScreenDeps): () => void {
  const { engine } = deps;
  clear(root);

  const modeLabels: Record<GameMode, string> = {
    dive: 'Free Dive',
    endless: 'Endless',
    daily: "Today's Dive",
  };

  // ---- header ----------------------------------------------------------
  const modeChip = el('span', { class: 'chip chip-mode', text: '—' });
  const diveCounter = el('span', { class: 'chip chip-ghost', text: '' });
  const dots = el('div', { class: 'prompt-dots' });
  const airRow = el('div', { class: 'air-row' });

  const RING_R = 26;
  const RING_C = 2 * Math.PI * RING_R;
  const ringFg = svgEl('circle', {
    cx: '32',
    cy: '32',
    r: String(RING_R),
    fill: 'none',
    stroke: 'url(#ringGrad)',
    'stroke-width': '5',
    'stroke-linecap': 'round',
    'stroke-dasharray': String(RING_C),
    'stroke-dashoffset': '0',
    transform: 'rotate(-90 32 32)',
  });
  const ringBg = svgEl('circle', {
    cx: '32',
    cy: '32',
    r: String(RING_R),
    fill: 'none',
    stroke: 'rgba(148, 197, 255, 0.18)',
    'stroke-width': '5',
  });
  const ringSvg = svgEl(
    'svg',
    { viewBox: '0 0 64 64', class: 'timer-ring' },
    [
      svgEl(
        'defs',
        {},
        [
          svgEl(
            'linearGradient',
            { id: 'ringGrad', x1: '0', y1: '0', x2: '1', y2: '1' },
            [
              svgEl('stop', { offset: '0%', 'stop-color': '#67e8f9' }),
              svgEl('stop', { offset: '100%', 'stop-color': '#818cf8' }),
            ],
          ),
        ],
      ),
      ringBg,
      ringFg,
    ],
  );
  const timerText = el('span', { class: 'timer-text', text: '25' });

  const exitBtn = el('button', {
    class: 'btn btn-ghost btn-icon',
    title: 'Surface (end this run)',
    'aria-label': 'Surface and end this run',
  }, ['⏏']);
  exitBtn.addEventListener('click', () => {
    sfx.click();
    engine.abort();
  });

  const header = el('header', { class: 'game-header' }, [
    el('div', { class: 'header-left' }, [modeChip, diveCounter]),
    el('div', { class: 'header-center' }, [dots]),
    el('div', { class: 'header-right' }, [
      stat('Score', formatPoints(0)),
      stat('Depth', '0 m'),
      airRow,
      el('div', { class: 'timer' }, [ringSvg, timerText]),
      exitBtn,
    ]),
  ]);
  // Replace the placeholder stats with live ones.
  const scoreStat = header.querySelector('.header-right .stat:nth-child(1) .stat-value')!;
  const depthStat = header.querySelector('.header-right .stat:nth-child(2) .stat-value')!;
  scoreStat.textContent = '0';
  depthStat.textContent = '0 m';

  // ---- depth gauge -----------------------------------------------------
  const gaugeTrack = el('div', { class: 'gauge-track' });
  for (const zone of ZONES) {
    const pos = gaugePosition(zone.from);
    const seg = el('div', {
      class: 'gauge-zone',
      style: `top:${pos * 100}%;height:${(gaugePosition(zone.to) - pos) * 100}%;background:linear-gradient(180deg, ${zone.color}, ${zone.deep})`,
    });
    gaugeTrack.append(seg);
  }
  const gaugeMarker = el('div', { class: 'gauge-marker' }, [
    el('div', { class: 'gauge-sub', text: '🛸' }),
  ]);
  const gaugeDepth = el('div', { class: 'gauge-depth', text: '0 m' });
  const gaugeZone = el('div', { class: 'gauge-zone-name', text: 'The Sunlight Zone' });
  const gauge = el('aside', { class: 'depth-gauge' }, [
    el('div', { class: 'gauge-label', text: 'Depth' }),
    gaugeTrack,
    gaugeMarker,
    el('div', { class: 'gauge-readout' }, [gaugeDepth, gaugeZone]),
  ]);

  // ---- prompt card -----------------------------------------------------
  const categoryChip = el('span', { class: 'chip chip-category', text: '' });
  const promptText = el('h2', { class: 'prompt-text', text: '' });
  const input = el('input', {
    class: 'answer-input',
    type: 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'type an answer…',
    'aria-label': 'Your answer',
    maxlength: '80',
  });
  const submitBtn = el('button', { class: 'btn btn-primary', type: 'submit' }, ['Dive']);
  const hintBtn = el('button', { class: 'btn btn-ghost', type: 'button' }, [
    '💡 Hint',
    el('span', { class: 'hint-cost', text: `−${HINT_SECOND_COST}s` }),
  ]);
  const hintNote = el('p', { class: 'hint-note', text: '' });
  const feedback = el('p', { class: 'feedback', text: '' });
  const form = el('form', { class: 'answer-form', autocomplete: 'off' }, [
    input,
    submitBtn,
  ]);
  const promptCard = el('section', { class: 'prompt-card' }, [
    el('div', { class: 'prompt-meta' }, [categoryChip, el('span', { class: 'prompt-index', text: '' })]),
    promptText,
    form,
    el('div', { class: 'prompt-tools' }, [hintBtn, hintNote]),
    feedback,
  ]);

  const stage = el('main', { class: 'game-stage' }, [gauge, promptCard]);

  // ---- result overlay --------------------------------------------------
  const resultCard = el('div', { class: 'result-card', 'aria-live': 'polite' });
  const resultOverlay = el('div', { class: 'result-overlay' }, [resultCard]);
  resultOverlay.addEventListener('click', (event) => {
    if (event.target === resultOverlay) nextPrompt();
  });

  root.append(header, stage, resultOverlay);

  // ---- helpers ---------------------------------------------------------
  let lastTickSecond = -1;

  function setScore(points: number): void {
    scoreStat.textContent = formatPoints(points);
  }

  function setDepth(depth: number): void {
    depthStat.textContent = formatDepth(depth);
    gaugeDepth.textContent = formatDepth(depth);
    const zone = zoneForDepth(depth);
    gaugeZone.textContent = zone.name;
    const pos = gaugePosition(depth);
    gaugeMarker.style.top = `${pos * 100}%`;
    gaugeMarker.style.setProperty('--zone', zone.color);
  }

  function renderDots(state: RunState): void {
    clear(dots);
    if (state.mode === 'endless') {
      dots.append(
        el('span', {
          class: 'dot dot-active',
          style: '--dot:#67e8f9',
          title: `Prompt ${state.index + 1}`,
        }),
      );
      for (let i = 0; i < 4; i++) {
        dots.append(el('span', { class: 'dot' }));
      }
      return;
    }
    const total = 7;
    for (let i = 0; i < total; i++) {
      const result = state.results[i];
      const done = Boolean(result);
      const dot = el('span', {
        class: `dot${done ? ' dot-done' : ''}${i === state.index ? ' dot-active' : ''}`,
        style: done && result?.tier ? `--dot:${TIERS[result.tier].color}` : '',
      });
      dots.append(dot);
    }
  }

  function renderAir(air: number): void {
    clear(airRow);
    airRow.append(el('span', { class: 'stat-label', text: 'Air' }));
    for (let i = 0; i < Math.max(3, air); i++) {
      airRow.append(
        el('span', {
          class: `tank${i < air ? ' tank-full' : ''}`,
          title: i < air ? 'Tank of air' : 'Empty',
        }),
      );
    }
  }

  function setTimer(remaining: number, fraction: number): void {
    const seconds = Math.ceil(remaining);
    timerText.textContent = String(seconds);
    ringFg.setAttribute('stroke-dashoffset', String(RING_C * (1 - fraction)));
    const urgent = remaining <= 5;
    header.classList.toggle('urgent', urgent);
    ringFg.setAttribute('stroke', urgent ? '#fb7185' : 'url(#ringGrad)');
    if (seconds !== lastTickSecond) {
      lastTickSecond = seconds;
      if (seconds <= 5 && seconds > 0) sfx.tick(seconds <= 3);
    }
  }

  function setBusy(busy: boolean): void {
    input.disabled = busy;
    submitBtn.disabled = busy;
    hintBtn.disabled = busy;
    input.classList.toggle('is-disabled', busy);
  }

  function showHint(text: string): void {
    hintNote.textContent = text;
    hintNote.classList.add('is-visible');
  }

  function showFeedback(text: string, kind: 'bad' | 'neutral'): void {
    feedback.textContent = text;
    feedback.className = `feedback is-visible feedback-${kind}`;
  }

  function clearFeedback(): void {
    feedback.textContent = '';
    feedback.className = 'feedback';
  }

  // ---- result rendering ------------------------------------------------
  function renderResult(result: PromptResult, accepted: boolean): void {
    clear(resultCard);

    if (!accepted) {
      const timedOut = result.outcome === 'timeout';
      const typedNote = timedOut
        ? null
        : el('p', { class: 'result-answer', text: `You typed: “${result.raw}”` });
      resultCard.append(
        el('div', { class: 'result-emblem refused', text: timedOut ? '⏱' : '🚫' }),
        el('h3', { class: 'result-title refused', text: timedOut ? 'Out of air' : 'Refused' }),
        el('p', {
          class: 'result-blurb',
          text: timedOut
            ? 'The clock ran out. Nothing scored, nothing punished.'
            : 'That answer is not on the sheet. Refused, not punished — it only cost you the seconds.',
        }),
        ...(typedNote ? [typedNote] : []),
        el('div', { class: 'result-actions' }, [nextButton()]),
      );
      resultOverlay.classList.add('is-open');
      resultOverlay.dataset.tier = 'refused';
      return;
    }

    const tier = result.tier!;
    const meta = TIERS[tier];
    const gained = result.points * 10;
    setBusy(true);

    resultCard.append(
      el('div', { class: 'result-emblem', text: meta.emblem, style: `color:${meta.color}` }),
      el('h3', { class: 'result-title', text: meta.name, style: `color:${meta.color}` }),
      el('p', { class: 'result-blurb', text: meta.blurb }),
      el('div', { class: 'result-points' }, [
        el('span', { class: 'result-points-value', text: `+${result.points}` }),
        el('span', { class: 'result-points-label', text: `points  ·  ${formatDepth(gained)} deeper` }),
      ]),
      el('p', { class: 'result-answer', text: `“${result.answer}”` }),
      el('p', { class: 'result-crowd', text: meta.crowdShare }),
      ...(result.hinted
        ? [el('p', { class: 'result-hint-note', text: 'Scored with a hint — tier capped.' })]
        : []),
      ...(result.repeat
        ? [el('p', { class: 'result-hint-note', text: 'You have said that one already.' })]
        : []),
      el('div', { class: 'result-actions' }, [nextButton()]),
    );
    resultOverlay.classList.add('is-open');
    resultOverlay.dataset.tier = tier;

    // Rare tiers deserve a bigger reaction.
    if (tier === 'krillion') {
      document.body.classList.add('shake-hard');
      setTimeout(() => document.body.classList.remove('shake-hard'), 700);
    } else if (tier === 'deepcut') {
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 500);
    }
  }

  function nextButton(): HTMLElement {
    const btn = el('button', { class: 'btn btn-primary btn-wide', type: 'button' }, [
      'Continue ▸',
    ]);
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      nextPrompt();
    });
    return btn;
  }

  function nextPrompt(): void {
    resultOverlay.classList.remove('is-open');
    engine.advance();
  }

  // ---- event wiring ----------------------------------------------------
  const unsubscribe = engine.on((event) => {
    switch (event.type) {
      case 'run-start': {
        const state = event.state;
        modeChip.textContent = modeLabels[state.mode];
        diveCounter.textContent =
          state.mode === 'daily' ? 'everyone gets this one' : `run #${state.runId}`;
        // A new run starts from zero, even when the screen was reused.
        setScore(state.score);
        setDepth(state.depth);
        renderDots(state);
        clear(airRow);
        if (state.mode === 'endless') renderAir(state.air);
        break;
      }
      case 'prompt-start': {
        const prompt: Prompt = event.prompt;
        categoryChip.textContent = prompt.category;
        promptText.textContent = prompt.text;
        (promptCard.querySelector('.prompt-index') as HTMLElement).textContent =
          event.total === Infinity ? `prompt ${event.index + 1}` : `${event.index + 1} / ${event.total}`;
        input.value = '';
        setBusy(false);
        hintNote.classList.remove('is-visible');
        hintNote.textContent = '';
        clearFeedback();
        promptCard.classList.remove('is-refused');
        resultOverlay.classList.remove('is-open');
        lastTickSecond = -1;
        setTimer(event.remaining, 1);
        requestAnimationFrame(() => input.focus());
        break;
      }
      case 'tick': {
        setTimer(event.remaining, event.fraction);
        break;
      }
      case 'hint': {
        showHint(event.text);
        sfx.click();
        break;
      }
      case 'graded': {
        if (event.accepted) {
          sfx.accept();
          const tier = event.result.tier!;
          if (tier === 'krillion') {
            sfx.krillion();
            deps.onKrillion?.();
          } else if (tier === 'deepcut') {
            sfx.deep();
          }
          setScore(engine.current.score);
          setDepth(engine.current.depth);
          renderDots(engine.current);
          renderResult(event.result, true);
        } else if (event.result.outcome === 'timeout') {
          // The clock ran out: show the card and let the player move on.
          sfx.refuse();
          setBusy(true);
          renderResult(event.result, false);
        } else {
          sfx.refuse();
          const prompt = event.result.prompt;
          const hint = refusalHint(prompt, event.result.raw);
          showFeedback(hint, 'bad');
          promptCard.classList.add('is-refused');
          setTimeout(() => promptCard.classList.remove('is-refused'), 600);
          input.select();
        }
        break;
      }
      case 'timeout': {
        break;
      }
      case 'state': {
        setScore(event.state.score);
        setDepth(event.state.depth);
        renderDots(event.state);
        if (event.state.mode === 'endless') renderAir(event.state.air);
        break;
      }
      case 'run-end': {
        renderDots(event.state);
        break;
      }
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      showFeedback('Say something first.', 'neutral');
      return;
    }
    const result = engine.submit(value);
    if (result && result.outcome === 'accepted') {
      clearFeedback();
    }
  });

  hintBtn.addEventListener('click', () => {
    const hint = engine.useHint();
    if (!hint) {
      showFeedback('No hint left for this prompt.', 'neutral');
    }
  });

  // Keyboard shortcut: Enter submits (native), Escape surfaces.
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !engine.current.finished) {
      engine.abort();
    }
  };
  window.addEventListener('keydown', onKey);

  // Initial paint
  renderDots(engine.current);
  setScore(engine.current.score);
  setDepth(engine.current.depth);

  return () => {
    unsubscribe();
    window.removeEventListener('keydown', onKey);
  };
}

/** A compact legend of the six tiers, used on the home and summary screens. */
export function tierLegend(): HTMLElement {
  return el(
    'div',
    { class: 'tier-legend' },
    TIER_ORDER.map((id: TierId) => {
      const meta = TIERS[id];
      return el('div', { class: 'tier-legend-item' }, [
        el('span', { class: 'tier-legend-dot', style: `background:${meta.color}` }),
        el('span', { class: 'tier-legend-name', text: meta.name }),
        el('span', { class: 'tier-legend-points', text: `${meta.points}` }),
      ]);
    }),
  );
}
