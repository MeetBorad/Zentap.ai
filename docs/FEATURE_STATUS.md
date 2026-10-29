# ZenTap.ai — Feature Status Matrix

| Feature | Status | Notes |
|---|---|---|
| **User Registration & Supabase Auth** | Done | Implemented via `AuthContext.tsx` with email/password authentication. |
| **Merchant Isolated Dashboard** | Done | `ClientPortalView.tsx` displays only logged-in user's business profile and metrics. |
| **Sample Dashboard Preview** | Done | Instant toggle between Live Profile and Sample Preview (Virat Gold Palace metrics). |
| **Business Profile Editor (8 Fields)** | Done | Name, GBP Link, Review URL, Contact Phone, City, State, Country, Pincode, Email, Address. |
| **4-Tier Hardware Pricing Plans** | Done | ₹500 Card (no sub), ₹1,500 Standee (+₹1k/mo), ₹2,000 Standee + Auto Reply (+₹1k/mo), and Plan 4 Franchise Custom Multi-QR Fleet. |
| **Franchise & Multi-Outlet Custom Plan (Plan 4)** | Done | Custom quotation builder for franchises: multi-branch counter, multi-QR generation, custom finishes, volume discounts, auto quotation generation (`ZT-QTN-XXXXX`). Full landing page pricing tab integration with seamless direct builder navigation. |
| **Admin Franchise Quotations Hub** | Done | 5th tab in ZenTap.in Admin Dashboard for tracking, managing, and contacting franchise quotation leads with WhatsApp 1-click chat. |
| **Dynamic Courier Calculation** | Done | Pincode zone detection (Gujarat ₹69, Metro ₹99, Pan-India). |
| **Razorpay Server-Side Order Creation** | Done | Server-side `/api/checkout/create-order` with trusted prices & dynamic courier fees. |
| **Razorpay Checkout Modal & Verification** | Done | Interactive payment modal (UPI / QR / Cards) and `/api/checkout/verify-payment` HMAC-SHA256 verification. |
| **Post-Payment Order Tracking Screen** | Done | 4-stage fulfillment timeline (*Payment Confirmed → Laser Engraving → RF Inspection → Dispatched*). |
| **Customized Google Review Assistant (`/r/[slug]`)** | Done | Dual-branch star routing: 1-2 stars = Private note + Post button; 3-5 stars = AI Draft + Post Google Review. |
| **Level Q Laser QR Code Download** | Done | Printable PNG download with 25% error correction redundancy. |
| **Scan & Tap Analytics** | Done | Total scans, NFC vs QR breakdown, review clicks (~88%), private feedback defused. |
| **Private Feedback Management Inbox** | Done | Alerts with 1-click customer phone call buttons. |
| **Upcoming Projects & Services Drawer** | Done | 5 services configured in persistent side drawer (after FAQ), excluded from homepage. |
| **Founder Admin Console** | Done | Supreme authority fleet directory, manual Google Review URL insertion, live preview. |
| **Self-Service Password Security** | Done | 3-failed-attempts lock, reset email trigger, in-dashboard password updates. |
| **Supabase PostgreSQL & RLS Fleet Sync** | Done | Verified live connection to Supabase; conflict-safe UUID mapping, anti-leak RLS safe views, 9 seeded courier rules, 5 registered admin users, and automated test diagnostics. |
