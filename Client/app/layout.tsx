import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Exo_2, Orbitron } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { fetchSiteChrome } from "@/lib/site-source";

const exo = Exo_2({
  variable: "--font-exo",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAZE — Найди свой путь в мире технологий",
  description:
    "MAZE — премиальный магазин техники. Apple, Samsung, Sony, Marshall, Dyson, Harman Kardon. Трейд-ин, рассрочка, доставка по РФ.",
};

/** Без pinch / double-tap zoom на мобилке (витрина + админка). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteData = await fetchSiteChrome();

  return (
    <html
      lang="ru"
      className={`${exo.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex max-w-full flex-col overflow-x-hidden bg-bg text-ink font-sans selection:bg-cyan/25 selection:text-white">
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        <Providers siteData={siteData}>{children}</Providers>
      </body>
    </html>
  );
}
