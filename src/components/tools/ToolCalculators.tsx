"use client";

import { useMemo, useState } from "react";

import {
  calculateImar,
  calculateKiraArtisi,
  calculateMortgage,
  calculateNetM2,
} from "@/lib/calculations";
import {
  calculateAmortismanV2,
  calculateBasitFaiz,
  calculateBilesikFaiz,
  calculateDaskYaklasik,
  calculateDegerArtisi,
  calculateEmlakVergisi,
  calculateEnflasyon,
  calculateEvAlmaMaliyeti,
  calculateGunSayisi,
  calculateKdvCikar,
  calculateKdvEkle,
  calculateKidemTazminati,
  calculateKisaDonemGetiri,
  calculateKomisyonOranli,
  calculateKomisyonPaylasimi,
  calculateKiraGeliriVergisi,
  calculateKiraKomisyonu,
  calculateKiraStopaji,
  calculateKrediKapatma,
  calculateM2Fiyati,
  calculateNetIcinBrutKira,
  calculateVerasetIntikal,
  calculateYuzde,
  calculateYuzdeKac,
  formatTRY,
  formatTRYKesirli,
  formatYuzde,
  parseSayiTr,
} from "@/lib/tool-calculations";

import { BosDurum, SayiGirisi, SonucKutusu } from "./ToolUi";

function AracDuzen({
  girisler,
  sonuc,
}: {
  girisler: React.ReactNode;
  sonuc: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        {girisler}
      </div>
      <div>{sonuc}</div>
    </div>
  );
}

