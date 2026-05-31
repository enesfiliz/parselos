export interface Client {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
}
