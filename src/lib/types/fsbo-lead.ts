export type FsboIslemTipi = "SATILIK" | "KIRALIK";
export type FsboKategori = "KONUT" | "ARSA" | "TICARI";

export type FsboLeadSpecs = {
  ilanNo: string;
  brutM2: number | null;
  netM2: number | null;
  odaSayisi: string | null;
  binaYasi: string | null;
  isitmaTipi: string | null;
};

export type FsboLeadData = {
  id: string;
  title: string;
  url: string;
  price: number | null;
  priceFormatted: string;
  location: string;
  region: string;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  metrekare: number | null;
  odaSayisi: string | null;
  source: string;
  islemTipi: FsboIslemTipi;
  kategori: FsboKategori;
  listingNo: string | null;
  description: string;
  images: string[];
  coverImage: string;
  specs: FsboLeadSpecs;
  isRead: boolean;
  isDiscarded: boolean;
  promotedDealId: string | null;
  listedAt: string | null;
  olusturulmaTarihi: string;
};

export type FsboWatchRegionData = {
  id: string;
  label: string;
};

export type FsboRadarFilters = {
  islemTipi: FsboIslemTipi | "";
  kategori: FsboKategori | "";
  il: string;
  ilce: string;
  priceMin: string;
  priceMax: string;
};

export const EMPTY_FSBO_FILTERS: FsboRadarFilters = {
  islemTipi: "",
  kategori: "",
  il: "",
  ilce: "",
  priceMin: "",
  priceMax: "",
};
