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
  title: "ZenTap | Smart NFC & QR Google Review Standees",
  description:
    "Turn customer footfall into 5-star Google Reviews with precision-crafted NFC acrylic standees and smart cards. Zero apps required, from ₹500 across India.",
  keywords: [
    "Google Review Standee",
    "NFC Review Standee Ahmedabad",
    "Smart Review Card India",
    "Tap to Review Standee",
    "Smart NFC Google Reviews",
    "NTAG216 NFC Card",
    "Restaurant Google Reviews NFC",
    "Salon Google Reviews Standee",
    "ZenTap Digital Solutions",
    "Ahmedabad Gujarat Business Reviews",
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
    title: "ZenTap | Smart NFC & QR Google Review Standees",
    description:
      "Turn customer footfall into 5-star Google Reviews with precision-crafted NFC acrylic standees and smart cards. Zero apps required, from ₹500 across India.",
    url: "https://www.zentapdigitalsolutions.com",
    siteName: "ZenTap Digital Solutions",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenTap Smart NFC & QR Google Review Standees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenTap | Smart NFC & QR Google Review Standees",
    description:
      "Turn customer footfall into 5-star Google Reviews with precision-crafted NFC acrylic standees. Zero apps needed, from ₹500 across India.",
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
        "Precision-crafted NFC & Dynamic QR acrylic counter standees and smart business cards for automated Google Review capture and lead generation in Ahmedabad, Gujarat, India.",
      "telephone": "+919274560880",
      "email": "contact@zentapdigitalsolutions.com",
      "priceRange": "₹500 - ₹2500",
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
      "name": "ZenTap Tactile NFC & Dynamic QR Review Standee",
      "image": "https://www.zentapdigitalsolutions.com/og-image.png",
      "description":
        "Precision-machined matte-black acrylic counter standee with embedded 13.56 MHz NTAG216 NFC chip and Level Q Laser QR Code for automated Google Review collection.",
      "brand": {
        "@type": "Brand",
        "name": "ZenTap",
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "500",
        "highPrice": "2500",
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
          "name": "Does ZenTap require customers to download an app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Customers simply tap their iPhone or Android smartphone on the standee or scan the high-contrast Level Q QR code with their default camera app. The Google review screen opens in under 0.6 seconds.",
          },
        },
        {
          "@type": "Question",
          "name": "How does ZenTap assist customers in leaving reviews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ZenTap eliminates typing friction by offering customers instant 1-tap review drafts and keyword tags directly aligned with their experience, opening straight into Google Maps for authentic review submission.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I update my Google Review link after receiving the hardware?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. All ZenTap NFC chips and QR codes route through dynamic cloud redirection. You can modify your Google Place URL, WhatsApp link, or booking page at any time via your Merchant Dashboard without replacing the physical standee.",
          },
        },
        {
          "@type": "Question",
          "name": "How fast is delivery across India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Orders are precision-encoded and dispatched via express courier within 24-48 business hours, typically delivering within 3-5 days across all metro cities and tier-1/tier-2 hubs in India.",
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
