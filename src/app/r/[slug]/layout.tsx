import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Verified Business";

  const title = `${formattedName} | Verified Google Review Assistant`;
  const description = `Leave a verified 5-star Google review or share direct feedback with ${formattedName}. Quick tap NFC and dynamic QR touchpoint powered by ZenTap.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.zentapdigitalsolutions.com/r/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.zentapdigitalsolutions.com/r/${slug}`,
      siteName: "ZenTap Digital Solutions",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${formattedName} Review Touchpoint`,
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
