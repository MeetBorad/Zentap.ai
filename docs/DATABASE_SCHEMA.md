# ZenTap.ai — Database Schema

## 1. PostgreSQL Schema Overview (Supabase)

All tables use UUID primary keys, timestamp tracking with timezone, and foreign key integrity. Monetary values are tracked in integer paise (1 INR = 100 paise) to prevent floating point inaccuracies.

---

### Table: `businesses`
Stores registered merchant profiles and their active standee configurations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique business ID |
| `owner_user_id` | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Associated user account |
| `name` | TEXT | NOT NULL | Business name |
| `email` | TEXT | NOT NULL | Account email |
| `phone` | TEXT | NULL | Business contact phone |
| `city` | TEXT | NULL | City |
| `state` | TEXT | NULL | State |
| `country` | TEXT | DEFAULT 'India' | Country |
| `pincode` | TEXT | NULL | Pincode for courier delivery |
| `address` | TEXT | NULL | Billing counter / store address |
| `slug` | TEXT | UNIQUE, NOT NULL | Public URL identifier (`/r/[slug]`) |
| `gbp_link` | TEXT | NULL | Google Maps profile URL |
| `review_url` | TEXT | NULL | Direct Google review dialog URL |
| `plan` | TEXT | DEFAULT 'standee_1500' | `card_500`, `standee_1500`, `standee_auto_2000` |
| `payment_status` | TEXT | DEFAULT 'pending' | `pending`, `paid`, `refunded`, `failed` |
| `active` | BOOLEAN | DEFAULT TRUE | Standee active status |
| `category` | TEXT | NULL | Business category |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

---

### Table: `orders`
Stores physical hardware purchases and fulfillment tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Order ID (e.g., `ZT-ORD-84920`) |
| `business_id` | UUID | REFERENCES businesses(id) ON DELETE CASCADE | Associated business |
| `plan` | TEXT | NOT NULL | Purchased hardware plan |
| `amount` | NUMERIC(10,2) | NOT NULL | Base hardware price (INR) |
| `courier` | NUMERIC(10,2) | NOT NULL | Courier fee (INR) |
| `status` | TEXT | DEFAULT 'processing' | `awaiting_payment`, `paid`, `processing`, `laser_engraving`, `signal_inspection`, `dispatched`, `delivered` |
| `razorpay_id` | TEXT | NOT NULL | Razorpay payment/order identifier |
| `razorpay_order_id`| TEXT | NULL | Razorpay Order ID |
| `razorpay_payment_id`| TEXT | NULL | Razorpay Payment ID |
| `tracking_number` | TEXT | NULL | Courier tracking / AWB number |
| `courier_name` | TEXT | NULL | E.g., BlueDart Express, Delhivery |
| `estimated_delivery`| DATE | NULL | Estimated counter delivery date |
| `at` | TIMESTAMPTZ | DEFAULT now() | Order timestamp |

---

### Table: `feedbacks`
Captures private customer feedback submitted from ratings $\le$ 2 stars.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Feedback ID |
| `business_id` | UUID | REFERENCES businesses(id) ON DELETE CASCADE | Associated business |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5) | Star rating given |
| `text` | TEXT | NOT NULL | Customer feedback comment |
| `customer_name` | TEXT | NULL | Customer name |
| `customer_phone` | TEXT | NULL | Customer phone for owner follow-up |
| `at` | TIMESTAMPTZ | DEFAULT now() | Feedback timestamp |

---

### Table: `scans`
Logs counter touchpoint engagement.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Scan record ID |
| `business_id` | UUID | REFERENCES businesses(id) ON DELETE CASCADE | Associated business |
| `source` | TEXT | CHECK (source IN ('qr', 'nfc', 'unknown')) | Touchpoint method |
| `visitor_hash` | TEXT | NULL | Privacy-preserving session hash |
| `is_preview` | BOOLEAN | DEFAULT FALSE | Preview mode flag (omitted from live telemetry) |
| `at` | TIMESTAMPTZ | DEFAULT now() | Scan timestamp |

---

### Table: `subscriptions`
Tracks recurring software automation billing (Plans B & C).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Subscription ID |
| `business_id` | UUID | REFERENCES businesses(id) ON DELETE CASCADE | Associated business |
| `plan` | TEXT | NOT NULL | `standee_1500`, `standee_auto_2000` |
| `amount` | NUMERIC(10,2) | DEFAULT 1000.00 | Monthly subscription fee (INR) |
| `status` | TEXT | DEFAULT 'active' | `active`, `past_due`, `cancelled` |
| `billing_start_date`| DATE | NOT NULL | Deferred start date (next month) |
| `next_billing_date` | DATE | NOT NULL | Next scheduled billing |
| `razorpay_subscription_id` | TEXT | NULL | Razorpay subscription reference |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

---

## 2. Row Level Security (RLS) Policies

* **Public Read**: Anonymous guests can read `id, name, slug, review_url, active, category, city` from `businesses` to render `/r/[slug]`. They cannot read emails, phones, orders, or private notes.
* **Merchant Isolated Access**: Authenticated users can only `SELECT`, `UPDATE`, and `INSERT` records where `owner_user_id = auth.uid()`.
* **Admin Access**: Superadmin accounts bypass customer scoping through server-side service role execution.
