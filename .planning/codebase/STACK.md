# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code in `src/`
- TSX - React components throughout

**Secondary:**
- JavaScript - Vite configuration and Node tooling

## Runtime

**Environment:**
- Node.js (implied by package.json, no specific version locked)

**Package Manager:**
- npm (lockfile: present as package-lock.json)

## Frameworks

**Core:**
- React 19.2.0 - UI framework, component-based architecture
- React Router 7.13.1 - Client-side routing for multi-page navigation

**State Management:**
- Zustand 5.0.11 - Lightweight store management (`src/stores/`)

**UI Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite integration plugin

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server
- @vitejs/plugin-react 5.1.1 - React support in Vite

**Data Visualization:**
- Recharts 3.7.0 - Charting library for dashboard metrics

**PWA:**
- vite-plugin-pwa 1.2.0 - Progressive Web App support with Workbox
- Workbox integration (auto-included via vite-plugin-pwa)

**Date/Time:**
- date-fns 4.1.0 - Date manipulation and formatting utilities

**Local Data Storage:**
- Dexie 4.3.0 - IndexedDB wrapper for structured data persistence

## Key Dependencies

**Critical:**
- Dexie 4.3.0 - Powers all data persistence (tasks, protocols, meals, logs)
- Zustand 5.0.11 - Centralized state management across stores
- React Router 7.13.1 - Application navigation and routing

**Infrastructure:**
- date-fns 4.1.0 - Time/date calculations and display formatting
- Tailwind CSS 4.2.1 - Visual presentation layer
- Recharts 3.7.0 - Analytics dashboard visualization
- vite-plugin-pwa 1.2.0 - PWA capabilities, offline support

## Configuration

**Environment:**
- No `.env` files required for core functionality
- Base path configurable via `import.meta.env.BASE_URL` (set to `/` in production, customizable for GitHub Pages)
- HTTPS supported in dev via optional local certificates (`certs/`)

**Build:**
- TypeScript compilation: `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`
- Vite config: `vite.config.ts`
- ESLint config: `eslint.config.js`
- PWA manifest configured in `vite.config.ts`

**Dev Server:**
- HTTPS capable (auto-detects local certificates, falls back to HTTP)
- Host accessible from network devices

## Platform Requirements

**Development:**
- Node.js + npm
- TypeScript 5.9+ type support
- ESLint + TypeScript ESLint tools
- Optional: mkcert for HTTPS certificates in dev

**Production:**
- Static hosting (GitHub Pages, Vercel, Netlify, any static host)
- Browser with IndexedDB support (all modern browsers)
- PWA capable browser (service worker support)

---

*Stack analysis: 2026-03-13*
