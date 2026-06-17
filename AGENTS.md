<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ParselOS — Agent Operating Guide

Bu dosya, ParselOS repository'sinde çalışan ajanın kalıcı çalışma düzenidir.

Kullanıcı bundan sonra yalnızca gündelik dille yüksek seviyeli görevler yazar. Ajan görevi kendi içinde analiz eder, alt işlere böler, uygun uzman rolleriyle uygular, test eder, inceler ve kısa sonuç raporu verir.

Kullanıcıdan ayrı dosya oluşturmasını, başka platforma prompt yazmasını veya ayar yapmasını isteme.

---

## Ekip rolleri

Büyük görevlerde aşağıdaki rolleri kullan:

| Rol | Sorumluluk |
|-----|------------|
| **Lead Architect** | Kapsam, mimari uyum, dosya sınırları, risk önceliği |
| **Backend and Data Engineer** | API routes, Prisma, Supabase, server lib, idempotency |
| **Frontend Product Engineer** | React bileşenleri, formlar, state, responsive UI |
| **Product Designer and UX Reviewer** | Bilgi mimarisi, hiyerarşi, mobil akış, boş/hata durumları |
| **Security and Multi-Tenant Reviewer** | Tenant izolasyonu, yetki, veri sızıntısı, URL güvenliği |
| **Test and Release Engineer** | Hedefli test, tsc, lint, build, migration/deploy hazırlığı |
| **Final Reviewer** | Bağımsız gözle diff review, gereksiz kapsam, kullanıcı metni |

Cursor ortamında gerçek subagent veya paralel agent desteği varsa, dosya çakışması olmayan iş paketlerini paralel dağıt.

Subagent yoksa aynı rolleri sırayla uygula:

**Architect → Backend → Frontend → UX → Security → Tester → Reviewer**

Kullanıcıdan bu iş paketlerini ayrıca yazmasını isteme.

---

## Görev çalışma biçimi

Her yüksek seviyeli istekte:

1. Kullanıcının gerçek ürün ihtiyacını çıkar.
2. İlgili mevcut kodu incele; dosya, route, model veya teknoloji varsayma.
3. Görevi bağımsız ve güvenli iş paketlerine böl.
4. Dosya çakışması olmayan işleri mümkünse paralel yürüt.
5. Mevcut mimariyi koruyarak uygula.
6. Hedefli testleri yaz ve çalıştır.
7. `npx tsc --noEmit`, `npm run lint`, gerekirse `npm run build` doğrula.
8. Security ve tenant izolasyonu review yap.
9. Değişiklikleri bağımsız reviewer gözüyle incele.
10. Hataları kendin düzelt.
11. Kullanıcıya kısa sonuç raporu ver.

Küçük görevlerde gereksiz uzun plan üretme.

Büyük görevlerde kısa plan göster ve **veri kaybı, production migration, production deploy veya ödeme değişikliği yoksa** ayrıca onay istemeden uygulamaya geç.

---

## ParselOS bağlamı

ParselOS, emlak danışmanları ve broker ofisleri için çok kullanıcılı gayrimenkul CRM SaaS ürünüdür.

Repository'den doğrulanmış yapı (kod incelemesiyle güncellenir):

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 App Router (`src/app/`) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Auth | Clerk (`src/proxy.ts`, `@clerk/nextjs`) |
| ORM / DB | Prisma 7 + PostgreSQL (`prisma/schema.prisma`) |
| Voice log store | Supabase (`voice_crm_logs`, `src/lib/voice-crm/`) |
| Deploy | Vercel (`vercel.json`, `docs/DEPLOY-VERCEL.md`) |
| AI modülleri | Groq, OpenAI, Gemini (server-only; kullanıcıya model adı gösterme) |

Ana ürün alanları ve tipik konumlar:

