# ParselOS UI Style Guide

> **Durum:** Hazırlık dokümanı — refactor öncesi hedef standart.  
> **Kapsam:** Landing, dashboard panel ve admin arayüz dili. Backend/auth/API dokunulmaz.  
> **Son inceleme:** Mevcut `globals.css` token’ları, `DashboardShell`, `SidebarNav`, `Header`, `AdminShell`, `CommandCenterView`, `HeroShowcase` / `LandingPage`.

---

## 1. ParselOS ürün hissi

ParselOS bir **premium gayrimenkul operasyon CRM’i**dir — Sahibinden tarzı ilan sitesi değil, generic mavi SaaS dashboard’u da değil.

Kullanıcı hissetmeli:

- **Profesyonel ofis yazılımı** — danışman, broker ve ofis yöneticisi günlük işini burada yürütür.
- **Saha + veri** — parsel, imar, portföy, fırsat ve müşteri tek akışta.
- **Güven ve netlik** — yoğun bilgi düzenli kartlarda; göz yormayan nötr zemin.
- **Sektöre özgü** — hafif kadastro/grid dokusu, toprak-yeşili ve sıcak altın vurgular; abartılı animasyon yok.

**Üç yüzey, tek dil:**

| Yüzey | Rol | Ton |
|-------|-----|-----|
| **Marketing (Landing)** | Güven + dönüşüm | Aynı renk ailesi; biraz daha geniş boşluk ve hero anlatımı |
| **Panel (Dashboard)** | Günlük operasyon | Açık gri zemin, büyük kartlar, okunaklı tablolar |
| **Admin (Founder Console)** | İç operasyon | Panel ile aynı iskelet; daha sıkı bilgi yoğunluğu, muted sage vurgu (ayrı “neon yeşil” estetiğinden kaçın) |

---

## 2. Renk dili

### 2.1 Hedef palet (birincil yön)

Panel ve landing **light-first** düşünülür. Koyu mod desteklenir ama ürün kimliği açık, sıcak nötr zemin üzerine kurulur.

| Token / kullanım | Light hedef | Anlam |
|------------------|-------------|--------|
| **Canvas** `--parsel-canvas` | `#F3F3F0` → `#F5F4F1` | Sıcak açık gri zemin |
| **Panel / Card** `--parsel-panel` | `#FFFFFF` | Kart yüzeyi |
| **Sunken** `--parsel-sunken` | `#EAEAE6` | Sidebar alt bölüm, ikincil zemin |
| **Elevated** `--parsel-elevated` | `#F8F8F6` | Hover, nested alan |
| **Foreground** | `#111113` | Graphite ana metin |
| **Muted foreground** | `#3F3F46` → `#52525B` | İkincil metin |
| **Border** | `#D8D8D4` | İnce, düşük kontrast çizgi |
| **Primary (marka)** | `#4A6B2F` / `#547236` | Zeytin-yeşili — CTA, aktif nav, onay |
| **Accent (sage-blue / teal)** | `#5B7C6B` · `#6B8F7A` · `#4A7C78` | İkincil vurgu, badge, link hover — *generic `#2563EB` mavi kullanılmaz* |
| **Gold (premium)** | `#8A6428` (light) · `#B38C56` (dark) | Fiyat, plan, önemli metrik — ölçülü |
| **Destructive** | Mevcut `--destructive` | Hata / iptal |

**Kaçınılacak renk davranışları:**

- Tailwind `blue-500`, `indigo-600`, `violet-*` ile primary tanımlamak.
- Admin’de tek başına `emerald-400/500` neon “God Mode” paleti (panelden kopuk).
- Landing hero’da ağır koyu zemin + panelde açık zemin arasında **güneşsiz geçiş** (landing de sıcak nötr/açık tona yaklaşmalı).

### 2.2 Mevcut kod ile fark (bilinçli geçiş)

