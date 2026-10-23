# Fin-tastic

A rarest-answer trivia game. You get a prompt — *"Name a bird"* — and the obvious
answer is worth almost nothing. The rarer your answer, the deeper you sink.

Everything runs locally: no accounts, no API keys, no network calls. The whole
answer bank ships with the game.

```
npm install
npm run dev          # http://localhost:5173
```

## How it plays

Every prompt has a **prompt text** and a sheet of accepted answers, bucketed by
how uncommon they are. The tier your answer lands in decides your points, and
points turn into depth: **1 point = 10 metres**.

| Tier | Points | Depth | Meaning |
| --- | --- | --- | --- |
| ○ Plankton | 15 | 150 m | The answer on everyone's lips |
| ◔ Reef Rookie | 30 | 300 m | A real answer, and not a terrible one |
| ◑ Jawsome | 60 | 600 m | Most people would never have said that |
| ◕ Fin-omenal | 85 | 850 m | You went somewhere the crowd never went |
| ✦ Fin-tastic | 100 | 1000 m | Nobody else reached this |

A perfect dive is seven Fin-tastic answers: 700 points, 7,000 m, and the bottom of
the ocean.

You get **25 seconds** per prompt. A refused answer is not punished - it only
costs the seconds it took, and the prompt stays open so you can try again. Run
the clock out and the prompt is marked **Time up**: nothing gained, nothing lost.

Answers are checked only when you press **Enter** - there is no live suggestion
list while typing. If a submission is a close, unambiguous typo of an accepted
answer, the game asks **Did you mean...?**. **Yes** submits the canonical answer;
**No** or **Escape** returns your original text and resumes the clock.

### Hints

A hint reveals a `jawsome`-tier example and costs **8 seconds**. It also caps what
the prompt can be worth: with a hint spent, the best you can do is `jawsome`
(60 points). Hints are one per prompt.

### Modes

| Mode | Prompts | Rules |
| --- | --- | --- |
| **Today's Dive** | 7 | The same seven prompts for everyone, all day. Replay it as many times as you like. |
| **Free Dive** | 7 | Seven fresh prompts, dealt the moment you ask. No cap, no daily limit — play forever. |
| **Endless** | 1 at a time | One prompt at a time, three tanks of air. A miss (timeout) costs a tank; a Fin-tastic answer gives one back. When the air runs out, the dive ends. Prompts get harder the deeper you are. |

### The ocean

Depth drives the backdrop, the gauge and the zone names. The first 10,935 m are
real ocean zones — sunlight, twilight, midnight, abyss, hadal. Past Challenger
Deep the map is invented on purpose: the Glass Orchard, the Vent Fields, the
Drowned Cities, the Long Dark, the Shrine, and finally Fin-tastic at
250 km down.

## Playing around

- **Resume.** A run in progress is saved to `localStorage` as soon as it starts
  and after every answer. Close the tab, come back, hit **Resume** and you pick
  up on the same prompt with the same score. Saved runs store prompt *ids*
  rather than whole prompt objects, so they stay small and always resolve
  against the current answer bank.
- **Every answer, in order.** The run summary lists every attempt you made,
  refusals included, with the tier each accepted answer scored.
- **Stats.** Dives played, deepest dive, deepest endless run, a per-tier tally,
  and the answers you have already used (so the game can flag repeats).
- **Debug handle.** `window.finTastic.engine.current` from the browser console
  shows the live run state.

## Project layout

```
src/
  data/promptBank.ts     the answer bank - every prompt and its accepted answers
  data/expandedPrompts.ts  the expansion bank added on top of the core prompts
  data/expandedPrompts2.ts the second expansion bank
  data/extraAnswers.ts     merges the long-tail answers and aliases into the bank
  data/extras/             add-only accepted answers and aliases, bucketed by prompt
  game/
    types.ts             shared types, including the slim SavedAttempt record
    tiers.ts             tier metadata, points, depth maths, round length
    scoring.ts           answer normalisation, matching, grading, hints
    selection.ts         seeded, category-balanced prompt queues
    confirmation.ts      detects a unique fuzzy correction before submitting
    zones.ts             the 11 depth zones
    rng.ts               seeded RNG (mulberry32) and the daily seed
    storage.ts           localStorage: lifetime stats and the in-progress run
    engine.ts            the game loop: modes, timer, attempts, scoring, restore
  ui/
    app.ts               screen routing, persistence, depth theming
    home.ts / game.ts / summary.ts
    audio.ts             WebAudio blips and stingers
    background.ts        the animated ocean canvas
    dom.ts               tiny element helper
  styles/                one stylesheet per screen
scripts/
  validate-data.mjs      the data validator
  show-prompt.mjs        prints one prompt, sanitised
tests/                   Node test suite for scoring, selection, confirmation and persistence
```

