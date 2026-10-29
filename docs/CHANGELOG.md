# ZenTap.ai — Changelog

## [1.3.7] — 2026-10-29
### Added
- **Multi-Draft AI Review Generator & Speech-to-Text 🎙️** (`/api/ai/generate-review`, `/r/[slug]`):
  - Created `/api/ai/generate-review` route generating 3 distinct review drafts:
    - *Draft 1: Humanized Authentic* (conversational, natural human patron phrasing).
    - *Draft 2: Detailed Story* (highlights specific selected tags, service, and location).
    - *Draft 3: Short & Punchy* (1-2 sentence high-impact recommendation).
  - Integrated browser Web Speech API for voice recording / speech-to-text in English (`en-IN`), Hindi (`hi-IN`), and Gujarati (`gu-IN`).
  - Added *✨ Humanized* as the primary review style selector.
  - Added interactive draft tabs enabling customers to preview and select between Draft 1, Draft 2, and Draft 3 before 1-tap clipboard copying and redirecting to Google Reviews.
- **Customized Review Categories ("What did you like most?")**:
  - Gated in Merchant Portal (`ClientPortalView.tsx`) under Sub-Tab 4 (*Review Categories*), unlocked upon standee payment.
  - Allows merchants to add, remove, and reset category tags that feed into the AI review generator.
  - Added full administrative control in `AdminConsoleView.tsx` with dedicated modal to customize categories for any merchant in the Master Table.
- **My Business Analytics Access Flow & Sub-Tab Architecture** (`ClientPortalView.tsx`):
  - Sub-Tab 1: **Dashboard** (Analytics) — displays NFC/QR telemetry; rendered locked and blurry with a padlock overlay and "Buy Standee to Unlock" CTA if unpaid.
  - Sub-Tab 2: **Edit Business Profile** — store name, category, contact, address.
  - Sub-Tab 3: **Link Business Profile (Optional)** — Google Business Profile and Google Review destination link.
  - Sub-Tab 4: **Review Categories** — customize "What did you like most?" tags.
  - Sub-Tab 5: **Review Assistant & QR Hub** — live `/r/[slug]` URL and Level Q Laser QR download.
  - Sub-Tab 6: **Standee Order & Status** — 4-stage tracking timeline (*Order Confirmed -> Creating Standee (QR/NFC) -> ZenTap.in Integration -> Dispatched*).
  - Sub-Tab 7: **Current Plan & Controls** — displays prominent *"No Active Plan"* card if unpaid.
- **Header Action Box & Official ZenTap.in Showcase**:
  - Added dedicated action box beside business name in header with "Buy / Order Standee", "Sample ZenTap.in Review Page", and "Test Customer Flow".
  - Replaced legacy showcase references with the official **ZenTap.in Digital Solutions** profile (`/r/zentap`, GBP link `https://share.google/9PoGc4WwJpFoTgAMh`, Google Review link `https://www.google.com/maps/place/...`).

## [1.3.6] — 2026-10-29
### Added
- **Left-Side Horizontal Navigation Tabs for Merchant Dashboard** (`ClientPortalView.tsx`):
  - Redesigned the sub-tabs controller into a responsive 2-column sidebar architecture (`flex flex-col lg:flex-row gap-6 items-start`).
  - Implemented left-side stacked horizontal tab cards one by one with sticky navigation (`lg:w-80 lg:sticky lg:top-20`):
    1. **1. Edit Business Details**: Store identity, contact info & shipping address.
    2. **2. Link Business Profile**: Dedicated Google Maps review destination connection with prominent `Optional` badge.
    3. **3. Review Assistant & QR Hub**: Direct `/r/[slug]` cloud link & printable Level Q QR generator.
    4. **4. Standee Order & Status**: 4-stage tracking timeline, checkout & quotations with `Active Order` badge.
    5. **5. Current Plan & Controls**: Active subscription tier & 1-tap touchpoint kill switch.
  - Added dedicated merchant WhatsApp support card (`+91 92745 60880`) docked beneath the left-side tab controller.
  - Maintained full responsiveness across mobile, tablet, and widescreen desktop layouts.

## [1.3.5] — 2026-10-29
### Added
- **Instant WhatsApp Chat for All 4 Plans** (`PricingView.tsx`):
  - Added dedicated WhatsApp inquiry action buttons to **Plan 1** (Normal Smart Card - ₹500), **Plan 2** (Auto Google Review Standee - ₹1,500), **Plan 3** (Standee + Auto Reply Engine - ₹2,000), and **Plan 4** (Franchise Custom Fleet).
  - Linked all instant WhatsApp buttons to the official business number: **`+919274560880`** (`https://wa.me/919274560880`).
  - Tailored pre-filled greeting messages per plan:
    - Plan 1: *"Hello ZenTap Team, I am interested in Plan 1 (Normal Smart NFC Card - ₹500). Please share more details."*
    - Plan 2: *"Hello ZenTap Team, I am interested in Plan 2 (Auto Google Review Standee - ₹1,500). Please share more details."*
    - Plan 3: *"Hello ZenTap Team, I am interested in Plan 3 (Standee + Auto Reply Engine - ₹2,000). Please share more details."*
    - Plan 4: *"Hello ZenTap Team, I am interested in Plan 4 (Franchise Multi-Location Fleet). Please provide a custom quotation."*
