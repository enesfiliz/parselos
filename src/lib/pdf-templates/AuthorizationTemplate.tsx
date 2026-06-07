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
  topBand: {
    height: 6,
    backgroundColor: "#151f23",
    marginBottom: 14,
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
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 4,
    backgroundColor: "#151f23",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoInitial: {
    color: "#b38c56",
    fontSize: 16,
    fontWeight: 700,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#151f23",
    letterSpacing: 1.1,
  },
  brandSub: {
    marginTop: 2,
    fontSize: 8,
    color: "#6b7280",
  },
  meta: {
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
  label: {
    width: "30%",
    padding: 8,
    backgroundColor: "#f8fafc",
    color: "#4b5563",
    fontWeight: 700,
  },
  value: {
    width: "70%",
    padding: 8,
    color: "#111827",
  },
  legalText: {
    marginTop: 18,
    lineHeight: 1.65,
    textAlign: "justify",
    color: "#1f2937",
  },
  clauseList: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clause: {
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    lineHeight: 1.45,
    color: "#374151",
  },
  clauseLast: {
    borderBottomWidth: 0,
  },
  highlight: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#b38c56",
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

export type AuthorizationTemplateProps = PdfTemplateBaseProps & {
  authorizationStartDate?: Date | string;
  authorizationEndDate?: Date | string;
  commissionRateText?: string;
};

export function AuthorizationTemplate({
  customer,
  property,
  company,
  documentDate,
  authorizationStartDate,
  authorizationEndDate,
  commissionRateText = "Taraflar arasında ayrıca yazılı olarak kararlaştırılacaktır.",
}: AuthorizationTemplateProps) {
  const companyName = company?.name ?? "ParselOS / Gozimy Emlak";
  const consultantName = company?.consultantName ?? "-";
  const startDate = formatDocumentDate(authorizationStartDate ?? documentDate);
  const endDate = authorizationEndDate
    ? formatDocumentDate(authorizationEndDate)
    : "Aksi yazılı olarak kararlaştırılmadıkça 90 gün";

  return (
    <Document title="Yetki Belgesi">
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand} />

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBlock}>
              <View style={styles.logoMark}>
                <Text style={styles.logoInitial}>P</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{companyName}</Text>
                <Text style={styles.brandSub}>Kurumsal gayrimenkul yetkilendirme dokümanı</Text>
              </View>
            </View>
            <View>
              <Text style={styles.meta}>Belge Tarihi: {formatDocumentDate(documentDate)}</Text>
              <Text style={styles.meta}>Danışman: {consultantName}</Text>
              <Text style={styles.meta}>Lisans / Yetki No: {company?.licenseNo ?? "-"}</Text>
            </View>
          </View>
          <Text style={styles.title}>TAŞINMAZ PAZARLAMA YETKİ BELGESİ</Text>
          <Text style={styles.subtitle}>
            Satış / kiralama pazarlaması ve aracılık hizmeti yetkilendirmesi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yetki Veren Müşteri / Malik Bilgileri</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <Text style={styles.label}>Ad Soyad</Text>
              <Text style={styles.value}>{getCustomerFullName(customer)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>T.C. Kimlik No</Text>
              <Text style={styles.value}>{getCustomerTc(customer)}</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>{valueOrDash(customer.telefon)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yetkiye Konu Taşınmaz</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <Text style={styles.label}>İl / İlçe</Text>
              <Text style={styles.value}>
                {valueOrDash(property.il)} / {valueOrDash(property.ilce)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ada / Parsel</Text>
              <Text style={styles.value}>
                {valueOrDash(property.ada)} / {valueOrDash(property.parsel)}
              </Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>Pazarlama Bedeli</Text>
              <Text style={styles.value}>{formatMoney(property.fiyat)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.legalText}>
          Yetki veren, yukarıda bilgileri yer alan taşınmazın satış veya kiralama
          amacıyla pazarlanması, potansiyel alıcılara/kiracılara sunulması,
          portföy çalışmalarının yürütülmesi ve görüşmelerin organize edilmesi
          hususunda {companyName} ve görevlendirdiği danışmanı yetkilendirdiğini
          kabul ve beyan eder.
        </Text>

        <View style={styles.clauseList}>
          <Text style={styles.clause}>
            1. Yetki başlangıç tarihi {startDate} olup yetki süresi {endDate}
            olarak kabul edilir.
          </Text>
          <Text style={styles.clause}>
            2. Danışman, taşınmazın tanıtımı, ilan çalışmaları, müşteri
            görüşmeleri, yer gösterme organizasyonu ve teklif takibi konularında
            profesyonel aracılık hizmeti sunar.
          </Text>
          <Text style={styles.clause}>
            3. Taşınmazın tapu kaydı, takyidat durumu, imar durumu, hisse yapısı
            ve fiili kullanımına ilişkin resmi kontrollerin işlem öncesinde
            ayrıca yapılması gerektiği taraflarca bilinir.
          </Text>
          <Text style={[styles.clause, styles.clauseLast]}>
            4. Hizmet bedeli / komisyon oranı: {commissionRateText}
          </Text>
        </View>

        <View style={styles.highlight}>
          <Text>
            Bu yetki belgesi, ilgili taşınmazın pazarlanmasına yönelik aracılık
            faaliyetinin yazılı dayanağıdır. Mülkiyet devri veya satış vaadi
            sonucunu tek başına doğurmaz; resmi işlemler yürürlükteki mevzuata
            göre ayrıca tesis edilir.
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
          {companyName} · Yetki belgesi, tarafların imzası ile geçerlilik kazanır.
        </Text>
      </Page>
    </Document>
  );
}
