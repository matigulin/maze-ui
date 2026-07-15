import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** Backend origin for same-origin rewrites (Railway private URL or local API). */
const apiInternalUrl = (
  process.env.API_INTERNAL_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Доступ с телефона в той же Wi‑Fi (dev HMR)
  allowedDevOrigins: ["192.168.0.63"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      // Railway public hosts (uploads preferably via same-origin /uploads rewrite)
      { protocol: "https", hostname: "*.up.railway.app", pathname: "/uploads/**" },
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
