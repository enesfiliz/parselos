import { AlertCircle } from "lucide-react";

import { getDatabaseConnectionHint } from "@/lib/pg-pool";

export function DashboardDbError() {
  const hints = process.env.DATABASE_URL
    ? getDatabaseConnectionHint(process.env.DATABASE_URL)
    : ["DATABASE_URL tanımlı değil."];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-border/80 bg-parsel-card/60 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <AlertCircle className="size-4" strokeWidth={1.75} />
          </span>
          <div className="space-y-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Veritabanı bağlantısı kurulamadı
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Dashboard verileri yüklenemedi. Supabase veritabanı kimlik
                bilgileri geçersiz veya bağlantı dizesi hatalı olabilir.
              </p>
            </div>

            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                Supabase → Project Settings → Database →{" "}
                <strong>Reset database password</strong>
              </li>
              <li>
                <strong>Session pooler</strong> URI&apos;yi kopyalayın (port{" "}
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">5432</code>)
              </li>
              <li>
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">.env.local</code>{" "}
                içindeki{" "}
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">DATABASE_URL</code>{" "}
                değerini güncelleyin
              </li>
              <li>
                Şifrede{" "}
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">@ # / ?</code>{" "}
                gibi karakterler varsa URL encode edin (
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">@</code> →{" "}
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">%40</code>)
              </li>
              <li>
                Dev sunucusunu yeniden başlatın:{" "}
                <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">npm run dev</code>
              </li>
            </ol>

            {hints.length > 0 ? (
              <ul className="space-y-1 rounded-lg border border-border bg-parsel-border/30 px-4 py-3 text-xs text-muted-foreground">
                {hints.map((hint) => (
                  <li key={hint}>• {hint}</li>
                ))}
              </ul>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Bağlantıyı test etmek için:{" "}
              <code className="rounded bg-parsel-border/50 px-1 text-muted-foreground">npm run db:check</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
