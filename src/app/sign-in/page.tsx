import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const query = params.redirect_url
    ? `?redirect_url=${encodeURIComponent(params.redirect_url)}`
    : "";
  redirect(`/login${query}`);
}
