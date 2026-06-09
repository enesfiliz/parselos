import Link from "next/link";

import { SITE_LEGAL } from "@/lib/legal/site-info";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  title: string;
  description: string;
  sections: LegalSection[];
  updatedAt?: string;
};

export function LegalDocument({
  title,
  description,
  sections,
  updatedAt = "31 Mayıs 2026",
}: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-10 border-b border-border/50 pb-8">
        <p className="parsel-section-label mb-2 text-parsel-gold">Yasal</p>
        <h1 className="parsel-page-title text-foreground">{title}</h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Son güncelleme: {updatedAt} · {SITE_LEGAL.operator}
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 font-outfit text-lg font-bold text-foreground">
              {section.title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 rounded-xl border border-border/50 bg-parsel-panel p-5 text-sm text-muted-foreground">
        <p>
          Sorularınız için{" "}
          <a href={`mailto:${SITE_LEGAL.email}`} className="text-parsel-gold hover:underline">
            {SITE_LEGAL.email}
          </a>
          {" · "}
          <Link href="/" className="text-parsel-gold hover:underline">
            Ana sayfa
          </Link>
        </p>
      </footer>
    </article>
  );
}
