# Krillion Dive

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
| 🫧 Plankton | 4 | 40 m | The answer on everyone's lips |
| 🫧 Too Clever | 8 | 80 m | The second answer everybody thinks of next |
| 🐟 Schooler | 16 | 160 m | A real answer, and not a terrible one |
| 🐠 Rare | 32 | 320 m | Most people would never have said that |
| 🦑 Deep Cut | 64 | 640 m | You went somewhere the crowd never went |
| 🐜 One in a Krillion | 100 | 1000 m | Nobody else reached this |

A perfect dive is seven Krillion answers: 700 points, 7,000 m, and the bottom of
the ocean.

You get **25 seconds** per prompt. A refused answer is not punished — it only
costs the seconds it took, and the prompt stays open so you can try again. Run
the clock out and the prompt is scored as "Out of air": nothing gained, nothing
lost.

### Hints

A hint reveals a `rare`-tier example and costs **8 seconds**. It also caps what
the prompt can be worth: with a hint spent, the best you can do is `rare`
(32 points). Hints are one per prompt.

### Modes

| Mode | Prompts | Rules |
| --- | --- | --- |
| 📅 **Today's Dive** | 7 | The same seven prompts for everyone, all day. Replay it as many times as you like. |
| 🔁 **Free Dive** | 7 | Seven fresh prompts, dealt the moment you ask. No cap, no daily limit — play forever. |
| 🫧 **Endless** | 1 at a time | One prompt at a time, three tanks of air. A miss (timeout) costs a tank; a Krillion answer gives one back. When the air runs out, the dive ends. Prompts get harder the deeper you are. |

### The ocean

Depth drives the backdrop, the gauge and the zone names. The first 10,935 m are
real ocean zones — sunlight, twilight, midnight, abyss, hadal. Past Challenger
Deep the map is invented on purpose: the Glass Orchard, the Vent Fields, the
Drowned Cities, the Long Dark, the Shrine, and finally One in a Krillion at
250 km down.

## Playing around

- **Resume.** A run in progress is saved to `localStorage` after every answer.
  Close the tab, come back, hit **Resume** and you pick up on the same prompt
  with the same score. Saved runs only store prompt *ids*, so they stay small
  and always resolve against the current answer bank.
- **Every answer, in order.** The run summary lists every attempt you made,
  refusals included, with the tier each answer scored.
- **Stats.** Dives played, deepest dive, deepest endless run, a per-tier tally,
  and the answers you have already used (so the game can flag repeats).
- **Debug handle.** `window.krillion.engine.current` from the browser console
  shows the live run state.

## Project layout

```
src/
  data/promptBank.ts     the answer bank — every prompt and its accepted answers
  game/
    types.ts             shared types, including the slim SavedAttempt record
    tiers.ts             tier metadata, points, depth maths, round length
    scoring.ts           answer normalisation, matching, grading, hints
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
```

## Working on the answer bank

`src/data/promptBank.ts` holds every prompt. Each one is written as six arrays,
one per tier, in order:

```ts
p(
  'bird',                       // id
  'Name a bird',                // the prompt text
  'Nature',                     // category chip
  'A feathered animal with a beak, two legs and wings', // hint
  [
    ['sparrow', 'pigeon', 'crow'],        // plankton
    ['robin', 'sparrow', 'wren'],          // clever
    ['albatross', 'pelican'],             // schooler
    ['kookaburra', 'hoopoe'],             // rare
    ['quetzal', 'takahe'],                // deepcut
    ['kiwi', 'secretary bird'],           // krillion
  ],
  { /* optional aliases */ },
),
```

Rules the data has to follow:

- Answers are **lowercase ASCII**, with no stray punctuation.
- The six buckets are **disjoint** — an answer belongs to exactly one tier.
- Every tier of every prompt needs at least a handful of entries, otherwise a
  tier is unreachable.
- Aliases map a spelling to a canonical answer that must exist.

A sanitising pass runs at module load: it lowercases everything, drops
duplicate answers (the commonest bucket wins) and removes aliases whose target
has gone.

### Validating

```
npm run validate
```

This checks the structure of every prompt and then **replays every single
accepted answer through the real scoring code**. That last part matters: if a
low tier shadows a higher one — say "tiger shark" sits in `deepcut` but "shark"
already claims it in `plankton` — the answer can never actually be scored, and
the validator catches it before a player does.

```
✓ all good — 40 prompts, 3034 accepted answers
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
| `npm run validate` | Validate the answer bank |
| `npm run show -- <id>` | Print one prompt |

## Notes

- The answer matcher is deliberately strict. Single-word answers also match
  their singular/plural forms; multi-word answers only match as whole phrases,
  so "tiger shark" does not satisfy a prompt that already accepts "shark".
- Scores are the only currency. There is no penalty for a refusal — the cost is
  the clock.
- The daily seed is derived from the date, so everyone gets the same prompts
  that day, but nothing stops you playing it twice.
