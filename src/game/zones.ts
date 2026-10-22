/**
 * The ocean the player sinks through.
 *
 * The first 10,935 m are real. Past Challenger Deep the map is invented and
 * hand-drawn, because a perfect dive only earns you to the trench floor and
 * endless mode deserves somewhere stranger to go.
 */

export interface Zone {
  id: string;
  name: string;
  /** Depth range in metres. */
  from: number;
  to: number;
  /** Short description shown on the depth gauge. */
  blurb: string;
  /** Surface colour of the zone, used for the backdrop gradient. */
  color: string;
  /** Deeper colour of the zone. */
  deep: string;
  /** True for the invented zones below Challenger Deep. */
  invented: boolean;
}

export const ZONES: Zone[] = [
  {
    id: 'sunlight',
    name: 'The Sunlight Zone',
    from: 0,
    to: 200,
    blurb: 'Photosynthesis happens here. So does most of the life you picture when you picture the sea.',
    color: '#9a8f8f',
    deep: '#6e6464',
    invented: false,
  },
  {
    id: 'twilight',
    name: 'The Twilight Zone',
    from: 200,
    to: 1000,
    blurb: 'Light fades to nothing. Most animals here make their own.',
    color: '#655858',
    deep: '#443b3b',
    invented: false,
  },
  {
    id: 'midnight',
    name: 'The Midnight Zone',
    from: 1000,
    to: 4000,
    blurb: 'No sunlight at all, near-freezing water, and the light that exists is made by animals.',
    color: '#342c2c',
    deep: '#241f1f',
    invented: false,
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    from: 4000,
    to: 6000,
    blurb: 'The great flat plains that make up most of the ocean floor.',
    color: '#1d1919',
    deep: '#151212',
    invented: false,
  },
  {
    id: 'hadal',
    name: 'The Hadal Zone',
    from: 6000,
    to: 10935,
    blurb: 'Named for Hades, the Greek underworld. Only the trenches get this deep.',
    color: '#100d0d',
    deep: '#0a0808',
    invented: false,
  },
  {
    id: 'glass-orchard',
    name: 'The Glass Orchard',
    from: 10935,
    to: 20000,
    blurb: 'Past the last real water. Here the coral grew clear and the light comes from far away.',
    color: '#2a1416',
    deep: '#1d0e11',
    invented: true,
  },
  {
    id: 'vent-fields',
    name: 'The Vent Fields',
    from: 20000,
    to: 45000,
    blurb: 'Black smokers breathe out metal. Things live here that have never seen the sun.',
    color: '#3a1519',
    deep: '#241014',
    invented: true,
  },
  {
    id: 'drowned-cities',
    name: 'The Drowned Cities',
    from: 45000,
    to: 90000,
    blurb: 'Roads down here. Nobody remembers who laid them.',
    color: '#241014',
    deep: '#180a0c',
    invented: true,
  },
  {
    id: 'long-dark',
    name: 'The Long Dark',
    from: 90000,
    to: 160000,
    blurb: 'The water gives up. The pressure does not.',
    color: '#120709',
    deep: '#0b0506',
    invented: true,
  },
  {
    id: 'shrine',
    name: 'The Shrine',
    from: 160000,
    to: 250000,
    blurb: 'Somebody put something down here on purpose.',
    color: '#0b0506',
    deep: '#070304',
    invented: true,
  },
  {
    id: 'fintastic',
    name: 'Fin-tastic',
    from: 250000,
    to: Infinity,
    blurb: 'Nobody has ever written this down. You are here.',
    color: '#8f1d28',
    deep: '#2a0d10',
    invented: true,
  },
];

export const CHALLENGER_DEEP = 10935;

/** The zone a given depth belongs to. */
export function zoneForDepth(depth: number): Zone {
  for (const zone of ZONES) {
    if (depth < zone.to) return zone;
  }
  return ZONES[ZONES.length - 1]!;
}

/** Progress through the current zone, 0..1. */
export function zoneProgress(depth: number): number {
  const zone = zoneForDepth(depth);
  if (!Number.isFinite(zone.to)) return 1;
  const span = zone.to - zone.from;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (depth - zone.from) / span));
}

/** How far through the whole ocean column the player is, 0..1. */
export function totalProgress(depth: number): number {
  const max = ZONES[ZONES.length - 1]!.from;
  return Math.min(1, depth / max);
}
