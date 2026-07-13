import type { Metadata } from "next";
import { Container, Section } from "@/components/Section";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "API Dokümantasyonu — Kaş Tasarımı Ankara",
    description:
      "Kaş Tasarımı Ankara microsite içerik API'si (blog, SSS, galeri, hizmet, ayarlar, iletişim) için geliştirici dokümantasyonu ve OpenAPI şeması.",
    path: "/api-docs",
  }),
  robots: { index: false, follow: true },
};

const BASE = "/api/microsites/{site}";

const endpoints: {
  method: "GET" | "POST";
  path: string;
  desc: string;
  sample: string;
}[] = [
  {
    method: "GET",
    path: `${BASE}/service`,
    desc: "Bu microsite'in bağlı olduğu hizmet detayını döner.",
    sample: `{
  "data": {
    "slug": "kas-tasarimi",
    "name_tr": "Kaş Tasarımı",
    "intro_tr": "…",
    "benefits_tr": ["…"],
    "process_tr": ["…"],
    "faq_tr": [{ "q": "…", "a": "…" }]
  }
}`,
  },
  {
    method: "GET",
    path: `${BASE}/posts?page=1`,
    desc: "Yayınlanmış blog yazılarını sayfalı döner (9/sayfa).",
    sample: `{
  "data": [
    { "id": 1, "slug": "kas-tasarimi-nedir", "title_tr": "…", "excerpt_tr": "…", "cover_url": null, "published_at": "2026-07-01T09:00:00+00:00", "category": null }
  ],
  "meta": { "current_page": 1, "last_page": 1, "total": 6 }
}`,
  },
  {
    method: "GET",
    path: `${BASE}/posts/{slug}`,
    desc: "Tek bir blog yazısını gövde (HTML) ile döner.",
    sample: `{
  "data": {
    "slug": "kas-tasarimi-nedir",
    "title_tr": "Kaş Tasarımı Nedir?",
    "body_tr": "<p>…</p>",
    "meta_title_tr": "…",
    "meta_desc_tr": "…"
  }
}`,
  },
  {
    method: "GET",
    path: `${BASE}/faqs`,
    desc: "Sıkça sorulan soruları döner.",
    sample: `{ "data": [ { "q_tr": "…?", "a_tr": "…" } ] }`,
  },
  {
    method: "GET",
    path: `${BASE}/gallery`,
    desc: "Galeri görsellerini (öncesi/sonrası) döner.",
    sample: `{ "data": [ { "image": "https://…/storage/…jpg", "alt_tr": "…" } ] }`,
  },
  {
    method: "GET",
    path: `${BASE}/settings`,
    desc: "Stüdyo bilgileri: telefon, WhatsApp, adres, konum, çalışma saatleri.",
    sample: `{
  "data": {
    "phone": "+90 …",
    "whatsapp": "https://wa.me/…",
    "street_address": "…",
    "locality": "Çankaya",
    "region": "Ankara",
    "lat": 39.9208, "lng": 32.8541,
    "hours": [ { "days": ["Monday"], "open": "10:00", "close": "19:00" } ]
  }
}`,
  },
  {
    method: "POST",
    path: `${BASE}/contact`,
    desc: "Randevu/iletişim talebi oluşturur (site etiketli lead). 30 istek/dk sınırı.",
    sample: `// request
{ "name": "Ad Soyad", "phone": "05xx…", "email": null, "preferred_date": "2026-07-20", "message": "…" }

// response 201
{ "ok": true, "id": 42 }`,
  },
];

const methodColor: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800",
  POST: "bg-amber-100 text-amber-800",
};

export default function ApiDocsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "API Dokümantasyonu", path: "/api-docs" }]} />
      <Section as="h1" eyebrow="Geliştiriciler" heading="API Dokümantasyonu"
        intro="Kaş Tasarımı Ankara microsite'i içeriğini ortak Stria Studio backend'inden çeker. Aşağıdaki uçlar salt-okunur ve site slug'ına göre kapsamlandırılmıştır.">
        <div className="mt-6 flex flex-wrap gap-3 text-[14px]">
          <a href="/openapi.yaml" className="rounded-[2px] border border-line bg-cream px-4 py-2 text-accent-dark hover:bg-blush/50">
            OpenAPI 3.1 şeması (openapi.yaml)
          </a>
          <span className="rounded-[2px] border border-line bg-cream px-4 py-2 text-muted2">
            Site slug: <code className="text-ink">{site.slug}</code>
          </span>
        </div>

        <div className="mt-8 rounded-[2px] border border-line bg-cream p-5 text-[14px] text-muted2">
          <p><strong className="text-ink">Base URL:</strong> <code>{`{API_URL}/api/microsites/{site}`}</code></p>
          <p className="mt-2"><strong className="text-ink">Örnek:</strong> <code>{`GET {API_URL}/api/microsites/${site.slug}/posts`}</code></p>
          <p className="mt-2">Bilinmeyen <code>site</code> slug'ı <code>404</code> döner. Tüm yanıtlar JSON'dur.</p>
        </div>

        <div className="mt-8 space-y-4">
          {endpoints.map((e) => (
            <div key={e.method + e.path} className="overflow-hidden rounded-[2px] border border-line bg-cream">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
                <span className={`rounded px-2.5 py-1 text-[12px] font-semibold ${methodColor[e.method]}`}>{e.method}</span>
                <code className="text-[14px] text-ink">{e.path}</code>
              </div>
              <div className="px-5 py-4">
                <p className="text-[14px] text-muted2">{e.desc}</p>
                <pre className="mt-3 overflow-x-auto rounded-[2px] bg-ink/95 p-4 text-[12.5px] leading-relaxed text-cream">
                  <code>{e.sample}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
