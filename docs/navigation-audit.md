# ParselOS Navigation Audit

> **Durum:** Hazırlık dokümanı — route ve sidebar düzeni refactor öncesi envanter.  
> **Kaynak:** `src/lib/dashboard-nav.ts`, `SidebarNav.tsx`, `Header.tsx`, `admin-nav.ts`, `src/app/**/page.tsx`, `src/proxy.ts`.  
> **Kural:** Bu aşamada dosya silinmez; öneriler sonraki UI/nav fazında uygulanır.

---

## 1. Sidebar’da görünen sayfalar (Panel)

**Kaynak:** `dashboardNavGroups` + sidebar footer (`SidebarNav.tsx`)

### Komuta

| Etiket (TR) | URL | Not |
|-------------|-----|-----|
| Dashboard | `/dashboard` | Komuta merkezi |

### Operasyon

| Etiket (TR) | URL | Not |
|-------------|-----|-----|
| Fırsatlar | `/deals` | Kanban |
| Müşteriler | `/customers` | CRM |
| Ajanda | `/calendar` | Takvim |
| Portföylerim | `/portfolios` | Portföy vitrini |
| Hesaplayıcılar | `/calculators` | İmar / finans hesap |

### İstihbarat

| Etiket (TR) | URL | Not |
|-------------|-----|-----|
| FSBO Radarı | `/fsbo-radar` | FSBO lead |
| İmar Radarı | `/imar-radari` | İmar duyuru tarama |

### Araçlar

| Etiket (TR) | URL | Not |
|-------------|-----|-----|
| Tapu AI | `/tapu-ai` | Tapu analizi |
| İlan Asistanı | `/ilan-asistani` | Pro özellik (middleware plan gate) |
| Ekspertiz | `/ekspertiz` | Rapor üretimi |
| Ekspertiz Arşivi | `/arsiv` | Arşiv listesi |

### Sidebar footer (nav grupları dışı)

| Etiket (TR) | URL | Not |
|-------------|-----|-----|
| Üyelik & Ayarlar | `/account` | Profil, ekip, lisans |

**Toplam sidebar linki:** 13 (12 grup item + 1 footer)

---

## 2. Var olup sidebar’da olmayan sayfalar

### Panel içi (dashboard route group)

| URL | Amaç | Neden sidebar’da yok? |
|-----|------|------------------------|
| `/billing` | Abonelik / ödeme | `extraPageTitles` ile header’da tanımlı; nav linki yok — genelde `/account` veya upgrade akışından |
| `/finans` | Finans görünümü (`FinansView`) | Nav tanımı yok — yetim sayfa |
| `/sesli-crm` | Sesli CRM | Nav tanımı yok — Supabase voice bağımlı |
| `/properties/new` | Yeni mülk formu | Alt akış; muhtemelen portföy/deals’ten açılmalı |
| `/portfolios/new` | Yeni portföy | Alt akış; `/portfolios` alt route |
| `/radar` | Eski istihbarat haritası | Redirect → `/imar-radari`; nav’dan kaldırıldı |

### Auth (shell dışı)

| URL | Not |
|-----|-----|
| `/login` | Özel giriş sayfası |
| `/sign-in` | Clerk alias → `/login` redirect |
| `/sign-up` | Kayıt |

### Marketing & yasal (shell dışı)

| URL | Not |
|-----|-----|
| `/` | Landing |
| `/gizlilik-politikasi` | Yasal |
| `/kvkk` | Yasal |
| `/kullanim-kosullari` | Yasal |
| `/mesafeli-satis-sozlesmesi` | Yasal |
| `/teslimat-ve-iade` | Yasal |

### Super Admin (ayrı shell — `AdminShell`)

| URL | Nav (`admin-nav.ts`) |
|-----|----------------------|
| `/admin/access` | Parola kapısı (shell öncesi) |
| `/admin` | Dashboard ✓ |
| `/admin/subscribers` | Aboneler ✓ |
| `/admin/billing` | Fatura & gelir ✓ |
| `/admin/ai-settings` | AI motor ✓ |
| `/admin/ai-metrics` | AI metrikleri ✓ |
| `/admin/content` | İçerik ✓ |
| `/admin/system` | Sistem ✓ |

