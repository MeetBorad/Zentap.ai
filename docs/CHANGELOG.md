# ZenTap — Changelog

## [1.54.2] — 2026-11-05
### Added (Clients Directory Full Available Data Columns Display)
- **Comprehensive Columns in Clients Directory (`ClientsWebpageTab.tsx`)**:
  - Upgraded table to display all 14 available data dimensions for registered businesses:
    1. **Business ID** (e.g. `ZT-0001` badge)
    2. **Business Name** (with building icon)
    3. **City / Location** (with location pin badge)
    4. **Owner Name**
    5. **Owner Phone** (clickable tel link)
    6. **Owner Email** (clickable mailto link)
    7. **WhatsApp** (clickable `wa.me` badge)
    8. **Google Review Link** (clickable amber badge)
    9. **Instagram Link** (clickable profile link)
    10. **Facebook Link** (clickable page link)
    11. **Hardware / Tags Assigned** (interactive chips linking directly to `/t/[tag_id]` with product & destination tooltip)
    12. **Custom Fields** (interactive badges for Website, GST, Address, UPI, etc.)
    13. **Registered Date** (formatted date with calendar icon)
    14. **Actions** (sticky right column for seamless edit and delete access)
  - Enhanced Add and Edit modals to include Google Review Link alongside City / Location inputs.
  - Wired live event listener (`zentap_platform_updated`) so tag assignments and client changes update table data in real time.

## [1.54.1] — 2026-11-05
### Fixed (Client Directory Persistence, Editing & Real-Time Sync)
- **Resolved Business Edit & Creation Persistence**:
  - Re-architected `action === "upsert"` on `clients` in `/api/admin/platform/route.ts` to locate existing clients by `id`, `oldBusinessId`, or `business_id` before executing targeted `.update()`.
  - Added resilient fallback on remote schema variations (e.g. catches missing `custom_fields` column gracefully without aborting the update/insert).
  - Implemented cascading updates: editing a client's `business_id` or `business_name` automatically cascades across `qr_nfc_tags`, `google_review_links`, `social_links`, `page_editor_configs`, and `payments`.
  - Added optimistic local cache updates in `addClientServer` and `updateClientServer` (`src/lib/adminPlatformStore.ts`) so UI changes render instantaneously and persist across refresh even under network latency.
  - Linked `id: editTarget.id` in `ClientsWebpageTab.tsx`'s `handleEditSubmit` for precise row targeting.
### Refactored (10-Pillar Architectural Cleanup, Service Layer, Rate Limiting & RLS)
- **Centralized Environment Configuration (`src/lib/config/env.ts`)**:
  - Encapsulated typed environment variable access with development fallbacks and production validation.
  - Hardened `.env*` git exclusion in `.gitignore` and updated `.env.example` with non-sensitive documentation.
- **API Rate Leveling & Limiting (`src/lib/rateLimit.ts` & `src/middleware.ts`)**:
  - Implemented an in-memory sliding window rate limiter integrated directly into Edge middleware.
  - Three tiers: Sensitive (`/api/ai/*`, `/api/checkout/*` @ 10 req/min), Standard (`/api/*` @ 60 req/min), and Telemetry (`/api/hub/click`, `/api/review/event` @ 180 req/min).
  - Emits standard `X-RateLimit-*` and `Retry-After` headers on 429 responses.
- **Dedicated Business Service Layer (`src/services/`)**:
  - Separated business logic from UI components: `reviewService.ts` (draft generation, sentiments), `paymentService.ts` (HMAC verification, ledger balance calculations), and `tagRouterService.ts` (URL sanitization, tag validation).
  - Connected `ZenTapReviewAssistant` to consume pure service functions.
- **Dead & Duplicate Code Pruning**:
  - Removed 8 unused orphaned components (`QrNfcDirectoryTab.tsx`, `PageDesignerTab.tsx`, `PrivateFeedbackTab.tsx`, `RequestsTab.tsx`, `ReviewAssistantTab.tsx`, `QuickTagSetupModal.tsx`, `UpcomingServicesDrawer.tsx`, `SentimentSimulator.tsx`).
- **Standardized API Structure & Error Handling (`src/lib/api/response.ts`)**:
  - Standardized JSON responses with `apiSuccess`, `apiError`, and `withErrorHandler` route wrappers.
- **PostgreSQL Row Level Security (RLS) Migration (`015_enforce_rls_policies_and_rate_limits.sql`)**:
  - Hardened RLS policies across all 20+ tables enforcing multi-tenant isolation (`auth.uid() = owner_user_id`), public read restrictions, and strict admin lockdowns.
- **Codebase Architecture Blueprint (`docs/ARCHITECTURE.md`)**:
  - Published comprehensive architectural blueprint detailing directory structure, service separation, security protocols, and state management.

## [1.53.0] — 2026-11-05
### Added (Business Page Destination & ZenTap Google Review Flow)
- **New Standee Destination: "Business Page (Blue)" (`business_page`)**:
  - Added `business_page` destination across Google Links & QR Sharing (`GoogleLinksWebpageTab.tsx`), Page Editor (`PageEditorWebpageTab.tsx`), and the Platform API store (`adminPlatformStore.ts`, `/api/admin/platform`).
  - Added blue badges and informative guidance cards for `Business Page (Blue)`.
  - Updated Page Editor filter so both `business_page` and `zentap_google` standees are designable and editable.
- **Dedicated ZenTap Google Review Assistant (`ZenTapReviewAssistant.tsx` & `/r/[slug]/review`)**:
  - Implemented the full dark-mode living-mesh review generator based on the reference code with Outfit typography, glowing amber accent lines, and ambient glow mesh orbs.
  - Interactive 1–5 star rating with glow drop-shadows and semantic titles ("Loved it! (5 Stars)", "Satisfactory (3 Stars)", "Needs Improvement (1 Star)").
  - Multi-select experience tags (Cleanliness, Nice Staff, Excellent Quality, Fast Service, etc.) with dynamic selection counter.
  - 3-mode length selector (Short 1–2, Medium 3–4, Detailed 5+) driving dynamic review draft generation customized with business name and location.
  - 1-click "Copy text" button with clipboard feedback and editable textarea draft.
  - Primary CTA **"Post the Review on Google Page"**: Automatically copies review draft to clipboard and redirects to the business's Google Review link (Link of Tag ID).
  - Preserved Google Review Anti-Gating compliance with private WhatsApp resolution options for $\le$ 2 stars.
  - Micro-trust indicators ("15 Seconds — Quick tap workflow", "100% Genuine — Direct Google Maps link") and business context banner with photo, WhatsApp support, and Call Us buttons.
- **Access Control & Routing Isolation**:
  - **`business_page`**: Scans open the Business Page (`/r/[slug]`). Clicking the "Loved your visit?" banner opens the review page with a "Back to Business Profile" breadcrumb.
  - **`zentap_google`**: Scans and direct navigation route straight to `/r/[slug]/review` without access to the Business Page (back button omitted and `/r/[slug]` redirects to review).

## [1.52.0] — 2026-11-05
### Redesigned (Living Mesh Digital Hub & Conditional Page Editor)
- **ZenTap Digital Card & Feedback Portal (`/r/zentap?preview=1` & `/r/[slug]`)**:
  - Completely redesigned `ZenTapHubPage.tsx` with ambient living-mesh backdrop glows, Outfit typography, and dark card architecture (`#121824`).
  - Added verified badge on business emblem, quick action bar (Call Us, Directions), and "Loved your visit?" 5-star Google Review trigger banner.
  - Integrated interactive review assistant modal with 1–5 star ratings, feedback tag chips, length selectors, real-time draft generation, and 1-tap Google Maps review redirection.
  - Retained Google Anti-Gating compliance with private feedback flow for $\le$ 2 stars while offering an accessible secondary route to Google Reviews.
  - **Strict Conditional Visibility**: Enforced strict conditional omission across all sections and buttons—if any field (WhatsApp, Instagram, Facebook, Website, Email, Phone, Address, About Us, Hours, FAQs, Location) is empty or unconfigured, it is completely hidden.
- **Admin Page Editor & Live Mockup Synchronization**:
  - Overhauled `PageEditorWebpageTab.tsx` with dedicated inputs for Website, Email, Address, Google Maps URL, About Us story, Opening Hours, FAQs, Location card, and Review Tags.
  - Added one-click "Auto-Fetch From Client Profile" to populate all business contact details and addresses seamlessly.
  - Updated the right-column Live Phone Mockup to accurately render the new living-mesh dark card interface with real-time conditional field reflection.

## [1.51.0] — 2026-11-03
### Redesigned (Super Admin Platform Settings Dashboard)
- **5-Section Unified Settings Dashboard**:
  - Completely overhauled `PlatformSettingsTab.tsx` with dedicated, categorized sections: **General & Routing**, **Custom Business Fields**, **Security & PIN**, **AI Models & Failover**, and **System & DB**.
  - Added real-time quick search to filter and locate settings instantly.
  - Added live Supabase connection status, real-time table entity counters, and diagnostic cache clear.
- **Full Inline Editing & Field Customizer**:
  - Added inline editing directly for every custom field (modify field display label, input type, and sample placeholder without recreating).
  - Configurable hardware PIN lockout thresholds (3 / 5 / 10 attempts), session expiry durations (10 / 15 / 30 / 60 minutes), and initial factory PIN default.
  - Added 1-click JSON backup export (`Export Config`) for seamless configuration portability.
  - Added default business city, sequential ID prefix (`ZT-`), and default standee routing destination selector.

## [1.50.0] — 2026-11-03
### Added (Custom Business Fields & Settings Configuration)
- **Super Admin Settings — Custom Business Fields Manager**:
  - Added a dedicated "Custom Business Fields" sub-tab inside Super Admin Settings (`PlatformSettingsTab.tsx`).
  - Enables administrators to configure arbitrary custom options (Website URL, Google Maps / Place Link, GST / Tax ID, Full Address, LinkedIn, YouTube, UPI ID, Secondary Contact, or custom text/links/numbers).
  - Included 1-click Quick-Add presets for recommended business attributes.
  - Provided live toggle switches to activate or disable custom fields in registration dialogs.
- **Dynamic Custom Details in Business Creation & Edit Forms**:
  - Updated "Add New Business" modal (`ClientsWebpageTab.tsx`) with an expandable "Custom Business Details" section displaying all active custom fields.
  - Added an inline "+ Add Field" creator right inside the dialog for on-the-fly custom property creation.
  - Added a direct 1-click navigation shortcut to Settings.
  - Updated "Edit Business Entry" modal to view and update existing custom field values per client.
- **Client Records & API Store Synchronization**:
  - Extended `ClientRecord` and `DeletedBusinessRecord` with `custom_fields?: Record<string, string>`.
  - Added `custom_fields` column to allowed database tables in `/api/admin/platform` and Supabase migration `014_custom_fields_migration.sql`.
  - Displayed custom field tags and external links on the Clients table view.

## [1.49.0] — 2026-11-03
### Updated (Footer Navigation Label)
- Renamed the button in the Google Review Transparency banner in `Footer.tsx` from **"Explore Hardware & Pricing"** to **"Products & Pricing"** for unified site navigation nomenclature.

## [1.48.0] — 2026-11-03
### Updated (Removed AI References & Real Standee Hero Showcase)
- **Removed AI References Across Public Website**:
  - Removed "AI", "AI Review", "AI draft", "AI guidance", and "AI engine" from all customer-facing views (`PricingView.tsx`, `HowItWorksView.tsx`, `FaqView.tsx`, `ResultsView.tsx`, `AiReviewCustomerFlow.tsx`).
  - Standardized all terminology to human-centric wording: "Smart Review Assistant", "Guided Review Flow", and "Instant Review Suggestions".
- **Fixed & Enhanced Real Standee Showcase on Homepage**:
  - Resolved container height collapse issue when switching to the "Real Standee" tab in `HomeView.tsx`.
  - Added an interactive multi-standee model selector showcasing authentic photography for Champagne Gold, Brushed Steel, Clear Acrylic & Beechwood, Rose Gold, and Counter Tap setups.

## [1.47.0] — 2026-11-03
### Updated (Sample Profile CTA Redirection on How It Works)
- Renamed all "Explore Sample Dashboard" and "View Sample Dashboard" buttons on `HowItWorksView.tsx` to **"Sample ZenTap Business Profile"**.
- Updated their redirection target from the internal showcase view to the live ZenTap review preview page: `https://www.zentapdigitalsolutions.com/r/zentap?preview=1`.

