"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function AdminAccessForm({
  passwordConfigured = true,
}: {
  passwordConfigured?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Giriş başarısız.");
        return;
      }

      toast.success("Super admin oturumu açıldı.");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-emerald-500/15 bg-parsel-elevated p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Super Admin</h1>
          <p className="text-sm text-muted-foreground">
            Komuta merkezi için ek parola gerekli.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Parola
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none ring-emerald-500/30 focus:ring-2"
          placeholder="Admin parolası"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !password.trim() || !passwordConfigured}
        className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Doğrulanıyor...
          </>
        ) : (
          "Giriş Yap"
        )}
      </Button>
    </form>
  );
}
