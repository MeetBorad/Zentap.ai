# ZenTap.ai — Development History

## 1. Verified Development Timeline & Iterations

### Initial Prototyping & Standalone Concept
* Modelled on `scratch/smart-review-ai/standalone-demo.html`.
* Concept established: NTAG216 NFC tag on counter standee pointing to a smart review assistant with multi-language support (English, Gujarati, Hindi).
* Star rating branching logic established: low ratings capture private feedback; high ratings encourage public Google reviews.

### Supabase Architecture & Multi-Tenancy Implementation
* Added `@supabase/supabase-js` and `@supabase/ssr`.
* Created database schemas (`schema_zentap_v2.sql`) with tables: `businesses`, `orders`, `feedbacks`, `scans`, `events`, `subscriptions`.
* Created local client fallback in `src/lib/businessStore.ts` so developers and sandboxes can operate seamlessly with high performance when offline or in staging.

### Superadmin & Security Fortification
* Removed insecure demo autofill and TOTP 2FA simulation.
* Configured dedicated superadmin credentials for `admin@zentapdigitalsolutions.com`.
* Added 3-attempt lock triggering password recovery workflow.
* Separated ordinary merchant login from the Founder Admin Console.
* Isolated merchant dashboards so users only access their own business records.

### Sample Dashboard & Standee Purchase Flow
* Added sample dashboard mode (`/dashboard/sample`) showing fully populated metrics (1,428 scans, Google review conversions, feedback inbox) so new merchants never land on an empty page.
* Created 3-tier commercial hardware plans:
  * Plan A: ₹500 Smart NFC Card (One-time, ₹0/mo)
  * Plan B: ₹1,500 Acrylic Standee (+ ₹1,000/mo next month)
  * Plan C: ₹2,000 Acrylic Standee + Auto Reply (+ ₹1,000/mo next month)
* Added dynamic courier calculation based on Indian pincode zones (Gujarat/West ₹69, Metro ₹99, Rest of India).
* Built post-payment "Your Order is in Process!" status tracking with 4-stage fulfillment timeline.

### Review Assistant Star Routing Upgrade
* Refactored `/r/[slug]` to strictly follow user rules:
  * Ratings $\le$ 2 Stars (1-2 stars): Improvement checklist, private feedback textarea, single "Post" button that does NOT redirect, followed by: *"Thank you for your time for review message!"*.
  * Ratings $\ge$ 3 Stars (3-5 stars): Positive experience chips, AI review draft generation, style selector, and a "Post Google Review" button redirecting to Google.

### Razorpay Payment Gateway Flow (Current Master Task)
* User reported: Adding basic product in cart did not prompt for payment.
* Upgrading to full server-side Razorpay order creation (`/api/checkout/create-order`), signature verification (`/api/checkout/verify-payment`), interactive payment modal supporting UPI, QR, and Cards, and automated order creation.