- **Merchant Portal WhatsApp Support Integration** (`ClientPortalView.tsx`):
  - Updated all WhatsApp touchpoints and quotation links to `+919274560880`.
  - Added pre-checkout *"Questions? Chat with Us on WhatsApp"* button directly above the payment button in Sub-Tab 4 (*Standee Order & Status*).
  - Added direct *"Instant WhatsApp Chat"* button alongside the Franchise Quotation request submission form.

## [1.3.4] — 2026-10-29
### Added
- **Landing Page Pricing Tab 4th Plan Integration** (`PricingView.tsx`):
  - Added Plan 4 card to the responsive 4-column pricing grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
  - Added "Franchise Fleet • Multi-QR" badge, custom bulk volume pricing (₹1,200/standee, from ₹800/branch/mo), multi-QR specifications, central owner dashboard, and 1-click WhatsApp quote button.
  - "Build Franchise Quotation" CTA button seamlessly routes to the merchant portal with Plan 4 preselected and the Orders/Quotation tab open.
- **Deep-Linked Routing to Merchant Portal Orders & Quotations** (`page.tsx` & `ClientPortalView.tsx`):
  - Added `portalInitialPlan` state in `page.tsx` passing `initialPlan` directly into `ClientPortalView`.
  - Added `useEffect` in `ClientPortalView` to automatically pre-select any chosen plan and activate Sub-Tab 4 (*Standee Order & Status*).
- **Comprehensive Project-Wide Pricing Reference Updates**:
  - `HomeView.tsx`: Updated action banner CTA text to "View All 4 Standee & Franchise Plans (From ₹500)".
  - `Footer.tsx`: Updated footer pricing link to "Pricing & Franchise Plans (From ₹500)".
  - `FaqView.tsx`: Added dedicated FAQ entry explaining franchise and multi-location business support and multi-QR architecture.
  - `AdminConsoleView.tsx`:
    - Added Tier 4 (*Franchise Multi-Outlet Fleet*) to the Overview hardware distribution widget.
    - Updated plan label display logic across the Master Table and Orders Table.
    - Added Plan 4 option to the admin order creation modal and the manual onboarding modal.

## [1.3.3] — 2026-10-29
### Added
- **Sub-Tab Re-Sequencing under My Live Business Analytics** (`ClientPortalView.tsx`):
  1. **Sub-Tab 1: Edit Business Details**: Default opening tab for editing business name, contact, city, state, country, pincode, and store address.
  2. **Sub-Tab 2: Link Business Profile (Optional)**: Explicitly non-mandatory Google Business Profile listing and write-review destination URL linking, with informative callout explaining ZenTap operations will verify and connect review links prior to laser engraving if left blank.
  3. **Sub-Tab 3: Review Assistant & QR Hub**: Your customized assistant link `/r/[slug]` with 1-click clipboard copy, live flow test, and printable Level Q Standee QR code (PNG).
  4. **Sub-Tab 4: Standee Order & Status**: 4-stage dispatch tracking timeline, hardware preview visuals, and purchasing.
  5. **Sub-Tab 5: Current Plan & Controls**: Hardware tier status, NTAG216 telemetry, live active/deactivate toggle, and private feedback inbox.
- **Franchise & Multi-Location Custom Plan (Plan 4)**:
  - Added 4th commercial tier: **Plan 4 — Franchise & Multi-Location Custom Plan** (`franchise_custom`).
  - Added dedicated multi-standee visual preview in `StandeeVisuals.tsx` displaying branch standees and headquarters master QR touchpoint.
  - Interactive **Franchise Custom Quotation Builder**:
    - Branch counter & standee counter steppers with bulk discounts (₹1,200/standee, ₹800/branch SaaS).
    - Hardware material finish selector (Matte Obsidian, Laser Wood, Hybrid Fleet).
    - Multiple unique QR codes toggle (individual branch destinations & Google review links).
    - Enterprise add-ons checklist (Auto Review Reply AI, Centralized Multi-Outlet Dashboard, Custom Laser Logo Engraving, Priority Multi-Location Drop-shipping).
    - Real-time estimated quotation breakdown.
    - Automatic quotation dispatch & storage (`ZT-QTN-XXXXX`) into the Admin Quotations Hub.
    - 1-click WhatsApp quote support button (`https://wa.me/918140417772`).
    - Merchant quotation history display with live status tracking.