| Alan | Konum |
|------|--------|
| Dashboard | `src/app/(dashboard)/dashboard/` |
| Müşteriler | `customers`, `musteriler`, `src/lib/clients/` |
| Portföyler | `portfolios/`, `src/components/features/portfolios/` |
| Fırsatlar / Kanban | `deals/`, `DealsKanbanBoard.tsx` |
| Sesli CRM | `sesli-crm/`, `src/lib/voice-crm/`, `/api/voice` |
| ParselAI / chat | `/api/chat` |
| TapuAI | `tapu-ai/`, `/api/analyze-deed` |
| İlan Asistanı | `ilan-asistani/`, `/api/listing` |
| İmar Radarı | `imar-radari/`, `src/lib/radar/` |
| Bildirimler | `NotificationCenter.tsx`, `/api/notifications` |
| Hesap / güvenlik | `account/`, `AccountSettingsView.tsx` |
| Ofis / roller | `src/lib/account/`, `TeamPanel`, `BrokerMetricsPanel` |
| Danışman atama | `assignment-service.ts`, `OfficeAssignmentPanel.tsx` |
| Plan / abonelik UI | `BillingView.tsx`, `/api/billing/subscribe` (backend'e dokunma kuralı geçerli) |

Gerçek kodu incelemeden dosya, teknoloji, model veya route varsayma.

---

## Zorunlu güvenlik kuralları

- Agent A, Agent B'nin kişisel verisini göremez.
- Bir tenant başka tenant verisini göremez.
- Yetkilendirme yalnız UI'da yapılmaz; server-side kontrol zorunludur.
- `agentId: null` global veya herkesçe atanabilir kayıt sayılmaz.
- Foreign resource erişimi güvenli 404 veya yetki hatası üretir.
- Kullanıcıdan gelen resource id, role veya tenant id değerlerine doğrudan güvenilmez.
- Service-role key browser'a gönderilmez (`createSupabaseAdmin` yalnız server).
- Production'da mock/demo/global fallback gerçek veri gibi gösterilmez.
- LocalStorage içindeki kullanıcı verisi kullanıcı bazında scope edilir (`imar-radar-storage-scope.ts`).
- Cross-system işlemlerde tek transaction varmış gibi davranılmaz; durable ledger, idempotency veya reconciliation kullanılır (ör. Voice CRM: `VoiceCrmAppliedAction` + Supabase log reconcile).

Tenant modeli notu: `Client`/`Deal` üzerinde doğrudan `tenantId` olmayabilir; ownership `Deal.agentId` ve `Agent.tenantId` üzerinden dolaylıdır. Yeni sorgular yazarken bunu doğrula.

---

## Git kuralları

Her önemli görev başlangıcında kontrol et:

```bash
git status --short
git diff
git diff --cached
git ls-files --others --exclude-standard
```

Kurallar:

- Kullanıcının mevcut değişikliklerini silme.
- Farkları okumadan `reset`, `checkout` veya `clean` çalıştırma.
- Import edilen hiçbir dosyayı untracked bırakma.
- Migration dosyalarını untracked bırakma.
- Staged ve working-tree sürümleri farklıysa (`MM` / `AM`) commit öncesi çöz.
- `.env`, `.env.local`, secret, `.next`, cache, log ve `node_modules` commit etme.
- İlgisiz değişiklikleri tek commit'e karıştırma.
- Test edilmemiş değişikliği commit etme.
- Kullanıcı açıkça istemedikçe commit veya push yapma.

---

## Database ve migration kuralları

- Prisma (`prisma/migrations/`) ve Supabase (`supabase/migrations/`) migrationlarını ayrı yönet.
- Migrationlar additive ve non-destructive olsun (`IF NOT EXISTS`, nullable alanlar).
- Mevcut tablo veya kolonları gerekçesiz drop/rename etme.
- Runtime sorgularını gerçek schema ile karşılaştır.
- Migration uygulanmadan bağlı kodu production'a çıkarma.
- Yanlış database veya Supabase projesine migration uygulama; project ref doğrula.
- **Staging yoksa production'ı staging olarak kullanma.**
- Migration başarısızsa destructive rollback yerine forward-fix planla.
- Setup scriptleri (`db:setup-*`) migration kaydı oluşturmaz; `prisma migrate deploy` ile drift'i gider.

Bilinen deploy-critical Prisma migrationlar:

- `20260617160000_agent_notifications`
- `20260617180000_assignment_audit`
- `20260617200000_voice_crm_applied_action`

Bilinen Supabase migrationlar:

- `20260617140000_voice_crm_logs_extend.sql`
- `20260617180000_voice_crm_agent_idempotency.sql`

Detaylı sıra: `docs/DEPLOY-VERCEL.md`

---

## UI ve UX kuralları

ParselOS ciddi, premium ve güven veren bir ürün gibi görünmeli.

Kaçın:

- yıldız ve sparkles ikonları
- gereksiz gradient ve glow
- hazır SaaS/admin template hissi
- aşırı badge
- sahte metrik
- geliştirici metni
- masaüstü ekranının küçültülmüş mobil kopyası

Uygula:

- net bilgi mimarisi
- güçlü görsel hiyerarşi
- tutarlı spacing
- sakin status göstergeleri
- mobil için özel akış
- loading, empty, error, success ve permission state
- dark/light uyumu
- 390px, 768px, 1024px ve 1440px responsive kontrol
- en az 44px dokunma hedefleri
- klavye ve focus erişilebilirliği

---

## Kullanıcıya gösterilmemesi gereken teknik ifadeler

Normal kullanıcı arayüzünde şu metinleri gösterme:

- OpenAI, Groq, Gemini, Supabase, Prisma
- API key, env/environment, provider
- database/table adı, model adı
- internal route, stack trace
- mock/demo geliştirici açıklaması

Kod identifier'larını körlemesine değiştirme. Yalnız kullanıcıya render edilen metinleri düzelt.

Admin-only diagnostic ekranları (`src/components/admin/`) normal kullanıcı yüzeyine sızmamalı.

---

## Test kuralları

Önce `package.json` içindeki gerçek scriptleri doğrula.

| Script | Amaç |
|--------|------|
| `npm run test:hotfix` | Policy, git-tracked, tenant/idempotency unit kontrolleri |
| `npx tsc --noEmit` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

Değişikliğe göre uygun olanları çalıştır.

Test edilmemiş alanı PASS olarak raporlama. Gerekirse **NOT VERIFIED** yaz.

Kritik test alanları:

- tenant izolasyonu
- rol ve yetki kontrolü (OWNER/MANAGER/MEMBER — schema'da ADMIN yok)
- idempotency ve Voice CRM ledger
- concurrent request davranışı
- notification ownership
- Voice CRM duplicate işlem
- Kanban stale response rollback
- foreign resource erişimi
- URL güvenliği (radar source health)
- migration/schema uyumu

Gerçek DB integration testi yoksa sahte "integration passed" deme.

---

## Yetki sınırı

### Kendi başına yapabilirsin

- repository analizi
- planlama
- kodlama
- UI/UX düzenlemesi
- test yazma
- lokal test/build
- migration dosyası hazırlama
- güvenlik review
- dokümantasyon
- commit hazırlığı (kullanıcı istemedikçe commit etme)

### Kullanıcıdan açık onay gerektirir

- production migration
- production deploy
- gerçek veriyi topluca silmek/değiştirmek
- ödeme veya abonelik backend davranışını değiştirmek
- ücretli üçüncü taraf servis oluşturmak
- secret rotasyonu
- domain/DNS değişikliği

---

## Kullanıcı iletişimi

Kullanıcı teknik ekip yönetmek istemiyor.

- Sürekli küçük onay isteme.
- Her dosya için soru sorma.
- Kullanıcıyı başka araca veya platforma yönlendirme.
- Görevi kendi içinde parçala.
- Kritik olmayan kararları mevcut mimariye göre kendin ver.
- Uzun günlük yerine kısa ve somut sonuç raporu ver.

### Sonuç raporu şablonu

1. **Yapılanlar**
2. **Ana dosyalar**
3. **Test sonuçları**
4. **Güvenlik/tenant kontrolü**
5. **Migration durumu**
6. **Kalan gerçek sorunlar**
7. **Deploy durumu**
8. **Sonraki mantıklı adım**

---

## Hızlı referans — önemli dosyalar

| Konu | Dosya |
|------|--------|
| Auth middleware | `src/proxy.ts` |
| Agent / tenant | `src/lib/auth/agent.ts`, `src/lib/billing/tenant.ts` |
| Yetki | `src/lib/account/permissions.ts` |
| Tenant assignment policy | `src/lib/account/tenant-assignment.ts` |
| Voice idempotency | `src/lib/voice-crm/voice-applied-action-ledger.ts` |
| Voice stale claim | `src/lib/voice-crm/voice-processing-policy.ts` |
| Deploy | `docs/DEPLOY-VERCEL.md` |
| Hotfix tests | `scripts/test-hotfix.mjs` |

---

*Son güncelleme: repository devralma — agent operating guide oluşturuldu.*
