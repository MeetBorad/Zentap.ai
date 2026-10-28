# ZenTap.ai — Smart NFC & Dynamic QR Google Review Ecosystem

Turn every customer tap into 5-star Google Reviews instantly. Engineered for restaurants, salons, and retail venues with real-time cloud telemetry and dual-channel AI review shielding.

---

## ⚡ Features

- **Matte Obsidian Standee 3D Simulator**: Interactive contactless tap simulation with realistic NFC ripples, Web Audio API acoustic chime, and instant 5-star Google Business prompt.
- **AI Sentiment Interceptor**: Automatically routes 4–5 star ratings to public Google Maps reviews while shielding 1–3 star complaints into private manager tickets.
- **Dynamic URL Destination Switcher**: Change the live NFC/QR target URL (Google Maps, Yelp, TripAdvisor, Guest WiFi) from the cloud in real time with zero hardware reprinting.
- **Merchant Telemetry Portal**: Track daily taps, conversion rates, Google review velocity, and pending manager replies.
- **AI Review Reply Assistant**: 1-click personalized AI responses ready to approve and sync to Google Business Profile.
- **Root Superadmin Fleet Console**: Hardware provisioning tool to encode blank NTAG216 semiconductors and monitor multi-unit deployments.
- **Supabase Database & Auth**:
  - Full email/password authentication & Google OAuth SSO.
  - Pre-configured tables: `merchants`, `standees`, `reviews`, `replies`, `private_feedbacks`, `standee_scans`, `subscriptions`, and `google_credentials`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) with Google Stitch *Neutral Edge* design tokens
- **Icons**: [Lucide React](https://lucide.dev/) & Material Symbols
- **Backend / Database**: [Supabase](https://supabase.com/) (`@supabase/ssr` & `@supabase/supabase-js`)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/MeetBorad/Zentap.ai.git
cd Zentap.ai
npm install
```

### 2. Environment Variables
Create `.env.local` using `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 License
Private & Proprietary — ZenTap.ai Inc.
