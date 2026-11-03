import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // AVIF primeiro (mais leve), WebP como alternativa; imagens otimizadas ficam em cache 1 ano
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    deviceSizes: [480, 640, 828, 1080, 1440, 1920],
    minimumCacheTTL: 31536000,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
