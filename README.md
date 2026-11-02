# MKWorldItemProb v1.0.0 — Mario Kart World (`v1.8.0`) Interactive Item Probability Table

**MKWorldItemProb** is an interactive **React + TypeScript + Vite** web application by **[liskadi](https://mkcentral.com/en-us/registry/players/profile?id=44345)** for exploring the item box probability matrix, 5 opening-to-normal race phases, global availability caps, and real-time scenario odds of **Mario Kart World (`v1.8.0`)**.

All probability weights, placement-to-pool mappings, opening race phase clamps, and global racer/cooldown parameters are derived from static analysis of the game's executable (`main.elf`) and parameter tables (`general_format.Product_180.sarc.zs`).

---

## Features

1. **01 • Decompiled Item Box Engine (`<ProbabilityMatrix />`)**:
   - **Lobby Size Switch (`12 Players` vs. `24 Players`)**: View exact item probabilities across 12-player (`1st–12th`) and 24-player (`1st–24th`) lobbies, with a 24P toggle between **All 24 Columns** and **12 Grouped Tiers**.
   - **5 Race Time Phases (`0s` to `45s+`)**:
     - **Phase 1 (`0s – 25s`)**: Opening position clamps active (`1st → 4th`, `2nd–5th → 5th`, `7th+ → 7th`) with 11 initial race items unlocked.
     - **Phase 2 (`25s – 30s`)**: Front and mid-pack clamps expire (`1st–7th` normal), `8th+ → 7th` remains clamped, and **9 mid-tier items unlock**.
     - **Phase 3 (`30s – 35s`)**: All positions pull their true pools and **4 items unlock** (Super Horn, Blooper, Kamek, Bullet Bill).
     - **Phase 4 (`35s – 45s`)**: **Golden Mushroom** and **Spiny Shell** unlock.
     - **Phase 5 (`45s+`)**: **Lightning** unlocks; all 27 pullable race items and all placement pools are 100% active.
   - **Item Table Source**: Switch between **Standard Race** (human player table) and **CPU/AI Racers** (COM opponent table).
2. **02 • Global Racer Caps & Timing Gates (`<AvailabilityTable />`)**:
   - **12 Players vs. 24 Players Switch**: Displays maximum simultaneous racers holding each item, global world racer caps, per-pull counts, eligible placement spots, first-available times (`0s`, `25s`, `30s`, `35s`, `45s`), global post-use cooldown timers (`30s` Blooper, `45s` Kamek, `90s` Spiny Shell & Lightning), active duration timers, duplicate slot rules, and `Online Server Check` indicators.
3. **03 • Real-Time Scenario Simulator & Odds Engine (`<ProbabilityCalculator />`)**:
   - Configure your **Target Item**, **Placement**, **Total Racers in Lobby (`1–24`)**, **Race Elapsed Time Phase**, **Item Already Held in Slot 1** (simulating duplicate slot prevention), **Ruleset / Table**, and **Distance Behind 1st (`m`)**.
   - Computes exact **Single Item Box (`%`)**, **Double Item Box (`≥1` non-duplicate pull `%`)**, fractional pull odds (`1 in X`), and renders live placement and full-roulette comparison charts.

---

## Development & Build

```bash
# Install dependencies
npm install

# Start Vite development server with hot-reload
npm run dev

# Type-check with TypeScript and build production bundle into ./dist
npm run build

# Locally preview the production build
npm run preview
```

---

## Deploying to GitHub Pages

`vite.config.ts` is pre-configured with `base: './'`, so the built app works automatically on GitHub Pages (`https://liskadi.github.io/MKWorldItemProb/`) or any custom domain.

1. Push this repository to GitHub (`main` or `master` branch).
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` will automatically build and publish `./dist` to GitHub Pages on every push.

---

## Disclaimer

MKWorldItemProb is an independent, non-commercial, fan-made reverse-engineering and data-visualization project for educational, informational, and community research purposes. This website and its creator are not affiliated with, endorsed by, sponsored by, or officially connected to Nintendo Co., Ltd., Nintendo of America Inc., Nintendo EPD (Entertainment Planning & Development), or any of their subsidiaries, affiliates, or development partners. Mario Kart, Mario Kart World, Nintendo Switch, Nintendo Switch 2, and all associated item names, icons, characters, trademarks, and game assets are the sole intellectual property and registered trademarks of Nintendo Co., Ltd. All statistical data is derived from independent analysis of game parameters, and all in-game icons are used strictly for identification and informational commentary under fair use.