export function KomisyonHesaplayici() {
  const [bedel, setBedel] = useState("2500000");
  const [oran, setOran] = useState("4");
  const [kdv, setKdv] = useState("20");

  const sonuc = useMemo(() => {
    const b = parseSayiTr(bedel);
    const o = parseSayiTr(oran);
    const k = parseSayiTr(kdv, true);
    if (!b || !o || k === null) return null;
    return calculateKomisyonOranli(b, o, k / 100);
  }, [bedel, oran, kdv]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Satış bedeli" deger={bedel} onDeger={setBedel} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi
              label="Toplam komisyon oranı"
              deger={oran}
              onDeger={setOran}
              suffix="%"
              hint="Alıcı ve satıcıdan birlikte tahsil edilen toplam oran; yasal üst sınır %4 + KDV."
            />
            <SayiGirisi label="KDV oranı" deger={kdv} onDeger={setKdv} suffix="%" hint="Gayrimenkul hizmetlerinde güncel KDV oranı %20'dir." />
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Hesap sonucu"
            satirlar={[
              { etiket: "Alıcı komisyonu (KDV hariç)", deger: formatTRY(sonuc.aliciKdvHaric) },
              { etiket: "Satıcı komisyonu (KDV hariç)", deger: formatTRY(sonuc.saticiKdvHaric) },
              { etiket: "Toplam KDV", deger: formatTRY(sonuc.kdvTutari) },
              { etiket: "Toplam tahsilat (KDV dahil)", deger: formatTRY(sonuc.toplamKdvDahil), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için satış bedelini girin." />
        )
      }
    />
  );
}

export function KomisyonPaylasimHesaplayici() {
  const [komisyon, setKomisyon] = useState("100000");
  const [aracilik, setAracilik] = useState("0");
  const [ofis, setOfis] = useState("50");

  const sonuc = useMemo(() => {
    const k = parseSayiTr(komisyon);
    if (!k) return null;
    return calculateKomisyonPaylasimi({
      komisyonKdvHaric: k,
      ofisYuzdesi: parseSayiTr(ofis, true) ?? 0,
      digerAracilikYuzdesi: parseSayiTr(aracilik, true) ?? 0,
      kdvOrani: 0,
    });
  }, [komisyon, aracilik, ofis]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Toplam hizmet bedeli (KDV hariç)" deger={komisyon} onDeger={setKomisyon} prefix="₺" />
          <SayiGirisi
            label="Düzenleyen/ortak ofis payı"
            deger={aracilik}
            onDeger={setAracilik}
            suffix="%"
            sifirOlabilir
            hint="İlanı düzenleyen ofis dışı bir aracısaysa toplam komisyon üzerinden payı girin; yoksa 0 bırakın."
          />
          <SayiGirisi label="Ofis payı (kalan havuzdan)" deger={ofis} onDeger={setOfis} suffix="%" sifirOlabilir />
          <p className="text-xs text-muted-foreground">
            Ofis payı, ortak ofis düşüldük sonra kalan havuzun oranıdır; kalan
            tutarın tamamı danışmanın yazılır. Pay oranları yasal sabit değil,
            sözleşmeyle belirlenir.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Dağılım"
            satirlar={[
              ...(sonuc.digerAracilikPay > 0
                ? [{ etiket: "Ortak ofis payı", deger: formatTRY(sonuc.digerAracilikPay) }]
                : []),
              { etiket: "Paylaşım havuzu", deger: formatTRY(sonuc.netPaylasimHavuzu) },
              { etiket: "Ofis payı", deger: formatTRY(sonuc.ofisPay) },
              { etiket: "Danışmanın eline geçen", deger: formatTRY(sonuc.danismanPay), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Paylaşımı görmek için komisyon tutarını girin." />
        )
      }
    />
  );
}

export function KiraGetirisiHesaplayici() {
  const [deger, setDeger] = useState("3000000");
  const [kira, setKira] = useState("25000");

  const girdiDeger = parseSayiTr(deger);
  const girdiKira = parseSayiTr(kira);
  const sonuc = useMemo(() => {
    if (!girdiDeger || !girdiKira) return null;
    return calculateAmortismanV2(girdiDeger, girdiKira);
  }, [girdiDeger, girdiKira]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Taşınmaz değeri / satış fiyatı" deger={deger} onDeger={setDeger} prefix="₺" />
          <SayiGirisi label="Aylık kira bedeli" deger={kira} onDeger={setKira} prefix="₺" />
        </>
      }
      sonuc={
        sonuc && girdiKira ? (
          <SonucKutusu
            baslik="Yatırım geri dönüşü"
            satirlar={[
              { etiket: "Yıllık brüt getiri oranı", deger: formatYuzde(sonuc.yillikBrutGetiri), vurgulu: true },
              { etiket: "Geri dönüş (amortisman) süresi", deger: `${sonuc.geriDonusYil} yıl ${sonuc.geriDonusAy} ay` },
              { etiket: "Yıllık kira geliri", deger: formatTRY(girdiKira * 12) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Getiri için taşınmaz değeri ve aylık kirayı girin." />
        )
      }
    />
  );
}

export function KiraArtisHesaplayici() {
  const [kira, setKira] = useState("15000");
  const [oran, setOran] = useState("35");
  const [ticari, setTicari] = useState(false);
  const [stopaj, setStopaj] = useState("20");

  const girdiKira = parseSayiTr(kira);
  const girdiOran = parseSayiTr(oran, true);
  const yeniKira = useMemo(() => {
    if (!girdiKira || girdiOran === null) return null;
    return calculateKiraArtisi(girdiKira, girdiOran);
  }, [girdiKira, girdiOran]);

  const girdiStopaj = parseSayiTr(stopaj, true);
  const stopajSonuc = useMemo(() => {
    if (!ticari || !yeniKira || girdiStopaj === null) return null;
    return calculateKiraStopaji(yeniKira, girdiStopaj);
  }, [ticari, yeniKira, girdiStopaj]);

  return (
    <div className="space-y-4">
      <AracDuzen
        girisler={
          <>
            <SayiGirisi label="Mevcut aylık kira" deger={kira} onDeger={setKira} prefix="₺" />
            <SayiGirisi
              label="Uygulanacak artış oranı"
              deger={oran}
              onDeger={setOran}
              suffix="%"
              sifirOlabilir
              hint="Yenileme döneminde sözleşmede belirlenen oran, TÜFE 12 aylık ortalamasını geçemez. Güncel oranı, yenileme ayınızdan bir önceki TÜİK açıklamasından teyit edin."
            />
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={ticari}
                onChange={(e) => setTicari(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              İş yeri kirası — stopaj dağılımını da göster
            </label>
            {ticari ? (
              <>
                <SayiGirisi label="Stopaj oranı" deger={stopaj} onDeger={setStopaj} suffix="%" sifirOlabilir />
                <p className="text-xs text-muted-foreground">
                  Değişiklik ihtimaline karşı güncel stopaj oranını teyit edin.
                </p>
              </>
            ) : null}
          </>
        }
        sonuc={
          yeniKira !== null && girdiKira ? (
            <SonucKutusu
              baslik="Yenileme sonucu"
              satirlar={[
                { etiket: "Mevcut kira", deger: formatTRY(girdiKira) },
                { etiket: "Yeni kira", deger: formatTRY(yeniKira), vurgulu: true },
                { etiket: "Yıllık fark", deger: formatTRY((yeniKira - girdiKira) * 12) },
              ]}
            />
          ) : (
            <BosDurum mesaj="Yeni kirayı görmek için mevcut kira ve artış oranını girin." />
          )
        }
      />
      {stopajSonuc ? (
        <SonucKutusu
          baslik="İş yeri: kiracının ödeyeceği brüt ve mal sahibinin neti"
          satirlar={[
            { etiket: "Brüt kira (sözleşmede yazan)", deger: formatTRY(stopajSonuc.brutKira) },
            { etiket: "Kesilen stopaj (gelir vergisi)", deger: formatTRY(stopajSonuc.stopaj) },
            { etiket: "Mal sahibine kalan net", deger: formatTRY(stopajSonuc.netKira), vurgulu: true },
          ]}
        />
      ) : null}
    </div>
  );
}

export function TapuHarciHesaplayici() {
  const [bedel, setBedel] = useState("3000000");
  const [doner, setDoner] = useState("6681");

  const sonuc = useMemo(() => {
    const b = parseSayiTr(bedel);
    if (!b) return null;
    const donerSermaye = parseSayiTr(doner, true) ?? 0;
    const aliciPayi = b * 0.02;
    const saticiPayi = b * 0.02;
    return {
      aliciPayi,
      saticiPayi,
      harçToplam: aliciPayi + saticiPayi,
      donerSermaye,
      genelToplam: aliciPayi + saticiPayi + donerSermaye,
    };
  }, [bedel, doner]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Beyan edilen satış bedeli"
            deger={bedel}
            onDeger={setBedel}
            prefix="₺"
            hint="Harç, tapuda beyan edilen bedel üzerinden hesaplanır; gerçek bedelden düşük beyan cezalı işleme konu olur."
          />
          <SayiGirisi
            label="Döner sermaye bedeli"
            deger={doner}
            onDeger={setDoner}
            prefix="₺"
            sifirOlabilir
            hint="2026 yılı için yaklaşık tutar; işlemden önce güncel tarifeyi tapu müdürlüğünden teyit edin. Dahil etmek istemiyorsanız 0 girin."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Tapu harcı dağılımı"
            satirlar={[
              { etiket: "Alıcı payı (%2)", deger: formatTRY(sonuc.aliciPayi) },
              { etiket: "Satıcı payı (%2)", deger: formatTRY(sonuc.saticiPayi) },
              { etiket: "Tapu harcı toplamı (%4)", deger: formatTRY(sonuc.harçToplam) },
              ...(sonuc.donerSermaye > 0
                ? [{ etiket: "Döner sermaye bedeli", deger: formatTRY(sonuc.donerSermaye) }]
                : []),
              { etiket: "Genel toplam", deger: formatTRY(sonuc.genelToplam), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Tapu harcı için beyan edilen bedeli girin." />
        )
      }
    />
  );
}

export function ImarHesaplayici() {
  const [arsa, setArsa] = useState("1000");
  const [taks, setTaks] = useState("0.30");
  const [kaks, setKaks] = useState("1.50");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(arsa);
    const t = parseSayiTr(taks);
    const k = parseSayiTr(kaks);
    if (!a || !t || !k) return null;
    return calculateImar(a, t, k);
  }, [arsa, taks, kaks]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Arsa alanı" deger={arsa} onDeger={setArsa} suffix="m²" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="TAKS" deger={taks} onDeger={setTaks} hint="Taban alanı katsayısı — yapı tabanının arsaya oranı." />
            <SayiGirisi label="KAKS / Emsal" deger={kaks} onDeger={setKaks} hint="Kat alanı katsayısı — toplam inşaat alanının arsaya oranı." />
          </div>
          <p className="text-xs text-muted-foreground">
            Birçok belediyede TAKS, imar uygulama alanına giren kesinleşmiş
            parsel alanı (TAKDS) üzerinden hesaplanır; katsayıları imar durum
            belgesinden teyit edin.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="İmar hesabı"
            satirlar={[
              { etiket: "Taban alanı (TAKS × arsa)", deger: `${sonuc.tabanOturumu.toLocaleString("tr-TR")} m²` },
              { etiket: "Toplam inşaat alanı (KAKS × arsa)", deger: `${sonuc.toplamInsaatAlani.toLocaleString("tr-TR")} m²`, vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Hesap için arsa alanı, TAKS ve KAKS değerlerini girin." />
        )
      }
    />
  );
}

export function NetBrutHesaplayici() {
  const [brut, setBrut] = useState("120");
  const [kayip, setKayip] = useState("20");

  const girdiBrut = parseSayiTr(brut);
  const girdiKayip = parseSayiTr(kayip, true);
  const sonuc = useMemo(() => {
    if (!girdiBrut || girdiKayip === null) return null;
    return calculateNetM2(girdiBrut, girdiKayip);
  }, [girdiBrut, girdiKayip]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Brüt alan" deger={brut} onDeger={setBrut} suffix="m²" />
          <SayiGirisi
            label="Ortak alan / duvar kaybı"
            deger={kayip}
            onDeger={setKayip}
            suffix="%"
            sifirOlabilir
            hint="Daire tipine göre genelde %15-25 aralığındadır; kesin net metrekare tapu projesinden doğrulanmalıdır."
          />
        </>
      }
      sonuc={
        sonuc !== null && girdiBrut ? (
          <SonucKutusu
            baslik="Alan dönüşümü"
            satirlar={[
              { etiket: "Brüt alan", deger: `${girdiBrut.toLocaleString("tr-TR")} m²` },
              { etiket: "Tahmini net alan", deger: `${sonuc.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} m²`, vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Net alanı görmek için brüt m² girin." />
        )
      }
    />
  );
}

export function KonutKredisiHesaplayici() {
  const [tutar, setTutar] = useState("2000000");
  const [vade, setVade] = useState("120");
  const [faiz, setFaiz] = useState("2.99");

  const sonuc = useMemo(() => {
    const t = parseSayiTr(tutar);
    const v = parseSayiTr(vade);
    const f = parseSayiTr(faiz, true);
    if (!t || !v || f === null) return null;
    return calculateMortgage(t, Math.round(v), f);
  }, [tutar, vade, faiz]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Kredi tutarı" deger={tutar} onDeger={setTutar} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Vade" deger={vade} onDeger={setVade} suffix="ay" />
            <SayiGirisi label="Aylık faiz oranı" deger={faiz} onDeger={setFaiz} suffix="%" sifirOlabilir />
          </div>
          <p className="text-xs text-muted-foreground">
            Sonuca masraf ve BSMV gibi ek maliyetler dahil değildir; nihai
            taksit bankanın sözleşme tablosuna göredir.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Ödeme planı"
            satirlar={[
              { etiket: "Aylık taksit", deger: formatTRY(sonuc.aylikTaksit), vurgulu: true },
              { etiket: "Toplam geri ödeme", deger: formatTRY(sonuc.toplamGeriOdeme) },
              { etiket: "Toplam faiz yükü", deger: formatTRY(sonuc.toplamFaiz) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Taksit için kredi tutarı, vade ve faiz oranı girin." />
        )
      }
    />
  );
}

export function KdvHesaplayici() {
  const [tutar, setTutar] = useState("10000");
  const [oran, setOran] = useState("20");
  const [dahilden, setDahilden] = useState(false);

  const sonuc = useMemo(() => {
    const t = parseSayiTr(tutar);
    const o = parseSayiTr(oran);
    if (!t || !o) return null;
    return dahilden ? calculateKdvCikar(t, o) : calculateKdvEkle(t, o);
  }, [tutar, oran, dahilden]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label={dahilden ? "KDV dahil tutar" : "KDV hariç tutar (matrah)"}
            deger={tutar}
            onDeger={setTutar}
            prefix="₺"
          />
          <SayiGirisi label="KDV oranı" deger={oran} onDeger={setOran} suffix="%" hint="Standart KDV oranı %20; bazı mal ve hizmetlerde %10 veya %1 uygulanır." />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDahilden(false)}
              className={`min-h-11 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors ${!dahilden ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              Tutarıma KDV ekle
            </button>
            <button
              type="button"
              onClick={() => setDahilden(true)}
              className={`min-h-11 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors ${dahilden ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              KDV&apos;li tutardan düş
            </button>
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="KDV sonucu"
            satirlar={[
              { etiket: "Matrah (KDV hariç)", deger: formatTRYKesirli(sonuc.matrah) },
              { etiket: "KDV tutarı", deger: formatTRYKesirli(sonuc.kdvTutari) },
              { etiket: "Toplam (KDV dahil)", deger: formatTRYKesirli(sonuc.kdvDahilToplam), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Hesap için tutarı girin." />
        )
      }
    />
  );
}

export function YuzdeHesaplayici() {
  const [sayi, setSayi] = useState("250");
  const [oran, setOran] = useState("20");
  const [karsilastirma, setKarsilastirma] = useState("");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(sayi);
    const o = parseSayiTr(oran, true);
    if (!a || o === null) return null;
    return calculateYuzde(a, o);
  }, [sayi, oran]);

  const yuzdeKac = useMemo(() => {
    const a = parseSayiTr(sayi);
    const b = parseSayiTr(karsilastirma, true);
    if (!a || b === null) return null;
    return calculateYuzdeKac(a, b);
  }, [sayi, karsilastirma]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Sayı" deger={sayi} onDeger={setSayi} />
          <SayiGirisi label="Yüzde oranı" deger={oran} onDeger={setOran} suffix="%" sifirOlabilir />
          <SayiGirisi
            label="Karşılaştırma (opsiyonel)"
            deger={karsilastirma}
            onDeger={setKarsilastirma}
            sifirOlabilir
            hint="İkinci sayıyı girin: yukarıdaki sayının yüzde kaçı olduğunu bulalım."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Yüzde sonuçları"
            satirlar={[
              { etiket: `${oran}% kaç eder`, deger: formatTRYKesirli(sonuc.yuzdeDegeri) },
              { etiket: "Bu oranda artışlı hali", deger: formatTRYKesirli(sonuc.artisSonucu) },
              { etiket: "Bu oranda azalışlı hali", deger: formatTRYKesirli(sonuc.azalisSonucu) },
              ...(yuzdeKac !== null
                ? [{ etiket: "Karşılaştırma sayısının yüzdesi", deger: formatYuzde(yuzdeKac), vurgulu: true }]
                : []),
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonuç için bir sayı ve yüzde oranı girin." />
        )
      }
    />
  );
}

export function IhtiyacKredisiHesaplayici() {
  const [tutar, setTutar] = useState("100000");
  const [vade, setVade] = useState("12");
  const [faiz, setFaiz] = useState("3.50");

  const sonuc = useMemo(() => {
    const t = parseSayiTr(tutar);
    const v = parseSayiTr(vade);
    const f = parseSayiTr(faiz, true);
    if (!t || !v || f === null) return null;
    return calculateMortgage(t, Math.round(v), f);
  }, [tutar, vade, faiz]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Kredi tutarı" deger={tutar} onDeger={setTutar} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Vade" deger={vade} onDeger={setVade} suffix="ay" />
            <SayiGirisi label="Aylık faiz oranı" deger={faiz} onDeger={setFaiz} suffix="%" sifirOlabilir />
          </div>
          <p className="text-xs text-muted-foreground">
            Bankaların ihtiyaç kredilerinde faiz genelde aylık oranla anılır;
            masraf ve BSMV sonuçlara dahil değildir.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Ödeme planı"
            satirlar={[
              { etiket: "Aylık taksit", deger: formatTRY(sonuc.aylikTaksit), vurgulu: true },
              { etiket: "Toplam geri ödeme", deger: formatTRY(sonuc.toplamGeriOdeme) },
              { etiket: "Toplam faiz yükü", deger: formatTRY(sonuc.toplamFaiz) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Taksit için tutar, vade ve faiz oranı girin." />
        )
      }
    />
  );
}

export function BilesikFaizHesaplayici() {
  const [anaPara, setAnaPara] = useState("100000");
  const [oran, setOran] = useState("45");
  const [yil, setYil] = useState("2");
  const [periyot, setPeriyot] = useState("12");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(anaPara);
    const o = parseSayiTr(oran);
    const y = parseSayiTr(yil);
    const p = parseSayiTr(periyot);
    if (!a || !o || !y || !p) return null;
    return calculateBilesikFaiz(a, o, y, p);
  }, [anaPara, oran, yil, periyot]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Ana para / birikim" deger={anaPara} onDeger={setAnaPara} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Yıllık bileşik oran" deger={oran} onDeger={setOran} suffix="%" />
            <SayiGirisi label="Süre" deger={yil} onDeger={setYil} suffix="yıl" />
          </div>
          <div className="flex gap-2">
            {[
              { deger: "12", etiket: "Aylık" },
              { deger: "4", etiket: "3 aylık" },
              { deger: "1", etiket: "Yıllık" },
            ].map((o) => (
              <button
                key={o.deger}
                type="button"
                onClick={() => setPeriyot(o.deger)}
                className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-medium transition-colors ${periyot === o.deger ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {o.etiket}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Faiz getirisi vergiye tabi olabilir; sonuç brüt büyüme senaryosudur.
            Mevduat stopaj oranlarını bankanızdan teyit edin.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Bileşik büyüme"
            satirlar={[
              { etiket: "Ana para", deger: formatTRY(sonuc.anaPara) },
              { etiket: "Dönem sonunda toplam", deger: formatTRY(sonuc.birikenToplam), vurgulu: true },
              { etiket: "Toplam getiri", deger: formatTRY(sonuc.toplamGetiri) },
              { etiket: "Faizlendirme dönemi sayısı", deger: `${sonuc.donemSayisi}` },
            ]}
          />
        ) : (
          <BosDurum mesaj="Büyümeyi görmek için ana para ve oran girin." />
        )
      }
    />
  );
}

export function NetIcinBrutKiraHesaplayici() {
  const [net, setNet] = useState("20000");
  const [stopaj, setStopaj] = useState("20");

  const girdiNet = parseSayiTr(net);
  const girdiStopaj = parseSayiTr(stopaj, true);
  const brut = useMemo(() => {
    if (!girdiNet || girdiStopaj === null) return null;
    return calculateNetIcinBrutKira(girdiNet, girdiStopaj);
  }, [girdiNet, girdiStopaj]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Mal sahibinin istediği net kira" deger={net} onDeger={setNet} prefix="₺" />
          <SayiGirisi label="Stopaj oranı" deger={stopaj} onDeger={setStopaj} suffix="%" sifirOlabilir hint="İş yeri kiralarında gelir vergisi stopajı güncel oranını teyit ederek girin." />
        </>
      }
      sonuc={
        brut && girdiNet ? (
          <SonucKutusu
            baslik="İş yeri: netten bruta"
            satirlar={[
              { etiket: "Net kira (mal sahibine kalan)", deger: formatTRY(girdiNet) },
              { etiket: "Aylık stopaj", deger: formatTRY(brut - girdiNet) },
              { etiket: "Sözleşmede yazacak brüt kira", deger: formatTRY(brut), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Brüt kirayı görmek için istenen net kirayı girin." />
        )
      }
    />
  );
}

export function M2BirimFiyatHesaplayici() {
  const [bedel, setBedel] = useState("2500000");
  const [m2, setM2] = useState("120");

  const sonuc = useMemo(() => {
    const b = parseSayiTr(bedel);
    const a = parseSayiTr(m2);
    if (!b || !a) return null;
    return calculateM2Fiyati(b, a);
  }, [bedel, m2]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Toplam bedel" deger={bedel} onDeger={setBedel} prefix="₺" />
          <SayiGirisi label="Alan" deger={m2} onDeger={setM2} suffix="m²" hint="İlanlarda brüt veya net yazdığını teyit edin; karşılaştırma aynı tür alandan yapılmalı." />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Birim fiyat"
            satirlar={[
              { etiket: "Metrekare birim fiyatı", deger: formatTRYKesirli(sonuc), vurgulu: true },
              { etiket: "100 m² karşılığı", deger: formatTRY(sonuc * 100) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Birim fiyat için bedel ve alan girin." />
        )
      }
    />
  );
}

export function KiraKomisyonHesaplayici() {
  const [kira, setKira] = useState("20000");
  const [kiraSayisi, setKiraSayisi] = useState("1");
  const [kdv, setKdv] = useState("20");
  const [esit, setEsit] = useState(true);

  const sonuc = useMemo(() => {
    const k = parseSayiTr(kira);
    const ks = parseSayiTr(kiraSayisi);
    const v = parseSayiTr(kdv, true);
    if (!k || !ks || v === null) return null;
    return calculateKiraKomisyonu(k, ks, v / 100, esit);
  }, [kira, kiraSayisi, kdv, esit]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Aylık kira bedeli" deger={kira} onDeger={setKira} prefix="₺" />
          <SayiGirisi
            label="Komisyon kaç kira?"
            deger={kiraSayisi}
            onDeger={setKiraSayisi}
            suffix="kira"
            hint="Yasal üst sınır sözleşmedeki bir aylık kira bedelidir; araç 1,5 gibi ara değerlere de izin verir."
          />
          <SayiGirisi label="KDV oranı" deger={kdv} onDeger={setKdv} suffix="%" sifirOlabilir />
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={esit}
              onChange={(e) => setEsit(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Komisyon kiracı ve mal sahibi arasında eşit paylaşılsın
          </label>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Kiralama hizmet bedeli"
            satirlar={[
              { etiket: "Toplam komisyon (KDV hariç)", deger: formatTRY(sonuc.toplamKomisyon) },
              { etiket: "KDV", deger: formatTRY(sonuc.kdvTutari) },
              { etiket: "Genel toplam (KDV dahil)", deger: formatTRY(sonuc.toplamKdvDahil), vurgulu: true },
              ...(esit
                ? [{ etiket: "Her tarafa düşen", deger: formatTRY(sonuc.tarafaDusen) }]
                : []),
            ]}
          />
        ) : (
          <BosDurum mesaj="Komisyon için aylık kirayı girin." />
        )
      }
    />
  );
}

export function DaskHesaplayici() {
  const [m2, setM2] = useState("100");
  const [bazBedel, setBazBedel] = useState("2500");
  const [ustSinir, setUstSinir] = useState("4500000");
  const [tarife, setTarife] = useState("0.25");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(m2);
    const b = parseSayiTr(bazBedel);
    const u = parseSayiTr(ustSinir);
    const t = parseSayiTr(tarife);
    if (!a || !b || !u || !t) return null;
    return calculateDaskYaklasik(a, b, u, t);
  }, [m2, bazBedel, ustSinir, tarife]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Konut alanı" deger={m2} onDeger={setM2} suffix="m²" />
          <SayiGirisi
            label="Metrekare baz bedeli"
            deger={bazBedel}
            onDeger={setBazBedel}
            prefix="₺"
            hint="DASK her yıl güncellenen metrekare baz bedeli üzerinden sigorta bedelini hesaplar; güncel rakamı teyit edin."
          />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Sigorta bedeli üst sınırı" deger={ustSinir} onDeger={setUstSinir} prefix="₺" hint="Güncel azami teminat tutarı." />
            <SayiGirisi label="Tarife oranı" deger={tarife} onDeger={setTarife} suffix="%" hint="Bölge ve yapı tarzına göre değişir; poliçedeki oranı esas alın." />
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Zorunlu deprem sigortası (yaklaşık)"
            satirlar={[
              { etiket: "Sigorta bedeli", deger: formatTRY(sonuc.sigortaBedeli) },
              { etiket: "Yaklaşık yıllık prim", deger: formatTRYKesirli(sonuc.prim), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Prim için alan ve baz bedel girin." />
        )
      }
    />
  );
}

export function KisaDonemGetiriHesaplayici() {
  const [gecelik, setGecelik] = useState("2000");
  const [gun, setGun] = useState("30");
  const [doluluk, setDoluluk] = useState("60");
  const [gider, setGider] = useState("15000");

  const sonuc = useMemo(() => {
    const g = parseSayiTr(gecelik);
    const sg = parseSayiTr(gun);
    const d = parseSayiTr(doluluk, true);
    const x = parseSayiTr(gider, true);
    if (!g || !sg || d === null || x === null) return null;
    return calculateKisaDonemGetiri(g, sg, d, x);
  }, [gecelik, gun, doluluk, gider]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Gecelik konaklama fiyatı" deger={gecelik} onDeger={setGecelik} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Değerlendirme günü" deger={gun} onDeger={setGun} suffix="gün" />
            <SayiGirisi label="Doluluk oranı" deger={doluluk} onDeger={setDoluluk} suffix="%" sifirOlabilir />
          </div>
          <SayiGirisi
            label="Aylık sabit giderler"
            deger={gider}
            onDeger={setGider}
            prefix="₺"
            hint="Site aidatı, faturalar, temizlik ve platform komisyonu gibi tekrar eden giderler."
          />
          <p className="text-xs text-muted-foreground">
            Kısa dönem kiralamada belediye izin ve vergi yükümlülükleri
            vardır; gelir modeli bölgesel kurallara göre değişir.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Kısa dönem gelir senaryosu"
            satirlar={[
              { etiket: "Tutulan gece sayısı", deger: `${sonuc.dolulukGunSayisi} gece` },
              { etiket: "Aylık brüt gelir", deger: formatTRY(sonuc.aylikBrutGelir) },
              { etiket: "Aylık net gelir", deger: formatTRY(sonuc.aylikNetGelir), vurgulu: true },
              { etiket: "Yıllık net (aylar aynıysa)", deger: formatTRY(sonuc.yillikNetGelir) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Gelir için gecelik fiyat ve doluluk girin." />
        )
      }
    />
  );
}

export function EmlakVergisiHesaplayici() {
  const [matrah, setMatrah] = useState("1500000");
  const [oran, setOran] = useState("0.2");

  const sonuc = useMemo(() => {
    const m = parseSayiTr(matrah);
    const o = parseSayiTr(oran);
    if (!m || !o) return null;
    return calculateEmlakVergisi(m, o);
  }, [matrah, oran]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Rayiç bedel (belediyedeki kayıtlı değer)"
            deger={matrah}
            onDeger={setMatrah}
            prefix="₺"
            hint="Emlak vergisi matrahı, belediyenin belirlediği rayiç bedeldir; tapu harcı beyanıyla karıştırmayın."
          />
          <SayiGirisi
            label="Vergi oranı"
            deger={oran}
            onDeger={setOran}
            suffix="%"
            hint="Konut için binde 2 (büyükşehirde binde 4'e kadar), iş yeri ve arsa için farklı oranlar uygulanır; güncel oranı belediyenizden teyit edin."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Yıllık emlak vergisi"
            satirlar={[
              { etiket: "Yıllık toplam", deger: formatTRY(sonuc.yillikVergi), vurgulu: true },
              { etiket: "Her taksit (2 eşit taksit)", deger: formatTRY(sonuc.taksitTutari) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Vergiyi görmek için rayiç bedeli girin." />
        )
      }
    />
  );
}

export function DegerArtisiHesaplayici() {
  const [alis, setAlis] = useState("2000000");
  const [satis, setSatis] = useState("3500000");
  const [istisna, setIstisna] = useState("60000");
  const [oran, setOran] = useState("20");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(alis);
    const s = parseSayiTr(satis);
    const i = parseIstisnaOr(istisna);
    const o = parseSayiTr(oran, true);
    if (!a || !s || o === null) return null;
    return calculateDegerArtisi(a, s, i, o);
  }, [alis, satis, istisna, oran]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Güncellenmiş alış bedeli"
            deger={alis}
            onDeger={setAlis}
            prefix="₺"
            hint="Alış yılındaki bedelin enflasyon/güncelleme katkısıyla yükseltilmiş hali. Pahalıya aldıysanız bu alan kazancınızı düşürür."
          />
          <SayiGirisi label="Satış bedeli" deger={satis} onDeger={setSatis} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi
              label="İstisna tutarı"
              deger={istisna}
              onDeger={setIstisna}
              prefix="₺"
              sifirOlabilir
              hint="Her yıl güncellenen kazanç istisnası; beyannamede güncel tutarı kullanın."
            />
            <SayiGirisi
              label="Vergi oranı (yaklaşık)"
              deger={oran}
              onDeger={setOran}
              suffix="%"
              sifirOlabilir
              hint="Tarife artan oranlıdır (%15'ten başlar). Bu araç tek bir ortalama oranla yaklaşık verir; kesin vergi toplam gelirinize göre bulunur."
            />
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Değer artışı kazancı"
            satirlar={[
              { etiket: "Ham kazanç", deger: formatTRY(sonuc.hamKazanc) },
              { etiket: "İstisna sonrası kazanç", deger: formatTRY(sonuc.istisnaSonrasiKazanc), vurgulu: true },
              { etiket: "Yaklaşık vergi", deger: formatTRY(sonuc.tahminiVergi) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Kazancı görmek için alış ve satış bedelini girin." />
        )
      }
    />
  );
}

function parseIstisnaOr(v: string): number {
  const t = v.trim();
  if (t === "" || t === "0") return 0;
  return parseSayiTr(t, true) ?? 0;
}

export function BasitFaizHesaplayici() {
  const [anaPara, setAnaPara] = useState("100000");
  const [oran, setOran] = useState("45");
  const [vade, setVade] = useState("6");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(anaPara);
    const o = parseSayiTr(oran, true);
    const v = parseSayiTr(vade);
    if (!a || o === null || !v) return null;
    return calculateBasitFaiz(a, o, v);
  }, [anaPara, oran, vade]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Ana para" deger={anaPara} onDeger={setAnaPara} prefix="₺" />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Yıllık basit oran" deger={oran} onDeger={setOran} suffix="%" hint="Faizin ana paraya eklenmeden büyüdüğü basit hesap (mevduat tek faiz dönemi için yaklaşık)." />
            <SayiGirisi label="Vade" deger={vade} onDeger={setVade} suffix="ay" />
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Basit faiz sonucu"
            satirlar={[
              { etiket: "Faiz getirisi", deger: formatTRY(sonuc.faizGetirisi), vurgulu: true },
              { etiket: "Vade sonu toplam", deger: formatTRY(sonuc.vadeSonuToplam) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Getiriyi görmek için ana para ve vade girin." />
        )
      }
    />
  );
}

export function GunSayisiHesaplayici() {
  const bugun = new Date();
  const varsayilan = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const [baslangic, setBaslangic] = useState(varsayilan(bugun));
  const [bitis, setBitis] = useState(() => {
    const y = new Date(bugun);
    y.setDate(y.getDate() + 90);
    return varsayilan(y);
  });

  const sonuc = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(baslangic) || !/^\d{4}-\d{2}-\d{2}$/.test(bitis)) {
      return null;
    }
    return calculateGunSayisi(new Date(baslangic), new Date(bitis));
  }, [baslangic, bitis]);

  const tarihGirisi = (
    label: string,
    deger: string,
    onDeger: (v: string) => void,
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type="date"
        value={deger}
        onChange={(e) => onDeger(e.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base tabular-nums text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
      />
    </div>
  );

  return (
    <AracDuzen
      girisler={
        <>
          {tarihGirisi("Başlangıç tarihi", baslangic, setBaslangic)}
          {tarihGirisi("Bitiş tarihi", bitis, setBitis)}
          <p className="text-xs text-muted-foreground">
            Başlangıç günü sayılmaz, bitiş günü sayılır. İş günü sayısı hafta
            sonlarını çıkarır; resmî tatiller dahil değildir.
          </p>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="İki tarih arası"
            satirlar={[
              { etiket: "Toplam gün", deger: `${sonuc.toplamGun} gün`, vurgulu: true },
              { etiket: "İş günü", deger: `${sonuc.isGunleri} gün` },
              { etiket: "Yıl / ay / gün", deger: `${sonuc.yil} yıl ${sonuc.ay} ay ${sonuc.gun} gün` },
            ]}
          />
        ) : (
          <BosDurum mesaj="Bitiş tarihi başlangıçtan sonra olmalı." />
        )
      }
    />
  );
}

export function KiraGeliriVergisiHesaplayici() {
  const [kira, setKira] = useState("120000");
  const [istisna, setIstisna] = useState("28000");
  const [goturu, setGoturu] = useState(true);
  const [gercekGider, setGercekGider] = useState("0");
  const [oran, setOran] = useState("20");

  const sonuc = useMemo(() => {
    const k = parseSayiTr(kira);
    if (!k) return null;
    return calculateKiraGeliriVergisi(
      k,
      parseSayiTr(istisna, true) ?? 0,
      goturu,
      parseSayiTr(gercekGider, true) ?? 0,
      parseSayiTr(oran, true) ?? 0,
    );
  }, [kira, istisna, goturu, gercekGider, oran]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Yıllık brüt kira geliri" deger={kira} onDeger={setKira} prefix="₺" hint="Mesken kiralarından bir yılda tahsil edilen toplam tutar." />
          <SayiGirisi
            label="İstisna tutarı"
            deger={istisna}
            onDeger={setIstisna}
            prefix="₺"
            sifirOlabilir
            hint="Mesken kira geliri için yıllık istisna; beyannamede düşülür. İstisna değişirse güncelleyin."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGoturu(true)}
              className={`min-h-11 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors ${goturu ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              Götürü gider (%15)
            </button>
            <button
              type="button"
              onClick={() => setGoturu(false)}
              className={`min-h-11 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors ${!goturu ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              Gerçek gider
            </button>
          </div>
          {!goturu ? (
            <SayiGirisi
              label="Gerçek gider tutarı"
              deger={gercekGider}
              onDeger={setGercekGider}
              prefix="₺"
              sifirOlabilir
              hint="Amortisman, bakım, aidat, faiz gibi belgelenebilir giderlerin toplamı."
            />
          ) : null}
          <SayiGirisi
            label="Ortalama vergi oranı"
            deger={oran}
            onDeger={setOran}
            suffix="%"
            hint="Tarife artan oranlıdır (%15–%40). Matrahınızın büyüklüğüne göre ortalama bir oran girin."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Yaklaşık vergi"
            satirlar={[
              { etiket: "İstisna sonrası gelir", deger: formatTRY(sonuc.istisnaSonrasi) },
              { etiket: goturu ? "Götürü gider (%15)" : "Gerçek gider", deger: formatTRY(sonuc.giderTutari) },
              { etiket: "Vergi matrahı", deger: formatTRY(sonuc.vergiMatrahi) },
              { etiket: "Tahmini gelir vergisi", deger: formatTRYKesirli(sonuc.tahminiVergi), vurgulu: true },
              { etiket: "Kira gelirine oranı", deger: formatYuzde(sonuc.gelirYuzdesi, 1) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için yıllık brüt kira gelirini girin." />
        )
      }
    />
  );
}

export function KidemTazminatiHesaplayici() {
  const [brut, setBrut] = useState("45000");
  const [yil, setYil] = useState("5");
  const [ay, setAy] = useState("6");
  const [tavan, setTavan] = useState("35000");
  const [damga, setDamga] = useState("7,59");

  const sonuc = useMemo(() => {
    const b = parseSayiTr(brut);
    if (!b) return null;
    return calculateKidemTazminati(
      b,
      parseSayiTr(yil, true) ?? 0,
      parseSayiTr(ay, true) ?? 0,
      parseSayiTr(tavan, true) ?? 0,
      parseSayiTr(damga, true) ?? 0,
    );
  }, [brut, yil, ay, tavan, damga]);

  const tavanUygulandi =
    sonuc !== null && (parseSayiTr(tavan, true) ?? 0) > 0 && sonuc.esasAlinanAylik < (parseSayiTr(brut) ?? 0);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Aylık brüt ücret"
            deger={brut}
            onDeger={setBrut}
            prefix="₺"
            hint="Son bir yıl içindeki en yüksek aylık brüt kazanca giydirilmiş ücret esas alınır."
          />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Kıdem (yıl)" deger={yil} onDeger={setYil} suffix="yıl" sifirOlabilir />
            <SayiGirisi label="Kıdem (ay)" deger={ay} onDeger={setAy} suffix="ay" sifirOlabilir />
          </div>
          <SayiGirisi
            label="Kıdem tazminatı tavanı"
            deger={tavan}
            onDeger={setTavan}
            prefix="₺"
            sifirOlabilir
            hint="Güncel tavanı girin; 0 girerseniz tavan uygulanmaz. Brüt ücret tavandaki küçük değişimlerden etkilenir."
          />
          <SayiGirisi label="Damga vergisi" deger={damga} onDeger={setDamga} suffix="‰" sifirOlabilir hint="Kıdem tazminatından yalnızca damga vergisi kesilir; gelir vergisi kesilmez." />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Kıdem tazminatı"
            satirlar={[
              { etiket: tavanUygulandi ? "Esas alınan aylık (tavan)" : "Esas alınan aylık", deger: formatTRY(sonuc.esasAlinanAylik) },
              { etiket: "Kıdem süresi", deger: `${sonuc.toplamAy} ay` },
              { etiket: "Brüt tazminat", deger: formatTRYKesirli(sonuc.brutTazminat) },
              { etiket: "Damga vergisi", deger: formatTRYKesirli(sonuc.damgaVergisi) },
              { etiket: "Net tazminat", deger: formatTRYKesirli(sonuc.netTazminat), vurgulu: true },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için brüt ücret ve kıdem süresini girin." />
        )
      }
    />
  );
}

export function EvAlmaMaliyetiHesaplayici() {
  const [bedel, setBedel] = useState("2500000");
  const [tapuOran, setTapuOran] = useState("2");
  const [komisyonOran, setKomisyonOran] = useState("2");
  const [kdv, setKdv] = useState("20");
  const [dask, setDask] = useState("3000");
  const [diger, setDiger] = useState("15000");

  const sonuc = useMemo(() => {
    const b = parseSayiTr(bedel);
    if (!b) return null;
    return calculateEvAlmaMaliyeti(
      b,
      parseSayiTr(tapuOran, true) ?? 0,
      parseSayiTr(komisyonOran, true) ?? 0,
      parseSayiTr(kdv, true) ?? 0,
      parseSayiTr(dask, true) ?? 0,
      parseSayiTr(diger, true) ?? 0,
    );
  }, [bedel, tapuOran, komisyonOran, kdv, dask, diger]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Satış bedeli" deger={bedel} onDeger={setBedel} prefix="₺" hint="Gerçek satış bedeli; tapu harcı bu bedel üzerinden hesaplanır." />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi
              label="Alıcının tapu harcı oranı"
              deger={tapuOran}
              onDeger={setTapuOran}
              suffix="%"
              hint="Kural olarak harç, alıcı ve satıcıya eşit paylaştırılır; toplam %4."
            />
            <SayiGirisi
              label="Alıcının komisyon oranı"
              deger={komisyonOran}
              onDeger={setKomisyonOran}
              suffix="%"
              hint="Yasal üst sınır alıcıdan %2 + KDV."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Komisyon KDV oranı" deger={kdv} onDeger={setKdv} suffix="%" sifirOlabilir />
            <SayiGirisi label="Yıllık DASK primi" deger={dask} onDeger={setDask} prefix="₺" sifirOlabilir />
          </div>
          <SayiGirisi
            label="Diğer maliyetler"
            deger={diger}
            onDeger={setDiger}
            prefix="₺"
            sifirOlabilir
            hint="Emlakçı dışı nakliye, tadilat, ekspertiz, noter gibi giderleriniz."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Alım maliyeti"
            satirlar={[
              { etiket: "Tapu harcı (alıcı payı)", deger: formatTRY(sonuc.tapuHarci) },
              { etiket: "Komisyon + KDV", deger: formatTRY(sonuc.komisyon + sonuc.komisyonKdv) },
              { etiket: "DASK + diğer giderler", deger: formatTRY((parseSayiTr(dask, true) ?? 0) + (parseSayiTr(diger, true) ?? 0)) },
              { etiket: "Toplam yan maliyet", deger: formatTRY(sonuc.yanMaliyetler) },
              { etiket: "Satış bedeliyle genel toplam", deger: formatTRY(sonuc.genelToplam), vurgulu: true },
              { etiket: "Yan maliyetin bedele oranı", deger: formatYuzde(sonuc.bedelYuzdesi, 1) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için satış bedelini girin." />
        )
      }
    />
  );
}

export function KrediKapatmaHesaplayici() {
  const [anaPara, setAnaPara] = useState("150000");
  const [taksitSayisi, setTaksitSayisi] = useState("24");
  const [taksit, setTaksit] = useState("7500");
  const [ceza, setCeza] = useState("1");

  const sonuc = useMemo(() => {
    const a = parseSayiTr(anaPara);
    const s = parseSayiTr(taksitSayisi);
    const t = parseSayiTr(taksit);
    if (!a || !s || !t) return null;
    return calculateKrediKapatma(a, s, t, parseSayiTr(ceza, true) ?? 0);
  }, [anaPara, taksitSayisi, taksit, ceza]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Kalan ana para borcu"
            deger={anaPara}
            onDeger={setAnaPara}
            prefix="₺"
            hint="Bankadan öğrenilecek, işlenen faiz hariç kalan anapara tutarı."
          />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi label="Kalan taksit" deger={taksitSayisi} onDeger={setTaksitSayisi} suffix="adet" />
            <SayiGirisi label="Aylık taksit" deger={taksit} onDeger={setTaksit} prefix="₺" />
          </div>
          <SayiGirisi
            label="Erken kapama cezası oranı"
            deger={ceza}
            onDeger={setCeza}
            suffix="%"
            sifirOlabilir
            hint="Yasal üst sınır, kalan vade 24 ay ve kısaysa kalan ana paranın %1'i, 24 aydan uzunsa %2'sidir. Bankanızın uyguladığı oranı girin."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Kapatma tablosu"
            satirlar={[
              { etiket: "Planlanan toplam ödeme", deger: formatTRY(sonuc.kalanToplamOdeme) },
              { etiket: "Bugün kapatma tutarı", deger: formatTRYKesirli(sonuc.kapatmaTutari), vurgulu: true },
              {
                etiket: sonuc.kapananTutar >= 0 ? "Erken kapanan (kâr)" : "Eksi kalır (geç kalmışsınız)",
                deger: formatTRY(Math.abs(sonuc.kapananTutar)),
              },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için kalan ana parayı, taksit sayısını ve tutarını girin." />
        )
      }
    />
  );
}

export function EnflasyonHesaplayici() {
  const [tutar, setTutar] = useState("100000");
  const [enflasyon, setEnflasyon] = useState("45");
  const [yil, setYil] = useState("5");

  const sonuc = useMemo(() => {
    const t = parseSayiTr(tutar);
    const e = parseSayiTr(enflasyon, true);
    const y = parseSayiTr(yil);
    if (!t || e === null || !y) return null;
    return calculateEnflasyon(t, e, y);
  }, [tutar, enflasyon, yil]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi label="Tutar" deger={tutar} onDeger={setTutar} prefix="₺" hint="Ölçmek istediğiniz para miktarı." />
          <div className="grid grid-cols-2 gap-4">
            <SayiGirisi
              label="Yıllık ortalama enflasyon"
              deger={enflasyon}
              onDeger={setEnflasyon}
              suffix="%"
              hint="TÜFE yıllık ortalaması; güncel resmî veriyi girin."
            />
            <SayiGirisi label="Süre" deger={yil} onDeger={setYil} suffix="yıl" hint="Ondalık girebilirsiniz (ör. 2,5)." />
          </div>
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Enflasyon etkisi"
            satirlar={[
              { etiket: "Bu tutarın bugünkü karşılığı (geçmişten)", deger: formatTRY(sonuc.guncelDeger), vurgulu: true },
              { etiket: "Gerekli artış", deger: formatTRY(sonuc.degerArtisi) },
              { etiket: "Bugünkü paranın süre sonu alım gücü", deger: formatTRY(sonuc.alimGucu) },
              { etiket: "Alım gücü kaybı", deger: formatTRY(sonuc.alimGucuKaybi) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için tutar, enflasyon ve süreyi girin." />
        )
      }
    />
  );
}

export function VerasetIntikalHesaplayici() {
  const [pay, setPay] = useState("1000000");
  const [istisna, setIstisna] = useState("0");
  const [oran, setOran] = useState("15");

  const sonuc = useMemo(() => {
    const p = parseSayiTr(pay);
    if (!p) return null;
    return calculateVerasetIntikal(
      p,
      parseSayiTr(istisna, true) ?? 0,
      parseSayiTr(oran, true) ?? 0,
    );
  }, [pay, istisna, oran]);

  return (
    <AracDuzen
      girisler={
        <>
          <SayiGirisi
            label="Payınıza düşen miras (para ve benzeri)"
            deger={pay}
            onDeger={setPay}
            prefix="₺"
            hint="Nakit, banka hesabı, altın gibi taşınır miras payınız. Her yasal mirasçı için ayrı istisna uygulanır."
          />
          <SayiGirisi
            label="Yıllık istisna tutarı"
            deger={istisna}
            onDeger={setIstisna}
            prefix="₺"
            sifirOlabilir
            hint="İlgili yılın veraset ve intikal vergisi istisnasını girin; bilmiyorsanız 0 bırakıp matrahı tam görün."
          />
          <SayiGirisi
            label="Ortalama vergi oranı"
            deger={oran}
            onDeger={setOran}
            suffix="%"
            hint="Tarife artan oranlıdır (%10'dan %30'a). Matrahınıza göre ortalama bir oran girin."
          />
        </>
      }
      sonuc={
        sonuc ? (
          <SonucKutusu
            baslik="Yaklaşık veraset vergisi"
            satirlar={[
              { etiket: "İstisna sonrası matrah", deger: formatTRY(sonuc.istisnaSonrasiMatrah) },
              { etiket: "Tahmini vergi", deger: formatTRYKesirli(sonuc.tahminiVergi), vurgulu: true },
              { etiket: "Vergiden sonra kalan", deger: formatTRY(sonuc.netTutar) },
              { etiket: "Miras payına oranı", deger: formatYuzde(sonuc.vergiYuzdesi, 1) },
            ]}
          />
        ) : (
          <BosDurum mesaj="Sonucu görmek için miras payınızı girin." />
        )
      }
    />
  );
}
