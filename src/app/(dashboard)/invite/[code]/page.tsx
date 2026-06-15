import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { InviteAcceptView } from "@/components/features/account/InviteAcceptView";
import { buildInvitePreview } from "@/lib/account/invite-accept";
import { buildInviteAcceptPath, normalizeInviteCode } from "@/lib/account/invite-shared";
import { requireCurrentAgent } from "@/lib/auth/agent";

export const dynamic = "force-dynamic";

type InvitePageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Ofis Daveti · ${normalizeInviteCode(code)}`,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const normalizedCode = normalizeInviteCode(code);
  const invitePath = buildInviteAcceptPath(normalizedCode);

  const { userId } = await auth();
  if (!userId) {
    redirect(`/login?redirect_url=${encodeURIComponent(invitePath)}`);
  }

  const agent = await requireCurrentAgent();
  const preview = await buildInvitePreview(normalizedCode, agent);

  return <InviteAcceptView preview={preview} />;
}
