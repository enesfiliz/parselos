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
        <MessageCircle className="size-4 text-parsel-gold" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground0">
          Hızlı İletişim & WhatsApp
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-parsel-panel p-3">
        <p className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Akıllı Mesaj Şablonları
        </p>

        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] [scrollbar-color:#b38c56_#151f23]">
          {WHATSAPP_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => openTemplate(template.id)}
              className={cn(
                "group flex min-w-[168px] max-w-[200px] shrink-0 flex-col gap-2 rounded-lg border border-[#b38c56]/30 bg-parsel-panel p-3 text-left transition-colors",
                "hover:border-parsel-gold/50 hover:bg-[#1a262b] hover:shadow-[0_0_20px_rgba(179,140,86,0.08)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38c56]/40",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#b38c56]/25 bg-parsel-gold/10">
                  <MessageCircle
                    className="size-3.5 text-parsel-gold"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {template.label}
                </span>
              </div>
              <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground0 transition-colors group-hover:text-muted-foreground">
                {template.preview}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
