"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
} from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import {
  EMPTY_PORTFOLIO_FORM,
  portfolioToFormValues,
  type PortfolioFormValues,
} from "@/lib/portfolios/portfolio-form";
import { cn } from "@/lib/utils";

type PortfolioAddDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  portfolio: AuthorizedPortfolioItem | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PortfolioFormValues) => void | Promise<void>;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function UnderlineField({
  id,
  label,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground/90 placeholder:text-white/25 transition-colors focus:border-[#b38c56] focus:outline-none"
      />
      {error ? <p className="text-[11px] text-red-400/90">{error}</p> : null}
    </div>
  );
}

async function uploadCoverFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/portfolios/cover", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Görsel yüklenemedi.");
  }

  return payload.url;
}

export function PortfolioAddDrawer({
  open,
  mode,
  portfolio,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: PortfolioAddDrawerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioFormValues>({
    defaultValues: EMPTY_PORTFOLIO_FORM,
  });

  const coverImageUrl = watch("coverImageUrl");

  useEffect(() => {
    if (!open) return;

    const values =
      mode === "edit" && portfolio
        ? portfolioToFormValues(portfolio)
        : EMPTY_PORTFOLIO_FORM;
    reset(values);
    setPreviewUrl(values.coverImageUrl || null);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mode, onOpenChange, open, portfolio, reset]);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  async function handleImageFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Desteklenmeyen format", {
        description: "JPG, PNG veya WEBP yükleyin.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya çok büyük", {
        description: "Kapak görseli en fazla 5 MB olabilir.",
      });
      return;
    }

    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
    }

    const localPreview = URL.createObjectURL(file);
    previewRef.current = localPreview;
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const url = await uploadCoverFile(file);
      setValue("coverImageUrl", url, { shouldDirty: true });
      setPreviewUrl(url);
      previewRef.current = url;
      toast.success("Kapak görseli yüklendi");
    } catch (error) {
      setPreviewUrl(coverImageUrl || null);
      previewRef.current = coverImageUrl || null;
      toast.error("Yükleme başarısız", {
        description:
          error instanceof Error ? error.message : "Görsel kaydedilemedi.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleImageFile(file);
  }

  function clearCoverImage() {
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = null;
    setPreviewUrl(null);
    setValue("coverImageUrl", "", { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submitForm(values: PortfolioFormValues) {
    await onSubmit(values);
  }

  const displayPreview = previewUrl || coverImageUrl;

  return (
    <>
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-parsel-elevated shadow-[-20px_0_60px_rgba(0,0,0,0.45)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex h-full flex-col"
        >
          <input type="hidden" {...register("coverImageUrl")} />

          <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-parsel-gold/80">
                {mode === "edit" ? "Düzenleme" : "Yeni Kayıt"}
              </p>
              <h2 className="mt-1 text-lg font-medium tracking-tight text-foreground/90">
                Portföy Kayıt Çekmecesi
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground/80"
              aria-label="Çekmeceyi kapat"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImageFile(file);
              }}
            />

            <div className="relative mb-8">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative flex h-36 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed transition-colors",
                  dragActive
                    ? "border-[#b38c56] bg-parsel-gold/5"
                    : "border-white/20 hover:border-parsel-gold",
                  isUploading && "pointer-events-none opacity-70",
                )}
              >
                {displayPreview ? (
                  <Image
                    src={displayPreview}
                    alt="Kapak önizleme"
                    fill
                    unoptimized={
                      displayPreview.startsWith("blob:") ||
                      displayPreview.startsWith("data:")
                    }
                    className="object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-5 text-foreground/35" strokeWidth={1.5} />
                    <span className="text-xs text-foreground/45">Görsel Yükle</span>
                    <span className="text-[10px] text-foreground/25">
                      Sürükle-bırak veya tıkla · max 5 MB
                    </span>
                  </>
                )}

                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                    <Loader2 className="size-5 animate-spin text-parsel-gold" />
                  </div>
                ) : null}
              </button>

              {displayPreview && !isUploading ? (
                <button
                  type="button"
                  onClick={clearCoverImage}
                  className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-lg border border-border bg-black/60 text-foreground/70 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-foreground"
                  aria-label="Görseli kaldır"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>

            <div className="space-y-6">
              <UnderlineField
                id="portfolio-title"
                label="Başlık"
                placeholder="Örn. Gölcük Merkez 4+1 Dubleks"
                error={errors.title?.message}
                {...register("title", { required: "Başlık zorunludur." })}
              />
              <UnderlineField
                id="portfolio-price"
                label="Fiyat"
                placeholder="₺ 7.850.000"
                error={errors.price?.message}
                {...register("price", { required: "Fiyat zorunludur." })}
              />

              <div className="space-y-2">
                <label
                  htmlFor="portfolio-listing-type"
                  className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  İlan Türü
                </label>
                <select
                  id="portfolio-listing-type"
                  className="w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground/90 focus:border-[#b38c56] focus:outline-none"
                  {...register("listingType")}
                >
                  <option value="SATILIK" className="bg-parsel-elevated">
                    Satılık
                  </option>
                  <option value="KIRALIK" className="bg-parsel-elevated">
                    Kiralık
                  </option>
                </select>
              </div>

              <UnderlineField
                id="portfolio-location"
                label="Lokasyon"
                placeholder="Kocaeli, Gölcük Merkez"
                error={errors.location?.message}
                {...register("location", { required: "Lokasyon zorunludur." })}
              />
              <UnderlineField
                id="portfolio-sqm"
                label="Metrekare"
                placeholder="185"
                type="number"
                {...register("sqm")}
              />
              <UnderlineField
                id="portfolio-rooms"
                label="Oda Sayısı"
                placeholder="4+1"
                {...register("rooms")}
              />
              <UnderlineField
                id="portfolio-building-age"
                label="Bina Yaşı"
                placeholder="Sıfır veya 8 yıl"
                {...register("buildingAge")}
              />
              <UnderlineField
                id="portfolio-owner-name"
                label="Mal Sahibi"
                placeholder="Ad Soyad"
                {...register("ownerName")}
              />
              <UnderlineField
                id="portfolio-owner-phone"
                label="Mal Sahibi Telefon"
                placeholder="05XX XXX XX XX"
                {...register("ownerPhone")}
              />

              <div className="space-y-2">
                <label
                  htmlFor="portfolio-description"
                  className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Açıklama
                </label>
                <textarea
                  id="portfolio-description"
                  rows={3}
                  placeholder="Portföy notları, öne çıkan özellikler..."
                  className="w-full resize-none rounded-xl border border-border bg-white/[0.02] px-3 py-2.5 text-sm text-foreground/85 placeholder:text-white/25 focus:border-[#b38c56] focus:outline-none"
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 px-6 py-5">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-11 w-full bg-parsel-gold text-sm font-medium text-black hover:bg-[#c49a62] disabled:opacity-60"
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : mode === "edit"
                  ? "Değişiklikleri Kaydet"
                  : "Portföyü Kaydet"}
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