## Working on the answer bank

`src/data/promptBank.ts` holds every prompt. Each one is written as six rarity
bands. The two commonest bands are folded into the Plankton tier, so the source
keeps a little more grading nuance than the five scoring tiers expose:

```ts
p(
  'bird',                       // id
  'Name a bird',                // the prompt text
  'Nature',                     // category chip
  'A feathered animal with a beak, two legs and wings', // hint
  [
    ['sparrow', 'pigeon', 'crow'],        // band 0 -> plankton
    ['robin', 'wren', 'starling'],        // band 1 -> plankton
    ['albatross', 'pelican'],             // band 2 -> reef-rookie
    ['kookaburra', 'hoopoe'],             // band 3 -> jawsome
    ['quetzal', 'takahe'],                // band 4 -> fin-omenal
    ['kiwi', 'secretary bird'],           // band 5 -> fintastic
  ],
  { /* optional aliases */ },
),
```

There is also a long-tail layer in `src/data/extras/`. It is keyed by prompt id
and holds extra answers per scoring tier, plus an optional alias map for
alternative names, abbreviations and spellings. It is merged in by
`src/data/extraAnswers.ts` after the original answers, so an answer that already
exists keeps its original (usually more common) tier. This keeps the curated
bank stable while making it easy to add rarer valid answers:

```ts
// src/data/extras/batch1.ts
import type { ExtraAnswers } from './types.ts';

export const BATCH_1_EXTRAS: Record<string, ExtraAnswers> = {
  bird: {
    jawsome: ['kookaburra', 'hoopoe'],
    'fin-omenal': ['quetzal', 'takahe'],
    fintastic: ['kiwi', 'secretary bird'],
  },
};
```

Rules the data has to follow:

- Answers are **lowercase ASCII**, with no stray punctuation.
- The six bands are **disjoint** — an answer belongs to exactly one band.
- Extra answers are disjoint too: an answer may not be added to a tier that a
  lower tier already claims.
- Every band of every prompt needs at least a handful of entries, otherwise a
  tier is unreachable.
- Aliases map a spelling to a canonical answer that must exist. An alias must
  not normalise to an answer that another tier already claims, or it shadows
  that answer.

A sanitising pass runs at module load: it lowercases everything, drops
duplicate answers (the commonest band wins) and removes aliases whose target
has gone.

The long-tail expansion currently contributes **4,067 accepted answers**,
bringing the bank to **13,982 answers across 191 prompts**. The one exception
is `us-state`: all 50 states were already present, so it is intentionally left
without padded extras.

### Validating

```
npm run validate
```

This checks the structure of every prompt and then **replays every single
accepted answer through the real scoring code**. That last part matters: if a
low tier shadows a higher one — say "tiger shark" sits in `fin-omenal` but "shark"
already claims it in `plankton` — the answer can never actually be scored, and
the validator catches it before a player does.

```
✓ all good — 191 prompts, 13,982 accepted answers
```

The lightweight test suite uses Node's built-in runner:

```
npm test
```

### Inspecting a prompt

```
npm run show -- bird
```

Prints a prompt and its tier buckets without leaking the answers into your
terminal history any more than necessary.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the lightweight Node test suite |
| `npm run validate` | Validate the answer bank |
| `npm run show -- <id>` | Print one prompt |

## Deploying

The game is a static site, so it ships on GitHub Pages. Pushing to `main` runs
`.github/workflows/deploy.yml`, which installs dependencies, validates the
answer bank, builds to `dist/` and publishes the artifact.

One-time setup: in the repository, open **Settings → Pages** and set **Source**
to **GitHub Actions**. The site then lives at
`https://<user>.github.io/<repo>/` (for this repository,
`https://l0sttpro.github.io/fin-tastic/`). The Vite `base` is relative, so the
build works under that subpath without further configuration.

## Notes

- The answer matcher is deliberately strict. Single-word answers also match
  their singular/plural forms; multi-word answers only match as whole phrases,
  so "tiger shark" does not satisfy a prompt that already accepts "shark".
- Answers are checked only when you press Enter; there is no live suggestion
  list and no answer hints while typing.
- Scores are the only currency. There is no penalty for a refusal — the cost is
  the clock.
- The daily seed is derived from the date, so everyone gets the same prompts
  that day, but nothing stops you playing it twice.
