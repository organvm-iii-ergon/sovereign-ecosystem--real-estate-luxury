[![ORGAN-III: Ergon](https://img.shields.io/badge/ORGAN--III-Ergon-1b5e20?style=flat-square)](https://github.com/organvm-iii-ergon)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

# The Sovereign Ecosystem — Luxury Real Estate Platform

**An AI-powered luxury real estate analytics platform featuring augmented-reality property visualization, real-time multi-user collaboration, regulatory compliance automation, and a glassmorphism design language built for high-net-worth property management.**

> **ORGAN-III (Ergon)** is the Commerce organ of the [ORGANVM system](https://github.com/organvm-iii-ergon) — the domain of products, services, and revenue-generating software. The Sovereign Ecosystem is one of ORGAN-III's flagship B2C applications: a full-stack property intelligence platform that synthesizes market analytics, AI-driven concierge services, and spatial computing into a single cohesive experience for luxury real estate professionals and their clients.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Technical Architecture](#technical-architecture)
- [Installation and Quick Start](#installation-and-quick-start)
- [Core Feature Set](#core-feature-set)
- [Design Language](#design-language)
- [Compliance Engine](#compliance-engine)
- [AI Concierge System](#ai-concierge-system)
- [Collaboration and Offline Capabilities](#collaboration-and-offline-capabilities)
- [AR Spatial Recognition](#ar-spatial-recognition)
- [Data Models and Domain Types](#data-models-and-domain-types)
- [Performance and Browser Support](#performance-and-browser-support)
- [Accessibility](#accessibility)
- [Project Documentation](#project-documentation)
- [Roadmap and Investment Thesis](#roadmap-and-investment-thesis)
- [Cross-Organ References](#cross-organ-references)
- [Related Work](#related-work)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Product Overview

The luxury real estate market operates at the intersection of aspiration, regulation, and financial complexity. Agents managing portfolios worth tens of millions of dollars need tools that match the sophistication of the properties they represent — tools that are simultaneously beautiful, intelligent, and legally rigorous. The Sovereign Ecosystem was designed to fill that gap.

At its core, the platform provides three primary experiences, each tailored to a distinct user role:

1. **Agent Dashboard** — A comprehensive command center for property management, market analytics, compliance monitoring, team coordination, and client relationship tools. Agents see live price feeds, pattern-based alerts, portfolio health scores, and regulatory watchlists in a single glassmorphic interface.

2. **Client Feed** — A curated, swipe-navigable property browsing experience designed for high-net-worth buyers and investors. Properties are presented as flippable cards with front-side visual presentation (live pricing, key metrics, curated badges) and back-side financial deep-dives (cap rates, ROI projections, compliance alerts, price performance sparklines).

3. **Private Vault** — A secure document management layer for deeds, inspection reports, leases, and financial records, organized by property and accessible through role-based permissions.

Beyond these three views, the platform integrates an AI concierge for natural-language property search, a real-time collaboration system for multi-contractor workflows, offline-first architecture for field work in areas with poor connectivity, and an augmented-reality measurement and room-template system for spatial property analysis.

The application is built entirely in TypeScript with React 19 and ships as a single-page application using Vite for bundling, Tailwind CSS v4 for styling, and the shadcn/ui component library for accessible, composable primitives. The codebase currently spans 141 files and approximately 38,000 lines of code, organized into a service-oriented architecture with clear separation between domain logic, UI components, and data hooks.

### Why "Sovereign"?

The name reflects a design philosophy: each property in a luxury portfolio is treated as a sovereign entity — with its own financial profile, regulatory obligations, compliance history, and market dynamics. The platform does not flatten properties into rows in a spreadsheet. It gives each one a first-class identity with dedicated analytics, alerts, and document storage. The ecosystem metaphor extends to the relationships between properties: portfolio diversification scoring, cross-property compliance patterns, and market correlation analysis all treat the portfolio as a living system rather than a static list.

---

## Technical Architecture

The Sovereign Ecosystem follows a service-oriented frontend architecture where domain logic is encapsulated in singleton service classes, UI state is managed through React hooks and the `useKV` persistence layer from GitHub Spark, and presentation is handled by composable React components built on Radix UI primitives.

### Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | React 19 + TypeScript 5.9 | Component model and type safety |
| **Bundler** | Vite 7 + SWC | Fast dev server, optimized production builds |
| **Styling** | Tailwind CSS v4 + custom theme | Utility-first CSS with luxury design tokens |
| **Components** | shadcn/ui (Radix primitives) | Accessible, composable UI building blocks |
| **Animation** | Framer Motion 12 | Physics-based transitions, layout animations |
| **Visualization** | D3.js 7 + Recharts | Market charts, sparklines, data overlays |
| **3D / Spatial** | Three.js 0.182 | AR property viewer and spatial rendering |
| **Audio** | Web Audio API | Theme-specific sound design and feedback |
| **Persistence** | IndexedDB (via useKV) | Client-side property data, preferences, queues |
| **Forms** | React Hook Form + Zod | Validated input handling with schema inference |
| **State** | TanStack Query | Server-state caching and synchronization |

### Directory Structure

```
src/
├── App.tsx                          # Root: role selection, tab routing, theme/sound
├── ErrorFallback.tsx                # Error boundary UI
├── components/
│   ├── AgentDashboard.tsx           # Agent command center
│   ├── ClientFeed.tsx               # Client property browsing
│   ├── PrivateVault.tsx             # Secure document manager
│   ├── AIConcierge.tsx              # Natural-language property assistant
│   ├── MarketOverview.tsx           # Market analytics dashboard
│   ├── ARPropertyViewer.tsx         # Augmented-reality viewer
│   ├── ARRoomTemplates.tsx          # Spatial room template system
│   ├── CollaborationView.tsx        # Real-time multi-user sessions
│   ├── TeamManagementDashboard.tsx  # Team performance and coordination
│   ├── PatternAlertDashboard.tsx    # Market pattern detection
│   ├── PortfolioValueTracker.tsx    # Portfolio analytics
│   ├── FlippablePropertyCard.tsx    # Interactive 3D card component
│   ├── ParticleBackground.tsx       # Constellation particle system
│   ├── FloatingElements.tsx         # Ambient decorative layer
│   ├── OfflineSyncIndicator.tsx     # Sync status overlay
│   └── ui/                          # 40+ shadcn/ui primitives
├── hooks/
│   ├── use-market-data.ts           # Real-time market feed hook
│   ├── use-pattern-alerts.ts        # Alert pattern detection hook
│   ├── use-language-detection.ts    # Auto-locale detection hook
│   └── use-theme.ts                 # Theme state management
├── lib/
│   ├── types.ts                     # Domain type definitions
│   ├── compliance.ts                # Regulatory compliance engine
│   ├── ai-concierge-service.ts      # AI query analysis and response
│   ├── recommendation-engine.ts     # Property scoring and matching
│   ├── market-data.ts               # Market data service
│   ├── spatial-recognition-service.ts # Room type detection
│   ├── collaboration-service.ts     # Real-time session management
│   ├── offline-sync-service.ts      # Offline queue and sync
│   ├── pattern-alerts.ts            # Pattern-based alert system
│   ├── chart-export-service.ts      # Chart image/PDF export
│   ├── email-schedule-service.ts    # Scheduled email reports
│   ├── notification-delivery.ts     # Push/email notification routing
│   ├── sound-manager.ts             # Theme-aware audio engine
│   ├── language-detection.ts        # Locale detection logic
│   ├── csv-export.ts                # Data export utilities
│   └── translations.ts             # i18n string table
└── styles/
    └── theme.css                    # CSS custom properties for themes
```

### Data Flow

The application follows a unidirectional data flow pattern. Properties are loaded from the `useKV` persistence layer and enriched through the compliance engine (`analyzeProperty`) before reaching any UI component. Market data flows through a singleton `MarketDataService` that initializes on property load and emits updates via subscription. The AI concierge service receives the current property context, user preferences, and conversation history, then returns structured `QueryAnalysis` objects that the UI translates into property recommendations, market insights, or portfolio health assessments.

Offline operations are queued in IndexedDB by the `OfflineSyncService` and replayed automatically when connectivity is restored. The sync queue survives page refreshes and supports automatic retry with exponential backoff (up to 3 attempts per operation).

---

## Installation and Quick Start

### Prerequisites

- **Node.js** 20+ (or latest LTS)
- **pnpm** (recommended) or npm
- A modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Setup

```bash
# Clone the repository
git clone https://github.com/organvm-iii-ergon/sovereign-ecosystem--real-estate-luxury.git
cd sovereign-ecosystem--real-estate-luxury

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The dev server starts on `http://localhost:5173` by default (Vite). Hot module replacement is enabled for instant feedback during development.

### Build and Preview

```bash
# Type-check and build for production
pnpm build

# Preview the production build locally
pnpm preview

# Lint the codebase
pnpm lint
```

### Configuration

Runtime configuration is managed through `runtime.config.json` at the project root and `theme.json` for the design token layer. The Vite configuration (`vite.config.ts`) uses the React SWC plugin for fast JSX transformation and is pre-configured for the Tailwind CSS v4 PostCSS integration.

---

## Core Feature Set

### Live Market Intelligence

The platform provides real-time market data through the `MarketDataService`, which initializes on property load and maintains live price feeds. Key features include:

- **Price Sparklines** — Miniature inline charts rendered via D3.js that show price movement over configurable time windows directly on property cards and in the market overview.
- **Market Ticker** — A scrolling real-time ticker displaying price changes, volume, and activity indicators across the monitored property set.
- **Volatility Pattern Analyzer** — Detects market patterns (price spikes, sustained drops, consolidation) and surfaces them through the `PatternAlertDashboard` with configurable notification thresholds.
- **Industry Benchmarks** — Contextual comparison of property metrics against regional and national averages.
- **Historical Replay** — Time-series playback of market conditions for any property, enabling agents to demonstrate historical performance to clients.

### Portfolio Management

- **Portfolio Value Tracker** — Aggregate portfolio valuation with trend analysis, diversification scoring, and risk assessment. The diversification algorithm checks geographic spread and penalizes over-concentration in a single city.
- **Property Comparison** — Side-by-side comparison of up to four properties with strength/weakness analysis, composite scoring, and shareable comparison links.
- **Circular Yield Slider** — A custom interactive control for adjusting yield projections and visualizing cap rate scenarios.
- **Chart Export** — Export any chart or dashboard view as PNG, SVG, or PDF through the `ChartExportService`.

### Team and Client Management

- **Team Management Dashboard** — Create teams, assign roles, track individual and team performance metrics through the `TeamPerformanceService`.
- **Team Leaderboard** — Competitive performance rankings with configurable scoring criteria.
- **Client Authentication** — Invite-code-based client access with role-based view restrictions.
- **Email Scheduler** — Automated report delivery scheduling for clients and team members.
- **Messaging Integrations** — Notification routing to external messaging platforms.

### Interactive Property Cards

Properties are rendered as `FlippablePropertyCard` components with a physics-based 3D flip animation (Framer Motion with elastic easing):

- **Front side** — Hero image, live price display with sparkline, location, key metrics (beds, baths, sqft), curated badge, and market activity indicator.
- **Back side** — Detailed financial breakdown (cap rate, ROI, projected rent), compliance flag summary, price performance chart, and action buttons for comparison, alerts, and vault access.

The flip interaction is keyboard-accessible (Enter/Space triggers flip) and includes full ARIA labeling for screen readers.

---

## Design Language

The Sovereign Ecosystem employs a luxury-grade glassmorphism design language built on carefully curated typography and color palettes.

### Typography

- **Display / Headings** — Cormorant (serif) — evokes the editorial quality of luxury print media.
- **Body / UI** — Outfit (sans-serif) — clean, modern, and highly legible at small sizes.

### Color Palettes

**Light Theme:**
| Token | Color | Usage |
|-------|-------|-------|
| Rose Blush | `#f4e5e0` | Primary accent, card backgrounds |
| Champagne | `#f5e6c8` | Secondary accent, highlights |
| Pearl White | `#faf8f5` | Base background |
| Lavender | `#e8dff5` | Tertiary accents, hover states |

**Dark Theme:**
| Token | Color | Usage |
|-------|-------|-------|
| Moonlit Indigo | `#1a1a2e` | Base background |
| Violet | `#4a3f6b` | Card backgrounds, panels |
| Lavender | `#a78bfa` | Primary accent |
| Silver | `#c0c0c0` | Text, borders |

### Glassmorphism

All major surfaces use the glassmorphism technique: semi-transparent backgrounds (`bg-card/70`) with strong backdrop blur (`backdrop-blur-2xl`), subtle borders at 30-40% opacity, and layered shadows with theme-aware color values. This creates a depth effect where content appears to float on frosted glass, reinforcing the premium aesthetic.

### Particle System

The background features a constellation particle system (`ParticleBackground` component) rendering three thematic formations:

- **Crown Constellation** — Symbolizes luxury and sovereignty.
- **House Constellation** — Represents real estate and architecture.
- **Diamond Constellation** — Represents value, investment, and permanence.

Constellation particles have enhanced glow effects and maintain their formation while subtly drifting. They are connected by gradient lines with shadow effects for depth, and remain responsive to theme transitions.

### Theme-Specific Sound Design

The `SoundManager` provides differentiated audio feedback based on the active theme:

- **Light mode** — Higher-frequency tones (brighter, crystalline character).
- **Dark mode** — Lower-frequency tones (deeper, atmospheric character).

Sound effects include `glassTap` (primary interaction), `cardFlip` (card rotation), `shimmer` (subtle highlight), and `softClick` (gentle feedback). All effects are generated procedurally through the Web Audio API — no audio file dependencies.

---

## Compliance Engine

One of the platform's most distinctive features is its automated regulatory compliance monitoring. The compliance engine (`src/lib/compliance.ts`) evaluates every property against jurisdiction-specific regulations and surfaces actionable alerts.

### Supported Regulations

**Good Cause Eviction (New York)**

New York's Good Cause Eviction law limits rent increases and restricts eviction grounds for qualifying properties. The engine calculates the exemption threshold (fair market rent multiplied by 2.45) and determines whether a property falls under the law's protections. For non-exempt properties, it computes the legal rent cap (current rent + 10%) and flags the property with a `GOOD_CAUSE_NY` compliance alert.

**Lead Watchdog (New Jersey)**

New Jersey's lead paint regulations require inspection of pre-1978 properties at defined intervals. The engine checks the property's year of construction and last inspection date, flagging properties with:
- `URGENT` severity if no inspection is on record.
- `URGENT` severity if the last inspection was more than three years ago (with the exact number of overdue days calculated).
- `INFO` severity for compliant properties with recent inspections.

**Lease Expiration Monitoring**

The engine monitors lease end dates and generates `LEASE_EXPIRING` alerts at configurable thresholds, giving agents and clients advance warning to negotiate renewals or plan transitions.

### Compliance Workflow

Properties pass through `analyzeProperty()` on load, which attaches an array of `ComplianceFlag` objects — each with a `type`, `severity` (URGENT / WARNING / INFO), human-readable `message`, and optional `calculatedValue`. The `getWatchlistProperties()` and `getRiskMapProperties()` functions aggregate these flags across the entire portfolio, feeding the Agent Dashboard's compliance watchlist and risk map views.

---

## AI Concierge System

The AI Concierge (`src/lib/ai-concierge-service.ts`) provides a natural-language interface to the entire property dataset. It is implemented as a singleton service with structured query analysis and multi-intent response generation.

### Query Analysis Pipeline

When a user submits a natural-language query, the concierge:

1. **Classifies intent** — Maps the query to one of eight recognized intents: `property-search`, `comparison`, `market-analysis`, `investment-advice`, `portfolio-health`, `document-query`, `financial-calculation`, or `general-question`.
2. **Extracts entities** — Identifies structured parameters (price ranges, locations, bedroom counts, property features) from free-text input.
3. **Generates suggested actions** — Proposes follow-up interactions based on the detected intent and extracted entities.

### Recommendation Engine

The recommendation engine (`src/lib/recommendation-engine.ts`) scores properties against user preferences using a weighted multi-factor model:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Price range match | 30 pts | Full match within range; 15 pts for below-range |
| Location preference | 25 pts | City matches user's preferred cities |
| Investment goals | 20 pts | Cash-flow: cap rate > 5%; appreciation: ROI > 8% |
| Bedroom requirement | 15 pts | Meets or exceeds minimum bedrooms |
| Curated status | 15 pts | Agent-curated properties receive a bonus |
| Diversification | 15 pts | Properties in new cities for moderate-risk portfolios |
| Bathroom requirement | 10 pts | Meets or exceeds minimum bathrooms |
| Compliance health | 10 pts | No URGENT compliance flags |

Recommendations are categorized by urgency (high / medium / low) and type (new listing, off-market opportunity, price drop, portfolio match, expiring lease).

### Response Types

The concierge generates structured responses including:

- **PropertyComparison** — Strength/weakness analysis with per-property scoring and a final recommendation.
- **MarketInsight** — Trend summaries, opportunity flags, risk assessments, and average portfolio metrics.
- **PortfolioHealth** — Overall health score, diversification rating, risk assessment, and actionable improvement recommendations.

### Multi-Language Support

The concierge integrates with a language detection service (`src/lib/language-detection.ts`) that identifies the user's locale and presents a `LanguageDetectionBanner` offering to switch the interface language. Translation strings are managed through `src/lib/translations.ts`.

---

## Collaboration and Offline Capabilities

### Real-Time Collaboration

The collaboration system (`src/lib/collaboration-service.ts`) enables multiple contractors to work simultaneously on property measurements and annotations:

- **Live multi-user sessions** with color-coded presence avatars and cursor tracking.
- **Threaded comments** on specific measurements with instant synchronization.
- **Granular access control** — per-contractor permissions (view, comment, edit).
- **Activity feed** — Real-time log of all changes and interactions within a session.
- **Automatic session creation** when a measurement collection is shared with a contractor.

### Offline-First Architecture

The offline sync system (`src/lib/offline-sync-service.ts`) implements a local-first data strategy:

- All measurements and changes are saved to IndexedDB before any network operation.
- When connectivity is lost, operations are queued transparently.
- On reconnection, the queue replays automatically with retry logic (up to 3 attempts per operation).
- The `OfflineSyncIndicator` component provides always-visible status in the bottom-right corner, with an expandable panel showing sync progress, pending changes, and any errors.
- The pending-changes queue persists across page refreshes and application restarts.

This architecture is critical for field work — property inspections in basements, rural areas, or new construction sites frequently have unreliable connectivity.

---

## AR Spatial Recognition

The AR subsystem (`src/lib/spatial-recognition-service.ts` + `src/components/ARPropertyViewer.tsx` + `src/components/ARRoomTemplates.tsx`) provides augmented-reality property measurement and room-type detection.

### Room Templates

The system ships with eight pre-built room templates, each containing typical dimensional ranges and contextual measurement presets:

| Template | Typical Dimensions (ft) | Presets |
|----------|------------------------|---------|
| Kitchen | 10 x 12 x 9 | Width, length, counter depth, cabinet height, island clearance |
| Bedroom | 12 x 14 x 9 | Width, length, closet depth, window height |
| Bathroom | 8 x 10 x 9 | Width, length, vanity width, shower dimensions |
| Living Room | 15 x 18 x 9 | Width, length, fireplace width, window span |
| Dining Room | 12 x 14 x 9 | Width, length, chandelier height, table clearance |
| Office | 10 x 12 x 9 | Width, length, desk span, bookshelf height |
| Hallway | 4 x 15 x 9 | Width, length, door clearance |
| Closet | 6 x 8 x 9 | Width, depth, shelf height, rod height |

### Spatial Analysis

When measurements are taken, the `SpatialRecognitionService` performs dimensional analysis against known room-type profiles and returns a `SpatialAnalysis` object containing:

- **Detected room type** with confidence score (0-100%).
- **Suggested template** for one-click measurement application.
- **Dimensional comparison** — actual versus typical values for the detected room type.
- **Matched spatial features** — which room-characteristic indicators were detected.

### Measurement Workflow

1. Enter AR mode through the `ARPropertyViewer` component.
2. Take dimensional measurements (width, length, height).
3. The system auto-detects the room type and suggests a template.
4. Apply the template to auto-populate contextual measurement labels and defaults.
5. Annotate measurements with notes using the `MeasurementAnnotations` component.
6. Export measurements via `MeasurementExport` (CSV, PDF) or `BatchMeasurementExport` for multi-room exports.

---

## Data Models and Domain Types

The type system (`src/lib/types.ts`) encodes the full domain model:

```typescript
interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  sqft: number
  imageUrl: string
  videoUrl?: string
  currentRent?: number
  projectedRent?: number
  capRate?: number
  roi?: number
  leaseEndDate?: string
  lastInspectionDate?: string
  isCurated: boolean
  fairMarketRent?: number
  legalRentCap?: number
  hasLeadRisk?: boolean
  complianceFlags: ComplianceFlag[]
}

interface ComplianceFlag {
  type: 'GOOD_CAUSE_NY' | 'LEAD_WATCHDOG_NJ' | 'LEASE_EXPIRING'
  severity: 'URGENT' | 'WARNING' | 'INFO'
  message: string
  calculatedValue?: number
}

type UserRole = 'agent' | 'client'
```

The `Property` interface is the central domain entity. Every service — compliance, AI concierge, recommendation engine, market data, collaboration — operates on `Property` objects. The `ComplianceFlag` type uses discriminated unions for type-safe flag handling across the regulatory engine.

---

## Performance and Browser Support

### Performance Optimizations

- **Particle rendering** — Uses `requestAnimationFrame` with frame-rate throttling to maintain smooth 60fps constellation animations without saturating the main thread.
- **Lazy-loaded components** — Heavy components (AR viewer, collaboration panel, chart export dialog) are code-split and loaded on demand.
- **Debounced interactions** — Search, filter, and alert-threshold inputs are debounced to prevent excessive re-renders and data fetching.
- **Progressive image loading** — Property images load progressively with skeleton placeholders.
- **Efficient state management** — TanStack Query handles server-state caching and deduplication; local UI state is kept minimal and co-located with components.

### Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| iOS Safari | 14+ |
| Chrome Mobile | 90+ |

The application requires ES2020+ JavaScript support and the Web Audio API for sound effects.

---

## Accessibility

The Sovereign Ecosystem targets **WCAG 2.1 Level AA** compliance across all interactive surfaces:

- **Keyboard navigation** — All interactive elements (cards, tabs, buttons, dialogs, sliders) are fully operable via keyboard. Focus is managed programmatically for modals and dynamic content.
- **Screen reader optimization** — Comprehensive ARIA labels, roles, landmarks, and live regions. Property cards announce their content and flip state. Charts include text alternatives.
- **Focus indicators** — Visible focus rings on all interactive elements, styled to match the glassmorphism theme without compromising visibility.
- **Color contrast** — All text meets 4.5:1 minimum contrast ratio against its background.
- **Motion preferences** — The particle system and animations respect the user's `prefers-reduced-motion` setting, disabling non-essential motion when requested.
- **Semantic HTML** — Proper heading hierarchy, landmark regions (`nav`, `main`, `aside`), and skip links for direct content access.

---

## Project Documentation

The repository includes extensive documentation beyond this README:

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product requirements document |
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | System analysis executive summary |
| [SYSTEM_ANALYSIS.md](./SYSTEM_ANALYSIS.md) | Comprehensive technical analysis (32KB) |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Technical architecture and implementation details |
| [COLLABORATION_FEATURES.md](./COLLABORATION_FEATURES.md) | Collaboration feature specifications |
| [OFFLINE_AR_COLLABORATION_DEMO.md](./OFFLINE_AR_COLLABORATION_DEMO.md) | Testing workflow for offline, AR, and collaboration |
| [FEATURE_DEMO.md](./FEATURE_DEMO.md) | Visual walkthrough with UI diagrams |
| [QUICK_START_NEW_FEATURES.md](./QUICK_START_NEW_FEATURES.md) | Quick start for latest features |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 19 detailed test scenarios |
| [SECURITY.md](./SECURITY.md) | Security reporting guidelines |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## Roadmap and Investment Thesis

The Sovereign Ecosystem is currently at **prototype / demo** stage (v0.x) — suitable for portfolio presentation and internal testing, with a clear path to production deployment.

### Phase 1: Foundation (0-9 months)

- Comprehensive automated test suite (target: 80%+ coverage).
- Production backend infrastructure (API layer, database, object storage).
- Real authentication and authorization (replacing the current invite-code model).
- Fix identified critical issues: error boundary hardening, useEffect cleanup, localStorage quota management, input sanitization.

### Phase 2: Scale (9-18 months)

- Mobile-first progressive web app (PWA) deployment.
- Advanced AI features: computer vision for property photo analysis, enhanced NLP for the concierge.
- Enterprise collaboration features: multi-org teams, audit trails, approval workflows.
- Performance optimization for portfolios exceeding 500 properties.

### Phase 3: Evolution (18-36 months)

- AI-first architecture transformation: the concierge becomes the primary navigation paradigm.
- Spatial computing expansion: WebXR-based AR/VR property tours, mixed-reality measurement tools.
- Blockchain and Web3 integration: on-chain property records, tokenized fractional ownership.
- Global expansion: multi-jurisdiction compliance engines, multi-currency support.

---

## Cross-Organ References

The Sovereign Ecosystem connects to the broader ORGANVM system:

| Organ | Relationship |
|-------|-------------|
| **ORGAN-I (Theoria)** | The [recursive-engine](https://github.com/organvm-i-theoria/recursive-engine) provides the epistemological framework for self-referential systems — the same pattern that drives the Sovereign Ecosystem's self-analyzing portfolio health engine. |
| **ORGAN-II (Poiesis)** | The glassmorphism design language and constellation particle system draw from the generative art research in ORGAN-II's [metasystem-master](https://github.com/organvm-ii-poiesis/metasystem-master). |
| **ORGAN-IV (Taxis)** | The [agentic-titan](https://github.com/organvm-iv-taxis/agentic-titan) orchestration framework provides the governance model for multi-agent workflows that could extend the AI concierge into a multi-model pipeline. |
| **ORGAN-V (Logos)** | The public development narrative for ORGAN-III products is chronicled in ORGAN-V's [public-process](https://github.com/organvm-v-logos/public-process) essays. |

---

## Related Work

Other ORGAN-III (Ergon) repositories in the commerce ecosystem:

- [**public-record-data-scrapper**](https://github.com/organvm-iii-ergon/public-record-data-scrapper) — Public record data extraction engine, a natural data pipeline for feeding property intelligence into the Sovereign Ecosystem.
- [**tab-bookmark-manager**](https://github.com/organvm-iii-ergon/tab-bookmark-manager) — Browser productivity tool demonstrating ORGAN-III's approach to consumer software.
- [**a-i-chat--exporter**](https://github.com/organvm-iii-ergon/a-i-chat--exporter) — AI conversation export utility, relevant to the concierge's conversation history management.

---

## Contributing

Contributions are welcome. This project follows the ORGANVM contribution model:

1. **Fork** the repository and create a feature branch from `main`.
2. **Follow existing conventions** — TypeScript strict mode, Tailwind utility classes, shadcn/ui component patterns.
3. **Write descriptive commit messages** in imperative mood.
4. **Test your changes** — verify across light and dark themes, check keyboard navigation, and validate accessibility with a screen reader.
5. **Open a pull request** with a clear description of the change and its motivation.

For bug reports and feature requests, please use [GitHub Issues](https://github.com/organvm-iii-ergon/sovereign-ecosystem--real-estate-luxury/issues).

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Author

**[@4444j99](https://github.com/4444j99)** — Creator and maintainer of the ORGANVM system.

ORGAN-III (Ergon) is the commerce domain — where theory becomes product, and product becomes revenue. The Sovereign Ecosystem represents the ambition of that mission: luxury-grade software for a market that deserves nothing less.
