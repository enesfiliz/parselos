export interface AppraisalLokasyon {
  enlem: number;
  boylam: number;
}

export interface FiyatAnalizi {
  tahmini_deger: string;
  ortalama_m2_fiyat: string;
}

export interface RadarMetrigi {
  kategori: string;
  puan: number;
}

export interface EmsalKaydi {
  rakip_mulk: string;
  fiyat: string;
  fark: string;
}

export interface KarlilikOrani {
  baslik: string;
  deger: string;
}

export interface AppraisalReport {
  lokasyon: AppraisalLokasyon;
  genel_skor: number;
  fiyat_analizi: FiyatAnalizi;
  radar_metrikleri: RadarMetrigi[];
  emsal_analizi: EmsalKaydi[];
  karlilik_oranlari: KarlilikOrani[];
  uzman_gorusu: string;
  detayli_bolge_analizi: string;
  yatirim_ve_risk_raporu: string;
  fiyat_analizi_gerekcesi: string;
}
