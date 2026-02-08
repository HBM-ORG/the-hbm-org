# The HBM - Bringing People Together

Official website for [The Human Being Movement](https://www.thehbm.org) — real connection through 8-minute video conversations.

## Tech Stack

- **React 19** + **Vite** — Fast build & dev server
- **Tailwind CSS v4** — Utility-first styling
- **React Router** — Client-side routing
- **Framer Motion** — Animations
- **Lucide React** — Icons

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/     # Reusable UI components (Layout, Navbar, Footer)
├── pages/          # Route pages (Home, FAQ, About, B2B)
├── data/
│   └── content.js  # ⭐ ALL site content — edit text here
├── assets/         # Images, fonts, etc.
├── App.jsx         # Router setup
├── main.jsx        # Entry point
└── index.css       # Global styles + design tokens
```

## Editing Content

All text content lives in `src/data/content.js`. Edit text there — changes appear instantly in dev mode.

## Deployment

```bash
npm run build
# Upload dist/ folder to Hostinger
```

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| `hbm-blue` | `#4A5ACF` | Primary brand |
| `hbm-coral` | `#E8845A` | Accent, CTAs |
| `hbm-lavender` | `#B8A5D4` | Secondary |
| `hbm-cream` | `#FFF8F0` | Backgrounds |

Fonts: **DM Serif Display** (headings) + **DM Sans** (body)

© HBM 2026
