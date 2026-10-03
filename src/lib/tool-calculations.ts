// ParselOS Araçlar — herkese açık hesap araçları için saf fonksiyonlar.
// Mevcut src/lib/calculations.ts korunur; burada yalnızca yeni iş mantığı bulunur.

/**
 * tr-TR kullanıcı girdisi çözümlemesi.
 * - "2.500"   → 2500 (üç haneli ondalık kısmı binlik ayıracı kabul eder)
 * - "1.234.567" → 1234567
 * - "250,000" → 250000 (üç haneli virgül sonrası binlik ayıracı)
 * - "1,5" veya "1.5" → 1.5 (onluk)
 * - "0,30" → 0.3
 */
export function parseSayiTr(v: string, sifirOlabilir = false): number | null {
  const s = v.trim().replace(/\s/g, "");
  if (s === "") return null;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  let norm: string;

  if (hasComma && hasDot) {
    // Son ayraç ondalıktır; diğerleri binliktir.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      norm = s.replace(/\./g, "").replace(/,/g, ".");
    } else {
      norm = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = s.split(",");
    if (parts.length > 2) {
      norm = parts.join("");
    } else if (parts[1].length === 3) {
      norm = parts[0] + parts[1];
    } else {
      norm = parts.join(".");
    }
  } else if (hasDot) {
    const parts = s.split(".");
    if (parts.length > 2) {
      norm = parts.join("");
    } else if (parts[1].length === 3) {
      norm = parts[0] + parts[1];
    } else {
      norm = s;
    }
  } else {
    norm = s;
  }

  const n = Number(norm);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  if (n === 0) return sifirOlabilir ? 0 : null;
  if (n > 1e15) return null;
  return n;
}

export type KomisyonOranliSonucu = {
  aliciKdvHaric: number;
  saticiKdvHaric: number;
  kdvTutari: number;
  toplamKdvDahil: number;
};

/**
 * Toplam komisyon oranı (alıcı + satıcı birlikte) elle verilebilir;
 * yasal tavan toplam %4'tür (Taşınmaz Ticareti Yönetmeliği).
 */
export function calculateKomisyonOranli(
  bedel: number,
  toplamOran: number,
  kdvOrani: number,
): KomisyonOranliSonucu | null {
  if (bedel <= 0 || toplamOran <= 0 || toplamOran > 100 || kdvOrani < 0) {
    return null;
  }
  const alici = bedel * (toplamOran / 2 / 100);
  const kdvTutari = alici * 2 * kdvOrani;
  return {
    aliciKdvHaric: alici,
    saticiKdvHaric: alici,
    kdvTutari,
    toplamKdvDahil: alici * 2 + kdvTutari,
  };
}

export type KomisyonPaylasimGirdi = {
  komisyonKdvHaric: number;
  ofisYuzdesi: number;
  digerAracilikYuzdesi: number;
  kdvOrani: number;
};

export type KomisyonPaylasimSonucu = {
  kdvTutari: number;
  komisyonKdvDahil: number;
  netPaylasimHavuzu: number;
  digerAracilikPay: number;
  ofisPay: number;
  danismanPay: number;
};

/**
 * Ofis payı doğrudan oranı alır (üst sınır %100); kalan tutarın tamamı
 * danışmana yazılır — arayüz sözüyle birebir aynı semantik.
 */
export function calculateKomisyonPaylasimi(
  g: KomisyonPaylasimGirdi,
): KomisyonPaylasimSonucu | null {
  if (g.komisyonKdvHaric <= 0) return null;

  const aracilikOrani = Math.min(Math.max(g.digerAracilikYuzdesi, 0), 100);
  const aracilikPay =
    g.komisyonKdvHaric * (aracilikOrani / 100);
  const netPaylasimHavuzu = g.komisyonKdvHaric - aracilikPay;

  const ofisOrani = Math.min(Math.max(g.ofisYuzdesi, 0), 100);
  const ofisPay = netPaylasimHavuzu * (ofisOrani / 100);
  const kdvTutari = g.komisyonKdvHaric * g.kdvOrani;

  return {
    kdvTutari,
    komisyonKdvDahil: g.komisyonKdvHaric + kdvTutari,
    netPaylasimHavuzu,
    digerAracilikPay: aracilikPay,
    ofisPay,
    danismanPay: netPaylasimHavuzu - ofisPay,
  };
}