| Alan | Bugün | Hedef |
|------|-------|-------|
| Root `html` | Varsayılan `dark` | Panel için light varsayılan değerlendir |
| Landing hero | Koyu arka plan, animasyon yoğun | Sıcak nötr + ölçülü grid; panel ile aynı kart dili |
| Admin shell | `#050505` + emerald vurgu | Panel shell ile hizalı; sage/teal accent |
| Primary | Zeytin yeşili (iyi) | Koru; sage-teal ile genişlet |

### 2.3 Kadastro / parsel detayı

Dekoratif grid **arka planda, düşük opaklıkta** kullanılır:

- 48px kare grid, `%8–12` opacity sage/yeşil çizgi.
- Hero veya boş bölüm arka planında; kart içeriğinin altına binmez.
- Animasyon: yavaş opacity drift (18–24s); `prefers-reduced-motion` ile kapatılır.

---

## 3. Typography

### Font ailesi

| Rol | Font | Kullanım |
|-----|------|----------|
| **Body / UI** | Inter (`--font-inter`) | Paragraf, form, tablo, nav |
| **Heading / metrik** | Outfit (`--font-outfit`, `--font-heading`) | Sayfa başlığı, KPI rakamları, landing H1 |

### Ölçek

| Seviye | Sınıf / örnek | Kullanım |
|--------|----------------|----------|
| Sayfa başlığı (panel) | `font-outfit text-base sm:text-lg font-bold` (Header) veya `.parsel-page-title` | Tek H1 / breadcrumb son segment |
| Bölüm etiketi | `.parsel-section-label` — 11px, uppercase, tracking `0.16em` | Kart grubu üstü |
| Nav grup | `.parsel-nav-group-label` — 10px, bold, tracking `0.18em` | Sidebar grupları |
| Gövde | `text-sm` (14px) | Tablo, form, kart gövdesi |
| Küçük / meta | `text-xs` (12px) | Zaman damgası, yardımcı |
| Metrik değer | `.parsel-metric-value` | Dashboard KPI |

**Kurallar:**

- Bir ekranda **en fazla bir** büyük Outfit başlığı (landing hariç).
- Uppercase etiketler yalnızca kısa etiketlerde (≤3 kelime); cümle metninde uppercase yok.
- Tabular nums (`tabular-nums`) para ve sayaçlarda zorunlu.

---

## 4. Spacing

### Grid ve container

- Panel main: `max-w-[1600px]` merkezli (`DashboardShell`).
- Main padding: `p-4 md:p-6 lg:p-8`.
- Kart içi: `p-4 md:p-5` (widget), `p-6` (büyük bölüm).

### Dikey ritim

| Bağlam | Boşluk |
|--------|--------|
| Sayfa üstü → ilk kart satırı | `space-y-6` veya `gap-6` |
| Kart içi bölümler | `space-y-4` |
| Form alanları | `gap-4` (grup), `gap-2` (label-input) |
| Sidebar nav item | `py-2.5 px-3`, gruplar arası `pt-3` |

### Köşe yarıçapı

- `--radius` tabanı: `0.625rem` (10px).
- Kart / panel: `rounded-2xl` (16px civarı).
- Nav item / input: `rounded-xl`.
- Badge / pill: `rounded-full` veya `rounded-md`.

---

## 5. Card yapısı

### Standart panel kartı

Mevcut `CommandCenterView` deseni referans alınır:

```
parsel-surface
rounded-2xl
border border-border/60
bg-parsel-panel
p-4 md:p-5
shadow-parsel-md   (light: --parsel-card-shadow)
```

**Katmanlar:**

1. **Canvas** — sayfa arka planı (`bg-parsel-canvas`).
2. **Surface kart** — birincil içerik kutusu.
3. **Sunken alan** — filtre çubuğu, sidebar footer, nested liste.

**Hover (interaktif kartlar):**

- `transition-all duration-300`
- `hover:border-border hover:shadow-parsel-md`
- Renk patlaması yok; gölge + border yeterli.

**Yasak:**

- `bg-white/[0.02]` ile cam kart panel ana içerikte (landing/dekor hariç).
- Aynı ekranda 3’ten fazla gölge seviyesi karışımı.

---

## 6. Sidebar kuralları

**Dosya referansı:** `SidebarNav.tsx`, `dashboard-nav.ts`

