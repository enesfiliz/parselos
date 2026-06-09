import "server-only";

import { validateLicenseNumberFormat } from "@/lib/account/license-verification";
import { TTBS_OFFICIAL_VERIFY_URL } from "@/lib/account/ttbs-constants";

export { TTBS_OFFICIAL_VERIFY_URL };

export type TtbsVerifyInput = {
  licenseNumber: string;
  businessName?: string | null;
  city?: string | null;
};

export type TtbsVerifyResult =
  | {
      ok: true;
      source: "TTBS" | "DEV_BYPASS";
      businessName?: string;
      message: string;
    }
  | {
      ok: false;
      status: "PENDING" | "REJECTED";
      source: "TTBS" | "FORMAT";
      message: string;
      officialUrl: string;
    };

/**
 * T.C. Ticaret Bakanlığı TTBS üzerinden yetki belgesi doğrulama.
 *
 * Resmi durum: ttbs.gtb.gov.tr kamuya açık sorgu sayfası CAPTCHA kullanır;
 * Bakanlığın üçüncü taraflara açık bir REST API'si yoktur. EİDS entegrasyonu
 * e-Devlet üzerinden ayrı bir kanaldır.
 *
 * ParselOS stratejisi:
 * 1. Format + işletme adı/il tutarlılığı kontrolü
 * 2. Mümkünse TTBS HTML sorgusu (CAPTCHA engelinde manuel kuyruk)
 * 3. PENDING → operasyon ekibi / gelecekte TTBS iş ortaklığı ile onay
 */
export async function verifyLicenseWithTtbs(
  input: TtbsVerifyInput,
): Promise<TtbsVerifyResult> {
  const format = validateLicenseNumberFormat(input.licenseNumber);
  if (!format.valid) {
    return {
      ok: false,
      status: "REJECTED",
      source: "FORMAT",
      message: format.reason ?? "Geçersiz yetki numarası.",
      officialUrl: TTBS_OFFICIAL_VERIFY_URL,
    };
  }

  const normalized = format.normalized ?? input.licenseNumber.trim().toUpperCase();

  if (process.env.TTBS_DEV_AUTO_VERIFY === "1") {
    return {
      ok: true,
      source: "DEV_BYPASS",
      businessName: input.businessName ?? undefined,
      message: "Geliştirme modu: yetki belgesi otomatik onaylandı.",
    };
  }

  const remote = await attemptTtbsHtmlLookup(normalized, input);
  if (remote.matched) {
    return {
      ok: true,
      source: "TTBS",
      businessName: remote.businessName,
      message: "Yetki belgeniz TTBS kayıtlarıyla eşleşti.",
    };
  }

  return {
    ok: false,
    status: "PENDING",
    source: "TTBS",
    message:
      "Belge TTBS üzerinden otomatik doğrulanamadı (CAPTCHA koruması). Kaydınız inceleme kuyruğuna alındı; 1 iş günü içinde sonuçlanır. Resmi sorgu: ttbs.gtb.gov.tr",
    officialUrl: TTBS_OFFICIAL_VERIFY_URL,
  };
}

async function attemptTtbsHtmlLookup(
  licenseNumber: string,
  input: TtbsVerifyInput,
): Promise<{ matched: boolean; businessName?: string }> {
  try {
    const response = await fetch(TTBS_OFFICIAL_VERIFY_URL, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "tr-TR,tr;q=0.9",
        "User-Agent":
          "ParselOS-LicenseVerifier/1.0 (+https://parselos.com; compliance-check)",
      },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return { matched: false };
    }

    const html = await response.text();
    if (/captcha|CaptchaImage/i.test(html)) {
      return { matched: false };
    }

    const normalized = licenseNumber.replace(/\s+/g, "");
    if (!html.includes(normalized)) {
      return { matched: false };
    }

    const businessHint = input.businessName?.trim();
    if (businessHint && businessHint.length > 3) {
      const fragment = businessHint.slice(0, Math.min(12, businessHint.length));
      if (!html.toLowerCase().includes(fragment.toLowerCase())) {
        return { matched: false };
      }
    }

    return { matched: true, businessName: businessHint ?? undefined };
  } catch {
    return { matched: false };
  }
}
