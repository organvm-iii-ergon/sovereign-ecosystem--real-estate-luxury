# The Sovereign Ecosystem - Luxury Real Estate Platform

A sophisticated, AI-powered luxury real estate platform featuring advanced UI/UX patterns, glassmorphism design, and intelligent property analytics.

## Latest Features (v5)

### 🌟 Constellation Particle System
- **Meaningful Patterns**: Particle background now includes three thematic constellation patterns:
  - Crown constellation (symbolizing luxury and sovereignty)
  - House constellation (representing real estate)
  - Diamond constellation (representing value and investment)
- Constellation particles have enhanced glow effects and maintain their formation while subtly drifting
- Connected by gradient lines with shadow effects for depth
- All particles remain responsive to theme changes

### 🎵 Theme-Specific Sound Design
- **Differentiated Audio**: Sound effects now vary based on the active theme:
  - Light mode: Higher frequency tones (brighter, more crystalline sounds)
  - Dark mode: Lower frequency tones (deeper, more atmospheric sounds)
- New sound effects added:
  - `cardFlip`: Distinctive two-tone flip sound
  - `shimmer`: Delicate high-frequency effect
  - `softClick`: Gentle interaction feedback
- All sounds automatically update when theme changes

### 🔄 Flippable Property Cards
- **Interactive Detail Reveal**: Property cards now flip on click to reveal comprehensive details
- Front side: Visual presentation with live pricing and key metrics
- Back side: Detailed financial overview, property specifications, compliance alerts, and price performance
- Smooth 3D flip animation with elastic easing
- Fully accessible with ARIA labels and keyboard navigation
- Glassmorphic design on both sides

### 🪟 Enhanced Glassmorphism
- **Refined Transparency**: All major components now use enhanced glassmorphism:
  - `bg-card/70` with `backdrop-blur-2xl` for deeper glass effect
  - Border opacity reduced to 30-40% for subtler definition
  - Enhanced shadow layers with theme-aware colors
- Applied to:
  - Property cards (front and back)
  - Navigation tabs
  - Headers and control buttons
  - Modal overlays
  - Detail panels

### ♿ Accessibility Improvements
- **WCAG AA Compliant**: All interactive elements meet accessibility standards
- Focus indicators: Visible focus rings on all buttons and interactive elements
- ARIA labels: Comprehensive labeling for screen readers
- Role attributes: Proper navigation and progress indicators
- Keyboard navigation: Full support for keyboard-only users
- Semantic HTML: Proper heading hierarchy and landmarks
- Motion: Respects user's motion preferences

## Core Features

### AI Concierge
- Natural language property search
- Contextual recommendations
- Portfolio analysis
- Multi-language support with automatic detection

### Property Management
- Live price tracking with sparklines
- Real-time market data
- Compliance monitoring (Good Cause NY, Lead Watchdog NJ)
- Pattern-based alerts

### Visual Design
- Elegant typography (Cormorant serif + Outfit sans-serif)
- Sophisticated color palette:
  - Light: Rose blush, champagne, pearl white, lavender
  - Dark: Moonlit indigo, violet, lavender, silver
- Animated particle background with constellations
- Floating decorative elements
- Smooth transitions and micro-interactions

### User Roles
- **Agent Dashboard**: Full property management, analytics, and client tools
- **Client Feed**: Curated property browsing with swipe navigation
- **Private Vault**: Secure document management

## Technical Stack

- React 19 + TypeScript
- Framer Motion for animations
- Tailwind CSS v4 with custom theme
- shadcn/ui components
- D3.js for data visualization
- Web Audio API for sound effects
- IndexedDB-backed persistence (useKV)

## Accessibility Features

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast ratios (4.5:1+ for text)
- Focus visible on all interactive elements
- Skip links for main content
- ARIA landmarks and labels
- Semantic HTML structure

## Performance

- Optimized particle rendering with requestAnimationFrame
- Lazy-loaded components
- Efficient state management
- Debounced search and filters
- Progressive image loading

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Built with attention to detail, accessibility, and user experience.
