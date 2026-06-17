"use client";

import {
  Activity,
  Briefcase,
  Kanban,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
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

function formatRelativeUpdate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return formatDate(iso);
}

type CustomerFilter = "all" | "withDeals" | "followUp";

const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

function getFollowUpStatus(customer: CustomerListItem) {
  if (customer.aktifFirsatSayisi > 0) {
    return {
      label: "Aktif fırsat",
      className: "border-primary/25 bg-primary/10 text-primary",
    };
  }
  return {
    label: "Takip bekliyor",
    className: "border-border/60 bg-parsel-elevated text-muted-foreground",
  };
}

function computeCustomerMetrics(customers: CustomerListItem[]) {
  const withDeals = customers.filter((c) => c.aktifFirsatSayisi > 0).length;
  const needsFollowUp = customers.filter((c) => c.aktifFirsatSayisi === 0).length;
  const withBudget = customers.filter((c) => Boolean(c.butce?.trim())).length;

  return {
    total: customers.length,
    withDeals,
    needsFollowUp,
    withBudget,
  };
}

function formatKaynakLabel(kaynak: string | null) {
  if (!kaynak?.trim()) return null;
  return kaynak.trim();
}

function matchesFilter(customer: CustomerListItem, filter: CustomerFilter) {
  if (filter === "withDeals") return customer.aktifFirsatSayisi > 0;
  if (filter === "followUp") return customer.aktifFirsatSayisi === 0;
  return true;
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
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [selected, setSelected] = useState<CustomerListItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);

  const metrics = useMemo(() => computeCustomerMetrics(customers), [customers]);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => matchesQuery(c, query) && matchesFilter(c, filter),
      ),
    [customers, query, filter],
  );

  function openProfile(customer: CustomerListItem) {
    setSelected(customer);
    setSheetOpen(true);
  }

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(customer: CustomerListItem) {
    setEditingId(customer.id);
    setForm({
      adSoyad: customer.adSoyad,
      telefon: customer.telefon ?? "",
      email: customer.email ?? "",
      butce: customer.butce ?? "",
      mulkTipi: customer.mulkTipi ?? "",
      notlar: customer.notlar ?? "",
    });
    setDialogOpen(true);
  }

  async function handleDelete(customer: CustomerListItem) {
    if (
      !window.confirm(
        `${customer.adSoyad} müşterisini silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${customer.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Silinemedi.");
      }
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selected?.id === customer.id) {
        setSheetOpen(false);
        setSelected(null);
      }
      toast.success("Müşteri silindi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Silinemedi.");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const adSoyad = form.adSoyad.trim();
    if (!adSoyad) {
      toast.error("Müşteri adı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        adSoyad,
        telefon: form.telefon.trim() || null,
        email: form.email.trim() || null,
        butce: form.butce.trim() || null,
        mulkTipi: form.mulkTipi.trim() || null,
        notlar: form.notlar.trim() || null,
      };

      const response = await fetch(
        editingId ? `/api/clients/${editingId}` : "/api/clients",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

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
        throw new Error(payload.error ?? "Kayıt başarısız.");
      }

      const saved = payload.data;
      if (!saved) throw new Error("Kayıt kaydedilemedi. Lütfen tekrar deneyin.");

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

      setCustomers((prev) =>
        editingId
          ? prev.map((c) => (c.id === editingId ? row : c))
          : [row, ...prev],
      );
      if (selected?.id === editingId) {
        setSelected(row);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      toast.success(editingId ? "Müşteri güncellendi." : "Yeni müşteri eklendi.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Müşteri eklenemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="parsel-section-label text-primary">Müşteri merkezi</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="parsel-page-title text-foreground">Müşteriler</h1>
              <span className="inline-flex items-center rounded-full border border-border/60 bg-parsel-panel px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-parsel-sm">
                {customers.length} kayıt
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Talep, bütçe, bölge ve fırsat takibini tek merkezden yönetin. Arama,
              WhatsApp ve profil inceleme aynı ekranda.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="h-11 shrink-0 gap-1.5 bg-primary px-5 text-primary-foreground shadow-parsel-sm hover:bg-primary/90"
          >
            <Plus className="size-4" strokeWidth={2} />
            Yeni Müşteri
          </Button>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Toplam müşteri</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.total}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Fırsatlı müşteri</p>
            <p className="parsel-metric-value mt-2 text-primary">{metrics.withDeals}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Takip bekleyen</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.needsFollowUp}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Bütçe tanımlı</p>
            <p className="parsel-metric-value mt-2 text-parsel-gold">{metrics.withBudget}</p>
          </article>
        </section>

        <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İsim, telefon, bölge veya bütçe ile ara..."
                className="h-11 w-full rounded-xl border border-border/60 bg-parsel-elevated pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all", label: "Tümü" },
                  { id: "withDeals", label: "Fırsatlı" },
                  { id: "followUp", label: "Takip bekleyen" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === item.id
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border/60 bg-parsel-elevated text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} müşteri listeleniyor
            {query.trim() ? ` · “${query.trim()}” araması` : ""}
          </p>
        </section>

        {customers.length === 0 ? (
          <div className="parsel-surface rounded-2xl border border-dashed border-border/60 bg-parsel-panel px-6 py-16 text-center shadow-parsel-sm">
            <UserRound className="mx-auto size-10 text-primary/70" strokeWidth={1.25} />
            <p className="mt-4 text-sm font-semibold text-foreground">
              Henüz müşteri eklenmedi
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              İlk müşterinizi ekleyin; talep, bütçe ve fırsat takibi burada başlar.
            </p>
            <Button
              type="button"
              onClick={openCreateDialog}
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Yeni Müşteri
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel px-6 py-12 text-center shadow-parsel-sm">
            <p className="text-sm font-medium text-foreground">
              Eşleşen müşteri bulunamadı
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Arama veya filtreyi değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-border/60 bg-parsel-panel shadow-parsel-sm md:block">
              <div className="min-w-[920px]">
              <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.75fr)_minmax(0,0.7fr)_auto_auto] gap-3 border-b border-border/60 bg-parsel-elevated/80 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Müşteri</span>
                <span>Bölge & mülk</span>
                <span>Bütçe</span>
                <span>Son görüşme</span>
                <span>Takip</span>
                <span>Fırsat</span>
                <span className="text-right">İşlem</span>
              </div>
              <ul>
                {filtered.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    variant="desktop"
                    onProfile={() => openProfile(customer)}
                    onEdit={() => openEditDialog(customer)}
                    onDelete={() => handleDelete(customer)}
                  />
                ))}
              </ul>
              </div>
            </div>

            <ul className="flex flex-col gap-3 md:hidden">
              {filtered.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  variant="mobile"
                  onProfile={() => openProfile(customer)}
                  onEdit={() => openEditDialog(customer)}
                  onDelete={() => handleDelete(customer)}
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
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-parsel-sunken/80 text-sm font-semibold text-foreground">
                  {getInitials(selected.adSoyad)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-outfit text-lg font-semibold text-foreground">
                      {selected.adSoyad}
                    </h2>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        getFollowUpStatus(selected).className,
                      )}
                    >
                      {getFollowUpStatus(selected).label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kayıt: {formatDate(selected.olusturulmaTarihi)}
                  </p>
                  {formatKaynakLabel(selected.kaynak) ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Kaynak: {formatKaynakLabel(selected.kaynak)}
                    </p>
                  ) : null}
                </div>
              </div>

              <section className="parsel-surface space-y-2 rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
                <p className="parsel-section-label text-muted-foreground">Son görüşme</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(selected.guncellenmeTarihi)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeUpdate(selected.guncellenmeTarihi)} · kayıt güncellemesine göre
                </p>
              </section>

              <section className="parsel-surface space-y-3 rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
                <p className="parsel-section-label text-muted-foreground">
                  Portföy kriterleri
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

              <section className="parsel-surface space-y-2 rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
                <p className="parsel-section-label text-muted-foreground">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSheetOpen(false);
                    openEditDialog(selected);
                  }}
                >
                  <Pencil className="size-3.5" />
                  Düzenle
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selected)}
                >
                  <Trash2 className="size-3.5" />
                  Sil
                </Button>
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
            <DialogTitle>
              {editingId ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId
                ? "İletişim ve portföy kriterlerini güncelleyin."
                : "Portföye yeni yatırımcı veya son kullanıcı ekleyin."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}
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
  onEdit,
  onDelete,
}: {
  customer: CustomerListItem;
  variant: "desktop" | "mobile";
  onProfile: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const waHref = buildWhatsAppUrl(customer.telefon);
  const status = getFollowUpStatus(customer);
  const kaynakLabel = formatKaynakLabel(customer.kaynak);

  if (variant === "mobile") {
    return (
      <li className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-xs font-semibold text-foreground">
            {getInitials(customer.adSoyad)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium text-foreground">{customer.adSoyad}</p>
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  status.className,
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {customer.region}
            </p>
            <p className="truncate text-xs text-muted-foreground">{customer.propertyType}</p>
            {kaynakLabel ? (
              <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
                Kaynak: {kaynakLabel}
              </p>
            ) : null}
            <p className="mt-2 text-sm font-semibold text-parsel-gold">
              {customer.butce ?? "Bütçe belirtilmedi"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-parsel-elevated px-2 py-0.5">
                <Briefcase className="size-3" />
                {customer.aktifFirsatSayisi} fırsat
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="size-3" />
                Son görüşme: {formatRelativeUpdate(customer.guncellenmeTarihi)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-border/50 pt-3">
          <ActionButtons
            waHref={waHref}
            onProfile={onProfile}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.75fr)_minmax(0,0.7fr)_auto_auto] items-center gap-3 border-b border-border/50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-foreground/[0.02]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-xs font-semibold text-foreground">
          {getInitials(customer.adSoyad)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {customer.adSoyad}
          </p>
          {customer.telefon ? (
            <p className="truncate text-xs text-muted-foreground">{customer.telefon}</p>
          ) : (
            <p className="text-xs text-muted-foreground/70">Telefon yok</p>
          )}
          {kaynakLabel ? (
            <p className="truncate text-[10px] text-muted-foreground/75">Kaynak: {kaynakLabel}</p>
          ) : null}
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/90">{customer.region}</p>
        <p className="truncate text-xs text-muted-foreground">{customer.propertyType}</p>
      </div>
      <p className="text-sm font-semibold text-parsel-gold">{customer.butce ?? "—"}</p>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground/90">
          {formatRelativeUpdate(customer.guncellenmeTarihi)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDate(customer.guncellenmeTarihi)}
        </p>
      </div>
      <span
        className={cn(
          "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
          status.className,
        )}
      >
        {status.label}
      </span>
      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border/60 bg-parsel-elevated px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Kanban className="size-3" />
        {customer.aktifFirsatSayisi}
      </span>
      <ActionButtons
        waHref={waHref}
        onProfile={onProfile}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </li>
  );
}

function ActionButtons({
  waHref,
  onProfile,
  onEdit,
  onDelete,
}: {
  waHref: string | null;
  onProfile: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/20 hover:bg-accent hover:text-foreground"
        aria-label="Düzenle"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
        aria-label="Sil"
      >
        <Trash2 className="size-3.5" />
      </button>
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
        className="inline-flex h-8 items-center rounded-lg border border-border/60 bg-parsel-elevated px-2.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-accent"
      >
        Profili Gör
      </button>
    </div>
  );
}
