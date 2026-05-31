"use client";

import { Check, Copy } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm",
  "transition-colors outline-none placeholder:text-muted-foreground/60",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

const textareaClassName = cn(
  "min-h-[120px] w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm",
  "transition-colors outline-none placeholder:text-muted-foreground/60",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

export function IlanAsistaniView() {
  const [konum, setKonum] = useState("");
  const [odaSayisi, setOdaSayisi] = useState("");
  const [metrekare, setMetrekare] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [ekstraOzellikler, setEkstraOzellikler] = useState("");

  const [listing, setListing] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setListing(null);
    setCopied(false);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konum,
          odaSayisi,
          metrekare,
          fiyat,
          ekstraOzellikler,
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "İlan metni oluşturulamadı.";
        throw new Error(message);
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("listing" in payload) ||
        typeof payload.listing !== "string"
      ) {
        throw new Error("API yanıtı geçerli bir ilan metni içermiyor.");
      }

      setListing(payload.listing);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "İlan metni oluşturulamadı.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!listing) return;

    await navigator.clipboard.writeText(listing);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Yapay Zeka İlan Asistanı
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Gayrimenkul özelliklerini girin; SEO uyumlu, profesyonel ilan metni
          anında oluşturulsun.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Card className="border-border/60 shadow-sm ring-border/60">
          <CardHeader className="border-b border-border/50 pb-5">
            <CardTitle className="text-base font-medium">
              Gayrimenkul Bilgileri
            </CardTitle>
            <CardDescription>
              Formu doldurup ilan metnini üretin
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="konum">Konum</Label>
                <Input
                  id="konum"
                  placeholder="Gölcük, Merkez"
                  value={konum}
                  onChange={(e) => setKonum(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oda-sayisi">Oda Sayısı</Label>
                  <Input
                    id="oda-sayisi"
                    placeholder="3+1"
                    value={odaSayisi}
                    onChange={(e) => setOdaSayisi(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metrekare">Metrekare</Label>
                  <Input
                    id="metrekare"
                    placeholder="145"
                    value={metrekare}
                    onChange={(e) => setMetrekare(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiyat">Fiyat</Label>
                <Input
                  id="fiyat"
                  placeholder="4.250.000 TL"
                  value={fiyat}
                  onChange={(e) => setFiyat(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ekstra">Ekstra Özellikler</Label>
                <textarea
                  id="ekstra"
                  placeholder="Deniz manzarası, kapalı otopark, akıllı ev sistemi"
                  value={ekstraOzellikler}
                  onChange={(e) => setEkstraOzellikler(e.target.value)}
                  className={textareaClassName}
                />
                <p className="text-xs text-muted-foreground">
                  Virgülle ayırarak not ekleyebilirsiniz
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isGenerating}
              >
                {isGenerating ? "Metin üretiliyor…" : "İlan Metni Üret"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-border/60">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/50 pb-5">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                Üretilen İlan Metni
              </CardTitle>
              <CardDescription>
                Sonuç burada görüntülenir
              </CardDescription>
            </div>

            {listing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopy()}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Kopyala
                  </>
                )}
              </Button>
            )}
          </CardHeader>

          <CardContent className="pt-8 pb-10">
            {isGenerating ? (
              <p className="text-sm text-muted-foreground">
                Yapay zeka ilan metnini hazırlıyor…
              </p>
            ) : listing ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-[15px] leading-8 text-foreground/90">
                  {listing}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 px-8 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Henüz ilan metni üretilmedi. Sol taraftaki formu doldurun.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
