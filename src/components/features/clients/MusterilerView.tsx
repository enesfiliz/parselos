"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/lib/types/client";

interface ClientFormState {
  adSoyad: string;
  telefon: string;
  email: string;
  notlar: string;
}

const emptyForm: ClientFormState = {
  adSoyad: "",
  telefon: "",
  email: "",
  notlar: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function MusterilerView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/clients");
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Müşteriler yüklenemedi.";
        throw new Error(message);
      }

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ) {
        setClients(payload.data as Client[]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Müşteriler yüklenemedi.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

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
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const body = {
        adSoyad: form.adSoyad.trim(),
        telefon: form.telefon.trim() || undefined,
        email: form.email.trim() || undefined,
        notlar: form.notlar.trim() || undefined,
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
        const apiError =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "İşlem başarısız oldu.";

        const apiDetails =
          payload &&
          typeof payload === "object" &&
          "details" in payload &&
          typeof payload.details === "string"
            ? payload.details
            : null;

        toast.error("Kayıt başarısız", {
          description: apiDetails ? `${apiError}: ${apiDetails}` : apiError,
        });
        return;
      }

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        payload.data
      ) {
        const saved = payload.data as Client;

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
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Müşteri silinemedi.";
        throw new Error(message);
      }

      setClients((prev) => prev.filter((item) => item.id !== client.id));
      toast.success("Müşteri silindi");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Müşteri silinemedi.";
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Portföy Vitrini
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Müşteriler</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Müşteri portföyünüzü yönetin, yeni kayıtlar ekleyin ve iletişim
            bilgilerine tek ekrandan ulaşın.
          </p>
        </header>

        <Button className="h-10 px-5" onClick={openCreateDialog}>
          Yeni Müşteri Ekle
        </Button>
      </div>

      <Card className="border-border/60 shadow-lg ring-border/60">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="text-base font-medium">Müşteri Listesi</CardTitle>
          <CardDescription>
            {isLoading
              ? "Kayıtlar yükleniyor…"
              : `${clients.length} kayıtlı müşteri`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Eklenme Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Yükleniyor…
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Henüz müşteri kaydı yok. Sağ üstten yeni müşteri ekleyebilirsiniz.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-neutral-900">
                      {client.adSoyad}
                    </TableCell>
                    <TableCell>{client.telefon || "—"}</TableCell>
                    <TableCell>{client.email || "—"}</TableCell>
                    <TableCell>{formatDate(client.olusturulmaTarihi)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditDialog(client)}
                          aria-label="Düzenle"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void handleDelete(client)}
                          aria-label="Sil"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={(event) => void handleSubmit(event)}>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}
              </DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini girin. Zorunlu alan yalnızca ad soyaddır.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
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
                <Label htmlFor="notlar">Notlar</Label>
                <textarea
                  id="notlar"
                  value={form.notlar}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notlar: e.target.value }))
                  }
                  rows={3}
                  placeholder="Portföy notları…"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