export type StopajSonucu = {
  brutKira: number;
  stopaj: number;
  netKira: number;
  yillikBrut: number;
  yillikStopaj: number;
};

export function calculateKiraStopaji(
  brutAylikKira: number,
  stopajOrani: number,
): StopajSonucu | null {
  if (brutAylikKira <= 0 || stopajOrani < 0 || stopajOrani > 100) return null;

  const stopaj = brutAylikKira * (stopajOrani / 100);
  const net = brutAylikKira - stopaj;

  return {
    brutKira: brutAylikKira,
    stopaj,
    netKira: net,
    yillikBrut: brutAylikKira * 12,
    yillikStopaj: stopaj * 12,
  };
}

export function calculateNetIcinBrutKira(
  istenenNetKira: number,
  stopajOrani: number,
): number | null {
  if (istenenNetKira <= 0 || stopajOrani < 0 || stopajOrani >= 100) return null;
  return istenenNetKira / (1 - stopajOrani / 100);
}

export type AmortismanSonucuV2 = {
  yillikBrutGetiri: number;
  geriDonusYil: number;
  geriDonusAy: number;
};

/** calculateAmortisman'ın "yıl 12 ay" kenar vakasını güvenli yuvarlar. */
export function calculateAmortismanV2(
  mulkDegeri: number,
  aylikKira: number,
): AmortismanSonucuV2 | null {
  if (mulkDegeri <= 0 || aylikKira <= 0) return null;

  const yillikBrutGetiri = ((aylikKira * 12) / mulkDegeri) * 100;
  const toplamAy = Math.round(mulkDegeri / aylikKira);

  return {
    yillikBrutGetiri,
    geriDonusYil: Math.floor(toplamAy / 12),
    geriDonusAy: toplamAy % 12,
  };
}

export type KdvSonucu = {
  matrah: number;
  kdvTutari: number;
  kdvDahilToplam: number;
};

export function calculateKdvEkle(matrah: number, oran: number): KdvSonucu | null {
  if (matrah <= 0 || oran <= 0 || oran > 100) return null;
  const kdvTutari = matrah * (oran / 100);
  return { matrah, kdvTutari, kdvDahilToplam: matrah + kdvTutari };
}

export function calculateKdvCikar(kdvDahil: number, oran: number): KdvSonucu | null {
  if (kdvDahil <= 0 || oran <= 0 || oran > 100) return null;
  const matrah = kdvDahil / (1 + oran / 100);
  return { matrah, kdvTutari: kdvDahil - matrah, kdvDahilToplam: kdvDahil };
}

export type YuzdeSonucu = {
  yuzdeDegeri: number;
  artisSonucu: number;
  azalisSonucu: number;
};

export function calculateYuzde(
  a: number,
  yuzde: number,
): YuzdeSonucu | null {
  if (a <= 0 || yuzde < 0) return null;
  return {
    yuzdeDegeri: a * (yuzde / 100),
    artisSonucu: a * (1 + yuzde / 100),
    azalisSonucu: a * (1 - yuzde / 100),
  };
}

/** B, A'nın yüzde kaçıdır? */
export function calculateYuzdeKac(a: number, b: number): number | null {
  if (a <= 0 || b < 0) return null;
  return (b / a) * 100;
}

export type BilesikFaizSonucu = {
  anaPara: number;
  birikenToplam: number;
  toplamGetiri: number;
  donemSayisi: number;
};

/**
 * Bileşik getiri: periyot başına oran, periyot sayısı kadar birikir.
 * Yıllık oran + yıl verildiğinde periyot = yıl, oran = yıllık/n (n: yıllık periyot).
 */
export function calculateBilesikFaiz(
  anaPara: number,
  yillikOran: number,
  yil: number,
  yillikPeriyot: number,
): BilesikFaizSonucu | null {
  if (anaPara <= 0 || yillikOran < 0 || yil <= 0 || yillikPeriyot <= 0) {
    return null;
  }
  const donemSayisi = Math.round(yil * yillikPeriyot);
  const birikenToplam =
    anaPara * Math.pow(1 + yillikOran / 100 / yillikPeriyot, donemSayisi);
  return {
    anaPara,
    birikenToplam,
    toplamGetiri: birikenToplam - anaPara,
    donemSayisi,
  };
}

