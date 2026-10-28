# ZenTap.ai — System Architecture

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 USER TOUCHPOINTS                                |
|                                                                                 |
|   +--------------------------+                     +------------------------+   |
|   |   Counter NFC Standee    |                     |  Counter Laser QR Code |   |
|   |  (NTAG216 - 13.56 MHz)   |                     |     (Level Q Error)    |   |
|   +------------+-------------+                     +-----------+------------+   |
|                |                                               |                |
+----------------+-----------------------------------------------+----------------+
                 | https://zentapdigitalsolutions.com/r/[slug]   |
                 v                                               v
+---------------------------------------------------------------------------------+
|                       NEXT.JS EDGE & APPLICATION SERVER                         |
|                                                                                 |
|  [ Public Routes ]                                                              |
|   * /r/[slug]                -> Customized Google Review Assistant              |
|   * /r/[slug]/go             -> Telemetry logger & 302 Google Redirect          |
|   * /review/[slug]           -> Canonical review route alias                    |
|                                                                                 |
|  [ Merchant Customer Portal ]                                                   |
|   * /dashboard               -> Isolated Merchant Business Profile & Telemetry  |
|   * /dashboard/sample        -> Fully populated active sample dashboard         |
|   * /dashboard/orders        -> Standee tracking & fulfillment timeline         |
|                                                                                 |
|  [ Founder Admin Console ]                                                      |
|   * /admin                   -> Multi-tenant fleet directory & link assignment  |
|                                                                                 |
|  [ API Layer ]                                                                  |
|   * /api/checkout/create-order   -> Server-side price calculation & Razorpay    |
|   * /api/checkout/verify-payment -> Cryptographic signature verification        |
|   * /api/webhooks/razorpay       -> Webhook listener & idempotent state sync    |
+---------------------------------------+-----------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
+----------------------------------+          +----------------------------------+
|      SUPABASE POSTGRESQL         |          |       RAZORPAY PAYMENT ENGINE    |
|                                  |          |                                  |
|  * Row Level Security (RLS)      |          |  * Standard Checkout Modal       |
|  * Tables: businesses, orders,   |          |  * UPI / Cards / NetBanking      |
|    feedbacks, scans, events      |          |  * Recurring Monthly Billing     |
|  * Supabase GoTrue Auth          |          |    (Plans B & C deferred start)  |
+----------------------------------+          +----------------------------------+
```

---

## 2. Directory Structure
```
zentap.ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   ├── create-order/route.ts
│   │   │   │   └── verify-payment/route.ts
│   │   │   └── webhooks/razorpay/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── r/[slug]/
│   │   │   ├── page.tsx          # Customized Google Review Assistant
│   │   │   └── go/route.ts       # Telemetry logger & redirector
│   │   ├── review/[slug]/
│   │   │   └── page.tsx          # Canonical alias
│   │   ├── layout.tsx
│   │   └── page.tsx              # Main App Shell & Router
│   ├── components/
│   │   ├── modals/
│   │   │   ├── AuthModal.tsx
│   │   │   ├── AdminAuthModal.tsx
│   │   │   └── RazorpayCheckoutModal.tsx
│   │   ├── views/
│   │   │   ├── ClientPortalView.tsx       # Merchant Dashboard
│   │   │   ├── SampleDashboardView.tsx    # Sample Preview Mode
│   │   │   └── AdminConsoleView.tsx       # Founder Fleet Management
│   │   ├── StandeeVisuals.tsx
│   │   └── UpcomingServicesDrawer.tsx     # Side Drawer Navigation
│   ├── context/
│   │   └── AuthContext.tsx
│   └── lib/
│       ├── businessStore.ts
│       ├── supabase/
│       │   ├── client.ts
│       │   ├── server.ts
│       │   ├── admin.ts
│       │   ├── service.ts
│       │   └── schema_zentap_v2.sql
│       └── razorpay.ts
├── docs/
└── public/
```

---

## 3. Security & Anti-Gating Architecture
1. **Google Review Anti-Gating Compliance**:
   * Ratings of 3, 4, 5 stars generate an editable AI review draft and direct to Google Reviews.
   * Ratings of 1 and 2 stars open an internal private feedback channel with an option to send directly to store management.
   * To prevent Google policy violation penalties, all visitors retain the option to access the public Google Business page directly.
2. **Multi-Tenant Isolation**:
   * Every database query from `ClientPortalView` enforces `owner_user_id = auth.uid()`.
   * Ordinary authenticated users can never query another user's business profile or orders.
   * Admin operations require superadmin credentials verified server-side.
