# NEON PONG — The Ultimate Arcade Experience

A futuristic, production-ready Pong arcade web game built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **HTML5 Canvas**.

## Features

- **Two Game Modes**
  - **Single Player vs AI**: Predictive AI opponent that calculates future ball trajectories including wall bounces across 4 difficulty tiers (`Easy`, `Medium`, `Hard`, `Impossible`).
  - **Local Two Player**: Simultaneous shared-keyboard 1v1 (`W`/`S` vs `↑`/`↓`) plus dual multi-touch virtual pads on mobile/tablet devices.
- **60 FPS HTML5 Canvas Engine**
  - Sub-stepped collision detection prevents ball tunneling at high rally speeds.
  - Dynamic bounce angles based on paddle impact offset and progressive rally speed escalation.
  - Neon glow trails, particle bursts, screen shake, and floating rally callouts.
- **Procedural Web Audio Synthesizer**
  - Original zero-dependency sound effects for paddle hits, wall bounces, scoring, countdowns, and victory/defeat fanfares, plus toggleable synthwave background music.
- **Responsive & Mobile-Ready**
  - HiDPI canvas scaling (`ResizeObserver` + `devicePixelRatio`) in both portrait and landscape layouts.
  - Virtual Up/Down controls and direct touch-drag support.
- **Customizable Arcade Settings**
  - AI Difficulty, Winning Score (`5`, `10`, `15`), Ball Speed (`Slow`, `Normal`, `Fast`), Sound Volume & Mute, Background Music toggle, and Visual FX toggle (saved in `localStorage`).

## Controls

| Action | Keyboard | Mobile / Touch |
| --- | --- | --- |
| Player 1 Move | `W` / `S` (or `↑` / `↓` in 1P AI mode) | Virtual Up/Down or Court Drag |
| Player 2 Move (2P) | `↑` / `↓` Arrow Keys | Right Virtual Up/Down or Court Drag |
| Pause / Resume | `Space` | Pause / Resume Button |
| Exit to Main Menu | `ESC` (with confirmation) | Menu Button |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build & Typecheck

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

## Deploy to Vercel

This project has zero backend state dependencies and requires no environment variables or API keys.

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Keep the default **Next.js** build settings (`npm run build`).
4. Click **Deploy**.