| Öğe | Kural |
|-----|--------|
| Genişlik | `w-72` (admin ile uyumlu) |
| Logo alanı | `h-16`, alt border `border-border/40` |
| Nav link | `rounded-xl`, `gap-3`, icon 18px |
| Aktif | `border-primary/35 bg-accent`, sol inset `3px` primary çizgi (light); dark’ta gold alternatif mevcut — **hedef: tek aktif stili light sage** |
| Pasif | `text-muted-foreground`, hover `bg-muted/70` |
| Grup başlığı | `.parsel-nav-group-label` |
| Footer | `border-t`, `/account` linki + tek satır meta |

**Sidebar’da olmaması gerekenler:** sayfa içi aksiyonlar, birincil CTA butonları.

---

## 7. Header kuralları

**Dosya referansı:** `Header.tsx`

| Öğe | Kural |
|-----|--------|
| Yükseklik | `h-[3.75rem] sm:h-16` |
| Stil | `.parsel-shell-header` — blur + ince alt border |
| Sol | Mobil menü + breadcrumb (`ParselOS` → sayfa adı) |
| Sağ | Theme toggle, bildirimler, kullanıcı |
| Başlık | `getDashboardPageTitle(pathname)` — nav etiketi ile **aynı metin** |

Header’da renkli banner veya modül bazlı farklı header arka planı kullanılmaz.

---

## 8. Dashboard kart kuralları

### KPI / metrik kartı

```
min-h-[96px] md:h-[104px]
rounded-2xl border border-border/60 bg-parsel-panel
.parsel-metric-value + kısa label (muted, uppercase opsiyonel)
```

- Trend pill: yeşil/kırmızı **yalnızca anlamlı yön** için; dekoratif ok yok.
- 4 KPI yan yana desktop; mobile 2 sütun.

### Widget kartı

- Başlık satırı: icon 16–18px + `text-sm font-semibold` + opsiyonel link.
- İçerik: liste veya mini grafik; kart padding korunur.

### Dashboard sayfa düzeni

1. Karşılama + arama (varsa)
2. KPI şeridi
3. 2 sütun widget grid (`xl:grid-cols-2`)
4. Tam genişlik tablo/liste

---

## 9. Table / list kuralları

| Öğe | Kural |
|-----|--------|
| Wrapper | Kart içinde `overflow-x-auto custom-scrollbar` |
| Header | `text-[10px] uppercase tracking-[0.16em] text-muted-foreground` |
| Satır | `border-b border-border/40`, hover `bg-foreground/[0.02]` |
| Hücre padding | `px-4 py-3.5` (md: `px-5 py-4`) |
| Min genişlik | `min-w-[720px]` geniş tablolarda |

**Liste (mobil uyumlu):**

- Kart liste alternatif: her satır ayrı `rounded-xl border` — dar ekranda tablo yerine.

**Durum badge:**

- Plan/durum: `rounded-full border px-2.5 py-0.5 text-[11px] font-medium`
- Renk anlamlı: aktif = sage/yeşil ton, askıda = amber, iptal = neutral/kırmızı.

---

## 10. Form kuralları

| Öğe | Kural |
|-----|--------|
| Input yükseklik | `h-10` veya `py-2.5` tutarlı |
| Border | `border-border`, focus `ring-2 ring-primary/20 border-primary/40` |
| Label | `text-sm font-medium`, gerekirse `text-muted-foreground` helper |
| Grup | `space-y-2` (tek alan), `grid gap-4 sm:grid-cols-2` (çoklu) |
| Primary submit | `bg-primary text-primary-foreground`, gold yalnızca marketing CTA |

Hata metni input altında `text-sm text-destructive`; toast ile çift bildirimden kaçın.

---

## 11. Empty / loading / error state kuralları

### Empty

- İkon (Lucide, 24–32px, muted).
- Başlık: `text-sm font-semibold text-foreground`.
- Açıklama: `text-sm text-muted-foreground`, max 2 satır.
- Tek birincil aksiyon (ör. “Portföy ekle”).

### Loading

