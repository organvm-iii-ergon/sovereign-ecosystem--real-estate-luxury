# CLAUDE.md — sovereign-ecosystem--real-estate-luxury

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Sovereign Ecosystem** — luxury real estate marketplace with compliance intelligence. Dual-role platform (Agent / Client) for discovering, analyzing, and transacting ultra-high-net-worth properties. Features AI compliance analysis, risk mapping, blockchain-verified document vaults, AR property previews, and offline sync.

## Commands

```bash
pnpm install         # Install dependencies
pnpm run dev         # Vite dev server (port 5000)
pnpm run build       # tsc + vite build
pnpm run lint        # ESLint
pnpm run test        # Vitest (no test suite yet)
```

## Architecture

GitHub Spark app: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion. Uses **pnpm** (not npm).

**App entry**: `src/App.tsx` — role-gated shell. User selects Agent or Client role; state persisted via `useKV`. Role determines which dashboard is shown.

**Core flows**:
- Agent: `AgentDashboard` → properties, client management, team, market analytics
- Client: `ClientFeed` → property discovery, compliance status, appointment booking

**Key components** (`src/components/`):
- **Property intelligence**: `MarketOverview`, `PatternAlertNotifications`, `LiveAlertToast`
- **Compliance**: `analyzeProperty()` (from `src/lib/compliance.ts`) classifies each property; `getWatchlistProperties()`, `getRiskMapProperties()`
- **AI tools**: `AIConcierge`, `OfflineSyncIndicator`
- **Client experience**: `ClientAuth`, `RoleSelector`, `PrivateVault`
- **Team management**: `TeamManagementDashboard`
- **UX**: `ParticleBackground`, `FloatingElements`, `ThemeToggle`, `LanguageDetectionBanner`

**Sound system**: `src/lib/sound-manager.ts` provides theme-aware sound effects; mutable via `soundEnabled` toggle.

**Market data**: `src/lib/market-data.ts` — `marketDataService.initialize(properties)` on mount, `cleanup()` on unmount.

**State**: `properties` and `documents` via `useKV`; role, auth, and sound are local `useState`.

**Path alias**: `@/*` → `src/*`

## Deployment

Live at **https://sovereign-ecosystem.netlify.app** (Netlify, `main` branch auto-deploys).

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** CANDIDATE
**Org:** `unknown` | **Repo:** `sovereign-ecosystem--real-estate-luxury`

### Edges
- **Produces** → `unknown`: unknown

### Siblings in Commerce
`classroom-rpg-aetheria`, `gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter`, `.github` ... and 11 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-02-24T12:41:28Z*
<!-- ORGANVM:AUTO:END -->