/** m² birim fiyatı: toplam bedel ÷ alan. */
export function calculateM2Fiyati(
  bedel: number,
  m2: number,
): number | null {
  if (bedel <= 0 || m2 <= 0) return null;
  return bedel / m2;
}

export type KiraKomisyonSonucu = {
  toplamKomisyon: number;
  kdvTutari: number;
  toplamKdvDahil: number;
  tarafaDusen: number;
};

/**
 * Kiralamada yasal tavan: sözleşmedeki aylık kira bedelinin 1 aylık tutarı
 * (+KDV). Pratikte alıcı/oturan ile mal sahibi arasında eşit paylaşılır.
 */
export function calculateKiraKomisyonu(
  aylikKira: number,
  kiraSayisi: number,
  kdvOrani: number,
  taraflarEsit: boolean,
): KiraKomisyonSonucu | null {
  if (aylikKira <= 0 || kiraSayisi <= 0 || kiraSayisi > 2 || kdvOrani < 0) {
    return null;
  }
  const toplamKomisyon = aylikKira * kiraSayisi;
  const kdvTutari = toplamKomisyon * kdvOrani;
  return {
    toplamKomisyon,
    kdvTutari,
    toplamKdvDahil: toplamKomisyon + kdvTutari,
    tarafaDusen: taraflarEsit ? (toplamKomisyon + kdvTutari) / 2 : toplamKomisyon + kdvTutari,
  };
}

/**
 * DASK primi yaklaşık = sigorta bedeli (m² × metrekare baz bedeli, üst sınır
 * dahil) × tarife oranı. Yalnızca yaklaşık; güncel tarife zorunlu tutulur.
 */
export function calculateDaskYaklasik(
  m2: number,
  metrekareBazBedeli: number,
  ustSinirTl: number,
  tarifeOraniYuzde: number,
): { sigortaBedeli: number; prim: number } | null {
  if (m2 <= 0 || metrekareBazBedeli <= 0 || tarifeOraniYuzde <= 0) return null;
  const sigortaBedeli = Math.min(m2 * metrekareBazBedeli, ustSinirTl);
  return { sigortaBedeli, prim: sigortaBedeli * (tarifeOraniYuzde / 100) };
}

export type KisaDonemSonucu = {
  aylikBrutGelir: number;
  aylikNetGelir: number;
  yillikNetGelir: number;
  dolulukGunSayisi: number;
};

/** Kısa dönem kiralama: doluluk oranı ve gecelik fiyattan aylık gelir. */
export function calculateKisaDonemGetiri(
  gecelikFiyat: number,
  aylikGun: number,
  dolulukYuzde: number,
  aylikSabitGider: number,
): KisaDonemSonucu | null {
  if (gecelikFiyat <= 0 || aylikGun <= 0 || aylikGun > 31) return null;
  const doluluk = Math.min(Math.max(dolulukYuzde, 0), 100);
  const gider = Math.max(aylikSabitGider, 0);
  const dolulukGunSayisi = Math.round((aylikGun * doluluk) / 100);
  const aylikBrutGelir = gecelikFiyat * dolulukGunSayisi;
  const aylikNetGelir = aylikBrutGelir - gider;
  return {
    aylikBrutGelir,
    aylikNetGelir,
    yillikNetGelir: aylikNetGelir * 12,
    dolulukGunSayisi,
  };
}

export type EmlakVergisiSonucu = {
  yillikVergi: number;
  taksitTutari: number;
};

/**
 * Emlak vergisi yıllık tutarı = rayiç (matrah) bedel × oran.
 * Oran taşınmaz türüne ve büyükşehir olmasına göre değişir; alan güncel
 * tarifeyle teyit edilmek üzere açık bırakılır. Vergi iki eşit taksitle
 * (Mart ve Ağustos dönemleri) ödenir.
 */
