import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      // Áreas privadas: nunca indexar
      { source: "/leads", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/conversa/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Imagens estáticas: cache longa
      { source: "/(images|obras|brand|andre)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
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
