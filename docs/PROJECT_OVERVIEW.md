# ZenTap.ai — Project Overview

## 1. Executive Summary
**ZenTap.ai** is a multi-tenant SaaS and hardware platform engineered for offline retail, hospitality, and luxury service businesses across India. ZenTap connects physical point-of-sale customer footfall to digital Google Business Profile reputation using laser-engraved NFC & Level Q QR hardware touchpoints (counter acrylic standees and smart cards). 

The platform pairs counter hardware with a **Customized Google Review Assistant** (`/r/[slug]`) featuring intelligent star-rating routing (private management resolution for 1-2 stars, AI review drafting + direct Google Review posting for 3-5 stars), real-time scan telemetry, and an isolated merchant dashboard.

---

## 2. Core Value Proposition & Marketing Disclosure
> "ZenTap.ai helps businesses create a more convenient customer feedback experience through NFC and QR review cards, customized Google Review Assistants, and review-management tools. Our solutions help businesses improve their review workflow and support their Google Business Profile visibility and local SEO efforts."

*Commercial Policy*: ZenTap.ai assists local businesses in capturing verified reviews and optimizing search visibility; it does not guarantee specific Google rankings, view multipliers, or guaranteed algorithmic placement.

---

## 3. Commercial Tiers & Hardware Specifications
ZenTap offers three transparent commercial tiers:

1. **Plan A — Normal Smart NFC Review Card**
   * **Hardware**: Compact PVC wallet/bill-folder card with embedded NTAG216 NFC chip and laser QR code. *(Card touchpoint, not acrylic standee)*.
   * **One-Time Price**: ₹500
   * **Courier**: Calculated dynamically by delivery pincode zone.
   * **Monthly Subscription**: ₹0 (No recurring fees).

2. **Plan B — Auto Google Review Standee**
   * **Hardware**: Heavyweight CNC laser-cut acrylic counter standee customized with business branding, logo, and NTAG216 NFC + Level Q QR.
   * **One-Time Price**: ₹1,500
   * **Courier**: Calculated dynamically by delivery pincode zone.
   * **Monthly Subscription**: ₹1,000/month starting in the month following the purchase month.

3. **Plan C — Auto Google Review Standee + Auto Google Review Reply Engine**
   * **Hardware**: Custom branded acrylic counter standee.
   * **Software**: Full access to Google Review Assistant + 24/7 AI review auto-reply automation engine.
   * **One-Time Price**: ₹2,000
   * **Courier**: Calculated dynamically by delivery pincode zone.
   * **Monthly Subscription**: ₹1,000/month starting in the month following the purchase month.

---

## 4. Key Platform Roles & Access Model
1. **Public Customer / Guest**:
   * Scans counter QR or taps NFC chip.
   * Accesses `/r/[slug]` (or `/review/[slug]`).
   * Never sees merchant dashboards, private billing, or administrative controls.
2. **Merchant / Business Owner**:
   * Registers and authenticates via Supabase Auth.
   * Accesses isolated private Customer Dashboard.
   * Edits business profile, places standee orders, tracks couriers, monitors scan analytics, and views private customer feedback.
   * Accesses Sample Dashboard preview (`/dashboard/sample`) to explore active system capabilities.
3. **Founder / Superadmin**:
   * Authenticates at dedicated admin modal (`admin@zentapdigitalsolutions.com`).
   * Supreme authority over Fleet Master Directory, manual Google review link assignment, instant QR generation, and fulfillment tracking.
