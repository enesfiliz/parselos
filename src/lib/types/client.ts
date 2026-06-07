export interface Client {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  kaynak: string | null;
  birthDate: string | null;
  butce: string | null;
  mulkTipi: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  /** Aktif pipeline kartları (LEAD, SHOWING, OFFER) */
  aktifFirsatSayisi?: number;
}
