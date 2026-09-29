import Script from "next/script";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSenseScript() {
  if (!adsenseClient) return null;
  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}` as string}
      crossOrigin="anonymous"
    />
  );
}

export function ReklamAlani({ slot }: { slot: string }) {
  if (!adsenseClient) return null;

  return (
    <div className="my-8 min-h-24" aria-hidden>
      <ins
        className="adsbygoogle block"
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-push-${slot}`}>{`(adsbygoogle=window.adsbygoogle||[]).push({})`}</Script>
    </div>
  );
}