export function calculateEmlakVergisi(
  matrahBedel: number,
  oranYuzde: number,
): EmlakVergisiSonucu | null {
  if (matrahBedel <= 0 || oranYuzde <= 0 || oranYuzde > 100) return null;
  const yillikVergi = matrahBedel * (oranYuzde / 100);
  return { yillikVergi, taksitTutari: yillikVergi / 2 };
}

export type DegerArtisiSonucu = {
  hamKazanc: number;
  istisnaSonrasiKazanc: number;
  tahminiVergi: number;
};

/**
 * Değer artışı kazancı (konut/büro satışında 5 yıl içinde kazanım):
 * kazanç = satış bedeli − güncellenmiş alış bedeli; istisna düşüldükten
 * sonra kalan tutar gelir vergisi tarifesine göre vergilendirilir.
 * Tarife artan oranlıdır (~%15–%40); araç, ortalama oranla yaklaşık üretir.
 */
export function calculateDegerArtisi(
  guncellenmisAlisBedeli: number,
  satisBedeli: number,
  istisnaTutari: number,
  ortalamaVergiOraniYuzde: number,
): DegerArtisiSonucu | null {
  if (guncellenmisAlisBedeli <= 0 || satisBedeli <= 0) return null;
  const hamKazanc = satisBedeli - guncellenmisAlisBedeli;
  if (hamKazanc <= 0) {
    return { hamKazanc, istisnaSonrasiKazanc: 0, tahminiVergi: 0 };
  }
  const istisnaSonrasiKazanc = Math.max(
    hamKazanc - Math.max(istisnaTutari, 0),
    0,
  );
  const oran = Math.min(Math.max(ortalamaVergiOraniYuzde, 0), 100);
  return {
    hamKazanc,
    istisnaSonrasiKazanc,
    tahminiVergi: istisnaSonrasiKazanc * (oran / 100),
  };
}

export type BasitFaizSonucu = {
  faizGetirisi: number;
  vadeSonuToplam: number;
};

/** Basit faiz: getirinin ana paraya eklenmeden birikmesi. Vade ay cinsinden. */
export function calculateBasitFaiz(
  anaPara: number,
  yillikOranYuzde: number,
  vadeAy: number,
): BasitFaizSonucu | null {
  if (anaPara <= 0 || yillikOranYuzde < 0 || vadeAy <= 0) return null;
  const faizGetirisi = anaPara * (yillikOranYuzde / 100) * (vadeAy / 12);
  return { faizGetirisi, vadeSonuToplam: anaPara + faizGetirisi };
}

export type GunSayisiSonucu = {
  toplamGun: number;
  isGunleri: number;
  yil: number;
  ay: number;
  gun: number;
};

/**
 * İki tarih arasındaki tam gün sayısı (başlangıç dahil değil, bitiş dahil).
 * Hafta sonu günleri "iş günü" sayısından düşülür.
 */
export function calculateGunSayisi(
  baslangic: Date,
  bitis: Date,
): GunSayisiSonucu | null {
  if (Number.isNaN(baslangic.getTime()) || Number.isNaN(bitis.getTime())) {
    return null;
  }
  const MS_GUN = 24 * 60 * 60 * 1000;
  const b = Date.UTC(baslangic.getFullYear(), baslangic.getMonth(), baslangic.getDate());
  const d = Date.UTC(bitis.getFullYear(), bitis.getMonth(), bitis.getDate());
  const toplamGun = Math.round((d - b) / MS_GUN);
  if (toplamGun < 0) return null;

  let haftaSonu = 0;
  for (let t = b + MS_GUN; t <= d; t += MS_GUN) {
    const gun = new Date(t).getUTCDay();
    if (gun === 0 || gun === 6) haftaSonu += 1;
  }

  let yil = bitis.getFullYear() - baslangic.getFullYear();
  let ay = bitis.getMonth() - baslangic.getMonth();
  let gun = bitis.getDate() - baslangic.getDate();
  if (gun < 0) {
    ay -= 1;
    // ayın son gününe tamamlanan fark: bir önceki ayın gün sayısı
    const oncekiAy = new Date(Date.UTC(bitis.getFullYear(), bitis.getMonth(), 0));
    gun += oncekiAy.getUTCDate();
  }
  if (ay < 0) {
    yil -= 1;
    ay += 12;
  }

  return { toplamGun, isGunleri: toplamGun - haftaSonu, yil, ay, gun };
}

