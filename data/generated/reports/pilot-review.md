# Wikidata pilot review

Manual review of the two pilot audits (`jupiter-moon`, `greek-god`) and the
observations from the first expansion batch. All entity names, descriptions,
QIDs and sitelink counts below come from cached Wikidata SPARQL/search
responses. The supporting caches are:

- `data/generated/wikidata/search-unverified-pilot.json` — search candidates for
  every unverified pilot answer.
- `data/generated/wikidata/entity-info-pilot.json` — labels, descriptions,
  aliases and sitelink counts for the suspicious matched items.
- `data/generated/wikidata/entity-parents-pilot.json` — parent-body checks for
  the three wrong-planet moons (`Hippocamp`, `Caliban`, `Aegaeon`).
- The per-prompt caches and `search-*.json` class QID caches in the same
  directory.

No answer data was changed.

## Suspicious verified matches

These answers matched an item in the query's class, but the matched item is not
obviously the entity the answer means. The calibration proposal uses the
matched item's sitelinks, so these need a manual decision before any proposal is
applied.

| Prompt | Answer | Matched item | Sitelinks | Proposed tier | Why it needs review |
| --- | --- | --- | ---: | --- | --- |
| greek-god | `clio` | Q126670238 — Kleio, one of the Oceanids | 0 | fintastic | Alias “Clio”, but this is an Oceanid, not the Muse Clio. The current proposal is based on a 0-sitelink item. |
| greek-god | `erato` | Q782764 — Erato, dryad, wife of Arcas | 5 | fintastic | Wikidata search for “Erato” shows Q104413, “Greek muse of lyrical poetry”. The proposal uses the dryad instead. |
| greek-god | `pandora` | Q3362052 — Pandora | 1 | fintastic | No English description; direct instance of Greek deity. The common mythological Pandora is not established by this match. |
| greek-god | `titan` | Q18415479 — Titan | 1 | fintastic | No English description; instance of the `titan` class. The answer is a race/class of deities, not a single person. |

Confirmed low-sitelink matches that do not need flagging:

- `apheliotes` → Q2245728 (Apeliotes, east wind, 7 sitelinks).
- `skiron` → Q9337884 (Sciron, personified north-west wind, 5 sitelinks).
- `hymen` → Q506770 (Greek god of marriage ceremonies, 41 sitelinks).
- `eileithyia` → Q94066 (Greek goddess of childbirth, 48 sitelinks).
- `eirene` → Q214987 (Greek goddess of peace, 40 sitelinks).

## Unverified answers

These answers have no matching item in the configured prompt cache. They keep
their current tier and are excluded from the proposal JSON.

### `jupiter-moon` (17)

| Answer | Current tier | Finding |
| --- | --- | --- |
| `thoe` | reef-rookie | Wikidata search finds Thoe, an Oceanid (Q2163700), but no moon item. Mythological name, not a moon. |
| `praxithea` | reef-rookie | Search finds Praxithea, a nymph (Q2108224 / Q13058657), but no moon. |
| `hippocamp` | jawsome | Q13938622 is Hippocamp, a moon of Neptune (parent Q332), not Jupiter. |
| `eanthe` | fin-omenal | No exact item; almost certainly a spelling variant of Euanthe (Q16886), which is already accepted. |
| `cori` | fin-omenal | No moon or matching mythological item found; probably invented as a moon answer. |
| `cimon` | fin-omenal | Q218102 is Cimon, an Athenian statesman; not a moon. |
| `caliban` | fin-omenal | Q18481 is Caliban, a moon of Uranus (parent Q324); wrong planet. |
| `mounisto` | fin-omenal | No Wikidata search results; probably invented. |
| `aegaeon` | fintastic | Q17762 is Aegaeon, a moon of Saturn (parent Q193); wrong planet. |
| `steropes` | fintastic | Q3553687 is Steropes, a Cyclops; not a moon. |
| `evadne` | fintastic | Q1142062 is Evadne, wife of Capaneus; not a moon. |
| `karpos` | fintastic | Q2642812 is Karpos, son of Zephyrus; not a moon. Possible variant of Carpo (Q16870), already accepted. |
| `hexlethe` | fintastic | No Wikidata search results; probably invented. |
| `euphrosyne` | fintastic | Q689422 is Euphrosyne, one of the Graces; not a moon. |
| `jupiter lxxiv` | fintastic | No Wikidata search result. Planetary-designation style, but unverifiable in this cache. |
| `jupiter lxxv` | fintastic | No Wikidata search result. Planetary-designation style, but unverifiable in this cache. |
| `jupiter lxxvi` | fintastic | No Wikidata search result. Planetary-designation style, but unverifiable in this cache. |

### `greek-god` (19)

| Answer | Current tier | Finding |
| --- | --- | --- |
| `euterpe` | plankton | Q104012 is Euterpe, muse of music; a genuine deity, but not in the Q22989102 result set. |
| `polyhymnia` | plankton | Q104425 is Polyhymnia, a Muse; genuine deity, not in the query class. |
| `melpomene` | plankton | Q103992 is Melpomene, muse of tragedy; genuine deity, not in the query class. |
| `terpsichore` | plankton | Q104042 is Terpsichore, muse of dance; genuine deity, not in the query class. |
| `achilles` | jawsome | Q41746 is Achilles, a Greek hero; not a god. |
| `odysseus` | jawsome | Q47231 is Odysseus, legendary king of Ithaca; not a god. |
| `bellerophon` | jawsome | Q189872 is Bellerophon, a hero; not a god. |
| `orpheus` | jawsome | Q174353 is Orpheus, a legendary musician and prophet; not a god. |
| `euryale` | jawsome | Q836140 is Euryale, one of the Gorgons; not a god. |
| `ganymede` | jawsome | Q131588 is Ganymede, son of Tros; not a god. |
| `charites` | fin-omenal | Q184353 is Charites, Greek goddesses of grace and beauty; genuine deities, not in the query class. |
| `morphy` | fin-omenal | Search results are a family name and chess terms, not Morpheus. Probably invented. |
| `mormo` | fin-omenal | No Greek-deity result; search returned an insect genus and unrelated terms. Not verifiable as a god. |
| `ercina` | fintastic | Search shows Hercyna (Q3731168), a nymph from Boeotia; likely a spelling variant, not an exact deity match. |
| `eidolon` | fintastic | Search results are a bat genus, a band and albums; not a deity. Probably invented. |
| `thetis` | fintastic | Q184437 is Thetis, a Nereid; a genuine mythological deity/nymph, but not in the query class. |
| `atreus` | fintastic | Q192469 is Atreus, king of Mycenae; not a god. |
| `khalkes` | fintastic | No Wikidata search results; probably invented. |
| `priapus` | fintastic | Q206878 is Priapus, an ancient Greek deity; genuine deity, but not in the query class. |

## Notes on the expansion batch

- `chemical-element`: 118 cached elements, 85/85 answers verified, no missing
  top-25 items. The query restricts to atomic numbers 1–118 so predicted
  elements do not enter the cache.
- `moon`: 426 cached natural satellites with a parent body; 46/46 answers
  verified. The top-25 missing list contains three Jovian moons already accepted
  by the `jupiter-moon` prompt: Metis, Adrastea and Thebe.
- `us-state`: 50 cached states; 50/50 answers verified.
- `country-europe`: the `country` class query returns 52 current countries;
  50/80 answers verified. The 30 unverified answers are constituent countries,
  dependent territories and other geographic entities that are not direct
  instances of `country` (Q6256), which is expected for a prompt that explicitly
  says “country or territory”.
