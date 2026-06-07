export type ScrapeResult = {
  title: string;
  price: string;
  location: string;
  m2: string;
  url: string;
  source: string;
  /** Gerçek scrape mi yoksa mock fallback mi */
  mocked: boolean;
};

export type ScrapeRequestBody = {
  url?: string;
};
