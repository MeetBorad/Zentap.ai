# Design — ZenTap.ai

A locked design system for ZenTap.ai. Every page and component redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
`modern-minimal` with tactile physical hardware focus. The design reflects precision-machined acrylic standees, laser-engraved NFC chips, and high-velocity Google review conversion.

## Macrostructure Family
- **Marketing pages (`/`)**: **Workbench + Bento Grid** — Asymmetric visual balance. An interactive tactile hardware workbench showcasing the physical standee alongside the live sentiment interceptor engine, followed by a dense bento grid of technical hardware specs (NTAG216, anti-gating compliance, dynamic URL repointing).
- **App & Merchant pages (`ClientPortal`, `AdminConsole`)**: **Split Studio / Workbench** — High-density, tabular telemetry with persistent navigation, real-time scan metrics, QR vector export tools, and courier dispatch logs.
- **Customer tap & review pages (`/r/[slug]`)**: **Minimal Specimen** — Zero-friction, ultra-focused single-purpose mobile interface. 1-tap star selection, instant Google Maps redirection for 4-5 stars, and frictionless in-place private feedback capture for 1-3 stars.

## Theme Tokens (OKLCH)
```css
:root {
  --color-paper: oklch(0.985 0.003 80);       /* Warm tactile ivory #FAF9F6 */
  --color-paper-2: oklch(0.955 0.006 80);     /* Subtle surface tint #F2F0EB */
  --color-paper-dark: oklch(0.140 0.008 50);  /* Obsidian acrylic background */
  --color-ink: oklch(0.145 0.008 50);         /* Deep warm charcoal ink #1C1B1A */
  --color-ink-2: oklch(0.420 0.015 50);       /* Muted technical graphite #615E5B */
  --color-rule: oklch(0.890 0.008 80);        /* Hairline architectural border #E2DFD8 */
  --color-rule-dark: oklch(0.240 0.010 50);   /* Dark acrylic hairline border */
  --color-accent: oklch(0.620 0.185 42);      /* Precision vermilion/amber #D94826 */
  --color-accent-hover: oklch(0.560 0.190 42);
  --color-focus: oklch(0.550 0.190 48);       /* Accessible focus ring */
  --color-success: oklch(0.680 0.160 145);    /* Emerald verified badge */
  --color-star: oklch(0.820 0.160 85);       /* Gold review star */
}
```

## Typography
- **Display**: `'Space Grotesk'`, weight `700`, style `normal`, tracking `-0.035em`
- **Body**: `'Plus Jakarta Sans'`, weight `450`, style `normal`, tracking `-0.012em`
- **Technical & Metrics (Mono)**: `'JetBrains Mono'`, `'SF Mono'`, ui-monospace, weight `500`
- **Scale Anchor**: `<text-display>` = `clamp(2.25rem, 5vw, 4rem)` with tight leading (`1.08`)

## Spacing
4-point architectural scale:
- `--space-1`: `4px`
- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px`
- `--space-6`: `24px`
- `--space-8`: `32px`
- `--space-12`: `48px`
- `--space-16`: `64px`
- `--space-24`: `96px`

## Motion
- **Easings**: `cubic-bezier(0.16, 1, 0.3, 1)` named `--ease-out`
- **Reveal Pattern**: Opacity fade with subtle 6px Y-axis settle on initial load only. No repetitive scroll-triggered fade animations.
- **Reduced-motion Fallback**: Instant opacity-only transition (≤ 150ms).

## Microinteractions Stance
- **Silent Success**: Configuration updates and QR generation complete silently without obstructive celebratory banners or popups.
- **Hover Timing**: Instant border and elevation response; tooltip delay 500ms; focus ring delay 0ms.
- **Tactile Tap**: Physical press feedback (`transform: scale(0.985)`) on standee simulation buttons.
- **No Faux UI Chrome**: Standee renders as an authentic physical acrylic object without simulated browser frames or fake smartphone wrappers.

## Navigation & Footer Archetypes
- **Navigation Archetype (N5 Floating Pill / N9 Edge-Aligned)**: High-density, purposeful navigation linking core hardware views (Standees, Sentiment Engine, Verified Results, Merchant Portal).
- **Footer Archetype (Ft4 Dense Colophon)**: Technical hardware colophon with live NFC telemetry status, Google review policy compliance statement, and direct portal links.

## CTA Voice
- **Primary CTA**: Solid obsidian or warm vermilion fill, pill or 12px rounded corner, explicit action verb (*"Configure Standee"*, *"Test Sentiment Filter"*, *"Open Merchant Desk"*).
- **Secondary CTA**: Hairline architectural border on paper background with crisp arrow transition (*"View Live Demo →"*).
