import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ZenTap.ai | Tactile NFC & Dynamic QR Google Review Standees",
  description: "Turn in-store customer satisfaction into verified Google Reviews. Precision-machined acrylic standees with embedded NTAG216 NFC, Level Q Laser QR, and private feedback routing.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ZenTap.ai | Tactile NFC & Dynamic QR Google Review Standees",
    description: "Precision-machined counter standees with embedded NTAG216 NFC and Level Q Laser QR. Zero apps needed.",
    url: "https://www.zentapdigitalsolutions.com",
    siteName: "ZenTap.ai",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
