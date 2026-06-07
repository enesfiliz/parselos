import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { parselClerkAppearance } from "@/lib/clerk-appearance";
import { Toaster } from "@/components/ui/sonner";
import "./clerk.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ParselOS",
    template: "%s · ParselOS",
  },
  description:
    "Gayrimenkul CRM platformu — ekspertiz, müşteri yönetimi ve yapay zeka destekli operasyonlar.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
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
      className="dark h-full antialiased"
    >
      <body
        className="flex min-h-full flex-col bg-[#09090b] font-sans text-zinc-100 antialiased"
      >
        <ClerkProvider appearance={parselClerkAppearance}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
