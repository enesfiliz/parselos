"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import {
  WHATSAPP_TEMPLATES,
  buildTemplateWhatsAppUrl,
  type WhatsAppTemplateId,
} from "@/lib/deals/whatsapp-templates";
import type { DealCardData } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

type DealWhatsAppTemplatesProps = {
  deal: DealCardData;
};

export function DealWhatsAppTemplates({ deal }: DealWhatsAppTemplatesProps) {
  function openTemplate(templateId: WhatsAppTemplateId) {
    const url = buildTemplateWhatsAppUrl(deal, templateId);

    if (!url) {
      toast.error("Müşteri telefon numarası bulunamadı.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-4 text-[#b38c56]" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Hızlı İletişim & WhatsApp
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#151f23] p-3">
        <p className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          Akıllı Mesaj Şablonları
        </p>

        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] [scrollbar-color:#b38c56_#151f23]">
          {WHATSAPP_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => openTemplate(template.id)}
              className={cn(
                "group flex min-w-[168px] max-w-[200px] shrink-0 flex-col gap-2 rounded-lg border border-[#b38c56]/30 bg-[#151f23] p-3 text-left transition-colors",
                "hover:border-[#b38c56]/50 hover:bg-[#1a262b] hover:shadow-[0_0_20px_rgba(179,140,86,0.08)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38c56]/40",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#b38c56]/25 bg-[#b38c56]/10">
                  <MessageCircle
                    className="size-3.5 text-[#b38c56]"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="text-xs font-semibold text-zinc-100">
                  {template.label}
                </span>
              </div>
              <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                {template.preview}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