- Panel route: `loading.tsx` skeleton tercih — pulse bloklar kart geometrisinde.
- Buton içi: `Loader2 animate-spin`, metin “Yükleniyor…”.
- Tam sayfa spinner yalnızca auth geçişlerinde.

### Error

- `DashboardDbError` deseni: net mesaj + yapılacaklar listesi + tekrar dene.
- Kırmızı banner değil; `border-destructive/30 bg-destructive/5` kutusu.
- Teknik detay kullanıcıya gösterilmez.

---

## 12. Landing vs panel hizalama notları

**Mevcut landing (`HeroShowcase`, `LandingPage`):**

- Koyu hero, gold gradient metin, yoğun animasyon.
- Ödeme rozetleri beyaz pill — doğru yön.

**Hedef uyum:**

- Landing arka planı panel canvas ailesine yaklaştırılır (sıcak açık gri).
- CTA butonları: panel primary + gold accent; shine animasyonu ölçülü.
- Feature kartları: panel `parsel-surface` ile aynı border/gölge.
- “Canlı feed” kartları dashboard widget’larına benzer boyut ve tipografi.

---

## 13. Admin UI notları

**Mevcut:** `AdminShell` — koyu zemin, emerald vurgu, “Founder Console” etiketi.

**Hedef hizalama (UI refactor fazında):**

- Shell geometrisi panel ile aynı (sidebar 72, header 64, main padding).
- Vurgu rengi: sage-teal / primary; emerald neon kaldırılır.
- Tablo ve KPI kartları dashboard ile aynı sınıflar (`parsel-surface`, metrik kart).
- “God Mode” copy yerine “Komuta Merkezi” / “Super Admin” — profesyonel ton.

---

## 14. Kaçınılacak tasarım hataları

1. **Generic mavi SaaS** — primary/link için Tailwind blue/indigo.
2. **Üç farklı ürün hissi** — landing koyu neon, panel açık, admin yeşil neon.
3. **Hardcoded hex dağınıklığı** — `#547236`, `#b38c56` vb. yalnızca token veya semantic sınıf üzerinden.
4. **Aşırı animasyon** — shine, float, orbit aynı viewport’ta 3+ efekt.
5. **Cam/blur içerik kartı** — `backdrop-blur` dekoratif arka planda kalır.
6. **Monolit ekran** — tek dosyada tüm varyantlar; kart/bölüm bileşenleri parçalanmalı (UI fazı).
7. **Nav–başlık uyumsuzluğu** — sidebar etiketi ≠ header başlığı.
8. **Küçük tıklama alanı** — nav/icon button `< 44px` dokunma hedefi.
9. **Mock veri görsel dili** — “Canlı” badge gerçek veri yokken (UX güven sorunu — ayrı konu).
10. **Ödeme logoları** — koyu zemin üzerine renksiz/ham SVG; her zaman açık pill zemin.

---

## 15. Token hızlı referans (mevcut CSS)

Light (`:root`) — refactor’da sage-teal accent genişletilecek:

| Token | Değer |
|-------|-------|
| `--parsel-canvas` | `#f3f3f0` |
| `--parsel-panel` | `#ffffff` |
| `--primary` | `#4a6b2f` |
| `--foreground` | `#111113` |
| `--parsel-gold` | `#8a6428` |
| `--radius` | `0.625rem` |

Utility sınıfları: `.parsel-surface`, `.parsel-page-title`, `.parsel-section-label`, `.parsel-shell-header`, `.parsel-metric-value`, `.parsel-nav-group-label`.

---

## 16. Sonraki UI refactor adımları (kod dışı plan)

1. Light-first panel varsayılanını değerlendir (`html` class stratejisi).
2. Landing hero’yu style guide canvas/card diline yaklaştır.
3. Admin emerald → sage/primary token hizalaması.
4. Hardcoded landing hex’lerini semantic token’a taşı.
5. Ortak `ParselCard`, `ParselMetric`, `ParselPageHeader` UI primitives (küçük adımlarla).

---

*Bu doküman uygulama kodunu değiştirmez; kontrollü UI refactor için tek referans kaynaktır.*
