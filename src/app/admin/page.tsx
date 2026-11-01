import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const target = tab ? `/?view=admin&tab=${tab}` : `/?view=admin`;
  redirect(target);
}
