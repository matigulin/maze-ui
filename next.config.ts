import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Фиксируем корень проекта (в системе несколько lockfile)
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