Admin nav ile sayfalar **uyumlu** (7 item + access gate).

---

## 3. Redirect / legacy route listesi

| Kaynak URL | Hedef | Dosya | Tür |
|------------|-------|-------|-----|
| `/musteriler` | `/customers` | `(dashboard)/musteriler/page.tsx` | TR alias |
| `/hesaplayicilar` | `/calculators` | `(dashboard)/hesaplayicilar/page.tsx` | TR alias |
| `/radar` | `/imar-radari` | `(dashboard)/radar/page.tsx` | Özellik birleştirme |
| `/sign-in` | `/login` (+ query) | `sign-in/page.tsx` | Clerk uyumu |
| `/sign-up` | (giriş yapmışsa) `/dashboard` | `sign-up/page.tsx` | Auth guard |
| `/login` | (giriş yapmışsa) `/dashboard` | `login/page.tsx` | Auth guard |

**Middleware (`proxy.ts`):** Public route listesinde yasal + auth sayfaları; dashboard route’ları Clerk + plan kontrolü altında.

---

## 4. Kaldırılacak / adapte edilecek route önerileri

> **Not:** Bu fazda dosya silinmez. Öneriler sıralı ve küçük adımlarla uygulanmalı.

### Öncelik A — Netleştir (düşük risk)

| Route | Öneri |
|-------|--------|
| `/musteriler` | **Koru (redirect)** — bookmark/SEO için; canonical `/customers` |
| `/hesaplayicilar` | **Koru (redirect)** — aynı mantık |
| `/radar` | **Koru (redirect)** — eski linkler; UI’da hiç referans verme |
| `/sign-in` | **Koru** — Clerk varsayılan URL uyumu |

### Öncelik B — Sidebar veya akışa bağla

| Route | Öneri |
|-------|--------|
| `/billing` | `/account` alt sekmesi veya “Abonelik” sidebar footer linki; header title zaten var |
| `/portfolios/new` | Sidebar’da değil — `/portfolios` içi “Yeni portföy” CTA yeterli |
| `/properties/new` | Deals/portfolios akışından link; standalone URL gizli kalabilir |

### Öncelik C — Karar gerektiren yetim sayfalar

| Route | Seçenek 1 | Seçenek 2 |
|-------|-----------|-----------|
| `/finans` | Operasyon grubuna “Finans” ekle | `/calculators` ile birleştir, `/finans` redirect |
| `/sesli-crm` | Araçlar grubuna “Sesli CRM” ekle (beta badge) | Feature flag ile gizle, URL 404/redirect |

### Öncelik D — Kod adaptasyonu (nav sonrası, dosya silmeden)

| Konu | Öneri |
|------|--------|
| Intelligence Radar bileşenleri | Nav’da yok; `/radar` redirect yeterli — UI fazında import referansları temizlenir (silme ayrı karar) |
| Admin vs panel URL | `/admin` ayrı kalır — kullanıcı tipi farklı |

---

## 5. Türkçe / İngilizce URL standardı önerisi

### Önerilen kural: **Canonical URL = İngilizce, UI etiketi = Türkçe**

| Ilke | Açıklama |
|------|----------|
| **Canonical path** | `/customers`, `/calculators`, `/deals`, `/dashboard` — kısa, stabil, kod/API ile uyumlu |
| **UI label** | Sidebar, header, breadcrumb **Türkçe** (“Müşteriler”, “Hesaplayıcılar”) |
| **TR alias** | `/musteriler`, `/hesaplayicilar` yalnızca 301/redirect; yeni link üretme |
| **Türkçe slug yasal** | `/gizlilik-politikasi`, `/kvkk` — SEO ve mevzuat için Türkçe kalır |
| **Admin** | İngilizce path korunur (`/admin/subscribers`) — iç araç |

### Canonical path tablosu (hedef)

