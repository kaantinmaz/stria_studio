import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Konsolidasyon: microbladingankara.com tüm rotalarını striastudio.com.tr'ye 301 taşır.
  async redirects() {
    return [
      // Eski İngilizce yazımlı giriş URL'leri → ana domain karşılıkları (301).
      { source: "/microblading-ankara", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/microblading", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/microblading-fiyatlari", destination: "https://striastudio.com.tr/blog/kalici-makyaj-fiyatlari-2026-ankara", statusCode: 301 },
      // Ana sayfa ve hizmet/lokasyon rotaları → ana domain hizmet sayfaları.
      { source: "/", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/mikroblading-fiyatlari", destination: "https://striastudio.com.tr/blog/kalici-makyaj-fiyatlari-2026-ankara", statusCode: 301 },
      { source: "/mikroblading-nasil-yapilir", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/ankarada-mikroblading-yapan-yerler", destination: "https://striastudio.com.tr/ankara-kalici-makyaj-yapan-yerler", statusCode: 301 },
      { source: "/kalici-kas-ankara", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/kas-konturu-ankara", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/kas-pudralama-ankara", destination: "https://striastudio.com.tr/hizmetler/kas-pudralama", statusCode: 301 },
      { source: "/mikroblading-mi-kas-pudralama-mi", destination: "https://striastudio.com.tr/blog/microblading-vs-kas-pudralama", statusCode: 301 },
      { source: "/mikroblading-sonrasi-bakim", destination: "https://striastudio.com.tr/blog/kalici-makyaj-sonrasi-bakim", statusCode: 301 },
      { source: "/mikroblading-zararli-mi", destination: "https://striastudio.com.tr/blog/kalici-makyaj-zararli-mi", statusCode: 301 },
      { source: "/mikroblading-oncesi-hazirlik", destination: "https://striastudio.com.tr/blog/kalici-makyaj-oncesi-hazirlik", statusCode: 301 },
      { source: "/eski-kalici-kas-duzeltme", destination: "https://striastudio.com.tr/blog/eski-kalici-kas-duzeltme", statusCode: 301 },
      { source: "/erkek-mikroblading-ankara", destination: "https://striastudio.com.tr/blog/erkeklerde-kalici-makyaj-kas", statusCode: 301 },
      { source: "/seyrek-kaslar-mikroblading", destination: "https://striastudio.com.tr/blog/seyrek-kaslar-icin-kas-cozumleri", statusCode: 301 },
      { source: "/cankaya-mikroblading", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/kecioren-mikroblading", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/cayyolu-mikroblading", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      { source: "/kizilay-mikroblading", destination: "https://striastudio.com.tr/hizmetler/microblading", statusCode: 301 },
      // Aynı kalan içerik rotaları → ana domaindeki eşdeğeri.
      { source: "/galeri", destination: "https://striastudio.com.tr/galeri", statusCode: 301 },
      { source: "/blog", destination: "https://striastudio.com.tr/blog", statusCode: 301 },
      { source: "/sss", destination: "https://striastudio.com.tr/sss", statusCode: 301 },
      { source: "/hakkimizda", destination: "https://striastudio.com.tr/hakkimizda", statusCode: 301 },
      { source: "/iletisim", destination: "https://striastudio.com.tr/iletisim", statusCode: 301 },
      // Blog yazıları → ana domaindeki kanonik yazılar.
      { source: "/blog/mikroblading-nedir", destination: "https://striastudio.com.tr/blog/microblading-nedir-ankara-kas-rehberi", statusCode: 301 },
      { source: "/blog/mikroblading-fiyatlari-2026-ankara", destination: "https://striastudio.com.tr/blog/kalici-makyaj-fiyatlari-2026-ankara", statusCode: 301 },
      { source: "/blog/mikroblading-mi-kas-pudralama-mi", destination: "https://striastudio.com.tr/blog/microblading-vs-kas-pudralama", statusCode: 301 },
      { source: "/blog/mikroblading-sonrasi-bakim-ilk-10-gun", destination: "https://striastudio.com.tr/blog/microblading-iyilesme-gunlugu", statusCode: 301 },
      { source: "/blog/mikroblading-kac-yil-kalici", destination: "https://striastudio.com.tr/blog/kalici-makyaj-renk-solmasi-rotus-zamani", statusCode: 301 },
      { source: "/blog/mikroblading-acitir-mi", destination: "https://striastudio.com.tr/blog/kalici-makyaj-acir-mi", statusCode: 301 },
      { source: "/blog/mikroblading-silinir-mi", destination: "https://striastudio.com.tr/blog/kalici-makyaj-silinir-mi", statusCode: 301 },
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
