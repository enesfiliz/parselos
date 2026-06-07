"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ClientProfileCard } from "@/components/features/clients/ClientProfileCard";
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
import type { Client } from "@/lib/types/client";
import { cn } from "@/lib/utils";

interface ClientFormState {
  adSoyad: string;
  telefon: string;
  email: string;
  notlar: string;
  birthDate: string;
  butce: string;
  mulkTipi: string;
}

const emptyForm: ClientFormState = {
  adSoyad: "",
  telefon: "",
  email: "",
  notlar: "",
  birthDate: "",
  butce: "",
  mulkTipi: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function toNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeClient(value: unknown): Client | null {
  if (!isRecord(value)) return null;

  const id = value.id;
  const adSoyad = value.adSoyad;
  const olusturulmaTarihi = value.olusturulmaTarihi;
  const guncellenmeTarihi = value.guncellenmeTarihi;

  if (
    typeof id !== "string" ||
    typeof adSoyad !== "string" ||
    typeof olusturulmaTarihi !== "string" ||
    typeof guncellenmeTarihi !== "string"
  ) {
    return null;
  }

  const aktifFirsatSayisi =
    typeof value.aktifFirsatSayisi === "number" ? value.aktifFirsatSayisi : 0;

  return {
    id,
    adSoyad,
    telefon: toNullableString(value.telefon),
    email: toNullableString(value.email),
    notlar: toNullableString(value.notlar),
    kaynak: toNullableString(value.kaynak),
    birthDate: toNullableString(value.birthDate),
    butce: toNullableString(value.butce),
    mulkTipi: toNullableString(value.mulkTipi),
    olusturulmaTarihi,
    guncellenmeTarihi,
    aktifFirsatSayisi,
  };
}

function getApiError(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return fallback;
  return typeof payload.error === "string" ? payload.error : fallback;
}

function getApiDetails(payload: unknown) {
  if (!isRecord(payload)) return null;
  return typeof payload.details === "string" ? payload.details : null;
}

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function ProfileCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-white/5 bg-[#151f23] p-6"
      aria-hidden
    >
      <div className="flex gap-4">
        <div className="size-14 rounded-2xl bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-800/80" />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-zinc-800" />
        <div className="h-7 w-24 rounded-full bg-zinc-800" />
      </div>
      <div className="mt-6 h-3 w-full rounded bg-zinc-800/60" />
    </div>
  );
}

