import type { LicenseVerificationStatus } from "@/lib/account/types";
import type { TtbsVerifyResult } from "@/lib/account/ttbs-client";

/** TTYB / TTBS yetki belgesi — temel format doğrulaması */
export function validateLicenseNumberFormat(licenseNumber: string) {
  const normalized = licenseNumber.trim().replace(/\s+/g, "").toUpperCase();
  if (normalized.length < 5 || normalized.length > 20) {
    return { valid: false as const, reason: "Yetki numarası 5–20 karakter olmalıdır." };
  }
  if (!/^[A-Z0-9][A-Z0-9\-/]*[A-Z0-9]$|^\d{5,12}$/.test(normalized)) {
    return {
      valid: false as const,
      reason: "Geçersiz format. Sadece harf, rakam, tire veya slash kullanın.",
    };
  }
  return { valid: true as const, normalized };
}

export function licenseStatusLabel(status: LicenseVerificationStatus) {
  switch (status) {
    case "NONE":
      return "Henüz gönderilmedi";
    case "PENDING":
      return "Onay bekliyor";
    case "VERIFIED":
      return "Onaylandı";
    case "REJECTED":
      return "Reddedildi";
  }
}

export function mapTtbsResultToLicenseStatus(result: TtbsVerifyResult): {
  status: LicenseVerificationStatus;
  rejectReason?: string;
  registryMeta: Record<string, unknown>;
} {
  if (result.ok) {
    return {
      status: "VERIFIED",
      registryMeta: {
        source: result.source,
        businessName: result.businessName ?? null,
        verifiedAt: new Date().toISOString(),
      },
    };
  }

  if (result.status === "REJECTED") {
    return {
      status: "REJECTED",
      rejectReason: result.message,
      registryMeta: {
        source: result.source,
        rejectedAt: new Date().toISOString(),
      },
    };
  }

  return {
    status: "PENDING",
    registryMeta: {
      source: result.source,
      officialUrl: result.officialUrl,
      queuedAt: new Date().toISOString(),
      message: result.message,
    },
  };
}
