# ZenTap — System Architecture & Codebase Blueprint

## 1. Directory & Folder Structure

```
zentap-ai/
├── src/
│   ├── app/                      # Next.js 15 App Router pages & server routes
│   │   ├── api/                  # Scalable API endpoints
│   │   │   ├── admin/            # Fleet management, models, payments, platform data
│   │   │   ├── ai/               # AI review generation & prompt evaluation
│   │   │   ├── card/             # NFC card updates, PIN verification & resets
│   │   │   ├── checkout/         # Razorpay order generation & crypto verification
│   │   │   ├── hub/              # Customer portal click tracking & analytics
│   │   │   ├── review/           # Customer feedback, star rating telemetry, generation
│   │   │   └── webhooks/         # Razorpay webhook listener
│   │   ├── r/[slug]/             # Customer-facing Business Hub & Review Assistant
│   │   ├── t/[code]/             # High-speed physical NFC/QR 302 routing engine
│   │   ├── w/[slug]/             # WhatsApp short-link click logger
│   │   ├── i/[slug]/             # Instagram short-link click logger
│   │   ├── f/[slug]/             # Facebook short-link click logger
│   │   └── y/[slug]/             # YouTube short-link click logger
│   │
│   ├── components/               # UI Component Hierarchy
│   │   ├── admin/                # Admin Console tabs & management widgets
│   │   │   └── tabs/             # Clients, Google Links, Page Editor, Payments, Overview
│   │   ├── customer/             # ZenTapHubPage, ZenTapReviewAssistant, AiReviewCustomerFlow
│   │   ├── modals/               # AuthModal, OwnerAccessModal, RazorpayCheckoutModal
│   │   ├── open-design/          # Design engineering button, card, and badge primitives
│   │   ├── views/                # Full-screen view pages (HomeView, HowItWorksView, etc.)
│   │   └── index.ts              # Modularized barrel exports
│   │
│   ├── services/                 # Pure Business Logic Layer (Separated from UI)
│   │   ├── reviewService.ts      # Review templates, rating titles, clause formatting
│   │   ├── paymentService.ts     # HMAC-SHA256 signature verification & ledger balances
│   │   ├── tagRouterService.ts   # NFC/QR validation, WhatsApp/Instagram URL formatters
│   │   └── index.ts              # Services entrypoint
│   │
│   ├── lib/                      # Core Utilities & State Management
│   │   ├── api/                  # Standardized API response & error handling wrappers
│   │   ├── config/               # Centralized typed environment configs (env.ts)
│   │   ├── supabase/             # Client, Admin, and Edge Middleware database instances
│   │   ├── rateLimit.ts          # In-memory sliding window rate limiter & leveling
│   │   ├── adminPlatformStore.ts # Central administrative fleet store
│   │   ├── businessStore.ts      # Multi-tenant business entities & demo fixtures
│   │   └── resolveTag.ts         # Server-side tag scan destination resolver
│   │
│   ├── context/                  # React Context providers (AuthContext.tsx)
│   └── middleware.ts             # Global session validation & API rate leveling
│
├── supabase/
│   └── migrations/               # PostgreSQL DDL migrations & RLS policy enforcements
└── docs/                         # Project Documentation (CHANGELOG, FEATURE_STATUS, ARCHITECTURE)
```

---

## 2. Separation of Concerns (Business Logic vs. UI)

- **UI Components (`src/components/`)**:
  Focus strictly on DOM rendering, responsive CSS/Tailwind layouts, tactile microinteractions, and UI event binding. No raw database calls or complex formatting formulas are embedded inside components.
- **Service Layer (`src/services/`)**:
  Pure TypeScript functions with zero React dependency:
  - `reviewService.ts`: Review template formulas, grammatical clause building, and rating classification.
  - `paymentService.ts`: Cryptographic HMAC-SHA256 signature checking and ledger arithmetic.
  - `tagRouterService.ts`: URL parsing, sanitization, and hardware tag code validation.
- **State & Storage (`src/lib/*Store.ts`)**:
  Unified isomorphic stores bridging Supabase PostgreSQL and local storage fallback for high availability.

---

## 3. Environment Security & Secret Protection

- **Centralized Environment Module (`src/lib/config/env.ts`)**:
  All environment variables are parsed and validated in one location. Missing values trigger graceful fallback warnings in development and descriptive exceptions in production.
- **Zero Secrets in Git**:
  - `.env`, `.env.local`, `.env*.local` are explicitly blocked in `.gitignore`.
  - Sensitive server-only keys (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`) are never prefixed with `NEXT_PUBLIC_` and cannot leak into client bundles.
- **`.env.example` Template**:
  Clean, sanitized template documenting every required key with non-sensitive placeholders.

---

## 4. API Rate Limiting & Leveling System (`src/middleware.ts` & `src/lib/rateLimit.ts`)

Every request to `/api/*` is evaluated against an in-memory sliding window rate limiter:
- **`SENSITIVE` Tier (10 req/min)**:
  Applies to `/api/ai/*` (model generation) and `/api/checkout/*` (order creation) to prevent credit exhaustion and spam.
- **`STANDARD` Tier (60 req/min)**:
  Applies to administrative actions, lead submissions, and card updates.
- **`TELEMETRY` Tier (180 req/min)**:
  Applies to high-throughput customer tap/click logs (`/api/hub/click`, `/api/review/event`).
- **Headers Returned**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After` (on 429 Too Many Requests)

---

## 5. PostgreSQL Row Level Security (RLS) Policies

All 20+ tables in Supabase enforce `ROW LEVEL SECURITY`:
- **Public Read (`SELECT`)**:
  Restricted to active, non-deleted businesses and standee tags.
- **Tenant Isolation (`UPDATE`)**:
  Enforces `auth.uid() = owner_user_id` so business owners cannot view or modify competitor records.
- **Public Insertion**:
  Telemetry (`scans`, `feedback`, `events`) permits visitor insertions with server sanitization.
- **Administrative Lockdown**:
  Sensitive financial tables (`payments`, `manual_payments`, `ai_models`, `admin_users`) disallow anonymous writes. Only queries signed with `SUPABASE_SERVICE_ROLE_KEY` or verified admin tokens have write access.

---

## 6. Scalable API Response Standard (`src/lib/api/response.ts`)

All endpoints return a uniform JSON envelope:
```json
// Success Response (HTTP 200/201)
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-05T11:45:00.000Z"
  }
}

// Error Response (HTTP 400/401/403/429/500)
{
  "success": false,
  "error": "Descriptive error message",
  "details": { ... },
  "meta": {
    "timestamp": "2026-11-05T11:45:00.000Z"
  }
}
```
All routes are guarded with `withErrorHandler` to intercept unexpected exceptions and prevent uncaught 500 server crashes.
