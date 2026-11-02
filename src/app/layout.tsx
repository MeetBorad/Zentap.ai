import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0e1015",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zentapdigitalsolutions.com"),
  title: "ZenTap: Google Review Stand for Shops in Ahmedabad | Tap to Review",
  description:
    "Get more Google reviews with a simple tap. ZenTap review stands for salons, cafes, clinics and shops in Ahmedabad. From Rs 499. No app, no monthly fee.",
  keywords: [
    "Google Review Stand",
    "Google Review Stand Ahmedabad",
    "Tap to Review Stand",
    "Google Review Card",
    "Review Stand for Salon",
    "Review Stand for Cafe",
    "Review Stand for Clinic",
    "Review Stand for Shop",
    "ZenTap Digital Solutions",
    "Ahmedabad Shop Reviews",
  ],
  authors: [{ name: "ZenTap Digital Solutions", url: "https://www.zentapdigitalsolutions.com" }],
  creator: "ZenTap Digital Solutions",
  publisher: "ZenTap Digital Solutions",
  alternates: {
    canonical: "https://www.zentapdigitalsolutions.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ZenTap: Google Review Stand for Shops in Ahmedabad | Tap to Review",
    description:
      "Get more Google reviews with a simple tap. ZenTap review stands for salons, cafes, clinics and shops in Ahmedabad. From Rs 499. No app, no monthly fee.",
    url: "https://www.zentapdigitalsolutions.com",
    siteName: "ZenTap Digital Solutions",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenTap Google Review Stand for Shops in Ahmedabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenTap: Google Review Stand for Shops in Ahmedabad | Tap to Review",
    description:
      "Get more Google reviews with a simple tap. ZenTap review stands for salons, cafes, clinics and shops in Ahmedabad. From Rs 499. No app, no monthly fee.",
    images: ["/og-image.png"],
    creator: "@zentap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.zentapdigitalsolutions.com/#business",
      "name": "ZenTap Digital Solutions",
      "legalName": "ZenTap Digital Solutions",
      "url": "https://www.zentapdigitalsolutions.com",
      "logo": "https://www.zentapdigitalsolutions.com/icon.png",
      "image": "https://www.zentapdigitalsolutions.com/og-image.png",
      "description":
        "Smart counter review stands and digital cards for local businesses in Ahmedabad. Customers tap their phone to open your Google review page directly.",
      "telephone": "+919274560880",
      "email": "contact@zentapdigitalsolutions.com",
      "priceRange": "₹499 - ₹1499",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, UPI, Net Banking",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Sindhu Bhavan Marg, Bodakdev",
        "addressLocality": "Ahmedabad",
        "addressRegion": "Gujarat",
        "postalCode": "380054",
        "addressCountry": "IN",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 23.0378,
        "longitude": 72.5118,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:30",
          "closes": "19:30",
        },
      ],
      "sameAs": [
        "https://www.instagram.com/zentapdigitalsolutions",
        "https://wa.me/919274560880",
      ],
    },
    {
      "@type": "Product",
      "@id": "https://www.zentapdigitalsolutions.com/#product-standee",
      "name": "ZenTap Google Review Stand",
      "image": "https://www.zentapdigitalsolutions.com/og-image.png",
      "description":
        "Smart acrylic counter stand. Customers tap or scan their phone to open your Google review page in 1 tap.",
      "brand": {
        "@type": "Brand",
        "name": "ZenTap",
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "499",
        "highPrice": "1499",
        "priceCurrency": "INR",
        "offerCount": "4",
        "availability": "https://schema.org/InStock",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.zentapdigitalsolutions.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do customers need an app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Customers just tap their phone on the stand or scan the QR code with their camera. The Google review screen opens immediately.",
          },
        },
        {
          "@type": "Question",
          "name": "Does it need charging?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No battery, no charging, no wires. It works anytime without power.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I change the link later?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We can change your Google link anytime from the cloud without you needing a new stand.",
          },
        },
        {
          "@type": "Question",
          "name": "Is it allowed by Google?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We never pay customers for reviews and never hide the Google review option from anyone. Every customer can freely share their honest experience.",
          },
        },
        {
          "@type": "Question",
          "name": "How long does delivery take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Delivery takes 24 to 48 hours across Ahmedabad, and 3 to 5 business days across Gujarat and India.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Google Analytics 4 (GA4) Global Site Tag */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          id="ga4-init"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': 'denied'
              });
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }}
        />

        {/* JSON-LD Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-sans">
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
