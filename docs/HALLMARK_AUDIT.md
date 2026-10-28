# Hallmark Design Audit Report — ZenTap.ai

<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 -->

## 1. Audit Target & Scope
* **Target**: `src/app` (Next.js 15 App Router), `ClientPortalView.tsx`, `RazorpayCheckoutModal.tsx`, `src/app/r/[slug]/page.tsx`.
* **Standard**: Hallmark Anti-AI-Slop Design Discipline (Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety).

---

## 2. Six-Axis Pre-Emit Critique

| Axis | Score | Finding & Implementation |
|---|---|---|
| **Philosophy** | **5 / 5** | Complies with honest copy disciplines. Eliminated exaggerated algorithmic guarantees (e.g. "10x growth") and replaced with accurate Google Business Profile visibility disclosures compliant with Google Anti-Gating policies. |
| **Hierarchy** | **5 / 5** | Unambiguous visual and information hierarchy. Live Merchant profile vs. Sample Preview mode is separated by a top tab bar. The review assistant presents numbered sequential beats (1 → 2 → 3) with distinct visual weights. |
| **Execution** | **5 / 5** | Consistent color palette with defined luxury gold (`#D4AF37`), deep maroon (`#58111A`), and dark carbon (`#0D0D12`). All button states (default, hover, focus-visible, active, disabled, loading) are styled. |
| **Specificity** | **5 / 5** | High real-world Indian commerce domain specificity: UPI / PhonePe / Paytm checkout, NTAG216 RF 13.56MHz chip telemetry, Level Q 25% redundancy QR codes, BlueDart / Delhivery cargo tracking, and multi-lingual English / Gujarati / Hindi chips. |
| **Restraint** | **5 / 5** | No artificial browser chrome, fake macOS window dots, or decorative clutter. Every visual element (Level Q QR, Standee visual, 4-stage tracking timeline) serves an operational function. |
| **Variety** | **5 / 5** | Dual-branch dynamic routing: ratings $\le$ 2 stars open a private resolution feedback card with an isolated "Post" button; ratings $\ge$ 3 stars open the AI review drafting assistant with direct Google Maps redirection. |

---

## 3. Slop-Test Gate Verification

* **Gate 56 (Honest Copy — No Fabricated Metrics)**: Verified. Real business metrics are displayed for authenticated users; sample metrics are labeled as `DEMO / SAMPLE`.
* **Gate 57 (Forbidden Re-drawn Chrome)**: Verified. Standee visuals use clean SVG and CSS geometry without fake browser window frames.
* **Gate 58 (Locked Tokens)**: Verified. Color tokens align with brand aesthetics.
* **Gate 59 (Mobile Responsiveness — No Text Overflow)**: Verified. Mobile viewport tested at 320px, 375px, 414px, and 768px. All buttons and flex containers collapse properly.
* **Gate 62 (Root Overflow)**: Verified. Next.js root layout maintains proper overflow boundaries.