export type KiraGeliriVergisiSonucu = {
  istisnaSonrasi: number;
  giderTutari: number;
  vergiMatrahi: number;
  tahminiVergi: number;
  gelirYuzdesi: number;
};

/**
 * Mesken kira geliri vergisi (yaklaşık): gelir → istisna → gider yöntemi →
 * tarife. Götürü giderde matrahın %15'i düşülür; gerçek gider tutarı
 * girilirse o esas alınır. Tarife artan oranlıdır (~%15–%40); araç
 * ortalama oranla yaklaşık üretir.
 */
export function calculateKiraGeliriVergisi(
  yillikBrutKira: number,
  istisnaTutari: number,
  goturuGider: boolean,
  gercekGiderTutari: number,
  ortalamaVergiOraniYuzde: number,
): KiraGeliriVergisiSonucu | null {
  if (yillikBrutKira <= 0) return null;
  const istisnaSonrasi = Math.max(
    yillikBrutKira - Math.max(istisnaTutari, 0),
    0,
  );
  const gider = goturuGider
    ? istisnaSonrasi * 0.15
    : Math.min(Math.max(gercekGiderTutari, 0), istisnaSonrasi);
  const vergiMatrahi = istisnaSonrasi - gider;
  const oran = Math.min(Math.max(ortalamaVergiOraniYuzde, 0), 100);
  const tahminiVergi = vergiMatrahi * (oran / 100);
  return {
    istisnaSonrasi,
    giderTutari: gider,
    vergiMatrahi,
    tahminiVergi,
    gelirYuzdesi: (tahminiVergi / yillikBrutKira) * 100,
  };
}

export type KidemTazminatiSonucu = {
  esasAlinanAylik: number;
  toplamAy: number;
  brutTazminat: number;
  damgaVergisi: number;
  netTazminat: number;
};

/**
 * Kıdem tazminatı: her tam yıla 30 günlük brüt ücret; kalan ayar oranında
 * işler. Aylık brüt, girilen tavanı aşamaz. Gelir vergisinden müstesnadır;
 * yalnız damga vergisi düşülür (binde, girilebilir).
 */
export function calculateKidemTazminati(
  brutAylikUcret: number,
  kiyemYil: number,
  kiyemAy: number,
  tavanAylik: number,
  damgaBinde: number,
): KidemTazminatiSonucu | null {
  if (brutAylikUcret <= 0) return null;
  const toplamAy = kiyemYil * 12 + kiyemAy;
  if (toplamAy <= 0) return null;
  const esasAlinanAylik =
    tavanAylik > 0 ? Math.min(brutAylikUcret, tavanAylik) : brutAylikUcret;
  const brutTazminat = esasAlinanAylik * (toplamAy / 12);
  const damgaVergisi = brutTazminat * (Math.max(damgaBinde, 0) / 1000);
  return {
    esasAlinanAylik,
    toplamAy,
    brutTazminat,
    damgaVergisi,
    netTazminat: brutTazminat - damgaVergisi,
  };
}

export type EvAlmaMaliyetiSonucu = {
  tapuHarci: number;
  komisyon: number;
  komisyonKdv: number;
  yanMaliyetler: number;
  genelToplam: number;
  bedelYuzdesi: number;
};

/**
 * Peşin ev alımında alıcının toplam maliyeti: satış bedeline tapu harcı,
 * kendi komisyon payı (KDV dahil), DASK ve diğer yan giderler eklenir.
 */
