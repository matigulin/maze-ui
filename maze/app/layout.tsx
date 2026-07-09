import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { fetchSiteChrome } from "@/lib/site-source";

// Русский текст + body — Exo 2 (полная кириллица, футуристичный характер)
const exo = Exo_2({
  variable: "--font-exo",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Латинский логотип MAZE, цифры и «спек»-подписи — Orbitron
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
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans selection:bg-cyan/25 selection:text-white">
        <Providers siteData={siteData}>
          <Background />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
