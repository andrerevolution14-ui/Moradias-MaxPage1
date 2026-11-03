import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // WebP (o mesmo formato das originais, evita perder nitidez); imagens otimizadas ficam em cache 1 ano
    formats: ["image/webp"],
    qualities: [75, 85],
    deviceSizes: [480, 640, 828, 1080, 1440, 1920, 2048],
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
