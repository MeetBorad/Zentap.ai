---
name: Kinetic Signal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#46464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76767e'
  outline-variant: '#c6c6ce'
  surface-tint: '#575d78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141a32'
  on-primary-container: '#7c839f'
  inverse-primary: '#bfc5e4'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#bfc5e4'
  on-primary-fixed: '#141a32'
  on-primary-fixed-variant: '#3f465f'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends **Precision Tech Minimalism** with subtle **Kinetic Glass** accents to convey physical-to-digital intelligence. It bridges tangible NFC interactions with cloud-based AI analytics, targeting modern enterprises, sales forces, and technology teams.

The visual language establishes authority through rich chromatic contrast, optical balance, and frictionless feedback. Surfaces feel lightweight yet structured, evoking speed, physical connectivity, and data accuracy without enterprise visual clutter.

## Colors

The palette establishes clarity across marketing sites and dense analytical workspaces.

- **Primary (`#0A1128` - Deep Tech Navy):** Anchors high-contrast headings, main navigational bars, primary button states, and deep background canvases in dark-accent sections.
- **Secondary (`#2563EB` - Electric Brand Blue):** Governs active actions, primary interactive targets, progress fills, focused input rings, and digital connection signals.
- **Tertiary (`#10B981` - Emerald Accent):** Reserved for live status pulses, positive ROI/growth deltas, active NFC sync confirmations, and verified credentials.
- **Neutral (`#64748B` - Slate Neutral):** Powers secondary typography, non-interactive icon states, and inactive tab indicators.
- **Canvas & Surface Base:** Light-mode backgrounds leverage pure cool tint `#F8FAFC`, layered with `#FFFFFF` for lifted cards and bordered by `#E2E8F0` for subtle structural separation.

## Typography

Plus Jakarta Sans powers marketing showcases and operational dashboards through its geometric balance, open counterforms, and legibility at compact data scales.

- **Numerics & Tabular Data:** Numeric KPI metrics and telemetry readouts must use `font-feature-settings: "tnum" on, "cv05" on` to prevent column jittering during live stream recalculations.
- **Micro-Hierarchy:** Uppercase styling is strictly reserved for `caption` and `label-sm` tracking badges (e.g., NFC card status, protocol flags).

## Layout & Spacing

A disciplined 8pt vertical cadence underpins the layout architecture:

- **Desktop (1200px+):** 12-column responsive fluid grid with max-width container set to `1280px` for landing pages, and fluid full-width layouts with `margin: 2rem` for data dashboards. Default gutter is `1.5rem`.
- **Tablet (768px - 1199px):** 8-column layout with `gutter: 1rem` and `margin: 1.5rem`. Side navigation collapses to an icon rail or sheet drawer.
- **Mobile (<768px):** 4-column layout with `margin-sm: 1rem` and `gutter-sm: 1rem`. Dashboard card groups stack into single-column vertical streams.

## Elevation & Depth

Visual hierarchy uses **Ambient Layering** combined with ultra-fine boundaries:

- **Level 0 (Flat/Base):** `background: #F8FAFC`. Zero elevation, sits behind content.
- **Level 1 (Card Rest):** `background: #FFFFFF`, border: `1px solid #E2E8F0`, shadow: `0 1px 3px 0 rgba(10, 17, 40, 0.04), 0 1px 2px -1px rgba(10, 17, 40, 0.03)`.
- **Level 2 (Interactive Lift / Hover):** Shadow shifts to `0 8px 20px -4px rgba(10, 17, 40, 0.08), 0 4px 6px -2px rgba(10, 17, 40, 0.03)`, border tints dynamically to `rgba(37, 99, 235, 0.3)`.
- **Level 3 (Modals / Floating Panels):** Background `#FFFFFF` with `0 20px 25px -5px rgba(10, 17, 40, 0.12), 0 8px 10px -6px rgba(10, 17, 40, 0.04)`.
- **Glass Accents (NFC Live Sensors / Overlays):** `background: rgba(255, 255, 255, 0.75)`, `backdrop-filter: blur(12px)`, border: `1px solid rgba(255, 255, 255, 0.8)`.

## Shapes

The design system maintains a modern curvature system (`roundedness: 2`):

- **Inputs, Buttons, Badges:** `0.5rem` (8px) corner radius for precise, professional boundaries.
- **Cards & Data Tables:** `1rem` (16px) corner radius to create inviting, sleek component grouping.
- **Modals & Hero Showcase Frames:** `1.5rem` (24px) for expansive visual containment.
- **Avatars & Signal Indicators:** Fully rounded (`9999px`) circles to balance rectilinear dashboard structures.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, radius `0.5rem`, padding `0.625rem 1.25rem`. Hover: `#1D4ED8` with subtle translate-y `-1px`. Focus: outline ring `2px #2563EB` offset by `2px`.
- **Secondary / Ghost:** Transparent surface with `1px solid #E2E8F0`, text `#0A1128`. Hover: background `#F1F5F9`, border `#CBD5E1`.
- **Navy Alternative:** Background `#0A1128`, text `#FFFFFF`. Used for high-impact landing page conversion actions.

### Cards & Panels
- **Standard Card:** Pure `#FFFFFF` fill, `1px solid #E2E8F0` border, `1rem` radius, `1.5rem` internal padding.
- **NFC / Hardware Device Card:** Includes an inset subtle linear gradient border with a dynamic status LED dot in the upper-right corner (Emerald `#10B981` when paired, Neutral `#94A3B8` when offline).

### Chips & Status Badges
- **Metric Positive:** Background `rgba(16, 185, 129, 0.1)`, text `#047857`, dot indicator `#10B981`. Radius `9999px`, padding `0.25rem 0.625rem`.
- **Technology Tag:** Background `#EFF6FF`, border `1px solid #DBEAFE`, text `#1D4ED8`.

### Form Inputs
- **Base Input:** Height `42px`, fill `#FFFFFF`, border `1px solid #CBD5E1`, text `#0A1128`, radius `0.5rem`, horizontal padding `0.75rem`.
- **Focus State:** Border `#2563EB`, shadow `0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Selection Controls
- **Checkboxes & Radios:** `18px` diameter/box, border `1.5px solid #94A3B8`. When checked: fill `#2563EB`, border `#2563EB`, displaying crisp white SVG glyphs.

### Lists & Data Tables
- Rows use bottom dividers (`1px solid #F1F5F9`), horizontal padding `1rem`, vertical padding `0.875rem`. Hover state yields an instant `background: #F8FAFC` transition.

### Domain-Specific Components
- **NFC Telemetry Signal:** An animated dual-pulse concentric ring emitting from `#2563EB` to visualize tap events and data ingestion.
- **AI Recommendation Banner:** High-clarity card surfaced in subtle navy tint (`#0A1128` background with white text and `#2563EB` badge) highlighting actionable business insights.