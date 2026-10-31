# Prompt — "Onde Está o Meu Café?" (v0.1, 2026-10-31)

> Working title. Prompt for Claude Code to build the game. Also usable as a GenAI course demo
> (prompt → playable game).

## Role and goal

Build an **original vertical fixed-shooter arcade game** (player moves along the bottom, waves of
enemies come from above, a boss at the end of each stage). Do **not** copy any existing game's name,
sprites, enemy formations, sounds or UI. All art is original, drawn procedurally (canvas/SVG) in a
**cartoon style**.

Audience: kids, friends, and a live demo for a GenAI course for doctors and nurses. Family-friendly,
a full run ≈ 10–15 min, easy to pick up in 10 seconds.

## Platform and tech

- **Phone first, touch controls, portrait.** Desktop as fallback (mouse/keyboard).
- Static site for **GitHub Pages**: HTML + CSS + vanilla JS + `<canvas>`, no build step, no
  frameworks, no external requests (offline; no analytics, trackers or data collection).
- 60 fps on a mid-range phone; fixed logical resolution (e.g. 360×640) scaled with letterboxing.
- High score in `localStorage`, wrapped in try/catch.
- **No music** for now. Short sound effects behind a mute toggle (muted by default).
- **All UI text in European Portuguese (pt-PT)** — "Jogar", "Pausa", "Recomeçar", "Pontuação",
  "Recorde". No Brazilian forms.
- Small modules: `game.js`, `player.js`, `enemies.js`, `bosses.js`, `items.js`, `weather.js`,
  `ui.js`, and **`character.js`** (every customisable hero trait in one place).

## Controls (touch)

- Drag in the lower half → hero follows the finger (mostly horizontal, small vertical range).
- Basic shots fire automatically.
- **Energy wave button** (bottom-right): hold to charge (glow + bar), release for a wide piercing
  beam. Cooldown after use.
- Pause button top-right; auto-pause when the tab loses focus.

## The hero (represents the author)

- A **martial-arts fighter riding a small flying cloud**; signature attack is the charged energy
  wave. Original design — own outfit and silhouette, not an existing anime character.
- **Appearance is a placeholder**: hair, beard, glasses, skin tone, build and outfit colours are
  named parameters in `character.js`, so the look can be added later without touching game logic.
- **Chest emblem**: the HC phoenix (`assets/hc-fenix.png`).
- **Match day**: emblem swaps to a **blue-and-white striped emblem with a dragon silhouette**
  (original drawing, not an official crest) and the outfit gets blue-and-white stripes.
- Catchphrase in a speech bubble at start, on respawn, and when no coffee has been caught for a
  while: **"Where is my coffee?"** (kept in English as a signature line; everything else pt-PT).
- 3 lives, short invulnerability blink after a hit.

## Items

### Phase A (stages 1–3): pure good vs. bad

| Item | Effect |
|---|---|
| Espresso (small cup) | Short, strong boost: +speed, +fire rate, 5 s |
| Americano (tall cup) | Longer, milder boost, 12 s |
| Chocolate bar | +speed, 8 s |
| Beer glass | Small slowdown, 5 s — dodge it |
| Beer mug (caneca) | Bigger slowdown, 7 s |
| Beer bottle | Slowdown + wobbly controls, 6 s |
| Francesinha | Heavy slowdown, 8 s (cartoon: layered sandwich, egg on top, sauce dripping) |

### Phase B (stages 4–6): trade-offs, introduced with a one-line tip

- Chocolate → **sugar rush then crash**: big boost 5 s, then mild slowdown 3 s.
- Beer → slowdown plus a small **shield**.
- Francesinha → **tank**: slow, but absorbs one extra hit.
- Coffees stay purely good.

### Upgrades (rarer, dropped by bosses and mid-bosses)

- **Laptop** → companion drone firing alongside the hero.
- **Tech gadget** (Wi-Fi antenna) → 3-way spread shot.
- **Syringe** → piercing shots, 10 s.
- **Stethoscope** → restores a life (or a shield if lives are full).

Icons readable at ~24 px; bad items distinct from good ones by shape and colour, not colour alone.

## Weather and time of day (random per stage, affects play fairly)

| Sky | Visual | Gameplay |
|---|---|---|
| Clear blue | Bright, soft clouds | Baseline |
| Cloudy | Foreground clouds drifting | Clouds briefly hide some enemy shots |
| Rain | Diagonal rain | Hero slides a little (inertia) |
| Fog | Fog with a clear radius around the hero | Less visibility near the top |
| Sunrise / sunshine | Warm gradient, sun glare | Occasional glare band crossing the screen |
| Night | Stars, enemies with glowing outlines | Darker field, glowing shots |

**Photosensitivity:** no full-screen flashes or strobing; glare/lightning soft and under 3 flashes
per second. Respect `prefers-reduced-motion` (fewer particles, no screen shake).

## Stages and bosses — kindergarten to master's degree

Each stage = themed enemy waves + a boss. Bosses are **teacher archetypes**, never real people.

1. **Jardim de infância** — giant crayons, throws building blocks and glitter.
2. **1.º ciclo** — chalkboard teacher: chalk projectiles, flying times-tables ("7×8?").
3. **2.º/3.º ciclo** — maths teacher with ruler and compass: geometric shapes, bouncing protractors.
4. **Secundário** — physics/chemistry teacher: bubbling flasks, "Exame Nacional" papers raining.
5. **Licenciatura** — professor with laser pointer slides, attendance sheets, "deadline" clocks.
6. **Mestrado (final boss)** — thesis supervisor and jury: red-pen storms, swarms of references, a
   "revisão pedida" shield that only the energy wave breaks.

### Mid-bosses — adult life (from stage 4 onwards, between waves)

- **Impostos** — paper monster of forms and invoices; splits into smaller forms when hit.
- **Acidente de carro** — cartoon cars swerving down the lanes; dodge, then shoot the tow truck.
- **Crédito à habitação** — a house with a rising interest-rate chart firing % signs.
- **Caos nas viagens** — giant suitcase and delayed-flight boards.

### Dia de jogo (special stage between 3 and 4)

- Emblem and outfit switch to the blue-and-white dragon look.
- Enemies: footballs, flying whistles, generic referee robots (no real clubs or players).
- Yellow card = slowdown; red card = lose a life; golden ball = big bonus.

## Screens and flow

- Title: game title, "Jogar", recorde, mute toggle, icon-based controls hint.
- Between stages: stage card ("Nível 3 — 2.º/3.º Ciclo") + one-line tip.
- Game over: score, recorde, "Recomeçar".
- Victory after the master's boss: celebration, "Mestre!", the hero finally gets a coffee.

## Repository and delivery

- New public repo under `hasp7`, GitHub Pages; added to hasp-HQ as a submodule under `projects/`.
- `README.md` in pt-PT: what it is, how to play, how to customise `character.js`, credits.
- Assets: original drawings + the HC phoenix only. No third-party logos, crests or sprites.

## Acceptance checks

- Smooth on a phone in portrait, one-handed, touch only.
- First-time player gets the controls within 10 s.
- Good vs. bad items distinguishable at a glance.
- All six skies appear across runs; fog and night stay fair.
- No network requests; works offline after first load.
- All visible text pt-PT (except the catchphrase).