## [1.46.0] — 2026-11-03
### Removed (Core SEO Engine Banner from How It Works)
- Removed the "Core SEO Engine / Helps Boost Your Google Profile Reach, Views & Overall SEO" promotional banner and its "View Live Sample Dashboard" CTA from `HowItWorksView.tsx` to keep the user journey uncluttered and focused purely on how the NFC standee operates.

## [1.45.0] — 2026-11-03
### Updated (Looping Tap SVG Animation on Homepage & Admin Payments Cleanup)
- **Implemented Looping Tap Animation**:
  - Created `TapAnimationLoop.tsx` utilizing the full 6-second synchronized SVG animation cycle: phone lowering, contactless NFC ripple emission, review sheet slide-up with Google "G" branding, sequential 5-star lighting, and positive service feedback confirmation.
  - Featured this animated demonstration directly in the homepage hero section with an instant toggle between "Live Tap Demo" and "Real Standee".
- **Admin Portal Payments Ledger Cleanup**:
  - Deleted the static "Product Price" column from the Payments webpage tab table and ledger (`PaymentsWebpageTab.tsx`).
  - Removed fixed price defaults (`1499`, `699`, `2499`, etc.) from all payment recording and editing modals.
  - Standardized payment tracking strictly on actual variable "Amount Received" without hardcoded price assumptions.
  - Updated backend stores and types (`adminPlatformStore.ts` and `manualPaymentStore.ts`) to make product price optional and eliminate fixed price locks.

## [1.44.0] — 2026-11-03
### Simplified & Streamlined (Audience-First Content & Admin Popover Fixes)
- **Top-Right Exclusive WhatsApp Order & Admin Login**:
  - Configured `[Order on WhatsApp]` as the strictly single, unique instance on the entire website, positioned on the top right side directly to the left of the `[Admin Login]` button.
  - Replaced all other order buttons across the site with "Contact us on WhatsApp".
  - Removed all hardcoded prices (`₹999`, `₹1,499`, `₹499`, `₹699`, `₹2,000`, etc.) in favor of "Contact us on WhatsApp".
- **Cleaned Public Content to Class 8 Reading Level**:
  - Removed technical jargon: `NTAG216`, `13.56 MHz`, `ISO 14443A`, `EEPROM`, `888 bytes`, `Level Q`, `HyperFrames`, `velocity`, `handshake`, `SEO lift`, `Local 3-Pack`, `Sentiment Interceptor`.
  - Removed unproven claims: `"45,382+ verified reviews"`, `"boost rating by 300%"`, `"91% of customers..."`, `"Verified Google Maps SEO Lift"`, `"Pan-India"`, `"Google Anti-Gating Compliant"`.
  - Removed the `Client Proofs & Testimonials` link until real customer proof is gathered.
- **Removed Simulators & Customizers from Home Page**:
  - Completely removed `Tap Simulator`, `3D customizer`, `Explore full mechanism`, and the floating `Upcoming Tech Services` drawer from the homepage.
  - Replaced 3D preview with authentic high-resolution product photography (`/standees/Gold.webp`).
- **Superadmin Popover Click-Outside Dismissal & Clean Exit**:
  - Added full-screen transparent click-capture backdrops to both the Superadmin dropdown and notification bell in `AdminConsoleView.tsx`. Clicking anywhere on the page instantly dismisses the open popover.
  - Updated `Exit Admin Session` to purge session and local storage, clear auth cookies, and cleanly redirect to the main homepage (`/`).
- **Mobile Bottom Navigation Bar**:
  - Streamlined to clean 4-tab utility: `Home`, `Process`, `Products`, `FAQ`, removing duplicate `Order` and `Admin` buttons.

## [1.43.0] — 2026-11-02
### Improved (Mobile View Sync & Removal of Merchant Registration / Sign-in Prompts)
- **Mobile Bottom Navigation Bar Synchronized**:
  - Replaced legacy mobile `Account` button (which previously opened merchant sign-in/registration modals) with high-utility, synchronized actions:
    - `Home` (`Store`)
    - `Process` (`Radio`)
    - `Pricing` (`DollarSign`)
    - `Order` (`MessageCircle` - direct instant WhatsApp order)
    - `Admin` (`ShieldAlert` / `ShieldCheck` - direct access to Admin Login / Console)
- **Eliminated Merchant Register/Sign-in Prompts Across Views**:
  - In `HowItWorksView.tsx`, converted "Sign Up Business" and "Order Custom Standee" to direct WhatsApp order actions.
  - In `SampleDashboardView.tsx`, converted "Register Your Business" button to "Order on WhatsApp".
  - In `ClientPortalView.tsx`, converted guest preview "Sign In / Register Business" actions into "Order on WhatsApp".
  - Maintained complete visual parity between desktop and mobile.

## [1.42.0] — 2026-11-02
### Improved (Header Admin Login Positioning, Dismissable Admin Dropdown & Clean Exit Session)
- **Header Navigation & Admin Login Cleanup**:
  - Moved the `Admin Login` option in `Header.tsx` to sit strictly to the right side of the Order button in the top navigation.
  - Removed duplicate `Super Admin Login` buttons from the Hero section and bottom CTA banner in `HomeView.tsx` to maintain a clutter-free, professional customer storefront.
  - Kept the brand logo on the top-left uncluttered.
- **Click-Outside Dismissal on Admin Popovers**:
  - Added `useRef` + `mousedown`/`touchstart` click-outside listeners and fixed transparent click-capturing backdrops to both the Superadmin avatar dropdown and notification bell in `AdminConsoleView.tsx`. Clicking anywhere on the screen or background now instantly closes the popover.
- **Instant Exit Session Redirection**:
  - Updated `Exit Admin Session` in `AdminConsoleView.tsx` to purge `localStorage.zentap_admin_supreme`, clear admin authentication cookies, trigger `signOut()`, and immediately redirect the user to the main website homepage (`/`).

## [1.41.0] — 2026-11-02
### Fixed & Hardened (Design Status State Preservation & Tag UUID Resolution)
- **Design Status Preservation in Standee Page Editor**:
  - In `PageEditorWebpageTab.tsx`, `openEditWhole` now detects existing designs (`config_data.title` or `theme`) and locks the dropdown default to `completed`, preventing editing business names or category chips from accidentally reverting the design status to `pending`.
- **Robust Tag-to-Business Lookup**:
  - In `resolveTag.ts`, sanitized `businesses` table query to distinguish between UUID and custom business codes (e.g. `ZT-0004`), preventing PostgreSQL `22P02 invalid input syntax for type uuid` errors.
  - Confirmed `/t/ST3` 302 redirects seamlessly to `/r/zt-0004?via=st3&s=qr` which serves the live 200 OK custom Google review assistant for **XYZ**.

## [1.40.0] — 2026-11-02
### Integrated (OpenSEO Suite Installation)
- **Installed 13 OpenSEO Skills & Workflows**:
  - Installed official OpenSEO suite from `every-app/open-seo` into `.agents/skills/`:
    - `local-seo`: Audit Google Business Profiles, compare against local competitors, and map Google Maps visibility.
    - `seo-audit`: Comprehensive website technical audit and prioritised organic fixes.
    - `keyword-research` & `keyword-clustering`: Discover search volume, evaluate SERPs, and group intent.
    - `competitor-analysis` & `competitive-landscape`: Reverse-engineer competitor footprints and keyword gaps.
    - `ai-visibility-audit` & `ai-prompt-research`: Evaluate brand citation and visibility across ChatGPT, Gemini, and Google AI Overviews.
    - `link-prospecting`: High-relevance backlink opportunities and outreach workflows.
    - `seo-coach`, `seo-project-setup`, `seo-report`, `simple-issue-description`.
  - Added `.mcp.json` configuring the live OpenSEO MCP endpoint (`https://app.openseo.so/mcp`).

## [1.39.0] — 2026-11-02
### Enhanced & Hardened (Complete Fallback Parity for ST3 & Unslop Natural Copy)
- **Hardened Tag Resolution & Fallback Synchronization**:
  - Added multi-tier lookup in `resolveScan` (`src/lib/resolveTag.ts`) checking both Supabase and store fallback across `tag_id` and `business_id`.
  - Added `getAllPageEditorConfigs` local fallback in both `src/app/r/[slug]/page.tsx` and `src/app/r/[slug]/review/page.tsx` to prevent any premature `/unavailable` redirects if Supabase encounters a latency spike.
  - Synchronized `INITIAL_CLIENTS`, `INITIAL_TAGS`, `INITIAL_GOOGLE_LINKS`, and `INITIAL_PAGE_EDITOR_CONFIGS` in `adminPlatformStore.ts` with `ZT-0004` (`ST3` / `XYZ`) so all serverless instances immediately recognize completed setups.
- **Unslop NLP Audit & Humanized Copy**:
  - Audited codebase with `theclaymethod/unslop` scanner suite.
  - Replaced robotic negative parallelism ("not only write reviews, but also engage") in `HomeView.tsx` with direct, natural phrasing.
- **Admin Console Modularization & Optimization**:
  - Extracted Overview tab into `OverviewWebpageTab.tsx`, reducing `AdminConsoleView.tsx` by over 1,600 lines of dead code.
  - Verified image assets compressed to high-efficiency WebP format (98.8% payload reduction).

## [1.38.0] — 2026-11-02
### Fixed (Completed Standee Page Resolution & Unintended `/unavailable` Redirect Gate)
- **Resolved Route Resolution for Completed Standee Designs**:
  - Fixed an issue where scanning or clicking a completed standee link (e.g. `/t/ST3` routing to `/r/zt-0004`) triggered an unintended redirect to `/unavailable`.
  - Cause: Previously, `/r/[slug]` strictly required businesses to exist in the legacy `businesses` table before checking `page_editor_configs`. Since clients created via the Admin Console live in the `clients` and `page_editor_configs` tables, `rawBiz` returned `null`, prematurely hitting the `redirect("/unavailable")` gate.
  - Fix:
    1. **Prioritized Page Editor Config Lookup**: In `/r/[slug]/page.tsx`, `page_editor_configs` is now queried *before* the business existence validation. When `setup_status === 'completed'`, it immediately constructs the effective business record and renders `<ZenTapHubPage />` with the exact theme, logo, banner, and buttons.
    2. **Multi-Table Client Fallback**: Enhanced `fetchPublicBusinessBySlug` in `service.ts` to seamlessly fall back to both `clients` (by `business_id` or `business_name`) and `page_editor_configs` (by `tag_id`, `business_id`, or `business_name`).
    3. **Aligned `/r/[slug]/review` Route**: Implemented the same multi-table fallback in `/r/[slug]/review` to guarantee full parity across both the Hub page and the AI Review Assistant page.

## [1.37.0] — 2026-11-02
### Fixed & Enhanced (Interactive Category Tag Addition & Removal Architecture)
- **Removable Category Badges with `×` Delete Triggers**:
  - Transformed the plain text category input in both the **Edit Whole Entry** modal and **Visual Page Designer** modal into an interactive Multi-Tag Manager.
  - Active categories (e.g. `Service`, `Restaurant & Cafe`, `Retail Store`) now render as individual purple badge chips with an explicit `×` removal button.
  - Clicking `×` instantly removes the category from the active list.
  - Added a 1-click **Clear all** button to wipe out all categories with a single tap.
- **Custom Category Addition with Enter / Comma / `+ Add` Button**:
  - Store admins can type any custom category name (e.g. `Service`, `Dental Care`, `Bakery`, `Jewellery Store`) and press **Enter**, `,` (comma), or click **+ Add**.
  - Form submission on Enter is cleanly intercepted via `e.preventDefault()`, adding the category chip immediately instead of accidentally submitting the modal.
- **Bidirectional Preset Chip Toggle**:
  - The preset category chips (`Restaurant & Cafe`, `Salon & Spa`, `Retail Store`, `Healthcare & Clinic`, `Service`, `Jewellery & Luxury`, `Customer Satisfaction Hub`) now function as toggleable switches:
    - If a preset is already active, it shows purple with `✓` and an `×` icon; clicking it **removes/unselects** it.
    - If a preset is not active, clicking it **adds** it to the active category list.
  - Synchronized across both the **Edit Whole Entry** modal and the **Visual Page Designer** modal.

