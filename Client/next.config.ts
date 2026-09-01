import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** Backend origin for same-origin rewrites (Railway private URL or local API). */
const apiInternalUrl = (
  process.env.API_INTERNAL_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  // Доступ с телефона в той же Wi‑Fi (dev HMR)
  allowedDevOrigins: ["192.168.0.63"],
  images: {
    // Unsplash с этой сети часто не открывается: optimizer ждёт ~7с на каждое фото → 504 и «вечный Rendering».
    // Браузер грузит URL напрямую; при ошибке ProductThumb сразу уходит в плейсхолдер.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "wsrv.nl", pathname: "/**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      // Railway / Render public hosts (uploads via same-origin /uploads rewrite)
      { protocol: "https", hostname: "*.up.railway.app", pathname: "/uploads/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/uploads/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiInternalUrl}/uploads/:path*`,
      },
    ];
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
