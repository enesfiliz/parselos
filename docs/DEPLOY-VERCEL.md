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

## 4. Veritabanı migration (bir kez)

Lokalden production DB'ye:

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