export function calculateEvAlmaMaliyeti(
  satisBedeli: number,
  aliciTapuHarciOraniYuzde: number,
  aliciKomisyonOraniYuzde: number,
  kdvOraniYuzde: number,
  daskYillik: number,
  digerMaliyetler: number,
): EvAlmaMaliyetiSonucu | null {
  if (satisBedeli <= 0) return null;
  const tapuHarci = satisBedeli * (Math.max(aliciTapuHarciOraniYuzde, 0) / 100);
  const komisyon = satisBedeli * (Math.max(aliciKomisyonOraniYuzde, 0) / 100);
  const komisyonKdv = komisyon * (Math.max(kdvOraniYuzde, 0) / 100);
  const yanMaliyetler =
    tapuHarci +
    komisyon +
    komisyonKdv +
    Math.max(daskYillik, 0) +
    Math.max(digerMaliyetler, 0);
  return {
    tapuHarci,
    komisyon,
    komisyonKdv,
    yanMaliyetler,
    genelToplam: satisBedeli + yanMaliyetler,
    bedelYuzdesi: (yanMaliyetler / satisBedeli) * 100,
  };
}

export type KrediKapatmaSonucu = {
  kalanToplamOdeme: number;
  kapatmaTutari: number;
  kapananTutar: number;
};

/**
 * Kalan tüketici kredisini bugünden kapatma: kalan ana paraya erken
 * kapama cezası eklenir; planlanan toplam ödemeden fark = kapanan tutar.
 */
export function calculateKrediKapatma(
  kalanAnaPara: number,
  kalanTaksitSayisi: number,
  aylikTaksit: number,
  cezaOraniYuzde: number,
): KrediKapatmaSonucu | null {
  if (kalanAnaPara <= 0 || kalanTaksitSayisi <= 0 || aylikTaksit <= 0) {
    return null;
  }
  const kalanToplamOdeme = aylikTaksit * kalanTaksitSayisi;
  const kapatmaTutari =
    kalanAnaPara + kalanAnaPara * (Math.max(cezaOraniYuzde, 0) / 100);
  return {
    kalanToplamOdeme,
    kapatmaTutari,
    kapananTutar: kalanToplamOdeme - kapatmaTutari,
  };
}

export type EnflasyonSonucu = {
  guncelDeger: number;
  degerArtisi: number;
  alimGucu: number;
  alimGucuKaybi: number;
};

/**
 * Yıllık ortalama enflasyonla değeri iki yönlü çevirir: geçmiş tutarın
 * bugünkü karşılığı ve bugünkü paranın süre sonundaki satın alma gücü.
 */
export function calculateEnflasyon(
  tutar: number,
  yillikEnflasyonYuzde: number,
  yil: number,
): EnflasyonSonucu | null {
  if (tutar <= 0 || yillikEnflasyonYuzde < 0 || yil <= 0) return null;
  const carpan = Math.pow(1 + yillikEnflasyonYuzde / 100, yil);
  const guncelDeger = tutar * carpan;
  const alimGucu = tutar / carpan;
  return {
    guncelDeger,
    degerArtisi: guncelDeger - tutar,
    alimGucu,
    alimGucuKaybi: tutar - alimGucu,
  };
}

export type VerasetIntikalSonucu = {
  istisnaSonrasiMatrah: number;
  tahminiVergi: number;
  netTutar: number;
  vergiYuzdesi: number;
};

/**
 * Veraset ve intikal vergisi (para ve benzeri miras payı, yaklaşık):
 * miras payından yıllık istisna düşülür, kalan matrah artan oranlı
 * tarifede (%10–%30) vergilendirilir; araç ortalama oranla yaklaşık üretir.
 */
export function calculateVerasetIntikal(
  mirasPayi: number,
  istisnaTutari: number,
  ortalamaVergiOraniYuzde: number,
): VerasetIntikalSonucu | null {
  if (mirasPayi <= 0) return null;
  const istisnaSonrasiMatrah = Math.max(
    mirasPayi - Math.max(istisnaTutari, 0),
    0,
  );
  const oran = Math.min(Math.max(ortalamaVergiOraniYuzde, 0), 100);
  const tahminiVergi = istisnaSonrasiMatrah * (oran / 100);
  return {
    istisnaSonrasiMatrah,
    tahminiVergi,
    netTutar: mirasPayi - tahminiVergi,
    vergiYuzdesi: (tahminiVergi / mirasPayi) * 100,
  };
}

export const formatTRY = (value: number): string =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

export const formatTRYKesirli = (value: number): string =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatYuzde = (value: number, basamak = 2): string =>
  `%${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  }).format(value)}`;