export function MusterilerView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const payload: unknown = await response.json();

        if (!response.ok) {
          throw new Error(getApiError(payload, "Müşteriler yüklenemedi."));
        }

        if (
          !cancelled &&
          isRecord(payload) &&
          "data" in payload &&
          Array.isArray(payload.data)
        ) {
          setClients(
            payload.data
              .map(normalizeClient)
              .filter((client): client is Client => Boolean(client)),
          );
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Müşteriler yüklenemedi.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateDialog() {
    setEditingClient(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(client: Client) {
    setEditingClient(client);
    setForm({
      adSoyad: client.adSoyad,
      telefon: client.telefon ?? "",
      email: client.email ?? "",
      notlar: client.notlar ?? "",
      birthDate: toDateInputValue(client.birthDate),
      butce: client.butce ?? "",
      mulkTipi: client.mulkTipi ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const body = {
        adSoyad: form.adSoyad.trim(),
        telefon: form.telefon.trim() || null,
        email: form.email.trim() || null,
        notlar: form.notlar.trim() || null,
        birthDate: form.birthDate.trim() || null,
        butce: form.butce.trim() || null,
        mulkTipi: form.mulkTipi.trim() || null,
      };

      const response = await fetch(
        editingClient ? `/api/clients/${editingClient.id}` : "/api/clients",
        {
          method: editingClient ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const payload: unknown = await response.json();

      if (!response.ok) {
        const apiError = getApiError(payload, "İşlem başarısız oldu.");
        const apiDetails = getApiDetails(payload);

        toast.error("Kayıt başarısız", {
          description: apiDetails ? `${apiError}: ${apiDetails}` : apiError,
        });
        return;
      }

      if (
        isRecord(payload) &&
        "data" in payload &&
        payload.data
      ) {
        const saved = normalizeClient(payload.data);
        if (!saved) {
          throw new Error("API yanıtı geçerli bir müşteri kaydı içermiyor.");
        }

        if (editingClient) {
          setClients((prev) =>
            prev.map((item) => (item.id === saved.id ? saved : item)),
          );
          toast.success("Müşteri bilgileri güncellendi.");
        } else {
          setClients((prev) => [saved, ...prev]);
          toast.success("Yeni müşteri portföye eklendi.");
        }
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingClient(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "İşlem başarısız oldu.";
      toast.error("Kayıt başarısız", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`${client.adSoyad} kaydını silmek istiyor musunuz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(payload, "Müşteri silinemedi."));
      }

      setClients((prev) => prev.filter((item) => item.id !== client.id));
      toast.success("Müşteri silindi");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Müşteri silinemedi.";
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="size-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Portföy Vitrini
            </span>
          </div>
          <h1 className="font-outfit text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Müşteriler
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            Profil kartlarıyla portföyünüzü yönetin; bütçe, mülk tipi ve doğum
            günü hatırlatıcıları tek bakışta.
          </p>
        </header>

        <Button className="h-10 w-full px-5 sm:w-auto" onClick={openCreateDialog}>
          Yeni Müşteri Ekle
        </Button>
      </div>

      {!isLoading && clients.length > 0 ? (
        <p className="text-sm text-zinc-500">
          <span className="font-medium text-zinc-300">{clients.length}</span>{" "}
          kayıtlı müşteri
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5",
            "bg-[#151f23] px-6 py-16 text-center sm:px-8 sm:py-20",
          )}
        >
          <Users className="mb-4 size-10 text-zinc-600" strokeWidth={1.25} />
          <p className="font-outfit text-lg font-medium text-zinc-300">
            Henüz müşteri yok
          </p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            İlk profil kartınızı oluşturmak için &quot;Yeni Müşteri Ekle&quot;
            düğmesine tıklayın.
          </p>
          <Button className="mt-6" onClick={openCreateDialog}>
            Müşteri Ekle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientProfileCard
              key={client.id}
              client={client}
              onEdit={openEditDialog}
              onDelete={(c) => void handleDelete(c)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={(event) => void handleSubmit(event)}>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}
              </DialogTitle>
              <DialogDescription>
                Profil kartında görünecek bilgileri girin. Ad soyad zorunludur.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ad-soyad">Ad Soyad</Label>
                <Input
                  id="ad-soyad"
                  value={form.adSoyad}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, adSoyad: e.target.value }))
                  }
                  placeholder="Ahmet Yılmaz"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={form.telefon}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, telefon: e.target.value }))
                  }
                  placeholder="+90 532 000 00 00"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="ornek@email.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth-date">Doğum Tarihi</Label>
                <Input
                  id="birth-date"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, birthDate: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="butce">Bütçe</Label>
                <Input
                  id="butce"
                  value={form.butce}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, butce: e.target.value }))
                  }
                  placeholder="5–8 M ₺"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mulk-tipi">Aranan Mülk Tipi</Label>
                <Input
                  id="mulk-tipi"
                  value={form.mulkTipi}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mulkTipi: e.target.value }))
                  }
                  placeholder="Konut, Arsa, Ticari…"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notlar">Notlar</Label>
                <textarea
                  id="notlar"
                  value={form.notlar}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notlar: e.target.value }))
                  }
                  rows={3}
                  placeholder="Portföy notları…"
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-parsel-bg/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-parsel-primary/30 focus-visible:outline-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSaving || !form.adSoyad.trim()}>
                {isSaving ? "Kaydediliyor…" : editingClient ? "Güncelle" : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
