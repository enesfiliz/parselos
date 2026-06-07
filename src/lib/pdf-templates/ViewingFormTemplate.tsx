import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  formatDocumentDate,
  formatMoney,
  getCustomerFullName,
  getCustomerTc,
  type PdfTemplateBaseProps,
  valueOrDash,
} from "./pdfTypes";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#b38c56",
    paddingBottom: 14,
    marginBottom: 22,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoBox: {
    borderWidth: 1,
    borderColor: "#b38c56",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: "#151f23",
    letterSpacing: 1.2,
  },
  companyMeta: {
    textAlign: "right",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  title: {
    marginTop: 22,
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    color: "#151f23",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 9,
    textAlign: "center",
    color: "#6b7280",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#151f23",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  grid: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cellLabel: {
    width: "28%",
    padding: 8,
    backgroundColor: "#f8fafc",
    color: "#4b5563",
    fontWeight: 700,
  },
  cellValue: {
    width: "72%",
    padding: 8,
    color: "#111827",
  },
  legalText: {
    marginTop: 18,
    lineHeight: 1.65,
    textAlign: "justify",
    color: "#1f2937",
  },
  clause: {
    marginTop: 8,
    lineHeight: 1.55,
    color: "#374151",
  },
  warningBox: {
    marginTop: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
    lineHeight: 1.45,
  },
  signatureRow: {
    marginTop: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  signatureBox: {
    width: "46%",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 8,
    textAlign: "center",
    fontWeight: 700,
  },
  signatureHint: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
});

export type ViewingFormTemplateProps = PdfTemplateBaseProps & {
  viewingDate?: Date | string;
};

export function ViewingFormTemplate({
  customer,
  property,
  company,
  documentDate,
  viewingDate,
}: ViewingFormTemplateProps) {
  const companyName = company?.name ?? "ParselOS / Gozimy Emlak";
  const consultantName = company?.consultantName ?? "-";
  const effectiveDate = formatDocumentDate(viewingDate ?? documentDate);

  return (
    <Document title="Yer Gösterme Formu">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>{companyName}</Text>
            </View>
            <View>
              <Text style={styles.companyMeta}>Belge Tarihi: {formatDocumentDate(documentDate)}</Text>
              <Text style={styles.companyMeta}>Danışman: {consultantName}</Text>
              <Text style={styles.companyMeta}>Lisans / Yetki No: {company?.licenseNo ?? "-"}</Text>
            </View>
          </View>
          <Text style={styles.title}>YER GÖSTERME FORMU</Text>
          <Text style={styles.subtitle}>
            Gayrimenkul gösterim, bilgilendirme ve hizmet teyit tutanağı
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Ad Soyad</Text>
              <Text style={styles.cellValue}>{getCustomerFullName(customer)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>T.C. Kimlik No</Text>
              <Text style={styles.cellValue}>{getCustomerTc(customer)}</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.cellLabel}>Telefon</Text>
              <Text style={styles.cellValue}>{valueOrDash(customer.telefon)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taşınmaz Bilgileri</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Konum</Text>
              <Text style={styles.cellValue}>
                {valueOrDash(property.il)} / {valueOrDash(property.ilce)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Ada / Parsel</Text>
              <Text style={styles.cellValue}>
                {valueOrDash(property.ada)} / {valueOrDash(property.parsel)}
              </Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.cellLabel}>Talep Edilen Bedel</Text>
              <Text style={styles.cellValue}>{formatMoney(property.fiyat)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.legalText}>
          Yukarıda bilgileri verilen taşınmazı {effectiveDate} tarihinde, emlak
          danışmanı aracılığıyla bizzat görerek gezdim. Taşınmazın konumu,
          genel nitelikleri, satış/kiralama koşulları ve talep edilen bedel
          hakkında tarafıma bilgi verilmiştir.
        </Text>
        <Text style={styles.clause}>
          Müşteri, bu formda belirtilen taşınmazla ilgili doğrudan veya dolaylı
          alım, kiralama ya da pazarlık sürecine girmesi halinde, hizmetin
          emlak danışmanı tarafından sağlandığını kabul eder.
        </Text>
        <Text style={styles.clause}>
          Bu belge, yer gösterme hizmetinin verildiğini ve müşterinin taşınmazı
          görerek bilgi aldığını ispat amacıyla düzenlenmiştir. Resmi tapu,
          takyidat, imar durumu ve hukuki kontroller ayrıca yapılmalıdır.
        </Text>

        <View style={styles.warningBox}>
          <Text>
            Not: Bu form tek başına satış vaadi, kapora sözleşmesi veya devir
            taahhüdü niteliğinde değildir. Tarafların yazılı mutabakatı ve
            yürürlükteki mevzuat hükümleri saklıdır.
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Danışman İmzası</Text>
            <Text style={styles.signatureHint}>{consultantName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Müşteri İmzası</Text>
            <Text style={styles.signatureHint}>{getCustomerFullName(customer)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {companyName} · Kurumsal gayrimenkul operasyon dokümanı
        </Text>
      </Page>
    </Document>
  );
}
