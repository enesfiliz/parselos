/**
 * Lokal FSBO test verisi — bot-sync endpoint'ine örnek ilan gönderir.
 * Kullanım: npm run fsbo:seed
 * Önkoşul: npm run dev çalışıyor olmalı.
 */

const API_URL =
  process.env.PARSELOS_API_URL?.trim() ||
  `${process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000"}/api/bot-sync`;
const SECRET = process.env.BOT_SECRET_KEY?.trim();

if (!SECRET) {
  console.error("BOT_SECRET_KEY .env.local içinde tanımlı değil.");
  process.exit(1);
}

const stamp = Date.now();

const payload = {
  source: "parselos-local-seed",
  syncedAt: new Date().toISOString(),
  listings: [
    {
      title: "Gölcükte Deniz Manzaralı 3+1 Müstakil Villa",
      price: 5_500_000,
      url: `https://www.sahibinden.com/ilan/emlak-konut-satilik-local-${stamp}-1`,
      source: "sahibinden",
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      ],
      specs: { m2: 165, odaSayisi: "3+1", binaYasi: "6" },
      region: "Kocaeli/Gölcük",
      il: "Kocaeli",
      ilce: "Gölcük",
      location: "Uğurtepe, Gölcük, Kocaeli",
      metrekare: 165,
      odaSayisi: "3+1",
      islemTipi: "SATILIK",
      kategori: "KONUT",
    },
    {
      title: "Başiskele Yeniköy Havuzlu 5+2 Villa",
      price: 8_200_000,
      url: `https://www.sahibinden.com/ilan/emlak-konut-satilik-local-${stamp}-2`,
      source: "sahibinden",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      ],
      specs: { m2: 280, odaSayisi: "5+2" },
      region: "Kocaeli/Başiskele",
      il: "Kocaeli",
      ilce: "Başiskele",
      location: "Yeniköy, Başiskele, Kocaeli",
      metrekare: 280,
      odaSayisi: "5+2",
      islemTipi: "SATILIK",
      kategori: "KONUT",
    },
  ],
};

console.log(`POST ${API_URL}`);

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-bot-secret": SECRET,
    Authorization: `Bearer ${SECRET}`,
  },
  body: JSON.stringify(payload),
});

const json = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error("Seed başarısız:", response.status, json);
  process.exit(1);
}

console.log("Seed başarılı:", json);
console.log("→ http://localhost:3000/fsbo-radar sayfasını yenileyin.");
