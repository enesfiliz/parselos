export interface ArchivedAppraisal {
  id: string;
  baslik: string;
  ada: string;
  parsel: string;
  m2: string;
  jsonVerisi: string;
  clientId: string | null;
  olusturulmaTarihi: string;
}

export interface ArchivedReportSnapshot {
  report?: {
    genel_skor?: number;
    fiyat_analizi?: {
      tahmini_deger?: string;
      ortalama_m2_fiyat?: string;
    };
    uzman_gorusu?: string;
  };
  form?: {
    il?: string;
    ilce?: string;
    mahalle?: string;
  };
}