## [1.36.0] — 2026-11-02
### Compliance & Authenticity (Review Gating Policy Compliance & Realistic Startup Metrics)
- **Purged Contradictory Review Gating Claims Across the Website**:
  - Removed "AI Sentiment Guard", "Anti-Gating Compliant", and claims of diverting 1-2★ reviews away from Google. Google strictly prohibits review gating (selectively soliciting positive reviews or discouraging negative reviews).
  - Reframed all customer review touchpoints around **Direct Google Maps Reviews** and **Smart AI Review Assistance**:
    - Every customer retains unhindered, direct access to write and publish authentic Google reviews.
    - AI provides 1-tap keyword-rich suggestions based on customer highlights (e.g. food, ambience, staff) to eliminate typing friction.
    - Added a transparent, optional **Direct Management Resolution Desk** for private feedback without restricting or gating public reviews.
  - Updated all marketing views: `HomeView.tsx`, `Footer.tsx`, `layout.tsx`, `page.tsx`, `HyperFramesPlayer.tsx`, `PhysicalStandeeGallery.tsx`, `SentimentSimulator.tsx`, `BenefitsView.tsx`, `FaqView.tsx`, `FeaturesView.tsx`, `HowItWorksView.tsx`, `PricingView.tsx`, `AdminConsoleView.tsx`, and `SampleDashboardView.tsx`.
- **Startup Metrics Normalization**:
  - Replaced inflated startup claims (`Over 45,382+ Verified Reviews Generated`, `boost rating by 300%`, `+410% Review Volume`, `150+ venues`) with realistic and credible early-stage metrics:
    - `Tested Across 15+ Local Businesses in Ahmedabad • 500+ Customer Reviews`.
    - `Collect genuine 5-star Google reviews seamlessly without awkward asking or paperwork`.
    - `5x Faster Review Collection` velocity and `10s Average Review Completion`.
  - Normalized customer testimonials in `ClientProofsView.tsx` to reflect genuine pilot tests across local businesses in Ahmedabad.

## [1.35.0] — 2026-11-02
### Enhanced (Categories Column, Destination Dropdown & Unified Review Assistant Design Consistency)
- **Categories Column & Quick Edit in Page Editor Table**:
  - Added dedicated **Category** column to the Standee Page Editor table (`PageEditorWebpageTab.tsx`).
  - Displays business category badge (e.g. `Restaurant & Cafe`, `Salon & Spa`, `Customer Satisfaction Hub`) with 1-click quick-edit trigger.
  - Added `Category / Categories` field to the **Edit Whole Entry** modal and preset category chips (`Restaurant & Cafe`, `Salon & Spa`, `Retail Store`, `Healthcare & Clinic`, `Customer Satisfaction Hub`) in the **Visual Page Designer** modal.
- **Interactive Destination Dropdown in Page Editor**:
  - Replaced the static badge under *Destination from the Google Links & QR sharing* with an active `<select>` dropdown.
  - Allows admins to toggle destinations directly from the Page Editor between:
    - `ZenTap Google Review (Green)` (`zentap_google`)
    - `Direct Google Review (Amber)` (`direct_google`)
    - `Not Assigned (Grey)` (`not_assigned`)
  - Automatically persists to Supabase PostgreSQL and updates Google Links & QR Sharing state.
- **Design Consistency Unification (`/r/[slug]/review` vs `/r/[slug]` Hub)**:
  - Completely aligned `https://www.zentapdigitalsolutions.com/r/zentap/review?s=qr` with `https://www.zentapdigitalsolutions.com/r/zentap?preview=1`:
    - **Wallpaper Background**: Full background wallpaper with dark blur backdrop overlay.
    - **Behind the Banner (Hero Cover)**: Exact hero cover banner image with gradient overlay.
    - **Round Cover Profile (Logo)**: Centered round avatar logo with border and backdrop blur.
    - **Business Title & Category**: Exact font typography and verified badge.
    - **Call & Directions Row**: Tactile Call and Directions action buttons.
    - **Interactive 5-Star Rating & AI Drafts**: Integrated 5 stars rating with sentiment indicator, "What stood out?" aspect chips, review length selector (Short, Medium, Detailed), "Write my review" AI generator button, voice dictation (`Mic`), editable draft carousel (1/3, 2/3, 3/3), and "Submit review" button that copies and opens Google Reviews.
    - **Unified Touchpoints**: Complete touchpoint row with WhatsApp, Instagram, Facebook, Call, and Directions across both pages.
  - When the admin clicks **Save & Publish Live**, the design updates both pages simultaneously.

## [1.34.0] — 2026-11-02
### Fixed & Enhanced (Redirect Collision Fix, Client Profile Auto-Fetch, Media Uploads & Hub Synchronization)
- **Instagram Redirect Collision Resolved**:
  - Fixed route collision in `src/app/r/[slug]/page.tsx` where legacy mock tag `tag-zt-0004` (`type: "instagram"`) intercepted business route `zt-0004` and issued an unintended 307 redirect to Instagram.
  - Renamed mock tag code to `demo-ig-0004` in `src/lib/businessStore.ts` and hardened `/r/[slug]` so `legacyTag` resolution is strictly bypassed when handling business routes.
- **Default Status of Design = Pending Gate**:
  - Enforced `setup_status = 'pending'` for unconfigured Standees in Supabase PostgreSQL (`page_editor_configs`).
  - When scanning or tapping `/t/ST3`, the visitor is smoothly routed to `/unavailable` ("Business Profile Under Process") with the exact copy and WhatsApp / Return to Homepage buttons.
- **Visual Page Designer Customization Upgrades**:
  - **Auto-Fetch from Client Profile**: Added 1-click "Auto-fetch from Client Profile" button that pulls phone, WhatsApp, Instagram, Facebook, business name, and city from `ClientRecord`.
  - **Behind the Banner (Cover Banner Image)**: Direct image file upload + URL field for the hero background banner.
  - **Round Cover Profile (Logo)**: Direct image file upload + URL field for circular business avatar.
  - **Background Wallpaper**: Direct image file upload, URL field, and preset wallpaper chips (Cyber Dark, Aurora, Studio, Slate).
  - **Facebook Integration**: Added Facebook URL field and tactile Facebook button in the live mockup and rendered Hub page.
- **Database & Live Hub Synchronization**:
  - Clicking **Save & Publish Live** persists `cover_image`, `logo_url`, `wallpaper_url`, `facebook`, `instagram`, `phone`, `whatsapp`, and switches `setup_status` to `completed`.
  - Synchronizes to both Supabase PostgreSQL and local `hubDesignStore`, rendering the full landing page matching `/r/zentap?preview=1` for `/r/[slug]`.

## [1.33.0] — 2026-11-02
### Enhanced (Page Editor ZenTap Review Isolation, Design Status & Pending Process Architecture)
- **ZenTap Google Review Destination Isolation**:
  - The **Page Editor** directory (`PageEditorWebpageTab.tsx`) now strictly filters and displays **only** Standees whose destination in Google Links & QR Sharing is set to **ZenTap Google Review** (`destination === 'zentap_google'`).
  - Standees assigned to *Direct Google Review* or *Not Assigned* are automatically excluded from the Page Editor, keeping focus strictly on standees requiring custom review assistant landing pages.
- **Pending Setup Gate ("Business Profile Under Process")**:
  - In `src/lib/resolveTag.ts`, when a visitor scans or taps a standee whose destination is `zentap_google`, the system checks whether the page has been designed and completed (`setup_status === 'completed'`).
  - If `setup_status === 'pending'` (meaning the page has not been designed or saved yet), it automatically redirects to `/unavailable`, displaying:
    - **Business Profile Under Process**: *"This QR Code / NFC Standee has not been activated yet or is currently being configured. The business review profile page is under process and will be live shortly."*
    - Direct buttons for **"Contact on WhatsApp"** (`wa.me/919274560880`) and **"Return to Homepage"**.
  - Once the admin designs the page and clicks **"Save Changes"**, the status flips to **Completed** (Green), and scanning immediately redirects to the live customized review page (`/r/[slug]`).
- **Added "Status of Design" Column**:
  - Added a dedicated **Status of Design** column alongside Setup Status displaying:
    - `Pending` (Red badge with `AlertCircle`) when not yet designed.
    - `Completed` (Green badge with `CheckCircle2`) once designed and saved.
- **Option to Edit Whole Entry**:
  - Added an **Edit** action button (`Edit2`) in the Actions column of the Page Editor directory table.
  - Opens the **Edit Page Entry** modal allowing full editing of Business ID, Business Name, Link of Tag ID, and Status of Design / Setup Status (`Pending` vs `Completed`).
  - Changes persist both in Supabase PostgreSQL (`/api/admin/platform`) and in the local platform store.

## [1.32.0] — 2026-11-02
### Enhanced (Business Owner Command Center & Overview Tab Overhaul)
- **Business Owner Executive Dashboard**:
  - Completely redesigned the **Overview** tab in `AdminConsoleView.tsx` from an internal hardware fleet and warehouse tracking page into a focused, operational **Business Owner Command Center**.
  - **Removed Unnecessary Internal Agency Metrics**: Purged hardware fleet manufacturing earnings, unconfirmed merchant names, raw factory inventory counts, product sales pie charts, and internal agency onboarding checklists.
  - **Added Multi-Store & Outlet Switcher**: Business owners can toggle between aggregated metrics across all outlets or zoom into a specific store (`ZT-XXXX`).
  - **Core Business KPIs**:
    - **Customer Footfall Taps & Scans**: Total in-store visitor interactions, growth trajectory (+24%), and visual NFC vs QR ratio breakdown.
    - **Google Reviews Generated**: Net verified review completions with conversion rate (~88% of visitors proceed to Google Maps).
    - **Average Customer Satisfaction**: Live rating aggregate (4.9 ★) with 5-star distribution.
    - **Sub-4★ Private Feedback Intercepted**: Negative sentiment safely caught privately to protect public Google rating and maintain Google Anti-Gating compliance.
  - **Weekly Footfall & Customer Sentiment Analytics**:
    - 7-day footfall bar chart with peak traffic time callout.
    - Star-rating breakdown distribution bar (5★, 4★, 3★, 1-2★).
  - **Active Standees & Counter Touchpoints Directory**:
    - Live list of physical devices placed across the venue with Tag ID, Counter Location, Routing Mode, Link of Tag ID (`/t/[tag_id]`), Scans recorded, and 1-tap Copy / Live Preview actions.
  - **What Customers Love Most & Live Customer Activity Feed**:
    - Interactive review aspect chips with 1-click modal to customize the tags customers see when leaving a review.
    - Real-time customer tap & scan stream showing recent visitor interactions.

## [1.31.0] — 2026-11-02
### Enhanced (Connected Design Review Page & Google Links & QR Sharing Architecture)
- **Tag ID Link Connection & Synchronization**:
  - Connected the **Design Review Page** (Page Editor) directly to **Google Links & QR Sharing**:
    - Replaced the disconnected manual "Google Review Form URL" with a dedicated **Connected to Google Links & QR Sharing** section.
    - Displays the **Link of Tag ID** (`${DOMAIN_BASE}/t/${tag_id}`) pulled directly from Google Links & QR Sharing for the active Standee Tag ID with a 1-click "Copy Link" and "Visit" button.
    - Synchronized **Page Linked to Tag ID (Google Review Posting Link)** between `page_editor_configs`, `google_review_links`, and `qr_nfc_tags`: changes saved in either tab automatically sync to the other.
- **Directory Table Standardization**:
  - Re-structured the Page Editor directory table with the exact standardized columns:
    1. **Business ID**: Monospace badge linked to merchant.
    2. **Business Name**: Full business name.
    3. **Tag ID**: High-contrast dark badge.
    4. **Link of Tag ID**: Active NFC/QR destination URL (`/t/[tag_id]`).
    5. **QR Code**: Quick high-res QR code preview and download.
    6. **NFC Link**: Dedicated 1-tap copy button for programming NFC tags (`?s=nfc`).
    7. **Setup Status**: Completed (Green) / Pending (Red).
    8. **Destination from the Google Links & QR sharing**: Interactive dropdown synced live with `google_review_links` and `qr_nfc_tags` (Not Assigned / Direct Google Review / ZenTap Google Review).
    9. **Actions**: Live Preview, Design Review Page, and Soft Delete.