| Modül | Canonical | TR alias (redirect) | Sidebar etiketi |
|-------|-----------|---------------------|-----------------|
| Dashboard | `/dashboard` | — | Dashboard |
| Fırsatlar | `/deals` | — | Fırsatlar |
| Müşteriler | `/customers` | `/musteriler` | Müşteriler |
| Ajanda | `/calendar` | — | Ajanda |
| Portföy | `/portfolios` | — | Portföylerim |
| Hesaplayıcı | `/calculators` | `/hesaplayicilar` | Hesaplayıcılar |
| FSBO | `/fsbo-radar` | — | FSBO Radarı |
| İmar | `/imar-radari` | `/radar` (eski) | İmar Radarı |
| Tapu AI | `/tapu-ai` | — | Tapu AI |
| İlan | `/ilan-asistani` | — | İlan Asistanı |
| Ekspertiz | `/ekspertiz` | — | Ekspertiz |
| Arşiv | `/arsiv` | — | Ekspertiz Arşivi |
| Hesap | `/account` | — | Üyelik & Ayarlar |
| Abonelik | `/billing` | — | (account altında veya footer) |

### Yeni route eklerken

1. Path İngilizce, kebab-case.
2. `dashboard-nav.ts` + `getDashboardPageTitle` aynı anda güncelle.
3. TR alias yalnızca gerçekten gerekirse (eski pazarlama linki).

---

## 6. Header ↔ sidebar tutarlılık kontrolü

| URL | Sidebar etiketi | Header (`getDashboardPageTitle`) | Uyum |
|-----|-----------------|----------------------------------|------|
| `/dashboard` | Dashboard | Dashboard | ✓ |
| `/account` | Üyelik & Ayarlar | Hesap & Abonelik | ⚠️ Farklı copy |
| `/billing` | (yok) | Abonelik | ⚠️ Sidebar link yok |

**Öneri:** `/account` için tek etiket: “Hesap & Abonelik” veya “Üyelik & Ayarlar” — ikisi eşitlenmeli.

---

## 7. Önerilen nav grupları (gelecek UI fazı — değişiklik taslağı)

Mevcut 4 grup yapısı korunabilir. Opsiyonel eklemeler:

```
Komuta          → Dashboard
Operasyon       → Fırsatlar, Müşteriler, Ajanda, Portföyler, Hesaplayıcılar [, Finans?]
İstihbarat      → FSBO Radarı, İmar Radarı
Araçlar         → Tapu AI, İlan Asistanı, Ekspertiz, Arşiv [, Sesli CRM?]
Footer          → Üyelik & Ayarlar [, Abonelik?]
```

Grup isimleri Türkçe kalır; URL’ler İngilizce canonical.

---

## 8. Proxy / erişim notları (bilgi amaçlı — dokunulmaz)

- **Public:** `/`, yasal sayfalar, auth, seçili API webhook’ları.
- **Dashboard:** Clerk oturumu gerekli.
- **Pro gate:** `/ilan-asistani` — plan tipi kontrolü (`proxy.ts`).
- **Admin:** Clerk + `/admin/access` parola cookie (`admin` layout).

Nav refactor bu kuralları değiştirmez; yalnızca link hedefleri netleşir.

---

## 9. Özet envanter

| Kategori | Adet |
|----------|------|
| Sidebar link (panel) | 13 |
| Panel sayfası (redirect hariç) | ~20 route |
| Redirect/legacy | 6 |
| Sidebar’da olmayan panel sayfası | 6 (`billing`, `finans`, `sesli-crm`, `properties/new`, `portfolios/new`, `radar`) |
| Admin nav item | 7 |
| Yasal / marketing | 6 |

---

## 10. Sonraki adım önerisi (nav/UI fazı)

1. **`/account` ↔ `/billing` ilişkisini netleştir** — tek “Hesap” hub’ı, sidebar footer’da alt link veya tab.
2. **`/finans` kararı** — nav’a ekle veya `/calculators`’a yönlendir.
3. **`/sesli-crm` kararı** — beta nav veya gizle.
4. **Header title eşlemesi** — `extraPageTitles` ile sidebar footer copy aynı hizada.
5. **Style guide ile birlikte** — landing CTA’lar canonical `/sign-up` → `/dashboard` akışına; nav dışı link taraması (iç linklerde TR alias kullanılmaması).

---

*Bu doküman uygulama kodunu değiştirmez; kontrollü navigation refactor için tek envanter kaynağıdır.*
