"use client";

import { Building2, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { InvitePreview } from "@/lib/account/invite-shared";

type InviteAcceptViewProps = {
  preview: InvitePreview;
};

export function InviteAcceptView({ preview }: InviteAcceptViewProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  async function acceptInvite() {
    setAccepting(true);
    try {
      const res = await fetch("/api/account/invites/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: preview.code }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Davet kabul edilemedi.");

      toast.success(data.message ?? "Ofise katıldınız");
      router.push("/account?tab=ekip");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Katılım başarısız");
    } finally {
      setAccepting(false);
    }
  }

  if (!preview.valid) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-sm">
          <h1 className="font-outfit text-xl font-semibold text-foreground">
            Davet Geçersiz
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{preview.error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => router.push("/account?tab=ekip")}
          >
            Hesap sayfasına dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ofis Daveti
            </p>
            <h1 className="font-outfit text-xl font-semibold text-foreground">
              {preview.tenantName}
            </h1>
          </div>
        </div>

        <dl className="space-y-3 rounded-xl border border-border bg-background/60 px-4 py-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Kurum tipi</dt>
            <dd className="font-medium text-foreground">{preview.organizationLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Ofis rolünüz</dt>
            <dd className="font-medium text-foreground">{preview.memberRoleLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Mesleki rol</dt>
            <dd className="font-medium text-foreground">{preview.agentRoleLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Davet kodu</dt>
            <dd className="font-mono font-semibold tracking-widest">{preview.code}</dd>
          </div>
          {preview.expiresAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Son geçerlilik</dt>
              <dd className="font-medium text-foreground">
                {new Date(preview.expiresAt).toLocaleDateString("tr-TR")}
              </dd>
            </div>
          ) : null}
        </dl>

        {preview.canAccept ? (
          <Button
            type="button"
            className="mt-6 w-full"
            onClick={acceptInvite}
            disabled={accepting}
          >
            {accepting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Ofise Katıl
          </Button>
        ) : (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            {preview.acceptBlockedReason}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => router.push("/account?tab=ekip")}
        >
          Hesap · Ekip sekmesine git
        </Button>
      </div>
    </div>
  );
}
