# ZenTap.ai — Changelog

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
