"use client";

import { Loader2, Plus, Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createClientForFsboPromoteAction,
  listClientsForFsboPromoteAction,
  type FsboPromoteClientOption,
} from "@/app/actions/fsbo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

type FsboSendToDealsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: FsboLeadData | null;
  onPromote: (
    leadId: string,
    clientId: string,
  ) => Promise<{ success: boolean; error?: string; clientName?: string }>;
  onSuccess: (leadId: string) => void;
};

type DialogMode = "existing" | "new";

export function FsboSendToDealsDialog({
  open,
  onOpenChange,
  lead,
  onPromote,
  onSuccess,
}: FsboSendToDealsDialogProps) {
  const [clients, setClients] = useState<FsboPromoteClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<DialogMode>("existing");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  function resetDialogState() {
    setQuery("");
    setSelectedId(null);
    setMode("existing");
    setNewName("");
    setNewPhone("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetDialogState();
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (!open) return;

    async function loadClients() {
      setLoadingClients(true);
      try {
        const result = await listClientsForFsboPromoteAction();
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setClients(result.data);
      } finally {
        setLoadingClients(false);
      }
    }

    void loadClients();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.adSoyad.toLocaleLowerCase("tr-TR").includes(q) ||
        c.telefon?.includes(q) ||
        c.mulkTipi?.toLocaleLowerCase("tr-TR").includes(q) ||
        c.butce?.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [clients, query]);

  async function handleCreateClient() {
    const name = newName.trim();
    if (name.length < 2) {
      toast.error("Müşteri adı en az 2 karakter olmalıdır.");
      return;
    }

    setCreating(true);
    const result = await createClientForFsboPromoteAction({
      adSoyad: name,
      telefon: newPhone.trim() || undefined,
    });
    setCreating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setClients((current) =>
      [...current, result.data].sort((a, b) =>
        a.adSoyad.localeCompare(b.adSoyad, "tr-TR"),
      ),
    );
    setSelectedId(result.data.id);
    setMode("existing");
    setQuery(result.data.adSoyad);
    toast.success(`${result.data.adSoyad} müşteri listesine eklendi.`);
  }

  async function handleSend() {
    if (!lead || !selectedId) {
      toast.error("Lütfen bir müşteri seçin veya yeni müşteri oluşturun.");
      return;
    }

    setSending(true);
    const result = await onPromote(lead.id, selectedId);
    setSending(false);

    if (!result.success) {
      toast.error(result.error ?? "Gönderim başarısız.");
      return;
    }

    toast.success(
      `${result.clientName ?? "Müşteri"} için Potansiyel aşamasında fırsat açıldı.`,
    );
    onSuccess(lead.id);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-[#151f23] text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-outfit">
            <Plus className="size-4 text-[#b38c56]" />
            Fırsatlara Gönder
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {lead
              ? `"${lead.title}" ilanını gerçek bir müşteriye bağlayın. İlan başlığı müşteri olarak kaydedilmez.`
              : "İlan seçilmedi."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-xl border border-white/5 bg-[#09090b] p-1">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300",
              mode === "existing"
                ? "bg-[#151f23] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Search className="size-3.5" />
            Mevcut Müşteri
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300",
              mode === "new"
                ? "bg-[#151f23] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <UserPlus className="size-3.5" />
            Yeni Müşteri
          </button>
        </div>

        {mode === "existing" ? (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Müşteri ara (ad, telefon)..."
                className="h-10 w-full rounded-xl border border-white/5 bg-[#09090b] pl-10 pr-3 text-sm text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#b38c56]/35"
              />
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-[#09090b]">
              {loadingClients ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-5 animate-spin text-zinc-500" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-zinc-500">
                  Eşleşen müşteri bulunamadı. Yeni müşteri sekmesinden ekleyin.
                </p>
              ) : (
                <ul>
                  {filtered.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(client.id)}
                        className={cn(
                          "flex w-full flex-col gap-0.5 border-b border-white/5 px-3 py-2.5 text-left transition-all duration-300 last:border-b-0",
                          selectedId === client.id
                            ? "bg-[#b38c56]/10"
                            : "hover:bg-white/[0.03]",
                        )}
                      >
                        <span className="text-sm font-medium text-zinc-100">
                          {client.adSoyad}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {client.telefon ?? "Telefon yok"}
                          {client.butce ? ` · ${client.butce}` : ""}
                        </span>
                        {client.mulkTipi ? (
                          <span className="truncate text-[10px] text-zinc-600">
                            {client.mulkTipi}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3 rounded-xl border border-white/5 bg-[#09090b] p-4">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Ad Soyad
              </span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn. Murat Korkmaz"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#151f23] px-3 text-sm text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#b38c56]/35"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Telefon (isteğe bağlı)
              </span>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="h-10 w-full rounded-xl border border-white/5 bg-[#151f23] px-3 text-sm text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#b38c56]/35"
              />
            </label>
            <Button
              type="button"
              disabled={creating || newName.trim().length < 2}
              onClick={handleCreateClient}
              className="w-full border border-[#b38c56]/30 bg-[#b38c56]/10 text-[#e8d4b8] transition-all duration-300 hover:bg-[#b38c56]/20"
            >
              {creating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Kaydediliyor…
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Müşteriyi Kaydet ve Seç
                </>
              )}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="text-zinc-400"
          >
            İptal
          </Button>
          <Button
            type="button"
            disabled={sending || !selectedId || !lead}
            onClick={handleSend}
            className="border border-[#b38c56]/30 bg-[#b38c56]/10 text-[#e8d4b8] transition-all duration-300 hover:bg-[#b38c56]/20"
          >
            {sending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Gönderiliyor…
              </>
            ) : (
              "Gönder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
