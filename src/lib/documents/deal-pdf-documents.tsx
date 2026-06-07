import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { DealCardData } from "@/lib/types/deal";
import { formatPortfolioRef } from "@/lib/types/deal";

export type DealDocumentType = "yetki-belgesi" | "yer-gosterme";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#18181b",
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#b38c56",
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#b38c56",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#09090b",
  },
  subtitle: {
    fontSize: 10,
    color: "#71717a",
    marginTop: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#547236",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 130,
    color: "#71717a",
    fontSize: 10,
  },
  value: {
    flex: 1,
    color: "#18181b",
    fontSize: 10,
  },
  paragraph: {
    fontSize: 10,
    color: "#3f3f46",
    marginBottom: 8,
    textAlign: "justify",
  },
  signatureBlock: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d8",
    paddingTop: 8,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#71717a",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#a1a1aa",
  },
});

function formatDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(value: string | null) {
  if (!value) return "Belirtilmedi";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(num);
}

function propertyAddress(deal: DealCardData) {
  return [deal.property.mahalle, deal.property.ilce, deal.property.il]
    .filter(Boolean)
    .join(", ");
}

function DealPdfFooter({ deal }: { deal: DealCardData }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>ParselOS · Otonom Evrak Üretimi</Text>
      <Text style={styles.footerText}>Ref: {deal.id.slice(0, 8).toUpperCase()}</Text>
      <Text style={styles.footerText}>{formatDate()}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function YetkiBelgesiDocument({ deal }: { deal: DealCardData }) {
  return (
    <Document title={`Yetki Belgesi — ${deal.client.adSoyad}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>ParselOS Gayrimenkul</Text>
          <Text style={styles.title}>YETKİ BELGESİ</Text>
          <Text style={styles.subtitle}>
            Taşınmaz satış / kiralama yetkilendirme belgesi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mülk Sahibi / Yetkili</Text>
          <InfoRow label="Ad Soyad" value={deal.client.adSoyad} />
          <InfoRow label="Telefon" value={deal.client.telefon ?? "—"} />
          <InfoRow label="Bütçe / Beklenti" value={deal.client.butce ?? "—"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taşınmaz Bilgileri</Text>
          <InfoRow label="İlan Başlığı" value={deal.property.ilanBasligi} />
          <InfoRow label="Konum" value={propertyAddress(deal)} />
          <InfoRow label="Parsel Ref." value={formatPortfolioRef(deal.property)} />
          <InfoRow label="Fiyat" value={formatPrice(deal.property.fiyat)} />
          <InfoRow
            label="Durum"
            value={deal.property.durum === "KIRALIK" ? "Kiralık" : "Satılık"}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yetki Kapsamı</Text>
          <Text style={styles.paragraph}>
            Yukarıda bilgileri yer alan taşınmazın pazarlama, tanıtım, yer
            gösterme ve teklif toplama süreçlerinde ParselOS yetkili temsilcisi
            aracılığıyla işlem yapılmasına mülk sahibi tarafından muvafakat
            edilmiştir.
          </Text>
          <Text style={styles.paragraph}>
            İşbu belge {formatDate()} tarihinde düzenlenmiş olup, tarafların
            imzası ile yürürlüğe girer. Yetki süresi imza tarihinden itibaren 90
            (doksan) gün olarak kabul edilir.
          </Text>
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Mülk Sahibi İmza</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>ParselOS Yetkili İmza</Text>
          </View>
        </View>

        <DealPdfFooter deal={deal} />
      </Page>
    </Document>
  );
}

export function YerGostermeFormuDocument({ deal }: { deal: DealCardData }) {
  return (
    <Document title={`Yer Gösterme Formu — ${deal.client.adSoyad}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>ParselOS Gayrimenkul</Text>
          <Text style={styles.title}>YER GÖSTERME FORMU</Text>
          <Text style={styles.subtitle}>
            Taşınmaz yer gösterme ve bilgilendirme tutanağı
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <InfoRow label="Ad Soyad" value={deal.client.adSoyad} />
          <InfoRow label="Telefon" value={deal.client.telefon ?? "—"} />
          <InfoRow label="Arayış" value={deal.client.mulkTipi ?? deal.client.butce ?? "—"} />
          <InfoRow label="Kaynak" value={deal.client.kaynak ?? "—"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gösterilen Taşınmaz</Text>
          <InfoRow label="İlan Başlığı" value={deal.property.ilanBasligi} />
          <InfoRow label="Adres" value={propertyAddress(deal)} />
          <InfoRow label="Ada / Parsel" value={formatPortfolioRef(deal.property)} />
          <InfoRow
            label="Özellikler"
            value={
              [
                deal.property.odaSayisi,
                deal.property.metrekare ? `${deal.property.metrekare} m²` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"
            }
          />
          <InfoRow label="Liste Fiyatı" value={formatPrice(deal.property.fiyat)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gösterim Kaydı</Text>
          <InfoRow label="Gösterim Tarihi" value={formatDate()} />
          <InfoRow label="Gösterim Saati" value={new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date())} />
          <Text style={styles.paragraph}>
            Müşteri, yukarıda tanımlı taşınmazı gezmiş, bilgilendirilmiş ve
            gösterim koşullarını kabul ettiğini beyan eder. Müşteri, bu
            gösterimden kaynaklanan işlem gerçekleşmesi halinde aracılık
            hizmet bedelinin ödeneceğini kabul eder.
          </Text>
          {deal.notlar ? (
            <Text style={styles.paragraph}>Not: {deal.notlar}</Text>
          ) : null}
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Müşteri İmza</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Gösterimi Yapan Temsilci</Text>
          </View>
        </View>

        <DealPdfFooter deal={deal} />
      </Page>
    </Document>
  );
}

export function getDealPdfDocument(
  type: DealDocumentType,
  deal: DealCardData,
) {
  if (type === "yetki-belgesi") {
    return <YetkiBelgesiDocument deal={deal} />;
  }
  return <YerGostermeFormuDocument deal={deal} />;
}

export const DEAL_DOCUMENT_META: Record<
  DealDocumentType,
  { title: string; filename: string }
> = {
  "yetki-belgesi": {
    title: "Yetki Belgesi",
    filename: "yetki-belgesi",
  },
  "yer-gosterme": {
    title: "Yer Gösterme Formu",
    filename: "yer-gosterme-formu",
  },
};
