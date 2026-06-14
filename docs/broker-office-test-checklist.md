# Broker Ofis — Manuel Test Checklist

Bu liste, dev/test ortamında `enesfiliz7@gmail.com` (veya script ile yükseltilmiş başka bir hesap) üzerinden Broker Ofis özelliklerini doğrulamak içindir.

**Ön koşul:** Hesap `scripts/upgrade-test-account-to-broker.ts` ile yükseltilmiş olmalı veya eşdeğer DB durumuna sahip olmalı:

- Script yalnızca **`ALLOW_TEST_BROKER_UPGRADE=1`** ile çalışır
- `Tenant.planType` = `PREMIUM` (UI: **Ofis**)
- `Tenant.organizationType` = `BROKERLIK`
- `Agent.roleType` = `BROKER`
- `Agent.tenantMemberRole` = `OWNER`
- `Tenant.status` = `ACTIVE`
- `Tenant.ownerAgentId` = `Agent.id`
- `iyzicoCustomerReference` / `iyzicoSubscriptionReference` / `iyzicoPricingPlanReference` **değişmemiş** (null kalabilir)

---

## 0. Script öncesi DB doğrulama (Prisma Studio)

- [ ] `Tenant.ownerAgentId` = hedef `Agent.id`
- [ ] Üç iyzico referans alanı script öncesi/sonrası aynı
- [ ] `DATABASE_URL` localhost veya bilinçli dev DB (production host değil)

---

## 1. Plan görünürlüğü

- [ ] Hesap menüsü / profil özetinde plan **Ofis** (PREMIUM) olarak görünüyor
- [ ] Rol rozeti **Broker / Ofis Sahibi** veya eşdeğeri görünüyor
- [ ] Üyelik rozeti / plan badge doğru renkte (altın / parsel-gold)

## 2. Abonelik sayfası (`/billing`)

- [ ] Mevcut plan **Ofis** olarak işaretli
- [ ] Ofis paketi özellikleri (5 danışman dahil, ek koltuk vb.) listeleniyor
- [ ] Ödeme geçmişi / iyzico referansı sahte veya boş olsa bile sayfa hata vermiyor

## 3. Ofis davet gönderme

- [ ] Hesap → Ekip / Ofis yönetimi bölümüne erişilebiliyor
- [ ] **Davet oluştur** butonu görünür ve tıklanabilir
- [ ] Yeni davet kodu oluşuyor ve listede görünüyor
- [ ] Davet linki / kodu kopyalanabiliyor

## 4. Davet iptal etme

- [ ] Aktif davet listede görünüyor
- [ ] Davet iptal / devre dışı bırakma çalışıyor
- [ ] İptal sonrası davet `isActive: false` veya listeden kalkıyor
- [ ] İptal edilen kodla yeni üye katılamıyor

## 5. Davet kabulü ve tenant üyeliği

- [ ] İkinci bir test hesabı davet kodu ile katılabiliyor
- [ ] Katılan kullanıcı aynı `tenantId` altında `Agent` kaydı alıyor
- [ ] Yeni üyenin `tenantMemberRole` = `MEMBER` (veya davette tanımlı rol)
- [ ] Ekip listesinde yeni üye görünüyor

## 6. Kullanıcı çıkarma

- [ ] Ofis sahibi (OWNER) ekip üyesini listeden çıkarabiliyor
- [ ] Çıkarılan kullanıcının `tenantId` temizleniyor veya erişimi kesiliyor
- [ ] OWNER kendini çıkaramıyor (beklenen kısıt)
- [ ] MANAGER yalnızca MEMBER çıkarabiliyor (rol hiyerarşisi)

## 7. Yetki ve rol kontrolleri

- [ ] OWNER: davet oluşturma, ekip yönetimi, ofis profili düzenleme açık
- [ ] MEMBER: davet oluşturma ve ekip yönetimi kapalı (403 veya UI gizli)
- [ ] Broker metrikleri (`canViewBrokerMetrics`) OWNER için açık
- [ ] API: `GET /api/account/summary` → `capabilities.canManageTeam: true`

## 8. Broker olmayan kullanıcı izolasyonu

- [ ] FREE veya PRO (Danışman) hesap ofis davet yönetimine erişemiyor
- [ ] `tenantMemberRole: MEMBER` olan danışman davet oluşturamıyor
- [ ] Başka tenant'a ait davet kodu ile katılım reddediliyor

## 9. Plan limitleri

- [ ] PREMIUM: portföy / müşteri / ilan içe aktarma sınırı yok (FREE limitleri uygulanmıyor)
- [ ] Ekip boyutu UI'da doğru sayılıyor (`teamCount`)
- [ ] Katalog metni: 5 danışman dahil bilgisi billing / account'ta tutarlı

## 10. Mobil ofis yönetimi

- [ ] Mobil genişlikte (`≤767px`) ekip paneli okunabilir
- [ ] Davet oluşturma ve listeleme mobilde kullanılabilir
- [ ] Üye çıkarma onayı mobilde çalışıyor
- [ ] Yatay kaydırma / taşma sorunu yok

---

## Hızlı doğrulama komutları

```bash
# PowerShell
$env:ALLOW_TEST_BROKER_UPGRADE="1"
npm run upgrade:test-broker

# veya tek satır (PowerShell)
$env:ALLOW_TEST_BROKER_UPGRADE="1"; node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts enesfiliz7@gmail.com

# Duplicate email varsa:
$env:ALLOW_TEST_BROKER_UPGRADE="1"; node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts --agentId <uuid>

# bash/zsh
ALLOW_TEST_BROKER_UPGRADE=1 node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts
```

Script sonrası tarayıcıda çıkış yapıp tekrar giriş yapın (Clerk `publicMetadata` senkronu için).

---

## Bilinen sınırlar (test ortamı)

- Script **`ALLOW_TEST_BROKER_UPGRADE=1`** olmadan çalışmaz; `NODE_ENV=production` ve `sk_live_` Clerk key engellenir.
- `DATABASE_URL` içinde `production`, `prod`, `vercel` algılanırsa script durur; `supabase.co` için uyarı basar (dev project doğrulayın).
- Script iyzico ödeme kayıtlarını oluşturmaz; billing sayfasında gerçek abonelik referansı olmayabilir.
- Proxy / middleware plan kontrolü Clerk `publicMetadata` üzerinden okur; senkron başarısızsa sayfayı yenileyin veya yeniden giriş yapın.
- Admin panel (`/admin/subscribers`) salt okunur; plan yükseltme oradan yapılmaz.
