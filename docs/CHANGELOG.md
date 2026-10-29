# ZenTap.ai — Changelog

## [1.2.1] — 2026-10-29
### Added
- Explicit "Standee Order Status: Pending Selection" banner in `ClientPortalView` when no order has been placed, guiding merchant to select and purchase hardware.
- Full 4-stage tracking timeline (Order Confirmed, Laser Engraving, Signal Inspection, BlueDart Dispatched) immediately upon standee order creation.

### Fixed
- Fixed Merchant vs Superadmin routing: removed `thedayithappened736@gmail.com` and non-superadmin accounts from `adminList` in `AuthContext.tsx`. Merchants always route to `ClientPortalView` and never see the Superadmin Fleet Directory table.
- Cleared stale `zentap_admin_supreme` localStorage key on regular merchant login.
- Preserved strict multi-tenant isolation, Google anti-gating compliance, and 17/17 passing test suite.

## [1.2.0] — 2026-10-29
### Added
- Created comprehensive documentation suite in `/docs`:
  - `PROJECT_OVERVIEW.md`
  - `DEVELOPMENT_HISTORY.md`
  - `ARCHITECTURE.md`
  - `DATABASE_SCHEMA.md`
  - `FEATURE_STATUS.md`
  - `BUGS_AND_FIXES.md`
  - `DECISIONS.md`
  - `NEXT_STEPS.md`
  - `CHANGELOG.md`
  - `AGENTS.md`
- Integrated server-side Razorpay order creation and signature verification.
- Added `RazorpayCheckoutModal.tsx` supporting UPI, QR, and Card payments.
- Added Hallmark design audit workflow.

### Fixed
- Fixed issue where purchasing basic product bypassed payment gateway.
- Enforced strict star-rating routing in `/r/[slug]` where ratings $\le$ 2 stars display ONLY a "Post" button and show a thank-you confirmation without redirecting.
- Fixed missing icon imports in views.

## [1.1.0] — 2026-10-28
### Added
- Separated Superadmin Auth modal (`AdminAuthModal.tsx`) with 3-attempt lock.
- Added Sample Dashboard Preview mode (`/dashboard/sample`) showing populated active metrics.
- Added 3-tier commercial hardware pricing cards with dynamic courier calculation.
- Added post-payment "Your Order is in Process!" tracking screen.

## [1.0.0] — 2026-10-27
### Added
- Initial Next.js 15 App Router architecture.
- Supabase authentication and multi-tenant schema.
- Customized Google Review Assistant with multi-language AI draft generation.
