# ZenTap.ai — Bugs & Fixes Log

## 1. Verified Bugs & Resolutions

### Bug 1: 2FA TOTP Insecurity & Superadmin Credentials
* **Issue**: The admin login contained a demo autofill badge and accepted any 6-digit TOTP code.
* **Fix**: Removed demo autofill, removed simulated TOTP code requirements, and updated admin credentials to `admin@zentapdigitalsolutions.com` with server-side validation.

### Bug 2: Locked Fleet Master Directory for Admin
* **Issue**: Admin dashboard was not granting supreme authority over all businesses.
* **Fix**: Enhanced `AdminConsoleView.tsx` with full unconstrained access to inspect, update Google Review links, regenerate QR codes, and toggle status across all registered tenants.

### Bug 3: Shared/Identical Dashboard for Admin and Merchants
* **Issue**: Logging in as admin and merchant showed identical views.
* **Fix**: Strictly segregated role routing. Ordinary merchants only see `ClientPortalView` with their isolated profile; superadmins see `AdminConsoleView`. Navigation prevents regular users from seeing admin controls.

### Bug 4: Standee Purchase Flow Missing Active Payment Trigger
* **Issue**: User reported that clicking to buy a product did not prompt for payment or initiate a payment gateway dialog.
* **Fix**:
  1. Installing official `razorpay` npm package.
  2. Implementing `/api/checkout/create-order` with trusted server-side pricing.
  3. Implementing `/api/checkout/verify-payment` with HMAC-SHA256 signature verification.
  4. Adding `RazorpayCheckoutModal.tsx` prompting the user for real or sandbox UPI/Card/QR payment with complete state management.

### Bug 5: Missing Lucide Icons during Local Compilation
* **Issue**: `Cannot find name 'AlertCircle'` in `AdminConsoleView.tsx` and `Cannot find name 'Wifi'` in `SampleDashboardView.tsx`.
* **Fix**: Imported all missing icon components from `lucide-react`.

### Bug 6: Star Rating < 2 Button Label & Redirection Behavior
* **Issue**: Lower ratings (1-2 stars) were previously able to click to Google or were ambiguous.
* **Fix**: Implemented strict behavior in `/r/[slug]`: 1-2 stars display a private note form with ONLY a "Post" button that submits feedback privately and displays a confirmation message without redirecting.