- **Franchise & Custom Quotations Hub in Superadmin Console** (`AdminConsoleView.tsx`):
  - Added dedicated 5th tab: **Franchise Quotes Hub** with badge alert for new pending quotations.
  - Added Franchise Quotations Pipeline operational card in Tab 1 Analytics.
  - Quotations table with Quote ID, Franchise Name, City, Contact, Configuration, Estimated Value, Status selector dropdown (`pending_review`, `contacted`, `quote_sent`, `approved`), and 1-click WhatsApp/Email actions.
  - Added Tier 4 card in Plans & Subscriptions tab with quick access to the quotation pipeline.

## [1.3.2] — 2026-10-29
### Added
- Created live Supabase automated audit scripts: `tests/check_supabase.mjs` and `tests/test_supabase_live_ops.mjs`.
- Verified live PostgreSQL connection, table integrity, and RLS policies across all tables (`businesses`, `public_businesses`, `scans`, `events`, `feedback`, `orders`, `courier_rules`, `subscriptions`, `admin_users`).
- Verified anonymous and authenticated RLS privacy: customer feedback and merchant emails/phones remain 100% confidential and leak-proof.
- Added automatic Supabase merchant profile creation in `ClientPortalView.tsx` upon first-time user login/signup, ensuring PostgreSQL persistence immediately.

### Fixed
- Fixed PostgreSQL UUID parsing error in `service.ts` when prefixes like `biz_` were passed: implemented `isValidUuid()` helper, stripping prefixes and allowing PostgreSQL `DEFAULT gen_random_uuid()` to assign standard UUIDs.
- Fixed `subscriptions` schema column mismatch in `verify-payment/route.ts`: mapped `monthly_amount`, `start_at`, `current_period_end` to match the exact Supabase v2 schema.
- Fixed `orders.id` UUID constraint in `verify-payment/route.ts` and `service.ts`: custom tracking numbers (e.g. `ZT-ORD-...`) are preserved in `tracking_number` and `razorpay_order_id` while letting PostgreSQL assign standard UUID primary keys.

### Audited
- Conducted full Site Hallmark Audit (architecture, multi-tenancy, Google Anti-Gating compliance, and Virat Gold Palace Certified 22K Hallmark Gold & Diamond Jewellery assistant flow).

### Added
- Renamed Merchant Header badge and portal view to **"My Live Business Analytics"**.
- Added dynamic branding background and typography matching the client's business from the Admin Master Table.
- Implemented 5 dedicated sub-tabs under *My Live Business Analytics*:
  1. **Link Business Profile**: Link and provide Google Business Profile listing and Google Review destination, directly connected and saved to the Admin Master Table.
  2. **Edit Business Details**: Comprehensive profile editor for business name, contact, city, state, country, pincode, and shipping address.
  3. **Review Assistant & QR Hub**: Your Customized Google Review Assistant destination `/r/[slug]` with 1-click copy, live preview test, and printable Level Q Standee QR code (PNG).
  4. **Standee Order & Status**: Active 4-stage dispatch tracking timeline with BlueDart tracking ID, plus hardware touchpoint purchasing and "Open for Test" capability.
  5. **Current Plan & Controls**: Hardware tier status, NTAG216 telemetry, live active/deactivate toggle, and private feedback inbox.
- Top 2-mode switcher for first-time login: *My Live Business Analytics* vs. *Sample Dashboard Preview* (showing newly registered merchants what they get once active with us).

## [1.3.0] — 2026-10-29
### Added
- Upgraded Admin Workspace to **"ZenTap.in Admin Dashboard"** with 4 organized tabs:
  1. **Analytics & Performance Dashboard**: Total fleet earnings (₹), NFC taps vs. QR scans breakdown, Google review conversions (~88%), active store count, Name Confirmation Pending alerts, Google Review Link Status, and Standee fulfillment status.
  2. **Admin Master Table (10 Columns)**: Business & Slug, Contact, City, Customer Page, Plan, Billing, Status, Scans, Google Review Destination, Supreme Actions.
  3. **Customized Business Name & Slug Editor Modal**: Allows Admin to manually edit and fix merchant business names, automatically generate/customize slugs, and connect Google Review URLs directly. Reflects instantly in merchant's user login.
  4. **Standee Orders & Dispatch Hub**: Track all standee manufacturing and courier timelines (BlueDart), plus a direct **"Order Standee"** form with pincode courier calculator.
  5. **Plans & Subscription Management**: View commercial tiers (₹500 / ₹1,500 / ₹2,000), change client plans, toggle billing states, or reset/delete subscriptions.
- Updated Header badge to **"ZenTap.in Admin Dashboard"** when viewing the admin console.

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
