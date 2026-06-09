# ParselOS Scraper Bot

Sahibinden arama sayfalarını **kendi VPS'inizde** Puppeteer Stealth ile tarar ve ilanları ParselOS `POST /api/bot-sync` uç noktasına gönderir.

> ParselOS sunucusu (Vercel) Sahibinden'e doğrudan bağlanmaz. Bot sizin altyapınızda çalışır; kullanım şartları riski VPS operatöründedir.

## Hızlı başlangıç (lokal)

Proje kökünden:

```bash
npm run fsbo:bot:setup    # .env + npm install
npm run dev               # ParselOS localhost:3000
npm run fsbo:bot:once     # tek seferlik tarama
```

`scraper-bot/.env` içinde `BOT_SECRET_KEY`, ParselOS `.env.local` ile **aynı** olmalı.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `PARSELOS_API_URL` | Evet | `https://parselos.com/api/bot-sync` veya lokal |
| `BOT_SECRET_KEY` | Evet | ParselOS `BOT_SECRET_KEY` ile eşleşmeli |
| `CRON_SCHEDULE` | Hayır | Varsayılan `0 8 * * *` (08:00) |
| `CRON_TIMEZONE` | Hayır | Varsayılan `Europe/Istanbul` |
| `MAX_LISTINGS_PER_TARGET` | Hayır | Hedef başına max ilan (12) |
| `MIN_DELAY_MS` / `MAX_DELAY_MS` | Hayır | İnsan benzeri gecikme |
| `HEADLESS` | Hayır | `false` = debug için görünür Chrome |
| `TARGETS_PATH` | Hayır | `./targets.json` |
| `RUN_ON_START` | Hayır | `1` = daemon başlarken hemen tara |

## targets.json

```json
[
  {
    "region": "Gölcük",
    "il": "Kocaeli",
    "ilce": "Gölcük",
    "source": "sahibinden",
    "islemTipi": "SATILIK",
    "kategori": "KONUT",
    "searchUrl": "https://www.sahibinden.com/satilik/konut/kocaeli-golcuk"
  }
]
```

Tüm alanlar zorunlu; eksik satırlar sessizce atlanır.

## VPS kurulumu (Ubuntu 22.04+)

```bash
# Sistem bağımlılıkları (Chromium)
sudo apt update
sudo apt install -y chromium-browser fonts-liberation libnss3 libatk-bridge2.0-0 \
  libdrm2 libxkbcommon0 libgbm1 ca-certificates

# Projeyi kopyala
git clone <repo> /opt/parselos
cd /opt/parselos/scraper-bot
cp .env.example .env
# .env düzenle: PARSELOS_API_URL, BOT_SECRET_KEY

npm install
node index.js --run-now   # smoke test

# PM2 ile sürekli çalıştır
npm install -g pm2
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm start` | Cron daemon (sürekli) |
| `npm run scrape:once` | Tek tarama + çık |
| `node index.js --run-now` | Aynı |

## API yanıtı

Başarılı gönderimde ParselOS döner:

```json
{ "success": true, "inserted": 3, "updated": 1, "skipped": 0, "total": 4 }
```

Loglarda `inserted/updated` sayılarına bakın; sadece ayıklanan ilan sayısı değil.

## Sorun giderme

| Belirti | Çözüm |
|---------|--------|
| `401 Yetkisiz` | `BOT_SECRET_KEY` eşleşmiyor |
| `Anti-bot engeli` | CAPTCHA; gecikmeyi artırın veya proxy deneyin |
| `0 inserted` | Fiyat/title parse edilemedi; selectors güncel mi kontrol edin |
| Chromium crash | RAM ≥ 2 GB; `--disable-dev-shm-usage` zaten aktif |

## Alternatif: manuel içe aktarma

FSBO Radarı → **İlan Linki Ekle** (ParselOS UI). Bot olmadan tek tek link yapıştırma.
