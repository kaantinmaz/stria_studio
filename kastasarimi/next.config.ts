import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Konsolidasyon: kastasarimiankara.com tüm rotalarını striastudio.com.tr'ye 301 taşır.
  async redirects() {
    return [
      // Ana sayfa ve hizmet/lokasyon rotaları → ana domain hizmet sayfaları.
      { source: "/", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/kas-tasarimi-fiyatlari", destination: "https://striastudio.com.tr/blog/kalici-makyaj-fiyatlari-2026-ankara", statusCode: 301 },
      { source: "/kas-tasarimi-nasil-yapilir", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/kas-tasarimi-nedir", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/ankarada-kas-tasarimi-yapan-yerler", destination: "https://striastudio.com.tr/ankara-kalici-makyaj-yapan-yerler", statusCode: 301 },
      { source: "/kas-tasarimi-kalici-mi", destination: "https://striastudio.com.tr/blog/kalici-makyaj-renk-solmasi-rotus-zamani", statusCode: 301 },
      { source: "/kas-tasarimi-iyilesme-sureci", destination: "https://striastudio.com.tr/blog/kas-pudralama-iyilesme-sureci", statusCode: 301 },
      { source: "/kas-tasarimi-bakimi", destination: "https://striastudio.com.tr/blog/kalici-makyaj-sonrasi-bakim", statusCode: 301 },
      { source: "/kas-tasarimi-kimlere-yapilmaz", destination: "https://striastudio.com.tr/blog/kalici-makyaj-kimlere-yapilmaz", statusCode: 301 },
      { source: "/erkek-kas-tasarimi-ankara", destination: "https://striastudio.com.tr/blog/erkeklerde-kalici-makyaj-kas", statusCode: 301 },
      { source: "/seyrek-kaslar-kas-tasarimi", destination: "https://striastudio.com.tr/blog/seyrek-kaslar-icin-kas-cozumleri", statusCode: 301 },
      { source: "/cankaya-kas-tasarimi", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/kizilay-kas-tasarimi", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/kecioren-kas-tasarimi", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      { source: "/yenimahalle-kas-tasarimi", destination: "https://striastudio.com.tr/hizmetler/kas-tasarimi", statusCode: 301 },
      // Aynı kalan içerik rotaları → ana domaindeki eşdeğeri.
      { source: "/galeri", destination: "https://striastudio.com.tr/galeri", statusCode: 301 },
      { source: "/blog", destination: "https://striastudio.com.tr/blog", statusCode: 301 },
      { source: "/sss", destination: "https://striastudio.com.tr/sss", statusCode: 301 },
      { source: "/hakkimizda", destination: "https://striastudio.com.tr/hakkimizda", statusCode: 301 },
      { source: "/iletisim", destination: "https://striastudio.com.tr/iletisim", statusCode: 301 },
      // Blog yazıları → ana domaindeki kanonik yazılar.
      { source: "/blog/kas-tasarimi-nedir", destination: "https://striastudio.com.tr/blog/hangi-kas-teknigi-size-uygun", statusCode: 301 },
      { source: "/blog/kas-tasarimi-karar-rehberi", destination: "https://striastudio.com.tr/blog/hangi-kas-teknigi-size-uygun", statusCode: 301 },
      { source: "/blog/kas-tasarimi-fiyatlari-2026-ankara", destination: "https://striastudio.com.tr/blog/kalici-makyaj-fiyatlari-2026-ankara", statusCode: 301 },
      { source: "/blog/yuz-sekline-gore-kas-tasarimi", destination: "https://striastudio.com.tr/blog/yuz-tipine-gore-kas-sekli", statusCode: 301 },
      { source: "/blog/kas-tasarimi-ne-kadar-kalici", destination: "https://striastudio.com.tr/blog/kalici-makyaj-renk-solmasi-rotus-zamani", statusCode: 301 },
      { source: "/blog/kas-tasarimi-oncesi-sonrasi-sureci", destination: "https://striastudio.com.tr/blog/kalici-makyaj-oncesi-hazirlik", statusCode: 301 },
      { source: "/blog/kas-tasarimi-sonrasi-bakim", destination: "https://striastudio.com.tr/blog/kalici-makyaj-sonrasi-bakim", statusCode: 301 },
      { source: "/blog/kas-tasariminda-altin-oran", destination: "https://striastudio.com.tr/blog/kas-tasarimi-altin-oran", statusCode: 301 },
      { source: "/blog/kas-tasarimi-sonrasi-ilk-10-gun", destination: "https://striastudio.com.tr/blog/microblading-iyilesme-gunlugu", statusCode: 301 },
      // Yasal sayfalar.
      { source: "/kvkk", destination: "https://striastudio.com.tr/kvkk", statusCode: 301 },
      { source: "/cerez-politikasi", destination: "https://striastudio.com.tr/cerez-politikasi", statusCode: 301 },
      { source: "/api-docs", destination: "https://striastudio.com.tr/", statusCode: 301 },
      // Catch-all: eşleşmeyen her yol → ana domain kökü. _next/api/sitemap/robots/favicon/og
      // ve statik dosya uzantıları hariç (build ve Google keşfi için gerekli).
      {
        source:
          "/:path((?!_next|api|sitemap\\.xml|robots\\.txt|favicon\\.ico|og|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|js|css|woff2)$).*)",
        destination: "https://striastudio.com.tr/",
        statusCode: 301,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8002", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", port: "8002", pathname: "/storage/**" },
      // Production: cover/gallery images are served by the Laravel backend.
      { protocol: "https", hostname: "admin.striastudio.com.tr", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
