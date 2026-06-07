export type PdfCustomer = {
  tc?: string | null;
  tcKimlikNo?: string | null;
  ad?: string | null;
  soyad?: string | null;
  adSoyad?: string | null;
  telefon?: string | null;
};

export type PdfProperty = {
  il?: string | null;
  ilce?: string | null;
  mahalle?: string | null;
  ada?: string | number | null;
  parsel?: string | number | null;
  fiyat?: string | number | null;
};

export type PdfCompanyInfo = {
  name?: string;
  consultantName?: string;
  consultantPhone?: string;
  address?: string;
  licenseNo?: string;
};

export type PdfTemplateBaseProps = {
  customer: PdfCustomer;
  property: PdfProperty;
  company?: PdfCompanyInfo;
  documentDate?: Date | string;
};

export function getCustomerFullName(customer: PdfCustomer) {
  const explicitName = customer.adSoyad?.trim();
  if (explicitName) return explicitName;

  return [customer.ad, customer.soyad].filter(Boolean).join(" ").trim() || "-";
}

export function getCustomerTc(customer: PdfCustomer) {
  return customer.tcKimlikNo?.trim() || customer.tc?.trim() || "-";
}

export function formatDocumentDate(value?: Date | string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatMoney(value: PdfProperty["fiyat"]) {
  if (value === null || value === undefined || value === "") return "-";

  const numberValue =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function valueOrDash(value: string | number | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized || "-";
}
