import type { Metadata } from "next";

import { ThemeInitScript } from "@/components/providers/ThemeInitScript";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./clerk.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://parselos.com"),
  title: {
    default: "ParselOS",
    template: "%s · ParselOS",
  },
  description:
    "ParselOS — emlak ve günlük hayat için ücretsiz hesap araçları ve gayrimenkul profesyonellerine yönelik operasyon platformu.",
  applicationName: "ParselOS Hesap",
  openGraph: {
    type: "website",
    siteName: "ParselOS Hesap",
    locale: "tr_TR",
    images: [
      {
        url: "/og-hesap-araclari.png",
        width: 1200,
        height: 630,
        alt: "ParselOS Hesap — 30 ücretsiz hesap aracı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    shortcut: [{ url: "/favicon.ico" }],
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
