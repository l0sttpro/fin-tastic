import type { PlayerStats, RunState } from '../game/types';
import { TIERS, TIER_ORDER, formatDepth, formatPoints, METRES_PER_POINT } from '../game/tiers';
import { zoneForDepth } from '../game/zones';
import { el, clear } from './dom';
import { sfx } from './audio';

export interface SummaryDeps {
  state: RunState;
  stats: PlayerStats;
  isBest: boolean;
  onAgain: (mode: RunState['mode']) => void;
  onHome: () => void;
}

export function renderSummary(root: HTMLElement, deps: SummaryDeps): void {
  const { state } = deps;
  clear(root);

  const zone = zoneForDepth(state.depth);
  const ending = state.ending?.kind ?? 'complete';
  const counts = state.results.reduce<Record<string, number>>((acc, result) => {
    if (result.tier) acc[result.tier] = (acc[result.tier] ?? 0) + 1;
    return acc;
  }, {});

  const accepted = state.results.filter((r) => r.tier !== null);
  const best = accepted.reduce((top, result) => (result.points > top ? result.points : top), 0);
  const average = accepted.length
    ? Math.round(accepted.reduce((sum, r) => sum + r.points, 0) / accepted.length)
    : 0;

  const headlines: Record<string, { title: string; blurb: string; icon: string }> = {
    complete: {
      title: 'Dive complete',
      blurb: 'Seven prompts, one dive. Seven perfect answers would put you 7,000 m down, in the hadal trenches.',
      icon: '🪸',
    },
    'out-of-air': {
      title: 'Out of air',
      blurb: 'Your last tank is gone. The dark keeps the rest.',
      icon: '🫧',
    },
    aborted: {
      title: 'Surfaced',
      blurb: 'You came back up early. The dive still counts.',
      icon: '⏏',
    },
  };
  const head = headlines[ending] ?? headlines.complete!;

  const headline = el('div', { class: 'summary-head' }, [
    el('div', { class: 'summary-icon', text: head.icon }),
    el('div', {}, [
      el('h2', { class: 'summary-title', text: head.title }),
      el('p', { class: 'summary-blurb', text: head.blurb }),
    ]),
    deps.isBest ? el('span', { class: 'badge-new', text: 'New personal best' }) : null,
  ]);

  const depthBlock = el('div', { class: 'depth-block' }, [
    el('span', { class: 'depth-value', text: formatDepth(state.depth) }),
    el('span', { class: 'depth-zone', text: zone.name }),
    el('span', { class: 'depth-blurb', text: zone.blurb }),
  ]);

  const scoreBlock = el('div', { class: 'score-block' }, [
    el('div', { class: 'score-item' }, [
      el('span', { class: 'score-value', text: formatPoints(state.score) }),
      el('span', { class: 'score-label', text: 'points' }),
    ]),
    el('div', { class: 'score-item' }, [
      el('span', { class: 'score-value', text: String(accepted.length) }),
      el('span', { class: 'score-label', text: 'accepted' }),
    ]),
    el('div', { class: 'score-item' }, [
      el('span', { class: 'score-value', text: String(average) }),
      el('span', { class: 'score-label', text: 'avg points' }),
    ]),
    el('div', { class: 'score-item' }, [
      el('span', { class: 'score-value', text: String(best) }),
      el('span', { class: 'score-label', text: 'best answer' }),
    ]),
  ]);

  // Tier breakdown bar
  const breakdown = el('div', { class: 'breakdown' });
  const total = Math.max(1, accepted.length);
  for (const tier of TIER_ORDER) {
    const count = counts[tier] ?? 0;
    if (count === 0) continue;
    const meta = TIERS[tier];
    breakdown.append(
      el('div', { class: 'breakdown-row' }, [
        el('span', { class: 'breakdown-label', style: `color:${meta.color}` }, [
          el('span', { class: 'breakdown-emoji', text: meta.emblem }),
          meta.name,
        ]),
        el('span', { class: 'breakdown-bar' }, [
          el('span', {
            class: 'breakdown-fill',
            style: `width:${(count / total) * 100}%;background:${meta.color}`,
          }),
        ]),
        el('span', { class: 'breakdown-count', text: `×${count}` }),
      ]),
    );
  }
  if (accepted.length === 0) {
    breakdown.append(el('p', { class: 'breakdown-empty', text: 'Nothing accepted this dive.' }));
  }

  // Answer log — every attempt the player made, refusals included.
  const log = el('div', { class: 'answer-log' });
  const attempts = state.attempts?.length ? state.attempts : state.results;
  attempts.forEach((result, index) => {
    const meta = result.tier ? TIERS[result.tier] : null;
    const timedOut = result.outcome === 'timeout';
    const tierText = meta
      ? `${meta.name} +${result.points}${result.repeat ? ' · repeat' : ''}`
      : timedOut
        ? 'out of air'
        : 'refused';
    log.append(
      el('div', {
        class: `log-row${result.tier ? '' : ' log-row-refused'}${result.repeat ? ' log-row-repeat' : ''}`,
      }, [
        el('span', { class: 'log-index', text: String(index + 1) }),
        el('span', { class: 'log-prompt', text: result.prompt.text }),
        el('span', { class: 'log-answer', text: result.answer ?? (timedOut ? '—' : result.raw) }),
        el('span', {
          class: 'log-tier',
          text: tierText,
          style: meta ? `color:${meta.color}` : '',
        }),
      ]),
    );
  });

  const againBtn = el('button', { class: 'btn btn-primary btn-wide' }, [
    state.mode === 'endless' ? 'Dive again ▸' : 'Another dive ▸',
  ]);
  againBtn.addEventListener('click', () => {
    sfx.click();
    deps.onAgain(state.mode);
  });

  const homeBtn = el('button', { class: 'btn btn-ghost btn-wide' }, ['Surface']);
  homeBtn.addEventListener('click', () => {
    sfx.click();
    deps.onHome();
  });

  root.append(
    el('div', { class: 'summary' }, [
      headline,
      depthBlock,
      scoreBlock,
      breakdown,
      el('details', { class: 'log-details' }, [el('summary', { text: 'Every answer, in order' }), log]),
      el('div', { class: 'summary-actions' }, [againBtn, homeBtn]),
      el('p', {
        class: 'fine-print',
        text: `Each point is ${METRES_PER_POINT} metres. Best dive so far: ${formatDepth(deps.stats.bestDepth)}.`,
      }),
    ]),
  );
}
