import type { GameMode, PlayerStats } from '../game/types';
import { formatDepth, formatPoints, PERFECT_DIVE_DEPTH, PERFECT_DIVE_POINTS } from '../game/tiers';
import { PROMPTS_SANITISED, TOTAL_ANSWERS } from '../data/promptBank';
import { el, clear } from './dom';
import { sfx } from './audio';
import { tierLegend } from './game';

export interface HomeDeps {
  stats: PlayerStats;
  onStart: (mode: GameMode) => void;
  onResume: () => void;
  hasSavedRun: boolean;
  todayKey: string;
}

function modeCard(
  mode: GameMode,
  title: string,
  subtitle: string,
  detail: string,
  icon: string,
  onClick: () => void,
  featured = false,
): HTMLElement {
  const btn = el('button', {
    class: `mode-card${featured ? ' mode-card-featured' : ''}`,
    'data-mode': mode,
  }, [
    el('span', { class: 'mode-icon', text: icon }),
    el('span', { class: 'mode-body' }, [
      el('span', { class: 'mode-title', text: title }),
      el('span', { class: 'mode-subtitle', text: subtitle }),
      el('span', { class: 'mode-detail', text: detail }),
    ]),
    el('span', { class: 'mode-arrow', text: '▸' }),
  ]);
  btn.addEventListener('click', () => {
    sfx.unlock();
    sfx.click();
    onClick();
  });
  return btn;
}

export function renderHome(root: HTMLElement, deps: HomeDeps): void {
  clear(root);
  const { stats } = deps;

  const title = el('h1', { class: 'brand' }, [
    el('span', { class: 'brand-krill', text: '🐜' }),
    el('span', { class: 'brand-word', text: 'KRILLION' }),
  ]);

  const tagline = el('p', { class: 'tagline' }, [
    'Seven prompts. Twenty-five seconds each. ',
    el('strong', { text: 'One answer.' }),
    ' The obvious one is worth nothing.',
  ]);

  const modes = el('div', { class: 'mode-grid' }, [
    modeCard(
      'daily',
      "Today's Dive",
      'The same seven prompts for everyone, today.',
      'Same prompts all day · replay freely',
      '📅',
      () => deps.onStart('daily'),
      true,
    ),
    modeCard(
      'dive',
      'Free Dive',
      'Seven fresh prompts, dealt the moment you ask.',
      'Play it again and again · new prompts every time',
      '🔁',
      () => deps.onStart('dive'),
    ),
    modeCard(
      'endless',
      'Endless',
      'One prompt at a time, three tanks of air.',
      'A miss costs a tank · a krillion gives one back',
      '🫧',
      () => deps.onStart('endless'),
    ),
  ]);

  const resumeBanner = deps.hasSavedRun
    ? el('div', { class: 'resume-banner' }, [
        el('span', { text: 'A dive is still waiting for you.' }),
        (() => {
          const btn = el('button', { class: 'btn btn-primary btn-small' }, ['Resume']);
          btn.addEventListener('click', () => {
            sfx.click();
            deps.onResume();
          });
          return btn;
        })(),
      ])
    : null;

  const statCards = el('div', { class: 'stat-grid' }, [
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value', text: formatDepth(stats.bestDepth) }),
      el('span', { class: 'stat-card-label', text: 'Deepest dive' }),
    ]),
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value', text: formatPoints(stats.bestScore) }),
      el('span', { class: 'stat-card-label', text: 'Best score' }),
    ]),
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value', text: String(stats.dives) }),
      el('span', { class: 'stat-card-label', text: 'Dives run' }),
    ]),
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value', text: formatDepth(stats.bestEndlessDepth) }),
      el('span', { class: 'stat-card-label', text: 'Deepest endless' }),
    ]),
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value accent', text: String(stats.tierCounts.krillion) }),
      el('span', { class: 'stat-card-label', text: 'One in a Krillion' }),
    ]),
    el('div', { class: 'stat-card' }, [
      el('span', { class: 'stat-card-value', text: String(stats.dailyStreak) }),
      el('span', { class: 'stat-card-label', text: 'Day streak' }),
    ]),
  ]);

  const howTo = el('details', { class: 'howto', open: true }, [
    el('summary', { text: 'How the scoring works' }),
    el('div', { class: 'howto-body' }, [
      el('p', {
        text: 'Every prompt has many right answers. The one fewest people would give is worth the most. Speed earns nothing — the clock only decides whether you answer at all.',
      }),
      tierLegend(),
      el('p', {
        class: 'howto-note',
        text: `Every point sinks you 10 metres. A perfect dive is ${PERFECT_DIVE_POINTS} points and ${formatDepth(PERFECT_DIVE_DEPTH)} — down in the hadal trenches. A wrong answer is refused, not punished: it only costs you the seconds it took.`,
      }),
      el('p', {
        class: 'howto-note',
        text: `${PROMPTS_SANITISED.length} prompts and ${TOTAL_ANSWERS} accepted answers in the bank right now.`,
      }),
    ]),
  ]);

  root.append(
    el('div', { class: 'home' }, [
      el('div', { class: 'home-hero' }, [title, tagline]),
      resumeBanner,
      modes,
      statCards,
      howTo,
      el('p', { class: 'fine-print', text: 'Built as a love letter to rarest-answer quizzes. No account, no tracking, no daily cap.' }),
    ]),
  );
}
