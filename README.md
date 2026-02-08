# The HBM - Website v2

React + Vite + Tailwind CSS v4

## Setup
```bash
npm install
npm run dev
```

## Structure
- `src/data/content.js` - ALL site text and image URLs (edit this to change content)
- `src/pages/` - Page components (Home, FAQ, About, B2B)
- `src/components/` - Shared components (Navbar, Footer, Layout)

## Content Editing
All text content is centralized in `src/data/content.js`. 
Images currently load from the WordPress site URLs.

## Build
```bash
npm run build
```
Output goes to `dist/` folder.
