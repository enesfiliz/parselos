import type { Metadata } from "next";

import { ThemeInitScript } from "@/components/providers/ThemeInitScript";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./clerk.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ParselOS",
    template: "%s · ParselOS",
  },
  description:
    "ParselOS — emlak ve günlük hayat için ücretsiz hesap araçları ve gayrimenkul profesyonellerine yönelik operasyon platformu.",
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
