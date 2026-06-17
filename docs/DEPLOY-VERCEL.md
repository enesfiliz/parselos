# ParselOS — Vercel Deploy & parselos.com DNS

## 1. Vercel projesi oluştur

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub repo: `enesfiliz/parselos`
3. Framework: **Next.js** (otomatik algılanır)
4. Build Command: `prisma generate && next build` (vercel.json'da tanımlı)
5. **Deploy** — ilk build env olmadan kısmen başarısız olabilir; önce env ekleyin

## 2. Vercel Environment Variables

Project → **Settings → Environment Variables** — hepsini **Production** için ekleyin:

| Değişken | Not |
|----------|-----|
| `DATABASE_URL` | Supabase **Transaction pooler** (port **6543**) + `?pgbouncer=true` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk **Live** key (`pk_live_...`) |
| `CLERK_SECRET_KEY` | Clerk **Live** secret (`sk_live_...`) |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook secret |
| `ADMIN_ACCESS_PASSWORD` | Admin access parolası (zorunlu) |
| `NEXT_PUBLIC_APP_URL` | `https://parselos.com` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role |
| `GEMINI_API_KEY` | AI modülleri |
| `GROQ_API_KEY` | ParselCopilot |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Harita |
| `CRON_SECRET` | Vercel cron auth (rastgele güçlü string) |
| `BOT_SECRET_KEY` | FSBO bot sync |

### DATABASE_URL örneği (Vercel için kritik)

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Session pooler (5432) Vercel serverless'ta bağlantı limitine takılabilir — **6543 kullanın**.

## 3. Clerk production ayarları

Clerk Dashboard → **Configure → Domains**:

- `parselos.com`
- `www.parselos.com`
- Vercel preview domain (opsiyonel)

Webhooks → Endpoint:

```
https://parselos.com/api/webhooks/clerk
```

Events: `user.created`, `user.updated`, `session.created`

## 4. Veritabanı migration (production öncesi zorunlu sıra)

Migration uygulanmadan deploy edilirse şu alanlar kırılır:

| Eksik migration | Etkilenen route/özellik |
|-----------------|-------------------------|
| `AgentNotification` | `/api/notifications`, bildirim merkezi |
| `AssignmentAudit` | `/api/account/assignments`, ofis atama paneli |
| `VoiceCrmAppliedAction` | Sesli CRM müşteri oluşturma (duplicate risk) |
| Supabase `voice_crm_logs_extend` | `/api/voice`, sesli not listesi |
| Supabase agent idempotency index | Sesli CRM eşzamanlı işlem güvenliği |

### 4.1 Production/staging DB bağlantısını doğrula

```bash
# .env.local veya geçici shell env ile
node --env-file=.env.local scripts/check-db-connection.mjs
```

- `DATABASE_URL` **Transaction pooler (6543)** + `?pgbouncer=true` olmalı (Vercel runtime).
- Supabase project ref'in doğru projeye ait olduğunu Dashboard → Settings → General'dan doğrula.
- Yanlış projeye migration uygulamamak için connection string'deki `[PROJECT_REF]` değerini not al.

### 4.2 Backup ve mevcut migration durumu

```bash
# Prisma migration geçmişi
npx prisma migrate status

# Supabase: Dashboard → Database → Backups (Point-in-time) veya manuel dump
```

Staging'de önce tüm migration'ları uygula; production'a geçmeden smoke test yap.

### 4.3 Prisma generate

```bash
npx prisma generate
```

### 4.4 Prisma migrations (sırayla — app deploy ÖNCESİ)

**Önemli:** `VoiceCrmAppliedAction` ve diğer Prisma migration'ları **uygulama deploy edilmeden önce** production/staging veritabanına uygulanmalıdır. App yeni kodla deploy edilip migration eksikse `/api/voice` create_client ve `/api/account/assignments` kırılır.

```bash
npx prisma migrate deploy
```

Beklenen sıra (timestamp):

1. `20260617160000_agent_notifications`
2. `20260617180000_assignment_audit`
3. `20260617200000_voice_crm_applied_action`

CLI yerine tek tablo kurulum scriptleri (lokal/staging fallback):

```bash
npm run db:setup-notifications
npm run db:setup-assignment-audit
npm run db:setup-voice-applied-action
```

### 4.5 Supabase migrations (sırayla — app deploy ÖNCESİ veya eşzamanlı)

Supabase voice log migration'ları da app deploy öncesi tamamlanmalıdır.

Supabase CLI kullanılıyorsa önce linked project doğrula:

```bash
npx supabase projects list
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

CLI yoksa Supabase Dashboard → **SQL Editor** ile sırayla çalıştır:

1. `supabase/migrations/20260617140000_voice_crm_logs_extend.sql`
2. `supabase/migrations/20260617180000_voice_crm_agent_idempotency.sql`

`voice_crm_logs` tablosu ve agent-scoped index'lerin oluştuğunu doğrula.

### 4.6 Migration doğrulama sorguları

**Prisma (PostgreSQL):**

```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('AgentNotification', 'AssignmentAudit', 'VoiceCrmAppliedAction');
```

**Supabase voice log** (`voice_crm_logs` — `20260617140000_voice_crm_logs_extend.sql`):

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'voice_crm_logs'
  AND column_name IN (
    'transcript',
    'status',
    'idempotency_key',
    'client_id',
    'applied_action',
    'updated_at'
  )
ORDER BY column_name;
```

Beklenen 6 satır. `status` değerleri arasında `pending`, `processing`, `processed` kullanılır; `processed_at` kolonu **yoktur** — zaman damgası için `updated_at` kullanılır.

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'voice_crm_logs'
  AND indexname IN (
    'voice_crm_logs_status_idx',
    'voice_crm_logs_agent_status_idx',
    'voice_crm_logs_idempotency_key_uidx'
  );
```

### 4.7 App deploy

Migration'lar tamamlandıktan sonra:

```bash
npx vercel --prod
```

veya Git push ile otomatik deploy.

### 4.8 Smoke tests (deploy sonrası)

- `GET /api/health` → `{"ok":true}`
- Giriş → `/dashboard`
- OWNER/ADMIN → Hesap → Ofis Metrikleri → Kaynak atama paneli
- Sesli CRM → kayıt → müşteri oluştur → aynı kayıtta tekrar oluşturma CTA görünmemeli
- Bildirim merkezi açılıyor mu

### 4.9 Forward-fix / rollback stratejisi

- **Forward-fix (tercih):** Eksik migration'ı uygula, `npx prisma migrate deploy`, Supabase SQL'i çalıştır, redeploy.
- **Prisma rollback:** Production'da `migrate resolve` veya manuel down migration yok — additive migration'lar geri alınmaz; yeni migration ile düzelt.
- **Supabase voice log:** `client_id` bağlantısı kopuksa ledger (`VoiceCrmAppliedAction`) üzerinden reconcile çalışır; duplicate Client oluşturmaz.
- **App rollback:** Vercel'de önceki deployment'a promote et; DB migration geri alınmaz — app eski sürüm yeni tabloları kullanmayabilir.

---

## 5. Eski kısa migration notu

Lokalden production DB'ye tek komut:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

## 5. parselos.com → Vercel DNS (Hostinger)

Hostinger hPanel → **Domains → parselos.com → DNS / Nameservers**

### Seçenek A — DNS kayıtları (önerilen)

Hostinger Node.js uygulamasını **durdurun** veya domain bağlantısını kaldırın.

| Tip | Ad | Değer |
|-----|-----|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Vercel → Project → **Settings → Domains** → `parselos.com` ve `www.parselos.com` ekleyin.

### Seçenek B — Vercel nameserver

Vercel'in verdiği NS kayıtlarını Hostinger'da nameserver olarak ayarlayın.

## 6. SSL

Vercel otomatik Let's Encrypt sağlar. DNS yayıldıktan sonra (5–48 saat) HTTPS aktif olur.

## 7. Deploy sonrası kontrol

- `https://parselos.com/api/health` → `{"ok":true}`
- `https://parselos.com` → landing page
- Giriş yap → `/dashboard`
- Clerk webhook test (Clerk dashboard)

## 8. CLI ile deploy

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

## Sorun giderme

| Hata | Çözüm |
|------|-------|
| Build: Prisma client | `postinstall: prisma generate` zaten package.json'da |
| Runtime: DB timeout | DATABASE_URL → 6543 + pgbouncer=true |
| Clerk redirect loop | Live keys + domain Clerk'te tanımlı mı kontrol et |
| 502/503 | Hostinger Node.js hâlâ domain'e bağlı olabilir — DNS'i Vercel'e yönlendir |