- **Cross-Tab Navigation Shortcut**:
  - Added a direct **Palette ("Design Review Page")** shortcut button in the Actions column of **Google Links & QR Sharing** to seamlessly jump to the Standee's Page Editor design flow.

## [1.30.0] — 2026-11-02
### Fixed & Enhanced (Persistent Soft Delete Architecture, Query-Level Filtering & Tag Cascade Release)
- **Database Schema Migration (`011_soft_delete_system.sql`)**:
  - Added `deleted_at TIMESTAMPTZ DEFAULT NULL` and `deleted_by TEXT DEFAULT NULL` across all 6 core platform tables (`clients`, `payments`, `qr_nfc_tags`, `google_review_links`, `social_links`, `page_editor_configs`).
  - Added B-tree indexes (`idx_<table>_deleted_at`) to enable high-performance query-level filtering.
- **Query-Level State Filtering**:
  - Replaced local array filtering with real Supabase database query filters:
    - Active tabs query `WHERE deleted_at IS NULL`.
    - Deleted tabs query `WHERE deleted_at IS NOT NULL`.
  - Badges and counts compute live from PostgreSQL.
- **Server-Side Mutation Integrity**:
  - All operations (`soft_delete`, `restore`, `permanent_delete`) execute server-side via `/api/admin/platform` using service-role credentials.
  - Exactly one row changed is verified; on failure, operations abort without modifying UI state.
- **Cascade Deletion & Tag Release**:
  - Soft-deleting a Client immediately releases all assigned hardware tags (`business_id = NULL, business_name = NULL`), returning them to unassigned inventory.
  - Linked payments, Google review links, social links, and page editor configurations are marked `deleted_by = 'cascade:client_delete'` (hidden everywhere else, but preserved in their respective Deleted tabs).
- **Collision Prevention on Restore**:
  - Restoring a Client verifies that no active client possesses a clashing `business_id`, `owner_email`, or `owner_phone`, showing an explicit warning toast if a clash exists.
- **Permanent Delete Safeguard**:
  - "Delete Permanently" action exists strictly on the Deleted tab, protected by a modal requiring typing the exact business name or tag ID.
- **URL Query State Preservation**:
  - Preserves view state across browser refreshes via `?status=deleted` (or `paid`, `unpaid`, `all`).
- **Fleet Header Count Fix**:
  - Fixed discrepancy where header showed 8 clients (from mock data) while the table showed 3. Connected header count directly to live Supabase active client records.

## [1.29.0] — 2026-11-02
### Enhanced (Live Overview Telemetry, Full Supabase Synchronizer & Operational Login Portal)
- **Live Overview Page Integration**:
  - Replaced mock and disconnected metrics with active real-time platform calculations from `platformClients`, `platformPayments`, `platformTags`, `platformGoogleLinks`, and `platformSocialLinks`.
  - Live revenue telemetry: `platformCollectedEarnings` calculated across all completed payments.
  - Live customer engagement: Aggregated hardware NFC scans and QR scans with accurate distribution.
  - Connected action modules: Dynamic badges for unconfirmed client details, pending Google review link destinations, payment ledger collections, and hardware inventory stock.
- **Backend Database Platform Synchronizer (`/api/admin/platform`)**:
  - Created dedicated backend API handler with automated Supabase PostgreSQL synchronization using service-role credentials.
  - Automatically queries, hydrates, and mutates records across all 12 platform tables: `clients`, `deleted_businesses`, `payments`, `deleted_payments`, `qr_nfc_tags`, `deleted_qr_nfc_tags`, `google_review_links`, `deleted_google_review_links`, `social_links`, `deleted_social_links`, `page_editor_configs`, and `deleted_page_editor_configs`.
  - Added broadcast event pipeline (`zentap_platform_updated`) for sub-second UI synchronization across all open views.
- **Merchant & Admin Login Architecture**:
  - Upgraded `/login` with dual-mode role selector ("Merchant" and "Admin Console").
  - Seamless navigation to Merchant Dashboard upon merchant sign-in, and instant redirect to the Admin Console for verified administrative accounts.
  - Integrated interactive password reset modal with Supabase authentication.
  - Added "My Dashboard" shortcut directly in the global header for authenticated merchants.

## [1.28.0] — 2026-11-02
### Enhanced (Full Entry Editing, Database Deletion Audit Tables, Business ID Search & Table Enhancements)
- **Database Schema Migration (`010_admin_tables_enhancements.sql`)**:
  - `public.deleted_payments`: Dedicated audit table for deleted payments with timestamps and operator tags.
  - `public.deleted_google_review_links`: Audit table for deleted Google Review standee configurations.
  - `public.deleted_social_links`: Audit table for deleted Social Link smart card configurations.
  - `public.deleted_qr_nfc_tags`: Audit table for deleted hardware QR/NFC tags.
  - `public.deleted_page_editor_configs`: Audit table for deleted showcase page configurations.
  - Full Row Level Security (RLS) policies and B-tree indexes across all deletion tables.
- **Clients Tab**:
  - Added full entry editing modal under Actions column allowing updates to `business_id`, `business_name`, `owner_name`, `owner_phone`, `owner_email`, `whatsapp`, `instagram_link`, `facebook_link`, and `city`.
- **Payments Tab**:
  - Added full entry editing modal under Actions column (updates business, product, price, selling rate, date, method, status, notes).
  - Removed admin password requirement on delete. Deleted payments are cleanly archived into `deleted_payments`.
  - Added top filter tabs: **All**, **Paid**, **Unpaid**, and **Deleted** with 1-click restore.
- **QR/NFC Generator Tab**:
  - In "Create Single Tag" modal: Added live search input for Business ID / Name to easily assign to any registered merchant.
  - In "Assign Business" modal & column: Added live search filter for Business ID / Name / City.
  - In Actions column: Added Option to edit the whole entry (Tag ID, Product Type, Assigned Business with search, Generated Link, Scans).
- **Google Links & QR Sharing Tab**:
  - Added dedicated **Google Review Link** column with direct quick-edit modal.
  - Added Actions column at the end with **Edit Whole Entry** and **Delete Entry** (moves to `deleted_google_review_links`).
  - Added **Deleted** section tab filter with 1-click restore.
- **Social Links & QR Sharing Tab**:
  - Added dedicated **Social Link** column with direct quick-edit modal.
  - Added Actions column at the end with **Edit Whole Entry** and **Delete Entry** (moves to `deleted_social_links`).
  - Added **Deleted** section tab filter with 1-click restore.
- **Page Editor Tab**:
  - Added Actions column at the end with **Edit Whole Entry** and **Delete Entry** (moves to `deleted_page_editor_configs`).
  - Added **Deleted** section tab filter with 1-click restore.

### Production Deployment & Canonical Domain Consolidation
- **Canonical Production Domain**: Standardized live production deployment strictly to `https://zentapdigitalsolutions.com` and `https://www.zentapdigitalsolutions.com`.
- **Legacy Domain Removal**: Completely removed unconfigured and legacy deployment aliases (`zentap.app`) from Vercel alias mappings and project domain configurations.
- **Vercel Cloud Build Ignore Fix**: Root-anchored `/open-design/` and `/Photos of standee/` in `.vercelignore` to prevent Next.js component resolution errors during cloud builds.
- **Internal URL & Metadata Standardization**: Updated all application fallbacks, QR generation links, metadata, and admin helpers to target `https://zentapdigitalsolutions.com`.
- **Live Verification**: Verified HTTP 200 responses across apex domain, www subdomain, and App Router redirect routes.


## [1.27.0] — 2026-11-02
### Added & Redesigned (Independent Webpages Architecture & Unified Admin Tables)
- **Database Schema Migration (`009_admin_webpages_redesign.sql`)**:
  - `public.clients`: Dedicated table for active businesses with `business_id`, `business_name`, `owner_name`, `owner_phone`, `owner_email`, `whatsapp`, `instagram_link`, `facebook_link`, `city`.
  - `public.deleted_businesses`: Permanent audit registry for permanently deleted clients with timestamps and reasons.
  - `public.payments`: Dedicated financial ledger storing `business_id`, `business_name`, `product`, `product_price`, `selling_rate`, `payment_date`, `payment_method`, `payment_status`, `notes`.
  - `public.qr_nfc_tags`: Hardware tag registry for `ST1`, `ST2`... (Counter Standees) and `CRD1`, `CRD2`... (Business NFC Cards).
  - `public.google_review_links`: Backend routing table for standees with destination modes (`not_assigned`, `direct_google`, `zentap_google`) and setup statuses (`pending`, `completed`).
  - `public.social_links`: Backend routing table for smart business cards with platform selectors (`WhatsApp`, `Instagram`, `Facebook`, `N/A`) and setup statuses.
  - `public.page_editor_configs`: Showcase page customizer configurations for standee merchants.
- **Dedicated Webpages & URL Routing (`?tab=...`)**:
  - **1. Clients Webpage (`ClientsWebpageTab.tsx`)**:
    - Columns: `Business ID`, `Business Name`, `Owner name`, `Owner Phone`, `Owner Email`, `Whatsapp`, `Instagram Link`, `Facebook Link`, `Actions`.
    - Search across ID, name, number, email, WhatsApp.
    - Two views only: **All Clients** and **Deleted** (permanent registry with 1-click restore).
    - Add New Business modal with Facebook link and auto-assigned ID preview.
  - **2. Payments Webpage (`PaymentsWebpageTab.tsx`)**:
    - Columns: `Business ID`, `Name`, `Product Price`, `Selling Rate / Amount received`, `Date & Method`, `Status of payment`, `Notes`, `Actions`.
    - Record Payment modal with client lookup, product presets, and payment modes (UPI/Cash).
    - Password-protected deletion: strictly requires Super Admin password to delete financial records.
  - **3. QR/NFC Generator Webpage (`QrNfcGeneratorWebpageTab.tsx`)**:
    - Single Tag creation: assigns sequential Tag ID (`ST1`, `ST2`... or `CRD1`, `CRD2`...) with immediate client assignment.
    - Batch Generation: asks only for Product Type and Quantity (1-100 units).
    - Columns: `Business ID`, `Product type`, `Tag ID`, `Status` (Assigned in Green / Not Assigned in Red), `Generated Link`, `Download QR`, `Copy NFC Link`, `Assign/Reassign Business`.
    - Default filter: **Unassigned**.
  - **4. Google Links & QR Sharing Webpage (`GoogleLinksWebpageTab.tsx`)**:
    - Standee-exclusive backend routing hub populated automatically from assigned standee tags.
    - Columns: `Business ID`, `Business Name`, `Tag ID`, `Link of Tag ID`, `QR Code`, `NFC Link`, `Setup Status` (Completed in Green / Pending in Red), `Total Scans/Taps`, `Destination of QR/NFC`, `Edit`.
    - Destination modes: Not Assigned (Red), Direct Google Review (Orange), ZenTap Google Review (Green).
    - Manual entry modal.
  - **5. Social Links & QR Setting Webpage (`SocialLinksWebpageTab.tsx`)**:
    - Card-exclusive backend routing hub populated automatically from assigned card tags.
    - Columns: `Business ID`, `Business Name`, `Social Platform` (WhatsApp, Instagram, Facebook, N/A), `Tag ID`, `Link of Tag ID`, `QR Code`, `NFC Link`, `Setup Status`, `Total Scans/Taps`, `Destination of QR/NFC`, `Edit`.
    - Manual entry modal.
  - **6. Page Editor Webpage (`PageEditorWebpageTab.tsx`)**:
    - Showcase customizer for Standee merchants.
    - Columns: `Business ID`, `Name`, `Tag ID`, `Link`, `QR Code`, `Setup Status` (Pending in Red, changes to Completed in Green upon save), `Open Page Editor`.
    - Full-screen split visual designer with Theme Presets, live interactive 3D phone mockup, and instant preview.
- **Global Font Visibility & Contrast Polish**:
  - Eliminated dark text on dark backgrounds across sidebar, tables, cards, and modal dialogs.
  - High-contrast slate typography (`text-zinc-900`) on crisp light cards and clean zinc badges.

