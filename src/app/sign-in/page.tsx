import { redirect } from "next/navigation";

import { isSafeInternalRedirect } from "@/lib/auth/redirect-url";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const query = params.redirect_url && isSafeInternalRedirect(params.redirect_url)
    ? `?redirect_url=${encodeURIComponent(params.redirect_url)}`
    : "";
  redirect(`/login${query}`);
}
