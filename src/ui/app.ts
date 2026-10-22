import type { GameMode, PlayerStats, RunState } from '../game/types';
import { GameEngine } from '../game/engine';
import {
  clearRun,
  emptyStats,
  loadRun,
  loadStats,
  recordDailyPlay,
  recordRun,
  saveRun,
  saveStats,
} from '../game/storage';
import { OceanBackground } from './background';
import { sfx } from './audio';
import { renderGame } from './game';
import { renderHome } from './home';
import { renderSummary } from './summary';

export class App {
  private root: HTMLElement;
  private engine = new GameEngine();
  private ocean: OceanBackground;
  private stats: PlayerStats = emptyStats();
  private teardown: (() => void) | null = null;
  private savedRun = loadRun();

  constructor(root: HTMLElement, canvas: HTMLCanvasElement) {
    this.root = root;
    this.ocean = new OceanBackground(canvas);
    this.stats = loadStats();

    // Warm up audio on the first interaction anywhere.
    const unlock = () => {
      sfx.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    this.engine.on((event) => {
      if (event.type === 'state') {
        this.persist(event.state);
      }
      if (event.type === 'graded' && event.accepted) {
        this.applyDepth(this.engine.current.depth);
      }
      if (event.type === 'run-start') {
        this.applyDepth(event.state.depth);
        // Persist immediately so starting a new run replaces any older save
        // even if the tab closes before the first answer.
        this.persist(event.state);
      }
      if (event.type === 'run-end') {
        this.showSummary();
      }
    });

    this.ocean.start();
    this.showHome();
  }

  private todayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  // -- screens ------------------------------------------------------------

  showHome(): void {
    this.teardown?.();
    this.teardown = null;
    this.applyDepth(0);
    this.ocean.setDepth(0);
    renderHome(this.root, {
      stats: this.stats,
      onStart: (mode) => this.startRun(mode),
      onResume: () => this.resumeRun(),
      hasSavedRun: Boolean(this.savedRun),
      todayKey: this.todayKey(),
    });
  }

  startRun(mode: GameMode): void {
    sfx.unlock();
    // The game screen subscribes to engine events, so it has to exist before
    // the run starts — otherwise the opening prompt is announced to nobody.
    this.enterGame();
    this.engine.start(mode);
  }

  private enterGame(): void {
    this.teardown?.();
    this.teardown = renderGame(this.root, {
      engine: this.engine,
      onFintastic: () => {
        this.ocean.swarm(36);
      },
    });
  }

  private showSummary(): void {
    this.teardown?.();
    this.teardown = null;

    const state = this.engine.current;
    const ending = state.ending?.kind ?? 'complete';

    // Persist the finished run into the lifetime stats.
    const tiers: Record<string, number> = {};
    const answered: string[] = [];
    for (const result of state.results) {
      if (result.tier) tiers[result.tier] = (tiers[result.tier] ?? 0) + 1;
      if (result.answer) answered.push(result.answer);
    }

    const previousBest = this.stats.bestDepth;
    this.stats = recordRun(this.stats, {
      mode: state.mode === 'endless' ? 'endless' : 'dive',
      depth: state.depth,
      score: state.score,
      tiers: tiers as Record<keyof PlayerStats['tierCounts'], number>,
      answered,
    });

    if (state.mode === 'daily') {
      this.stats = recordDailyPlay(this.stats, this.todayKey());
    }

    saveStats(this.stats);
    clearRun();
    this.savedRun = null;

    sfx.surface();

    renderSummary(this.root, {
      state,
      stats: this.stats,
      isBest: state.depth > previousBest && state.depth > 0,
      onAgain: (mode) => this.startRun(mode),
      onHome: () => this.showHome(),
    });

    if (ending === 'out-of-air') sfx.airOut();
  }

  // -- persistence --------------------------------------------------------

  private persist(state: RunState): void {
    if (state.finished) return;
    saveRun(state, this.engine.queueIds);
  }

  private resumeRun(): void {
    const run = this.savedRun;
    if (!run) {
      this.showHome();
      return;
    }
    // Restore the exact saved queue when available; older saves are rebuilt
    // from their seed or already-played prompts.
    this.enterGame();
    this.engine.restore(run);
  }

  // -- depth theming ------------------------------------------------------

  private applyDepth(depth: number): void {
    const factor = Math.min(1, depth / 10935);
    this.ocean.setDepth(factor);
    document.documentElement.style.setProperty('--depth', String(factor));
  }
}
