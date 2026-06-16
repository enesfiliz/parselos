"use client";

import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSafeInternalRedirect } from "@/lib/auth/redirect-url";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = submitting || fetchStatus === "fetching";
  const redirectUrl = getSafeInternalRedirect(searchParams.get("redirect_url"));
  const signUpHref = redirectUrl
    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-up";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn || isBusy) return;

    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.longMessage ?? signInError.message);
      setSubmitting(false);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({
        navigate: async () => {
          router.push(redirectUrl);
        },
      });

      if (finalizeError) {
        setError(finalizeError.longMessage ?? finalizeError.message);
      }

      setSubmitting(false);
      return;
    }

    setError("Giriş tamamlanamadı. Lütfen bilgilerinizi kontrol edin.");
    setSubmitting(false);
  }

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-parsel-panel p-8 shadow-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-parsel-gold/10 blur-[100px]"
      />

      <div className="relative">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tighter text-foreground">
          ParselOS
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Tekrar hoş geldin. Komuta merkezine erişiliyor...
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            E-posta
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@parselos.com"
            className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-all focus:border-parsel-gold focus:ring-1 focus:ring-parsel-gold focus:outline-none"
          />

          <label
            htmlFor="login-password"
            className="mb-1.5 mt-5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Şifre
          </label>
          <div className="relative mt-4">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground transition-all focus:border-parsel-gold focus:ring-1 focus:ring-parsel-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {error ? (
            <p className="mt-4 text-center text-xs text-red-400/90">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isBusy || !signIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-parsel-gold py-3 font-medium text-background transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Giriş yapılıyor…
              </>
            ) : (
              "Komuta Merkezine Gir"
            )}
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          256-bit SSL Güvenli Bağlantı
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href={signUpHref} className="font-medium text-primary hover:underline">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  );
}
