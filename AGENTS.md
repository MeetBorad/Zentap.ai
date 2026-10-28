# Agent Operational Guidelines — ZenTap.ai

## Project Stack & Standards
- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **Backend / Database**: Supabase PostgreSQL with Row Level Security (RLS) & GoTrue Authentication.
- **Payments**: Razorpay Node SDK & Razorpay Checkout.
- **Hardware Integration**: NTAG216 NFC (13.56 MHz) and Level Q Error Correction QR Codes.

## Rules for Autonomous Agents
1. **Multi-Tenant Privacy**:
   - Always enforce user isolation in database queries (`owner_user_id = auth.uid()`).
   - Never expose other businesses' metrics, orders, or private contact details to another customer.
2. **Payment Integrity**:
   - Always calculate and validate plan prices and courier fees on the server.
   - Never trust client-submitted prices or amounts.
   - Verify Razorpay signatures using HMAC-SHA256.
3. **Google Review Anti-Gating Compliance**:
   - Offer private feedback for ratings $\le$ 2 stars with a single "Post" button (no redirect).
   - Offer AI review drafts and direct Google posting for ratings $\ge$ 3 stars.
   - Maintain a discreet secondary option for all visitors to access Google directly to prevent policy penalties.
4. **Documentation**:
   - Consult files in `docs/` before making major changes.
   - Update `docs/CHANGELOG.md` and `docs/FEATURE_STATUS.md` after adding or modifying features.
   - Never commit API keys, service role keys, or secrets into documentation or git.
