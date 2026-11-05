---
name: mobile-first-sync
description: |
  Mandatory mobile-first UI synchronization skill for ZenTap.ai. Enforces that every user-facing page, review assistant, standee hub, modal, and admin preview is designed, formatted, and strictly verified for 360px-430px smartphone viewports before shipping.
triggers:
  - "mobile view"
  - "mobile sync"
  - "responsive view"
  - "mobile first"
  - "phone mockup"
  - "smartphone layout"
  - "check mobile"
  - "audit mobile"
metadata:
  author: zentap
  version: "1.0.0"
---

# Mobile-First Synchronization Skill — ZenTap.ai

## Core Directive
ZenTap is a physical NFC & QR hardware product. **Over 95% of real visitors access the system from a mobile phone (iOS / Android) immediately after tapping or scanning a physical counter standee.**

Therefore, **desktop-only or desktop-biased design is strictly forbidden**. Every UI change must be built, checked, and synchronized mobile-first.

---

## 7 Non-Negotiable Mobile Standards

### 1. Viewport Constraints & Container Width
- Base mobile container width must always be locked to `w-full max-w-[480px] mx-auto px-4`.
- Never allow elements to stretch edge-to-edge without padding unless it's a full-bleed hero banner.
- Root wrappers must enforce `overflow-x-hidden min-h-screen` to prevent horizontal wobble.

### 2. Touch Targets & Tactile Ergonomics
- Minimum interactive button/touch target size is `44px x 44px` (or `h-11` / `h-12` minimum height).
- Buttons must use tactile feedback classes: `.tactile-btn`, physical press scale `active:scale-[0.978]`, and explicit transition classes (`transition-all duration-150`).
- Star ratings must have minimum `p-1` and hit target bounding boxes (`w-8 h-8 sm:w-9 sm:h-9` icons).

### 3. iOS Input Zoom Prevention
- On mobile Safari / iOS WebKit, any `<input>` or `<textarea>` with a font size smaller than `16px` forces an unwanted browser viewport auto-zoom that disorients the user.
- **Rule**: Inputs on mobile must use `text-base sm:text-xs` or `text-base sm:text-sm` (so mobile renders at 16px to prevent zoom, while desktop scales down elegantly).

### 4. Horizontal Carousels & Mobile Swiping
- For horizontal item lists (like review suggestions, category chips, photos):
  - Must use `flex flex-row gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory`.
  - Cards must specify `shrink-0 snap-start` with a constrained mobile width (e.g., `min-w-[250px] max-w-[280px]`).
  - Add `-mx-4 px-4` or `-mx-1 px-1` so the carousel bleeds gracefully to screen edges without clipping card shadows.

### 5. Single-Thumb Reachability (Thumb Zone)
- Primary CTAs (e.g. "Post Review on Google Page", "Change Reviews", "Submit") must be stacked vertically at the bottom of the card within comfortable reach of the user's thumb.
- Avoid placing primary action buttons inside deeply nested horizontal rows on mobile.

### 6. Modal & Drawer Ergonomics
- On viewports `< 640px`, modals must render as bottom-sheets (`fixed inset-x-0 bottom-0 rounded-t-3xl`) or centered overlay with `max-h-[90vh] overflow-y-auto`.
- Backdrop blur (`backdrop-blur-md bg-black/60`) and explicit close trigger in the top-right corner.

### 7. Dual Sync with Admin Page Editor Phone Mockup
- When modifying customer pages (`/r/[slug]` and `/r/[slug]/review`), ensure the changes are visually coherent with the live Phone Mockup (`PhoneFrame` in `PageEditorWebpageTab.tsx`).
- Themes (`obsidian`, `slate`, `emerald`, `sunset`, `clean_light`) must maintain legible contrast on OLED/AMOLED screens.

---

## Pre-Flight Mobile Verification Checklist
Before concluding any task involving UI:
1. [ ] Is the container wrapped with `max-w-[480px] mx-auto`?
2. [ ] Does any text or card horizontally overflow the 360px viewport?
3. [ ] Are review cards swipeable side-by-side with snap alignment?
4. [ ] Are inputs styled with `text-base sm:text-xs` to prevent iOS zoom?
5. [ ] Is the primary action CTA clearly visible and thumb-tappable?
