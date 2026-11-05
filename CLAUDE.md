# ZenTap.ai — Claude Code Guidelines

## Overview
ZenTap.ai is an intelligent NFC & QR-powered Google review acceleration and smart review management platform.

## Development & Build Commands
- Dev Server: `npm run dev`
- Build: `npm run build`
- Type Check: `npm run typecheck`
- Lint: `npm run lint`
- Test Suite: `npm test` (Runs `tests/audit_scenarios.test.mjs`)

## Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend / Database**: Supabase PostgreSQL with Row Level Security (RLS) & GoTrue Authentication
- **Payments**: Razorpay Node SDK & Razorpay Checkout
- **Hardware Integration**: NTAG216 NFC (13.56 MHz) and Level Q Error Correction QR Codes
- **Animations / Microinteractions**: GSAP (`@gsap/react`), Framer Motion

## Core Rules & Guardrails
1. **Multi-Tenant Privacy**:
   - Always enforce user isolation in database queries (`owner_user_id = auth.uid()`).
   - Never expose other businesses' metrics, orders, or private contact details.
2. **Payment Integrity**:
   - Always calculate and validate plan prices and courier fees on the server.
   - Never trust client-submitted prices or amounts. Verify Razorpay signatures using HMAC-SHA256.
3. **Google Review Anti-Gating Compliance**:
   - Ratings $\le$ 2 stars: Private feedback with direct submit (no redirect).
   - Ratings $\ge$ 3 stars: AI review drafts + direct Google review link.
   - Always retain a discreet secondary direct Google access option to prevent Google policy violations.
4. **Design & Tactile Craftsmanship**:
   - Consult skills in `.claude/skills/` (`emil-design-eng`, `taste-skill`, `ui-animation`, `redesign-skill`).
   - Redesigned components must follow tactile microinteractions (`.tactile-btn`, physical press scale `0.978`, explicit transitions).
5. **Documentation**:
   - Update `docs/CHANGELOG.md` and `docs/FEATURE_STATUS.md` after adding or modifying features.
   - Never commit API keys, service role keys, or secrets into git or documentation.

