import { Metadata } from "next";
import { getBusinessBySlug, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = (slug || "").replace(/[|%#?&\s/]+$/g, "").trim().toLowerCase();

  // Attempt to resolve real business name
  let businessName = "ZenTap Verified Business";
  try {
    const rawBiz = getBusinessBySlug(cleanSlug) || (await fetchPublicBusinessBySlug(cleanSlug));
    if (rawBiz?.name) {
      businessName = rawBiz.name;
    } else if (cleanSlug === "zentap" || cleanSlug === "sample" || cleanSlug === "st3") {
      businessName = SAMPLE_DEMO_BUSINESS.name;
    } else if (cleanSlug) {
      businessName = cleanSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  } catch {
    businessName = cleanSlug || "Verified Business";
  }

  const title = `Share your experience on Google | ${businessName}`;
  const description = `Share your experience on Google with ${businessName}. Quick tap NFC and dynamic QR touchpoint powered by ZenTap.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.zentapdigitalsolutions.com/r/${cleanSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.zentapdigitalsolutions.com/r/${cleanSlug}`,
      siteName: "ZenTap Digital Solutions",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${businessName} Touchpoint`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function ReviewTouchpointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
