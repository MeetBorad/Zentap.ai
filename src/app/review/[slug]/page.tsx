import { redirect } from "next/navigation";

export default async function ReviewSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/r/${slug}`);
}
