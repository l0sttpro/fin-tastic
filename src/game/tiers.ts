import type { TierId, TierMeta } from './types';

/**
 * The six rarity tiers. Points are what count; depth is points * 10 metres.
 */
export const TIERS: Record<TierId, TierMeta> = {
  plankton: {
    id: 'plankton',
    name: 'Plankton',
    points: 4,
    metres: 40,
    blurb: 'The answer on everyone’s lips. It barely moves you.',
    crowdShare: '~60% of players',
    color: '#7dd3fc',
    emblem: '🫧',
  },
  clever: {
    id: 'clever',
    name: 'Too Clever',
    points: 8,
    metres: 80,
    blurb: 'You thought of the second answer. So did everyone else.',
    crowdShare: '~20% of players',
    color: '#a5b4fc',
    emblem: '🫧',
  },
  schooler: {
    id: 'schooler',
    name: 'Schooler',
    points: 16,
    metres: 160,
    blurb: 'A real answer, and not a terrible one.',
    crowdShare: '~10% of players',
    color: '#c4b5fd',
    emblem: '🐟',
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    points: 32,
    metres: 320,
    blurb: 'Most people would never have said that.',
    crowdShare: '~5% of players',
    color: '#f0abfc',
    emblem: '🐠',
  },
  deepcut: {
    id: 'deepcut',
    name: 'Deep Cut',
    points: 64,
    metres: 640,
    blurb: 'You went somewhere the crowd never went.',
    crowdShare: '~1% of players',
    color: '#fbbf24',
    emblem: '🦑',
  },
  krillion: {
    id: 'krillion',
    name: 'One in a Krillion',
    points: 100,
    metres: 1000,
    blurb: 'Nobody else reached this. The whole room is looking at you.',
    crowdShare: '1 in a million',
    color: '#f472b6',
    emblem: '🐜',
  },
};

export const TIER_ORDER: TierId[] = [
  'plankton',
  'clever',
  'schooler',
  'rare',
  'deepcut',
  'krillion',
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
