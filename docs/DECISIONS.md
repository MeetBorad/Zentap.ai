# ZenTap.ai — Architectural & Business Decisions

## 1. Key Decisions Record (ADR)

### ADR 01: Multi-Tenant Data Isolation Strategy
* **Context**: Need to ensure absolute privacy between different merchant accounts.
* **Decision**: All Supabase queries in customer portals must filter strictly by `owner_user_id = auth.uid()`. Database RLS policies ensure that even if client-side code is tampered with, PostgreSQL rejects unauthorized access. In offline/mock mode, data is partitioned by `zentap_biz_<userId>` in `localStorage`.

### ADR 02: Google Anti-Gating Policy Compliance
* **Context**: Google prohibits gating (suppressing negative reviews or selectively directing only positive reviews to Google Maps).
* **Decision**:
  * 3-5 stars: Direct customers to Google Reviews with an AI-crafted review draft.
  * 1-2 stars: The default prominent action is "Post" (sending private feedback to store management so they can resolve the customer's issue immediately).
  * Compliance Preservation: To remain fully compliant with Google policies, a discreet secondary option ("Or leave a public review on Google") is made accessible to all users so public reviews are never completely blocked.

### ADR 03: Subscription Billing Commencement Rule
* **Context**: The ₹1,000 monthly software fee for Plans B and C must not be charged immediately at checkout.
* **Decision**: The monthly recurring subscription starts in the month following the purchase month (30 days deferred). At initial checkout, merchants pay ONLY: `Base Standee Price (₹1,500 or ₹2,000) + Courier Fee`.

### ADR 04: Courier Charge Calculation by Pincode
* **Context**: Avoid flat-rate or arbitrary shipping fee assumptions.
* **Decision**: Implemented `calculateCourierCharge(pincode)` based on standard Indian logistics zones:
  * Gujarat / West Region (First digit '3'): ₹69
  * Metro / Major Urban Centers (First digits '1', '2', '4', '5', '6'): ₹99
  * Pan-India Standard / Northeast / Remote: ₹149

### ADR 05: Error Correction Level Q for Laser QR Codes
* **Context**: Counter QR codes endure coffee spills, scratches, and counter dirt.
* **Decision**: Standard QR codes use Level L (7% recovery). ZenTap standardizes on **Level Q (25% error correction redundancy)** ensuring counter standees scan cleanly even when damaged.
