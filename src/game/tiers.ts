import type { TierId, TierMeta } from './types';

/**
 * The five rarity tiers. Points are what count; depth is points * 10 metres.
 */
export const TIERS: Record<TierId, TierMeta> = {
  plankton: {
    id: 'plankton',
    name: 'Plankton',
    points: 15,
    metres: 150,
    blurb: 'The answer on everyone’s lips. It barely moves you.',
    crowdShare: '~80% of players',
    color: '#5f5f5f',
    emblem: '○',
  },
  'reef-rookie': {
    id: 'reef-rookie',
    name: 'Reef Rookie',
    points: 30,
    metres: 300,
    blurb: 'A real answer, and not a terrible one.',
    crowdShare: '~10% of players',
    color: '#7d7d7d',
    emblem: '◔',
  },
  jawsome: {
    id: 'jawsome',
    name: 'Jawsome',
    points: 60,
    metres: 600,
    blurb: 'Most people would never have said that.',
    crowdShare: '~5% of players',
    color: '#a3a3a3',
    emblem: '◑',
  },
  'fin-omenal': {
    id: 'fin-omenal',
    name: 'Fin-omenal',
    points: 85,
    metres: 850,
    blurb: 'You went somewhere the crowd never went.',
    crowdShare: '~2% of players',
    color: '#b32733',
    emblem: '◕',
  },
  fintastic: {
    id: 'fintastic',
    name: 'Fin-tastic',
    points: 100,
    metres: 1000,
    blurb: 'Nobody else reached this. The whole room is looking at you.',
    crowdShare: '1 in a million',
    color: '#e53945',
    emblem: '✦',
  },
};

export const TIER_ORDER: TierId[] = [
  'plankton',
  'reef-rookie',
  'jawsome',
  'fin-omenal',
  'fintastic',
];

export const METRES_PER_POINT = 10;

/** Perfect dive = 7 prompts x 100 points = 700 points = 7000 m. */
export const PROMPTS_PER_DIVE = 7;
export const POINTS_PER_PROMPT = 100;
export const PERFECT_DIVE_POINTS = PROMPTS_PER_DIVE * POINTS_PER_PROMPT;
export const PERFECT_DIVE_DEPTH = PERFECT_DIVE_POINTS * METRES_PER_POINT;

export const SECONDS_PER_PROMPT = 25;

/** Endless mode starts with three tanks of air. */
export const STARTING_AIR = 3;

export function tierIndex(id: TierId): number {
  return TIER_ORDER.indexOf(id);
}

export function pointsToDepth(points: number): number {
  return points * METRES_PER_POINT;
}

export function formatDepth(metres: number): string {
  if (metres >= 1000) {
    return `${(metres / 1000).toFixed(metres >= 10_000 ? 0 : 2).replace(/\.00$/, '')} km`;
  }
  return `${Math.round(metres).toLocaleString('en-US')} m`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}
