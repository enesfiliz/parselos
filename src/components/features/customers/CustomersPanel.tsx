"use client";

import {
  Kanban,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getInitials } from "@/lib/client-birthday";
import { resolveClientRegionAndType } from "@/lib/clients/portfolio-hints";
import type { CustomerListItem } from "@/lib/clients/server-queries";
import { cn } from "@/lib/utils";

type CustomerFormState = {
  adSoyad: string;
  telefon: string;
  email: string;
  butce: string;
  mulkTipi: string;
  notlar: string;
};

const emptyForm: CustomerFormState = {
  adSoyad: "",
  telefon: "",
  email: "",
  butce: "",
  mulkTipi: "",
  notlar: "",
};

function normalizeWhatsAppPhone(phone: string | null): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `9${digits}`;
  return `90${digits}`;
}

function buildWhatsAppUrl(phone: string | null) {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

function matchesQuery(customer: CustomerListItem, query: string) {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  const haystack = [
    customer.adSoyad,
    customer.telefon,
    customer.email,
    customer.region,
    customer.propertyType,
    customer.butce,
    customer.mulkTipi,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return haystack.includes(q);
}

type CustomersPanelProps = {
  initialCustomers: CustomerListItem[];
};

export function CustomersPanel({ initialCustomers }: CustomersPanelProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerListItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);

  const filtered = useMemo(
    () => customers.filter((c) => matchesQuery(c, query)),
    [customers, query],
  );

  function openProfile(customer: CustomerListItem) {
    setSelected(customer);
    setSheetOpen(true);
  }

  function openCreateDialog() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const adSoyad = form.adSoyad.trim();
    if (!adSoyad) {
      toast.error("Müşteri adı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adSoyad,
          telefon: form.telefon.trim() || null,
          email: form.email.trim() || null,
          butce: form.butce.trim() || null,
          mulkTipi: form.mulkTipi.trim() || null,
          notlar: form.notlar.trim() || null,
        }),
      });

      const payload = (await response.json()) as {
        data?: {
          id: string;
          adSoyad: string;
          telefon: string | null;
          email: string | null;
          notlar: string | null;
          kaynak: string | null;
          butce: string | null;
          mulkTipi: string | null;
          olusturulmaTarihi: string;
          guncellenmeTarihi: string;
          aktifFirsatSayisi?: number;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Müşteri eklenemedi.");
      }

      const saved = payload.data;
      if (!saved) throw new Error("Geçersiz API yanıtı.");

      const hints = resolveClientRegionAndType(saved.mulkTipi);

      const row: CustomerListItem = {
        id: saved.id,
        adSoyad: saved.adSoyad,
        telefon: saved.telefon,
        email: saved.email,
        notlar: saved.notlar,
        kaynak: saved.kaynak,
        butce: saved.butce,
        mulkTipi: saved.mulkTipi,
        olusturulmaTarihi: saved.olusturulmaTarihi,
        guncellenmeTarihi: saved.guncellenmeTarihi,
        aktifFirsatSayisi: saved.aktifFirsatSayisi ?? 0,
        region: hints.region,
        propertyType: hints.propertyType,
      };

      setCustomers((prev) => [row, ...prev]);
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Yeni müşteri eklendi.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Müşteri eklenemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Users className="size-4 text-parsel-gold" strokeWidth={1.5} />
              <h1 className="font-outfit text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Müşteriler ve Yatırımcılar
              </h1>
              <span className="inline-flex items-center rounded-full border border-[#b38c56]/35 bg-parsel-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#e8d4b8]">
                {customers.length} müşteri
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Kanban fırsatlarıyla konuşan otonom müşteri portföyü — arama,
              WhatsApp ve profil inceleme tek ekranda.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="h-10 shrink-0 gap-1.5 bg-parsel-gold px-4 text-black hover:brightness-110"
          >
            <Plus className="size-4" strokeWidth={2} />
            Yeni Müşteri
          </Button>
        </header>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya telefon ile ara..."
            className="h-10 w-full rounded-xl border border-border/50 bg-parsel-panel pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#b38c56]/35"
          />
        </div>

        {customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-parsel-panel px-6 py-16 text-center">
            <UserRound className="mx-auto size-10 text-zinc-700" strokeWidth={1.25} />
            <p className="mt-4 text-sm font-medium text-foreground/90">
              Henüz müşteri eklenmedi
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              İlk yatırımcınızı ekleyin; fırsatlar paneliyle otomatik
              eşleşsin.
            </p>
            <Button
              type="button"
              onClick={openCreateDialog}
              className="mt-6 bg-parsel-gold text-black hover:brightness-110"
            >
              + Yeni Müşteri
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-parsel-panel px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aramanızla eşleşen müşteri bulunamadı.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-border/50 bg-parsel-panel md:block">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto_auto] gap-3 border-b border-border/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Müşteri</span>
                <span>Bölge & Mülk</span>
                <span>Bütçe</span>
                <span>Fırsat</span>
                <span className="text-right">Aksiyon</span>
              </div>
              <ul>
                {filtered.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    variant="desktop"
                    onProfile={() => openProfile(customer)}
                  />
                ))}
              </ul>
            </div>

            <ul className="flex flex-col gap-3 md:hidden">
              {filtered.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  variant="mobile"
                  onProfile={() => openProfile(customer)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          showCloseButton
          className="!left-auto !right-0 h-full w-full overflow-y-auto border-l border-border bg-background p-6 sm:max-w-md"
        >
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 border-b border-border/50 pb-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-semibold text-foreground">
                  {getInitials(selected.adSoyad)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-outfit text-lg font-semibold text-foreground">
                    {selected.adSoyad}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kayıt: {formatDate(selected.olusturulmaTarihi)}
                  </p>
                </div>
              </div>

              <section className="space-y-3 rounded-2xl border border-border/50 bg-parsel-panel p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Portföy Kriterleri
                </p>
                <div className="grid gap-2 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Bölge</p>
                    <p className="text-foreground">{selected.region}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Mülk Tipi</p>
                    <p className="text-foreground">{selected.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Maksimum Bütçe</p>
                    <p className="font-semibold text-parsel-gold">
                      {selected.butce ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Aktif Fırsat</p>
                    <p className="text-foreground">
                      {selected.aktifFirsatSayisi} kanban kartı
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 rounded-2xl border border-border/50 bg-parsel-panel p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  İletişim
                </p>
                {selected.telefon ? (
                  <p className="flex items-center gap-2 text-sm text-foreground/90">
                    <Phone className="size-3.5 text-muted-foreground" />
                    {selected.telefon}
                  </p>
                ) : null}
                {selected.email ? (
                  <p className="flex items-center gap-2 text-sm text-foreground/90">
                    <Mail className="size-3.5 text-muted-foreground" />
                    {selected.email}
                  </p>
                ) : null}
                {selected.notlar ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {selected.notlar}
                  </p>
                ) : null}
              </section>

              <div className="flex flex-wrap gap-2">
                {buildWhatsAppUrl(selected.telefon) ? (
                  <a
                    href={buildWhatsAppUrl(selected.telefon)!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-medium text-foreground"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                ) : null}
                <Link
                  href="/deals"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-parsel-panel px-4 text-sm font-medium text-foreground"
                >
                  <Kanban className="size-4 text-parsel-gold" />
                  Fırsatları Gör
                </Link>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border bg-parsel-panel text-foreground">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Portföye yeni yatırımcı veya son kullanıcı ekleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adSoyad">Ad Soyad</Label>
              <Input
                id="adSoyad"
                value={form.adSoyad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adSoyad: e.target.value }))
                }
                required
                className="border-border bg-background"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={form.telefon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefon: e.target.value }))
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="butce">Bütçe</Label>
                <Input
                  id="butce"
                  value={form.butce}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, butce: e.target.value }))
                  }
                  placeholder="6.200.000 TL"
                  className="border-border bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mulkTipi">Bölge & Mülk Tipi</Label>
              <Input
                id="mulkTipi"
                value={form.mulkTipi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mulkTipi: e.target.value }))
                }
                placeholder="Kocaeli / Gölcük — İmarlı arsa"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notlar">Notlar</Label>
              <Input
                id="notlar"
                value={form.notlar}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notlar: e.target.value }))
                }
                className="border-border bg-background"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saving}
                className="bg-parsel-gold text-black hover:brightness-110"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerRow({
  customer,
  variant,
  onProfile,
}: {
  customer: CustomerListItem;
  variant: "desktop" | "mobile";
  onProfile: () => void;
}) {
  const waHref = buildWhatsAppUrl(customer.telefon);

  if (variant === "mobile") {
    return (
      <li className="rounded-2xl border border-border/50 bg-parsel-panel p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-xs font-semibold text-foreground">
            {getInitials(customer.adSoyad)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{customer.adSoyad}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {customer.region}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {customer.propertyType}
            </p>
            <p className="mt-2 text-sm font-semibold text-parsel-gold">
              {customer.butce ?? "Bütçe belirtilmedi"}
            </p>
            <span className="mt-2 inline-flex rounded-full border border-border/50 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {customer.aktifFirsatSayisi} Aktif Fırsat
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButtons waHref={waHref} onProfile={onProfile} />
        </div>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto_auto] items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-xs font-semibold text-foreground">
          {getInitials(customer.adSoyad)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {customer.adSoyad}
          </p>
          {customer.telefon ? (
            <p className="truncate text-[11px] text-muted-foreground">
              {customer.telefon}
            </p>
          ) : null}
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-foreground/90">{customer.region}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {customer.propertyType}
        </p>
      </div>
      <p className="text-sm font-semibold text-parsel-gold">
        {customer.butce ?? "—"}
      </p>
      <span className="inline-flex w-fit rounded-full border border-border/50 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {customer.aktifFirsatSayisi} Aktif
      </span>
      <ActionButtons waHref={waHref} onProfile={onProfile} />
    </li>
  );
}

function ActionButtons({
  waHref,
  onProfile,
}: {
  waHref: string | null;
  onProfile: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <a
        href={waHref ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          if (!waHref) {
            e.preventDefault();
            toast.error("Telefon numarası kayıtlı değil.");
          }
        }}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-lg bg-[#25D366] text-foreground transition-opacity",
          !waHref && "cursor-not-allowed opacity-40",
        )}
        aria-label="WhatsApp"
      >
        <MessageCircle className="size-4" strokeWidth={2} />
      </a>
      <button
        type="button"
        onClick={onProfile}
        className="inline-flex h-8 items-center rounded-lg border border-border bg-parsel-panel px-2.5 text-[11px] font-medium text-foreground/90 transition-colors hover:border-white/20 hover:text-foreground"
      >
        Profili Gör
      </button>
    </div>
  );
}
