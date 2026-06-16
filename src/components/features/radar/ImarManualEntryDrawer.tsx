"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { isValidSourceUrl } from "@/components/features/radar/imar-radar-ui-helpers";
import { Button } from "@/components/ui/button";
import type { ImarRecordCategory, ManualImarRecordInput } from "@/lib/radar/imar-radar-types";
import { cn } from "@/lib/utils";

type ImarManualEntryDrawerProps = {
  open: boolean;
  defaultRegion: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ManualImarRecordInput) => void | Promise<void>;
};

const CATEGORY_OPTIONS: { value: ImarRecordCategory; label: string }[] = [
  { value: "aski", label: "Askı ilanı" },
  { value: "plan-degisikligi", label: "Plan değişikliği" },
  { value: "duyuru", label: "Resmi duyuru" },
  { value: "parsel", label: "Parsel duyurusu" },
  { value: "sanayi", label: "Sanayi alanı" },
  { value: "manuel", label: "Manuel takip" },
];

type FormValues = {
  title: string;
  region: string;
  category: ImarRecordCategory;
  summary: string;
  sourceUrl: string;
  tracking: boolean;
  verificationNote: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  region: "",
  category: "manuel",
  summary: "",
  sourceUrl: "",
  tracking: true,
  verificationNote: "",
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}

const fieldClassName =
  "w-full rounded-xl border border-border/60 bg-parsel-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export function ImarManualEntryDrawer({
  open,
  defaultRegion,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: ImarManualEntryDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { ...EMPTY_FORM, region: defaultRegion },
  });

  useEffect(() => {
    if (!open) return;
    reset({ ...EMPTY_FORM, region: defaultRegion });
  }, [defaultRegion, open, reset]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  async function submit(values: FormValues) {
    const sourceUrl = values.sourceUrl.trim();
    await onSubmit({
      title: values.title.trim(),
      region: values.region.trim(),
      category: values.category,
      summary: values.summary.trim(),
      sourceUrl: sourceUrl || undefined,
      tracking: values.tracking,
      verificationNote: values.verificationNote.trim() || undefined,
    });
    onOpenChange(false);
    reset({ ...EMPTY_FORM, region: defaultRegion });
  }

  return (
    <>
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "parsel-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border/60 bg-parsel-panel transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
          <div>
            <p className="parsel-section-label text-primary">Manuel kayıt</p>
            <h2 className="text-lg font-semibold text-foreground">İmar takip kaydı ekle</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Formu kapat"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5"
        >
          <Field id="title" label="Başlık" error={errors.title?.message}>
            <input
              id="title"
              {...register("title", { required: "Başlık zorunludur.", minLength: 4 })}
              className={fieldClassName}
              placeholder="Örn. Söğüt sanayi imar planı askı ilanı"
            />
          </Field>

          <Field id="region" label="İl / ilçe / bölge" error={errors.region?.message}>
            <input
              id="region"
              {...register("region", { required: "Bölge zorunludur." })}
              className={fieldClassName}
              placeholder="Örn. Söğüt, Bilecik"
            />
          </Field>

          <Field id="category" label="Kayıt türü">
            <select id="category" {...register("category")} className={fieldClassName}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="summary" label="Özet" error={errors.summary?.message}>
            <textarea
              id="summary"
              rows={4}
              {...register("summary", {
                required: "Özet zorunludur.",
                minLength: { value: 12, message: "Özet en az 12 karakter olmalıdır." },
              })}
              className={cn(fieldClassName, "resize-none")}
              placeholder="Kısa özet ve izleme notu..."
            />
          </Field>

          <Field id="sourceUrl" label="Kaynak linki (opsiyonel)" error={errors.sourceUrl?.message}>
            <input
              id="sourceUrl"
              {...register("sourceUrl", {
                validate: (value) =>
                  !value.trim() || isValidSourceUrl(value) || "Geçerli bir http/https URL girin.",
              })}
              className={fieldClassName}
              placeholder="https://..."
            />
          </Field>

          <Field id="verificationNote" label="Doğrulama notu (opsiyonel)">
            <textarea
              id="verificationNote"
              rows={3}
              {...register("verificationNote")}
              className={cn(fieldClassName, "resize-none")}
              placeholder="Resmi kaynak kontrol notu..."
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-foreground/85">
            <input type="checkbox" {...register("tracking")} className="size-4 rounded border-border" />
            Bu kaydı hemen takibe al
          </label>
        </form>

        <div className="border-t border-border/50 px-6 py-5">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full"
            onClick={handleSubmit(submit)}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Kaydı oluştur
          </Button>
        </div>
      </aside>
    </>
  );
}
