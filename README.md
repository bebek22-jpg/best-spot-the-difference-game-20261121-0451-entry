# TWINLIGHT — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/bebek22-jpg/best-spot-the-difference-game-20261121-0451-entry/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/bebek22-jpg/best-spot-the-difference-game-20261121-0451-entry/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference hunt across three hand-drawn scenes, built for
[make.fun's best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
bounty. Original game, art, sound and code — no libraries, no network
requests, no assets: every picture is drawn procedurally in code and every
sound is synthesised with WebAudio.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 in a desktop browser. Or serve `game/` with
any static file server and open `game/index.html`.

## How to play

Two pictures hang side by side — almost the same, never quite. Find every
difference before the clock runs out.

- **Click** a difference on either picture to mark it with a golden ring
- **H** — hint (lights up a difference you haven't found yet; 3 per level)
- **P** — pause · **M** — sound · **R** — restart level · **Enter** — next

Quick finds in a row build a combo (up to +100 bonus per find). A wrong click
costs 5 seconds and 25 points; a hint costs 50 points. Clearing a level pays
a time bonus of 5 points per second left. Your best score is kept in the
browser.

## What's inside

- Three original scenes, drawn procedurally on canvas, with rising
  difficulty: **Harbour Dawn** (8 differences, 3:00), **Night Market**
  (9 differences, 2:30), **Clockwork Garden** (10 differences, 2:00)
- 27 planted differences, hidden by design: missing clouds and cats, changed
  colours, clock hands, gear counts, steam curls, sign shapes
- Satisfying finds: an animated golden ring with a star, sparkle particles
  on both panels, a rising chime that climbs with your combo
- Time pressure you can feel: a draining timer bar that turns red, ticking
  in the last 10 seconds, a 5-second penalty for every miss
- Title, pause, level-clear, time-up and victory screens with run stats
  (score, time bonus, accuracy) and instant restart
- Deterministic screenshot scenes: `?shot=play|win|start&level=1..3`

## Layout

```
game/
  index.html            the page; two 560x400 canvases, HUD, overlays
  style.css             warm dark frame, gold accents, storybook serif
  src/
    main.js             boot, HUD + overlay wiring, frame loop, shot mode
    config.js           every tuning number in one place
    random.js           seeded RNG + math helpers
    engine.js           state machine, clicks, scoring, timer, hints
    scenes.js           the three procedural scenes + difference data
    render.js           panels, find-markers, hint pulse, particles
    audio.js            synthesised WebAudio SFX (no audio files)
    input.js            pointer + keyboard wiring
    shots.js            deterministic screenshot scenes
    storage.js          best-score persistence
main.ts                 the entry program: copies game/ + screenshots/ to
                        /output and writes dossier.json (kit library)
serve.ts                tiny static server for local play
vendor/makefun-game.ts  the kit's dossier library, unchanged
screenshots/            1-harbour, 2-market, 3-garden, 4-level-clear
```

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=9sdv3agh&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
