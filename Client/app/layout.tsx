import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { fetchSiteChrome } from "@/lib/site-source";

const manrope = Manrope({
  variable: "--font-outfit",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-barlow",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
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
      className={`${manrope.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full max-w-full flex-col overflow-x-hidden bg-bg font-sans text-ink selection:bg-accent/30 selection:text-bg">
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