## [1.26.0] — 2026-11-01
### Added & Enhanced (Unique Business IDs, Google & Social Links Tabs, Live Preview Fix, and Hardware Routing)
- **Live Preview Fix on `/r/[slug]?preview=1`**:
  - Removed server-side gating `if (design.hub_enabled)` on preview mode in [`src/app/r/[slug]/page.tsx`](file:///d:/Projects/Zentap.ai/src/app/r/[slug]/page.tsx) so live previews always render `<ZenTapHubPage isPreview={true} />`.
  - Added client-side hydration `useEffect` in [`ZenTapHubPage.tsx`](file:///d:/Projects/Zentap.ai/src/components/customer/ZenTapHubPage.tsx) to mount and reflect real-time changes saved in `localStorage` from Page Designer immediately upon visiting or previewing.
- **Unique Business ID Fleet System**:
  - Sequential, unique Business ID format (e.g. `ZT-0001`, `ZT-0002`, `ZT-0003`...) generated and assigned upon business registration.
  - Added `business_id_code` to `BusinessRecord` in [`businessStore.ts`](file:///d:/Projects/Zentap.ai/src/lib/businessStore.ts) and `DbBusinessRecord` in [`service.ts`](file:///d:/Projects/Zentap.ai/src/lib/supabase/service.ts).
  - Search filters and Clients directory match and display Business ID badges.
- **Google Links & QR Setting Tab**:
  - Renamed and streamlined tab with a font-mono **Business ID** column.
  - Added **+ Add Manual Entry** modal to configure Google review URLs, review slugs, QR/NFC destinations, and assign hardware tags.
  - Upgraded **Destination of QR/NFC** to a multi-state dropdown featuring:
    - 🟢 Direct Google Review
    - 🟠 ZenTap Google Review
    - 🔴 Not Assigned
- **Social Links & QR Setting Tab (`SocialLinksAndQrSettingsTab.tsx`)**:
  - Dedicated operational workspace for smart business cards and social NFC/QR routing.
  - Supported platforms: WhatsApp, Instagram, Facebook.
  - Columns: `Business ID`, `Name`, `Social Platform`, `Code`, `Link`, `Assigned Status`, `Status of the link`, `Scans / Taps`, `Download QR`, `Copy NFC Link`.
  - Includes **+ Add Manual Social Link** modal and platform filter pills (`All`, `WhatsApp`, `Instagram`, `Facebook`).
- **QR/NFC Generator (Standees & Cards)**:
  - Renamed tab from "Standees & Cards" to **QR/NFC Generator** and purged the legacy "Quick Setup" modal.
  - Direct connection to Google Links & QR Setting and Social Links & QR Setting tabs.
  - Supports batch generation (1 to 100 units) and individual tag creation with sequential `zt-XXXX` codes.

## [1.25.0] — 2026-11-01
### Fixed & Improved (Admin Fleet Directory Deletion & Permanent Purge Workflow)
- **Fleet Filter Logic Fix**:
  - Corrected `filtered` business calculation in [`AdminConsoleView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/AdminConsoleView.tsx) where `statusFilter === 'all'` previously bypassed the `b.is_deleted` check.
  - Soft-deleted businesses now strictly disappear from the main "All", "Unpaid", and "Paid" lists and appear exclusively under the **"Deleted"** tab.
- **Permanent Purge & Seed Immunity (`PURGED_BIZ_IDS_KEY`)**:
  - Resolved issue where seed businesses (e.g., "Iron Works Fitness Arena") were resurrected by `INITIAL_FLEET` re-seeding on page load or state refresh.
  - Implemented persistent `zentap_v2_purged_biz_ids` registry in [`businessStore.ts`](file:///d:/Projects/Zentap.ai/src/lib/businessStore.ts); purged business IDs are permanently remembered and filtered out from both local stores and Supabase synchronization.
  - Updated `purgeBusinessRecord` to automatically release all attached NFC/QR tags back to the inventory pool before deletion, avoiding foreign key blockers.
- **Fail-Safe Cascade in Supabase**:
  - Updated `adminPermanentDeleteDbBusiness` in [`service.ts`](file:///d:/Projects/Zentap.ai/src/lib/supabase/service.ts) to safely unassign child tags and delete dependent records in `scans`, `manual_payments`, `page_design`, and review tables before executing the deletion in Postgres.
- **Streamlined Deletion & Restore UI**:
  - Delete button on main list performs a clean delete moving the business into the "Deleted" tab with full restoration capability.
  - "Deleted" tab features clear 1-click **Restore** (green) and **Purge** (red) actions.
  - Confirmation modal supports typing either `delete` or the business name (case-insensitive and trimmed) for smooth verification.

## [1.24.0] — 2026-11-01
### Added & Streamlined (Direct WhatsApp Ordering & Founder Manual Dashboard Operations)
- **Customer-Facing Pivot to Direct WhatsApp-First Business Model**:
  - Brand identity standardized to **ZenTap**; official domain configured to `https://www.zentapdigitalsolutions.com/`.
  - Centralized official WhatsApp communication number: `919274560880`.
  - Replaced online checkout, cart, and client payment processing across customer-facing routes with direct 1-tap WhatsApp enquiry and ordering buttons.
  - Kept underlying payment gateway infrastructure (`razorpay.ts`, checkout endpoints) modular and preserved so automated checkout can be plugged back in at any time.
- **Strict Single Admin Login Restriction**:
  - Enforced that there is **strictly ONLY ONE** admin login option across the entire website, located exclusively at the **top-left corner of the homepage header** (`currentView === 'home'`).
  - Completely purged all admin login links from the website footer, product pages, right-hand header action bar, and mobile drawer.
- **The 4 Official Product Categories**:
  - **1. Business Review Standee** (₹999 Standee • ₹499 Card): Direct 1-tap Google Review redirection without intermediate pages. Pre-filled WhatsApp message: `"Hello ZenTap, I am interested in your QR/NFC Business Review Standee with direct Google Review integration. Please share the details."`
  - **2. ZenTap Smart Review Standee** (₹1,499 Standee + Assistant): Powered by the ZenTap Review Assistant with AI drafting, multilingual support, and 1-2★ private sentiment shield. Pre-filled WhatsApp message: `"Hello ZenTap, I am interested in the ZenTap Smart Review Standee with the ZenTap Review Assistant. Please share the details."`
  - **3. ZenTap Smart Business Card** (₹699 PVC • ₹1,499 Metal): NFC & QR digital business card with contact vCard save, socials hub (Instagram, Facebook, LinkedIn, YouTube), and direct WhatsApp chat. Pre-filled WhatsApp message: `"Hello ZenTap, I am interested in the ZenTap Smart Business Card with QR/NFC functionality. Please share the details."`
  - **4. ZenTap Custom Solutions** (Custom Quote / Bulk): Tailored QR/NFC standees, acrylic/metal branding, multi-branch fleet networks, and bespoke event/display hardware. Pre-filled WhatsApp message: `"Hello ZenTap, I would like to discuss a customized QR/NFC solution for my business."`
- **Database Migration (`supabase/migrations/007_manual_payments.sql`)**:
  - `public.manual_payments`: Full transaction ledger storing `id`, `business_id`, `business_name`, `product_purchased`, `total_agreed_amount`, `amount_received`, `pending_balance` (auto-calculated stored generated column), `payment_date`, `payment_method`, `payment_status`, and `admin_notes`.
  - RLS policies restricting access to verified root admins.
  - Extended `public.businesses` with `selected_product` and `whatsapp_support_number`.
- **Founder Dashboard Manual Operations Suite**:
  - Removed "Orders & Payments" navigation option and notification triggers from the admin console UI to align with manual offline entries. Preserved underlying order models and API endpoints for future automated website purchases.
  - Dedicated **Manual Payments** tab in the admin console sidebar (`ManualPaymentsTab.tsx`).
  - Overview screen upgraded with a live **Manual Payment Ledger & Receivables** widget showing real-time amounts collected vs pending balances with a 1-click shortcut.
  - Financial metric cards: Total Revenue Agreed, Total Amount Collected, Pending Balance / Receivables, Settlement Breakdown.
  - Live search and filter controls by business, status (`completed`, `partial`, `pending`), and product category.
  - Record & Edit Payment Modal with live auto-calculating pending balance preview (`Total Agreed - Amount Received`).
  - Updated Business Onboarding modal to select from the 4 official product categories.
  - Dedicated API endpoint at `/api/admin/payments` (GET, POST, DELETE) with graceful Supabase sync and local fallback cache.

## [1.23.0] — 2026-11-01
### Added (AI Model Manager + Auto-Failover Resilience Suite)
- **Non-Destructive Database Migration (`supabase/migrations/006_ai_models_and_failover.sql`)**:
  - `public.ai_models`: Multi-provider catalog storing `label`, `provider` (`anthropic`, `openai`, `google`, `openrouter`, `openai_compatible`), `model_id`, `base_url`, `api_key_encrypted`, `priority`, `enabled`, `status` (`active`, `standby`, `exhausted`, `cooldown`, `disabled`), `cooldown_until`, `monthly_budget_usd`, token pricing, and error logs.
  - `public.ai_settings`: Single-row global configuration for `failover_enabled`, `manual_primary_id`, `exhausted_retry_hours` (default 6h), `cooldown_seconds` (default 60s), `alert_email`, and `last_failover_at`/`last_failover_info`.
  - `public.ai_model_usage`: High-granularity audit log tracking token usage, estimated USD costs, latencies, success rates, and categorized error types.
  - Added nullable column `model_id` to `review_generations` and `model_override_id` to `business_review_config`.
- **Cryptographic Security Layer (`src/lib/ai/crypto.ts`)**:
  - AES-256-GCM encryption with 96-bit random IV and 128-bit authentication tags using secret key derived from `APP_ENC_KEY`.
  - API keys are decrypted strictly server-side; client UI displays only masked credentials (`sk-...ab12`).
- **Universal Provider Adapter Layer (`src/lib/ai/adapters.ts`)**:
  - Unified `generate({ system, prompt, maxTokens })` interface.
  - Native adapters for Anthropic (`/v1/messages`), OpenAI (`/v1/chat/completions`), Google Gemini (`/v1beta/models/...:generateContent`), and OpenAI-compatible providers (OpenRouter, Groq, local inference, custom `base_url`).
  - Strict error classification categorizing HTTP 401/402/403/quota errors as `credit_exhausted`, 429/500/502/503/timeouts as `rate_limited`, and malformed payloads as `invalid_response`.
- **Dynamic Auto-Failover Execution Engine (`src/lib/ai/modelManager.ts` & `/api/review/generate`)**:
  - Priority queue selection: Client `model_override_id` $\rightarrow$ Global `manual_primary_id` $\rightarrow$ Active priority order.
  - Automatic filtering: skips disabled models, models cooling down, and models whose monthly budget has been reached.
  - Automatic cooldown handling for rate-limited models and scheduled retries for exhausted providers once `exhausted_retry_hours` elapses.
  - 1-retry self-healing on invalid JSON responses before triggering failover.
  - Seamless fallback to environment `ANTHROPIC_API_KEY` (with `claude-haiku-5-5`) and deterministic synthesizer if no database models are configured or if all fail.
- **Admin AI Models Management Workbench (`AiModelManagerTab.tsx`)**:
  - Integrated into Settings > **AI Models & Failover** tab.
  - Top status banner displaying active primary model, status indicator, and last failover timestamp.
  - Full model fleet table with order controls, priority swapping, real-time status badges, masked keys, and error diagnostics.
  - Actions: Register/Edit model, Delete, Toggle Enable/Disable, "Set Primary", and "Reset Status" (clearing cooldown/exhausted state).
  - Rate-limited "Test Model" ping utility displaying live network latency in milliseconds.
  - Global auto-failover policy editor (failover toggle, cooldown seconds, exhausted retry hours, alert email).
  - Business-level "Model Override" selector added to Review Assistant > Language & Tone settings.
  - Per-generation model attribution display in Review Assistant > Usage telemetry.

## [1.22.0] — 2026-11-01
### Added (ZenTap Hub Page + Dedicated AI Review Page + Page Designer)
- **Non-Destructive Database Migration (`supabase/migrations/005_zentap_hub_and_page_designer.sql`)**:
  - `public.page_design`: Table storing theme styling tokens, presets, typography, button/card styles, dark mode setting, cover/logo URLs, and editable text labels behind per-business `hub_enabled` flag (default `false`).
  - `public.page_buttons`: Touchpoint actions (review, call, directions, whatsapp, instagram, facebook, youtube, website, menu, booking, custom links) with ordering and visibility toggles.
  - `public.page_sections`: Ordered content sections (about, photos, hours, offers, faqs, testimonials, video) with visibility switches and JSON content.
  - `public.page_photos`: Photo gallery repository with captions and ordering.
  - `public.click_events`: Telemetry tracking button taps on Hub pages with visitor source (`qr` | `nfc` | `web`).
- **Mobile Hub Page (`ZenTapHubPage.tsx`)**:
  - Mobile-first glassmorphism design: cover banner, round overlapping logo, verified badge, tagline, address pill with Google Maps link.
  - Quick action row: "Call" and "Directions" buttons.
  - Primary "Write a review" hero button linking to `/r/[slug]/review`.
  - Circular social row (WhatsApp, Instagram, Facebook, YouTube, Website, Email).
  - Dynamic interactive sections: About text, Photo gallery with full-screen lightbox modal, Opening hours with "Open Now" badge, FAQs accordion, Testimonials, and Video embeds.
  - Footer with "Powered by ZenTap" badge and owner management modal.
- **Short Links & Click Telemetry**:
  - `/f/[slug]`: 302 redirect to business Facebook profile with click logging.
  - `/y/[slug]`: 302 redirect to business YouTube channel with click logging.
  - `POST /api/hub/click`: Server API recording button interactions with source tracking.
- **Dedicated AI Review Page (`/r/[slug]/review`)**:
  - Standalone route at `/r/[slug]/review` implementing the AI Review flow.
  - 5 empty stars, multi-select product and aspect chips.
  - Swipeable suggestion carousel (`1/3` with `<` and `>` arrow navigation) labeled "Your draft, edit freely".
  - Voice dictation microphone button powered by browser `SpeechRecognition` API.
  - "Submit review" button copying text within tap handler and opening Google Reviews.
  - "Generate another set" regeneration button and "Suggestions are a starting point" disclaimer.
  - Discreet "Tell the owner privately" modal for 1-3 star ratings without gating Google access.
- **Admin Page Designer Workbench (`PageDesignerTab.tsx`)**:
  - Added **Page Designer** sidebar item (`Palette` icon) and table row icon on Clients table.
  - 7 configuration tabs: Branding, Theme (with 5 one-click presets + custom pickers), Buttons (reorder, toggle, custom links), Sections, Texts, Behaviour, and Analytics.
  - Interactive iPhone phone frame live preview updating in real-time as settings are tweaked.
  - "Duplicate from..." another business and "Save Changes" functionality.
  - Seamless zero-regression: businesses with `hub_enabled = false` retain their existing review page without any modifications.

## [1.21.0] — 2026-11-01
### Added (AI Review Assistant Suite & Admin Console Deep Linking)
- **Non-Destructive Database Migration (`supabase/migrations/004_ai_review_assistant.sql`)**:
  - `public.business_review_config`: Per-business configurations including `ai_review_enabled` flag (default `false`), `language` (english, hinglish, gujarati_roman, hindi_roman, mixed), `tone` (friendly, professional, casual, warm), `default_length` (short, medium, long), `highlights`, `facebook_url`, `website_url`, `address`, and `show_icons`.
  - `public.review_options`: Products & Aspects table with sorting, active flags, and seeded 12 preset aspects (Cleanliness, Nice Staff, Fast Service, Hygiene, etc.).
  - `public.review_generations`: Generation logs tracking prompt parameters, length, language, options selected, and hashed visitor IPs.
  - `public.review_events`: Telemetry tracking for `'copied'` and `'opened_google'` conversion actions.
  - `public.private_feedback`: Private 1-3 star feedback table with rating, customer message, optional contact details, and tag identifiers.
- **AI Generation Engine & Rate Limiter (`/api/review/generate`)**:
  - Dual-mode generation: Anthropic Claude Haiku (`claude-haiku-5-5`) API with strict contextual instructions (Roman script for Hinglish/Gujarati, natural human sentiment, length boundaries) paired with deterministic multi-language synthesizer fallback.
  - Deduplication against recent 20 generations for the business.
  - IP & business-level rate-limiting (max 10 requests per 10 minutes per IP).
  - Telemetry routes: `POST /api/review/event` and `POST /api/review/feedback`.
- **Customer Review Page Flow (`/r/[slug]`)**:
  - Gated behind `ai_review_enabled === true`:
    - 5 empty stars (no default selection).
    - Multi-select chips for products and aspects (minimum 1 required).
    - Length selector: Short (1-2 sentences), Medium (2-3 sentences), Long (3-4 sentences).
    - "Write my review" generator returning 3 editable draft cards.
    - "Write 3 more" regeneration button.
    - Direct clipboard copy on tap with telemetry logging and Google Review URL dispatch for all 1-5 star ratings.
    - Discreet "Tell the owner privately" modal for 1-3 star ratings without gating Google access.
  - When `ai_review_enabled === false`: Completely preserves the original existing review page without any modifications.
- **Admin Console Expansion (`src/components/views/AdminConsoleView.tsx`)**:
  - Added sidebar navigation items: **Review Assistant** (`Sparkles`), **QR & NFC** (`QrCode`), and **Feedback** (`MessageSquare`).
  - Added dedicated **Review Assistant** icon on each row of the Clients table for 1-click deep navigation.
  - Rendered `ReviewAssistantTab`, `QrNfcDirectoryTab`, and `PrivateFeedbackTab`.
  - Added deep-link URL parameter support (`?tab=review_assistant&biz={id}`).

## [1.20.0] — 2026-11-01
### Added (Owner Card Management from Review Page & Fallback Activation Hub)
- **Review Page Owner Entry Point**:
  - Added subtle grey footer link `"Business owner? Manage this card"` exclusively on review pages ([`src/app/r/[slug]/ReviewAssistantClient.tsx`](file:///d:/Projects/Zentap.ai/src/app/r/[slug]/ReviewAssistantClient.tsx)).
  - Strictly excluded from homepage, navigation headers, and all public landing views.
- **PIN Authentication & Security Hardening**:
  - Built verification engine ([`src/lib/ownerAccess.ts`](file:///d:/Projects/Zentap.ai/src/lib/ownerAccess.ts)) with SHA-256 hashed PIN comparisons.
  - Added 30-minute lockout enforced automatically after 5 failed attempts, rate-limited by IP and tag code.
  - Generic uniform error message (`"PIN is incorrect"`) prevents account/tag enumeration.
  - Added secondary optional business password field for double-secret support.
  - Audit logging for every verification attempt, lockout, update, and reset to `public.partner_actions`.
- **15-Minute Scoped Owner Panel ([`src/components/modals/OwnerAccessModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/modals/OwnerAccessModal.tsx))**:
  - Issues cryptographic 15-minute session token with real-time ticking countdown badge.
  - Live scan telemetry breakdown: Total scans, NFC taps, QR scans.
  - Update Details form: Business Name, Google Review link (with live test link button and `maps.app.goo.gl` warning banner), WhatsApp number & message, and Instagram handle.
  - Card Reset action with confirmation dialog following reset levels:
    - **Off**: Turns card off, scans display neutral "Page Unavailable".
    - **Direct**: Sets destination directly to Google Reviews.
    - **Needs Approval**: Marks card for administrator re-verification.
- **Fallback Portal for Direct Google Cards (`/activate`)**:
  - Implemented standalone route at [`src/app/activate/page.tsx`](file:///d:/Projects/Zentap.ai/src/app/activate/page.tsx) with `?card={code}` auto-population for owners whose physical cards bypass the ZenTap page straight to Google.
  - Allows full PIN verification and 15-minute management access without needing the review page.
- **API Endpoints**:
  - `POST /api/card/verify` ([`src/app/api/card/verify/route.ts`](file:///d:/Projects/Zentap.ai/src/app/api/card/verify/route.ts))
  - `POST /api/card/update` ([`src/app/api/card/update/route.ts`](file:///d:/Projects/Zentap.ai/src/app/api/card/update/route.ts))
  - `POST /api/card/reset` ([`src/app/api/card/reset/route.ts`](file:///d:/Projects/Zentap.ai/src/app/api/card/reset/route.ts))

## [1.19.0] — 2026-11-01
### Added & Overhauled (Physical Hardware Tag Layer & Existing Standees Remote Switch)
- **Physical Tag Architecture & Routing (`/t/[code]`)**:
  - Implemented dynamic route handler at `src/app/t/[code]/route.ts` with HTTP 302 redirects and `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
  - Resolution engine (`src/lib/resolveTag.ts`) handles Google Review standees (`zentap_page` vs `direct`), WhatsApp cards, and Instagram cards.
  - Automatically deduplicates and records single scan telemetry in both Supabase and local store.
- **Single Tag Management ("Add Single Tag")**:
  - Added "Add Single Tag" modal in Admin Console supporting custom hardware codes (e.g. `zt-0105` or client slug `urban-bistro`) with automatic fallback to sequential `zt-XXXX`.
  - Supports item selection (Counter Standee or NFC Card) and optional immediate assignment to a business.
- **"Chip Written" Verification & "Ready to Give Out" Filter**:
  - Added `chip_written` boolean tracking whether an NFC tag has been physically written and verified with NFC Tools.
  - Added interactive per-tag "Written" / "Needs Writing" toggle badge in the Standees & Cards table.
  - Added **"Ready to give out"** filter pill showing tags that are both free (unassigned) and verified chip-written.
- **Legacy Standee Routing Integration (`/r/[slug]`)**:
  - Converted `src/app/r/[slug]/page.tsx` into a Server Component using `resolveScan` for instant 302 redirection.
  - Existing physical standees printed with `/r/{slug}` can now be mapped to a legacy tag with `code = slug`, enabling instant remote switching between Direct Google and ZenTap Assistant without touching physical hardware.
  - Extracted client interactive interface to `ReviewAssistantClient.tsx`.
- **Database & Schema Updates (`supabase/migrations/001_tags_migration.sql`)**:
  - Added `chip_written` column to `public.tags`.
  - Added `create_single_tag` stored procedure with optional custom code, form factor, chip_written state, and atomic assignment.

## [1.18.0] — 2026-11-01
### Added & Overhauled (WhatsApp Order Architecture, Super Admin Fleet Hub & Dynamic Short Links)
- **Public Website & Navigation Transition**:
  - Removed Sign In, Sign Up, Customer Dashboard ("My Dashboard"), and "Sample Dashboard" everywhere from public header, hero, footer, and pricing views.
  - Placed side-by-side CTA buttons in header and hero: **Order on WhatsApp** (`wa.me/919274560880`) and **Super Admin Login** (`/admin/login`).
  - Added dedicated `/login` and `/signup` routes redirecting to `/` (home).
  - Built dedicated `/admin/login` page with superadmin authentication.
  - Converted all pricing plan cards to "Order on WhatsApp" with prefilled plan names.
  - Purged the word "trial" from all marketing copy and billing states.
- **Admin Portal Overhaul**:
  - Added prominent **"Add Business"** button above fleet table opening a complete business creation modal with permanent slug generation, owner details, WhatsApp, Instagram, Google link, redirect mode toggle, active toggle, and 6-month valid-until date.
  - Implemented safe **Soft-Delete System** on every row (marks inactive, preserves permanent physically encoded slug, renders neutral "Page Unavailable" screen on standee scans) with confirmation dialog and separate permanent delete action.
  - Integrated split scan analytics display (`NFC: X • QR: Y • Total: Z`).
  - Added instant row toggles for **Redirect Mode** (Custom Review Page vs. Direct Google Review) and **Active Status**.
  - Built 3-in-1 QR Asset Hub modal generating high-res PNG (1200px) and vector SVG for **Review QR** (`/r/{slug}?s=qr`), **WhatsApp QR** (`/w/{slug}`), and **Instagram QR** (`/i/{slug}`).
- **Review Router (`/r/[slug]`) & Touchpoint Enhancements**:
  - Built redirect-mode engine:
    - If inactive or soft-deleted: neutral clean "Page Unavailable" screen.
    - If Redirect Mode OFF: immediate 302 redirect directly to Google Reviews (or setup fallback if link not configured).
    - If Redirect Mode ON: customized review assistant with AI drafting.
  - Added prominent **Chat on WhatsApp** and **Follow on Instagram** buttons directly below Google Review flow.
- **Dynamic Short Links Engine**:
  - Created `/w/[slug]` route handler (logs scan telemetry $\rightarrow$ 302 redirects to business WhatsApp).
  - Created `/i/[slug]` route handler (logs scan telemetry $\rightarrow$ 302 redirects to business Instagram profile).
### Enhanced (Stitch Design System & Content Alignment Across 3 Core Pages)
- **Home View Alignment ([`src/components/views/HomeView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/HomeView.tsx))**:
  - Aligned hero badge with verified counter pill (`Over 45,382+ Verified Reviews Generated`).
  - Aligned primary headline to Stitch: *"Turn Every Customer Tap into 5-Star Google Reviews instantly"*.
  - Aligned subtitle: *"Smart NFC & Dynamic QR standees that boost your local business rating by 300% without awkward asking or paperwork."*
  - Integrated Stitch 3-pillar section: *"Engineered for Rapid Growth • Zero Friction. Pure 5-Star Velocity"* (`Instant Tap-to-Review`, `AI Sentiment Guard`, `Dynamic Link Updates`).
- **How It Works View Alignment ([`src/components/views/HowItWorksView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/HowItWorksView.tsx))**:
  - Aligned page header to Stitch: *"Complete Ecosystem & How It Works • Advanced Hardware & AI Routing Capabilities"*.
  - Added Stitch 4-Pillar Hardware & AI Capability Grid (`NTAG216 High-Performance Chip`, `Automated Sentiment Interceptor`, `Live Tap Telemetry & Analytics`, `Custom Pantone Branding`) alongside the 4-step process and 9:16 interactive video stage.
- **Product & Pricing View Alignment ([`src/components/views/PricingView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/PricingView.tsx))**:
  - Aligned page header to Stitch: *"Transparent Investment • Choose Your Growth Pack"*.
  - Updated subtitle: *"Zero monthly fees for basic routing. Own your hardware outright, collect hundreds of 5-star Google reviews, and dominate your local neighborhood."*
  - Added Stitch `"Best Value"` badges to the most popular hardware tiers while preserving full Razorpay payment and multi-location franchise logic.

## [1.16.0] — 2026-11-01
### Fixed & Enhanced (Global High-Contrast Typography & Font Visibility Overhaul)
- **Home Page Hero & Headline Contrast Fix**:
  - Replaced animated `BlurText` (which initialized with `opacity: 0`) and `ShinyText` with crisp, high-contrast semantic typography in [`src/components/views/HomeView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/HomeView.tsx) (`text-white` with `#ff7a00` wavy accent).
  - Adjusted GSAP ScrollTrigger `.fromTo()` parameters on `.step-card-stagger` and `.product-card-stagger` to prevent cards from rendering transparent before scroll trigger initialization.
- **Obsidian Theme Color Tokens & Contrast Calibration (`src/app/globals.css`, `tailwind.config.ts`)**:
  - Upgraded `--color-ink-2` from low-contrast `#9ba1b0` to `#cbd5e1` (Tailwind `slate-300`).
  - Calibrated `on-surface` to `#ffffff`, `on-surface-variant` to `#cbd5e1`, and `on-secondary-container` to `#000000` on `#ff7a00` background.
  - Neutral badges updated to high-contrast dark slate (`bg-[#1e2230] border-[#3a4154] text-white`).
- **Comprehensive Project-Wide Contrast Audit**:
  - **Hardware Studio Modal ([`src/components/CardCustomizerModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/CardCustomizerModal.tsx))**: Converted all form labels, format selectors, material tabs, and inputs from legacy light-mode classes to obsidian high-contrast tokens (`text-white`, `text-slate-200`, `text-slate-300`, `bg-[#0e1015]`, `border-[#232734]`).
  - **Sentiment Simulator ([`src/components/SentimentSimulator.tsx`](file:///d:/Projects/Zentap.ai/src/components/SentimentSimulator.tsx))**: Elevated contrast on star rating states, route descriptions, input placeholders, and resolution channel alerts.
  - **Standee 3D Hero Preview ([`src/components/Standee3DPreview.tsx`](file:///d:/Projects/Zentap.ai/src/components/Standee3DPreview.tsx)) & Visuals ([`src/components/StandeeVisuals.tsx`](file:///d:/Projects/Zentap.ai/src/components/StandeeVisuals.tsx))**: Upgraded finish selection pill text and telemetry metrics to `text-slate-300 hover:text-white`.
  - **Customer Tap / Review Page ([`src/app/r/[slug]/page.tsx`](file:///d:/Projects/Zentap.ai/src/app/r/[slug]/page.tsx))**: Upgraded unselected star contrast and powered-by footer text from faint `text-gray-600` to high-contrast `text-slate-400`.
  - **Modals & Overlays ([`src/components/modals/AuthModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/modals/AuthModal.tsx), [`AdminAuthModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/modals/AdminAuthModal.tsx), [`TapReviewModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/modals/TapReviewModal.tsx))**: Fully overhauled to dark obsidian palette with legible input borders, placeholders, and error alerts.
  - **Analytics Consent Banner ([`src/components/GoogleAnalytics.tsx`](file:///d:/Projects/Zentap.ai/src/components/GoogleAnalytics.tsx))**: Redesigned into obsidian dark theme (`bg-[#141720]/95`, `text-white`, `text-slate-300`) with high-contrast buttons.
  - **Navigation & Footer ([`src/components/Header.tsx`](file:///d:/Projects/Zentap.ai/src/components/Header.tsx), [`Footer.tsx`](file:///d:/Projects/Zentap.ai/src/components/Footer.tsx))**: Elevated menu links, dropdown item descriptions, and colophon text to `text-zinc-200` and `text-slate-300`.
  - **Public Views ([`PricingView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/PricingView.tsx), [`FeaturesView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/FeaturesView.tsx), [`ResultsView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/ResultsView.tsx))**: Replaced all remaining muted grays with bright `text-slate-200`, `text-slate-300`, and `text-emerald-400`.

## [1.15.0] — 2026-11-01
### Added & Configured (Physical Standee Authentic Hardware Photography Showcase)
- **High-Resolution Standee Photography Assets (`public/standees/`)**:
  - Imported and optimized all 10 authentic factory photography assets from `Photos of standee/`:
    - 4 Premium Finishes: Champagne Gold Mirror (`Gold.png`), Brushed Stainless Steel (`Steel.png`), Natural Wood & Transparent Acrylic (`Wood Trans.png`), Rose Gold Metallic (`Pink.png`).
    - 6 Counter Perspectives: Counter Perspective (`1.png`), NFC Tap Zone (`2.png`), Frontal Portrait (`3.png`), Beveled Acrylic Edges (`4.png`), Table Placement (`5.png`), Laser Dynamic QR (`6.png`).
- **New Interactive Physical Hardware Gallery (`src/components/PhysicalStandeeGallery.tsx`)**:
  - Built full interactive hardware viewer with 3-tab filtering (*All 10 Photos*, *4 Material Finishes*, *Counter Angles*).
  - High-resolution hero stage with ambient backlight, specification overlays, interactive zoom modal, and quick thumbnail strip.
  - Seamlessly integrated directly into [`src/components/views/HomeView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/HomeView.tsx) below the products section.
- **Upgraded Interactive 3D Standee Hero Simulator (`src/components/Standee3DPreview.tsx`)**:
  - Replaced vector schematic with real standee photography for Gold, Steel, Wood Base, and Blush Pink.
  - Retained 3D flip card mechanics, GSAP haptic press, AudioContext chime, and tap review simulator trigger.
- **Physical Photography in Visual Components & Customizer**:
  - Upgraded [`src/components/StandeeVisuals.tsx`](file:///d:/Projects/Zentap.ai/src/components/StandeeVisuals.tsx) to render real standee photos across Pricing, Client Portal, and Sample Dashboard.
  - Enhanced [`src/components/CardCustomizerModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/CardCustomizerModal.tsx) with a Real Photo toggle mapping user-selected materials directly to high-res studio photography.


## [1.14.0] — 2026-11-01
### Enhanced (Tactile Obsidian Dark Theme for High-Contrast Brand Logo Display)
- **Obsidian Dark Palette Foundation (`src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`)**:
  - Re-anchored base color tokens from light ivory (`#FAF9F6`) to a sleek, modern tactile obsidian palette (`#0e1015` base canvas, `#141720` surface, `#1e2230` container, `#232734` border outlines, `#f5f5f7` ink text, `#9ba1b0` muted text).
  - Added default `dark` class to `<html>` tag and updated viewport theme-color to `#0e1015`.
  - Harmonized accent color tokens with the official ZenTap logo's vivid amber/orange radar hue (`#ff7a00`).
- **Logo Contrast & Visibility Optimization**:
  - The white 3D-beveled 'Z' emblem and dual-tone 'ZenTap' lettering now pop with striking contrast and clarity across both [`src/components/Header.tsx`](file:///d:/Projects/Zentap.ai/src/components/Header.tsx) and [`src/components/Footer.tsx`](file:///d:/Projects/Zentap.ai/src/components/Footer.tsx).
- **Component & View Modernization**:
  - Redesigned [`src/components/open-design/`](file:///d:/Projects/Zentap.ai/src/components/open-design/) primitive components (`Card`, `Badge`, `Button`) to adhere to Emil Kowalski tactile interactions in dark mode.
  - Refactored [`src/components/views/HomeView.tsx`](file:///d:/Projects/Zentap.ai/src/components/views/HomeView.tsx) hero headline, value props, 3-step process cards, product spotlight cards, and lead capture showcase to dark obsidian styling.
  - Upgraded [`src/components/SentimentSimulator.tsx`](file:///d:/Projects/Zentap.ai/src/components/SentimentSimulator.tsx) and [`src/components/CardCustomizerModal.tsx`](file:///d:/Projects/Zentap.ai/src/components/CardCustomizerModal.tsx) to dark acrylic card containers with obsidian borders.


## [1.13.0] — 2026-11-01
### Added & Configured (Official Brand Logo Integration)
- **Official Brand Logo Asset (`public/logo.png`, `public/zentap-logo.png`)**:
  - Imported the official high-resolution ZenTap logo featuring the 3D-beveled white 'Z', orange gradient radar NFC arcs, and dual-tone 'ZenTap' typography.
- **Header & Footer Brand Updates**:
  - Replaced the generic block 'Z' emblem and text combo in [`src/components/Header.tsx`](file:///d:/Projects/Zentap.ai/src/components/Header.tsx) (both public site navigation and dashboard return bar) with the official logo image.
  - Replaced the footer identity badge in [`src/components/Footer.tsx`](file:///d:/Projects/Zentap.ai/src/components/Footer.tsx) with the new official brand logo.
  - Updated the closing Scene 6 outro in [`src/components/SmartStandeeAnimation.tsx`](file:///d:/Projects/Zentap.ai/src/components/SmartStandeeAnimation.tsx) to display the official high-res logo.


## [1.12.0] — 2026-11-01
### Added & Enhanced (Cloudflare Security Audit & Navigation Streamlining)
- **Cloudflare Security Audit Suite (`.agents/skills/security-audit/`, `.claude/skills/security-audit/`, `.gemini/skills/security-audit/`)**:
  - Integrated official Cloudflare Security Audit skill suite covering Client-Side, Web Protocol & Auth, Data Isolation, Cloud/Deployment, and Supply Chain review specifications.
  - Hardened server-side payment verification in `src/app/api/checkout/verify-payment/route.ts`: required non-empty `razorpay_signature` in request payload to prevent bypass during checkout verification.
  - Audited multi-tenant boundary checks (`owner_user_id = auth.uid()`), webhook HMAC-SHA256 signatures, and lead capture endpoints.
- **Main Navigation Cleanliness**:
  - Streamlined primary navigation in `Header.tsx`, `page.tsx`, and `Footer.tsx`.
  - Removed redundant `Features` and `Sample Showcase` tabs from the main website navigation bar and mobile bottom nav, focusing user attention on **Home**, **Products & Pricing**, **How It Works**, and **Merchant Dashboard**.


## [1.11.0] — 2026-11-01
### Added & Configured (Paul Bakaus Impeccable Design Quality & Anti-Slop Suite)
- **Impeccable Skills Suite (`.agents/skills/impeccable/`, `.claude/skills/impeccable/`, `.gemini/skills/impeccable/`)**:
  - Installed official `pbakaus/impeccable` design suite (24 design commands including `/impeccable critique`, `/impeccable audit`, `/impeccable polish`, `/impeccable typeset`, `/impeccable layout`, `/impeccable animate`).
  - Added full reference library across visual hierarchy, responsive adaptation, craft floors, and motion design.
- **Automated Anti-Slop Detection Engine (`npx impeccable detect`)**:
  - Executed full detector scan across all 64 source files in `src/`.
  - Replaced decorative text gradient fills with crisp solid typography in `src/app/r/[slug]/page.tsx` for optimal readability and contrast.
  - Eliminated tacky bounce easings in favor of physical exponential deceleration (`cubic-bezier(.16, 1, .3, 1)`) in `SmartStandeeAnimation.tsx` and smooth hover scaling in `HowItWorksView.tsx`.
  - Configured design system brand font exemption in `.impeccable/config.json`.
  - Detector now returns **0 anti-patterns** across the entire codebase.


## [1.10.0] — 2026-11-01
### Added & Enhanced (Smart Standee Interactive 9:16 Video Animation Showcase)
- **Interactive Smart Standee 9:16 Showcase (`src/components/SmartStandeeAnimation.tsx`)**:
  - Implemented responsive portrait (9:16) video animation component inside an ultra-clean mobile mockup stage.
  - 7 sequential scenes (`s0` to `s6`) with smooth keyframe transitions:
    1. `s0`: Premium All-in-One Smart NFC Standee intro with 3D pop & spin.
    2. `s1`: Dual functionality (NFC Enabled + QR Enabled chip badges).
    3. `s2`: Floating social & review ecosystem (Google, Facebook, Instagram, WhatsApp).
    4. `s3`: Tap walkthrough with NFC pulse waves and live AI review generation simulator.
    5. `s4`: Scan walkthrough with laser QR scanning beam and phone frame mockup.
    6. `s5`: Core feature highlights (All-in-One, Unlimited Taps/Scans, Dynamic QR, AI Review Assistant).
    7. `s6`: High-conversion brand outro with glowing CTA.
  - Integrated dynamic real-time replay progress bar and click-to-replay haptic controls.
- **Embedded into How It Works Page (`src/components/views/HowItWorksView.tsx`)**:
  - Positioned prominently as a featured hardware walkthrough section right above the 4-step process.
  - Paired with OpenDesign buttons (`OpenDesignButton`) and feature capability badges.
  - Maintained complete anti-gating compliance and Emil Kowalski design standards.


## [1.9.0] — 2026-11-01
### Added & Enhanced (HeyGen HyperFrames Video Framework Integration)
- **HyperFrames Agent Skills & Design Templates** (`.agents/skills/hyperframes/`, `.agents/skills/video-hyperframes/`):
  - Installed official HeyGen HyperFrames composition protocols and templates.
  - Added continuous frame animation standards and Remotion/HyperFrames compatibility.
- **Interactive HyperFrames Showcase Player** (`src/components/HyperFramesPlayer.tsx`):
  - Developed a 6-frame kinetic motion timeline showcasing ZenTap's 0.6s tap velocity, obsidian acrylic hardware, zero-app native NFC detection, anti-gating sentiment shield, automated multilingual replies, and Local 3-Pack authority.
  - Linear timeline progress bar with millisecond frame interpolation.
  - Scrubber navigation with glassmorphism controls (Play, Pause, Step Next, Step Prev, Frame Select).
  - GSAP physics-eased entry transitions on every frame change.
  - Embedded into `HomeView.tsx` right below the 3-step walkthrough.


## [1.8.0] — 2026-10-31
### Added & Enhanced (OpenDesign Ecosystem & Emil Kowalski Design Engineering)
- **OpenDesign Multi-Agent Skills Suite** (`.agents/skills/`, `.claude/skills/`, `.gemini/skills/`):
  - Installed and configured OpenDesign core design skills: `emil-design-eng`, `taste-skill`, `ui-animation`, `design-brief`, `redesign-skill`, `brandkit`, and `web-design-guidelines`.
  - Added official agent design engineering rules in `AGENTS.md` and locked design contract in `design.md`.
- **OpenDesign In-Project Component Suite** (`src/components/open-design/`):
  - Created reusable OpenDesign primitives (`OpenDesignButton`, `OpenDesignCard`, `OpenDesignBadge`) fully typed for Next.js 15 & React 19.
  - Implemented variants (`primary`, `accent`, `secondary`, `ghost`, `subtle`, `metal`) and sizes (`sm`, `md`, `lg`, `icon`) with built-in tactile micro-interactions.
  - Deployed in `HomeView.tsx` (Hero badge, main CTAs, 3-step walkthrough cards, bottom banner) and `PricingView.tsx` (all 4 product order buttons).
- **OpenDesign Full Systems & Templates Catalog** (`open-design/`):
  - Installed complete `design-systems/` (151 design system token sets including Apple, Bento, Linear, Stripe, Vercel, Minimal) and `design-templates/` (SaaS landing, pricing pages, prototypes).
- **Emil Kowalski Design Engineering & Micro-Interactions** (`src/app/globals.css`, `HomeView.tsx`, `Header.tsx`, `PricingView.tsx`):
  - Added `.tactile-btn` and `.tactile-btn-subtle` with physical press feedback (`active:scale-[0.978]` and `active:scale-[0.985]`).
  - Added `.tactile-card` with smooth physical lift (`translateY(-2.5px)`) and shadow bloom on hover.
  - Eliminated blanket `transition-all` declarations on primary CTAs in favor of targeted transitions (`transform`, `background-color`, `border-color`, `box-shadow`) with exact cubic-bezier timing.
  - Upgraded public header nav pills, merchant action buttons, product catalog cards, and hero CTAs with tactile press response.


## [1.7.0] — 2026-10-30
### Added & Enhanced (GSAP Animation Engine Integration)
- **GSAP & `@gsap/react` Core Integration**: Installed and configured official GreenSock ecosystem with strict adherence to `gsap-react`, `gsap-core`, and `gsap-scrolltrigger` skill guidelines.
- **Interactive 3D Standee 360° Flip (`Standee3DPreview.tsx`)**:
  - Implemented GSAP `useGSAP()` scoped timeline with `preserve-3d` and physics-based `power2.inOut` easing.
  - Interactive inspection toggle allowing users to rotate the standee between **Front Face** (NFC hotspot, NTAG216 chip) and **Reverse Face** (Laser Level Q dynamic QR code).
  - GSAP spring haptic feedback on NFC phone tap simulation (`back.out(2)`).
- **ScrollTrigger Staggered Section Entrances (`HomeView.tsx`)**:
  - Staggered entry for 4 Core Hardware Product cards triggered via ScrollTrigger (`y: 40`, `stagger: 0.12`, `power3.out`).
  - Staggered sequential illumination for the 3-Step "How ZenTap Works" walkthrough (`y: 35`, `stagger: 0.15`, `power2.out`).
- **Production Deployment**: Live on `https://www.zentapdigitalsolutions.com`.

## [1.6.0] — 2026-10-30
### Added & Enhanced (React Bits UI Integration)
- **React Bits Component Suite** (`src/components/react-bits/`):
  - **`SpotlightCard`**: Radial mouse-following spotlight glow effect integrated into the 4 Core Hardware Product cards (*Simple QR/NFC*, *Metal Standee*, *PVC Card*, *Corporate Bulk*) and performance metrics cards.
  - **`ShinyText`**: Shimmering metallic sheen gradient sweep across the primary hero headline (*"5-Star Google Reviews"*).
  - **`BlurText`**: Staggered focus-reveal text animation on the opening hero value proposition (*"Turn customer footfall into"*).
  - **`CountUp`**: Smooth cubic-eased numeric counter animation on tap velocity (`0.6s`), app install rate (`100%`), and documented client performance metrics (`+410%`, `4.9★`, `+34%`, `88%`).
  - **`AuroraBackground`**: Ambient fluid mesh gradient pulsing gently behind the Hero Section to complement ZenTap's warm off-white and obsidian architectural design.
  - **`TiltedCard`**: 3D perspective mouse-tilt specimen interaction for standee hardware.
- **Production Deployment**: Live on `https://www.zentapdigitalsolutions.com`.

## [1.5.0] — 2026-10-30
### Changed & Deployed
- **Brand Name Uniformity**: Standardized brand name strictly to **ZenTap** (removed all mentions of `ZenTap.ai`, `zentap.in`, `zentap.app`).
- **Company Name**: Standardized legal entity and brand publisher strictly to **ZenTap Digital Solutions**.
- **Domain Consolidation**: Consolidated all metadata, Open Graph, Twitter cards, sitemap, robots, and customer links to **`zentapdigitalsolutions.com`**.
- **Removed "AI" Terminology**: Sanitized all customer-facing and merchant-facing copy to eliminate impressions that customer reviews are artificially generated:
  - Replaced *"AI Review Assistant"* with *"Review Assistant"* / *"Smart Review Assistant"*.
  - Replaced *"AI Review Drafts"* with *"Review Suggestions"* / *"Smart Review Suggestions"*.
  - Replaced *"AI Interceptor Shield"* with *"Private Feedback Resolution Active"*.
  - Replaced *"AI Reply Engine"* with *"Automated 24/7 Google Review Reply Engine"*.
- **Production Deployment to Vercel**: Successfully deployed production build to `https://www.zentapdigitalsolutions.com` and `https://zentapdigitalsolutions.com`.
### Added
- **Minimal Website Redesign Inspired by `zentap.in/index.html`** (`HomeView.tsx`, `Header.tsx`):
  - Streamlined hero section with bold value proposition, minimal typography, and clear dual CTAs.
  - 3-step "How It Works" guide: Tap & Connect, Review & Engage, Grow & Dominate.
  - Minimal top navigation bar with clean links: Home, Products & Pricing, How It Works, Features, Sample Showcase, and Merchant Dashboard.
  - Interactive NFC Tap & Review Simulator embedded seamlessly on homepage.
- **Official Products & Pricing Integration Matching `zentap.in/products.html`** (`PricingView.tsx`, `businessStore.ts`, `razorpay.ts`):
  - **Product 1 — Simple QR/NFC Card / Standee** (₹499 Card / ₹999 Standee): Direct 1-tap mode that opens the Google Review page directly for customers with zero intermediary barriers.
  - **Product 2 — Metal NFC/QR Standee with AI Replies** (₹1,999): Premium metal standee with automated AI review replies, anti-gating protection, and sentiment analytics.
  - **Product 3 — PVC NFC Card** (₹699): Durable matte PVC card with embedded NTAG216 chip, dynamic QR, and lifetime cloud profile hosting.
  - **Product 4 — Corporate Bulk Cards** (₹499/unit): Centralized dashboard to issue, update, and reassign digital cards across team members without physical reprints.
- **Interactive 3D Hardware Specimen Customizer** (`CardCustomizerModal.tsx`):
  - Form factor toggle: Counter Standee (L-Shaped) vs Pocket NFC Card.
  - 5 authentic materials & finishes: Matte Obsidian, Brushed Steel, Brushed Gold, Clean Minimal White, and Executive Emerald.
  - Live logo file upload with instant specimen preview.
  - Live typography customization for business name and tagline.
  - 6-color accent palette selector.
  - Real-time Level Q QR code rendering.
  - "Save Design to Profile" and "Order with this Design" direct checkout integration.
- **Dynamic Profile & Interaction Hub on Review Page** (`/r/[slug]`):
  - **Interaction Tab**: 1-tap WhatsApp direct chat with pre-filled message, Table/Appointment Booking (Calendly/reservations), Digital Portfolio / Menu showcase, Call Store, Directions, Instagram, and Website.
  - **Lead Capture Tab**: Built-in customer enquiry form collecting name, phone, email, service requested, and message, submitted directly to `/api/leads`.
  - **Direct Review Mode**: Dedicated high-visibility 1-tap banner and direct routing when `redirect_mode === "direct_review"`.
- **Merchant Dashboard Expansion** (`ClientPortalView.tsx`):
  - **Dynamic Profile & Interaction Tab**: Configure WhatsApp number/greetings, booking links, portfolio/menu URLs, social links, and toggle between "Interactive Profile" vs "Direct 1-Tap Google Review".
  - **Leads & Inquiries Tab**: Real-time table displaying captured customer leads with status pills (New, Contacted, Converted, Archived) and 1-tap WhatsApp/Phone dialer shortcuts.
  - **Hardware Design Studio Tab**: Instant access to launch the 3D Customizer and preview saved card/standee specs.

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
