import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

const BASE_URL = "https://admin.striastudio.com.tr/api";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "API Dokümantasyonu",
    description:
      "Stria Studio public içerik, iletişim, analitik ve otomasyon API uçları için Türkçe geliştirici dokümantasyonu.",
    path: "/api-docs",
  }),
  robots: { index: false, follow: false },
};

type Field = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
};

type Endpoint = {
  method: "GET" | "POST";
  path: string;
  description: string;
  fields?: Field[];
  fieldsTitle?: string;
  request?: string;
  response: string;
  responseTitle?: string;
};

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/posts",
    description:
      "Ana siteye ait yayınlanmış blog yazılarını, yayın tarihine göre yeniden eskiye ve sayfa başına 9 kayıt olacak şekilde döner.",
    fieldsTitle: "Sorgu parametreleri",
    fields: [
      {
        name: "page",
        type: "integer",
        description: "Sayfa numarası; varsayılan 1.",
      },
      {
        name: "category",
        type: "string (slug)",
        description: "Yazıları kategori slug'ına göre filtreler.",
      },
      {
        name: "tag",
        type: "string (slug)",
        description: "Yazıları etiket slug'ına göre filtreler.",
      },
      {
        name: "q",
        type: "string",
        description:
          "Arama sorgusu. Mevcut backend sürümünde henüz filtrelemeye uygulanmaz.",
      },
    ],
    response: `{
  "data": [
    {
      "id": 12,
      "slug": "microblading-sonrasi-bakim",
      "title_tr": "Microblading Sonrası Bakım",
      "excerpt_tr": "İlk günlerden rötuşa kadar bakım önerileri…",
      "cover_url": "https://admin.striastudio.com.tr/storage/posts/bakim.webp",
      "published_at": "2026-07-10T09:00:00+00:00",
      "category": { "slug": "bakim", "name_tr": "Bakım", "name_en": "Care" },
      "tags": [{ "slug": "microblading", "name_tr": "Microblading", "name_en": "Microblading" }]
    }
  ],
  "meta": { "current_page": 1, "last_page": 2, "per_page": 9, "total": 13 }
}`,
  },
  {
    method: "GET",
    path: "/posts/{slug}",
    description:
      "Yayınlanmış tek bir ana site yazısını HTML gövdesi ve SEO alanlarıyla döner. Bulunamayan veya yayında olmayan slug için 404 verir.",
    response: `{
  "data": {
    "slug": "microblading-sonrasi-bakim",
    "title_tr": "Microblading Sonrası Bakım",
    "excerpt_tr": "İlk günlerden rötuşa kadar bakım önerileri…",
    "body_tr": "<p>İlk 24 saat boyunca…</p>",
    "meta_title_tr": "Microblading Sonrası Bakım Rehberi",
    "meta_desc_tr": "Microblading sonrası bakım adımları…",
    "category": { "slug": "bakim", "name_tr": "Bakım", "name_en": "Care" },
    "tags": []
  }
}`,
  },
  {
    method: "GET",
    path: "/categories",
    description: "Blog kategorilerini Türkçe ve İngilizce adlarıyla döner.",
    response: `{
  "data": [
    { "id": 3, "slug": "bakim", "name_tr": "Bakım", "name_en": "Care" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/tags",
    description: "Blog etiketlerini Türkçe ve İngilizce adlarıyla döner.",
    response: `{
  "data": [
    { "id": 7, "slug": "microblading", "name_tr": "Microblading", "name_en": "Microblading" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/services",
    description: "Aktif hizmetlerin liste görünümünde kullanılan özet alanlarını döner.",
    response: `{
  "data": [
    {
      "slug": "microblading",
      "name_tr": "Microblading",
      "tag_tr": "Kaş",
      "desc_tr": "Doğal kıl görünümü için kişiye özel kaş uygulaması.",
      "image": "/images/micro.png",
      "url": "/hizmetler/microblading"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/services/{slug}",
    description:
      "Aktif bir hizmetin açıklama, SEO, süreç, fayda, SSS, galeri ve ilişkili hizmet alanlarını döner.",
    response: `{
  "data": {
    "slug": "microblading",
    "name_tr": "Microblading",
    "intro_tr": "Kaş yapınıza göre planlanan doğal bir uygulama…",
    "benefits_tr": ["Doğal görünüm", "Kişiye özel tasarım"],
    "process_tr": ["Danışma", "Tasarım", "Uygulama"],
    "faq_tr": [{ "q": "Ne kadar kalıcıdır?", "a": "Cilt tipine göre değişir." }],
    "gallery": ["https://admin.striastudio.com.tr/storage/services/1.webp"],
    "related": ["microshading"]
  }
}`,
  },
  {
    method: "GET",
    path: "/settings",
    description:
      "Stüdyonun iletişim, adres, sosyal medya, çalışma saatleri ve kampanya ayarlarını döner.",
    response: `{
  "data": {
    "phone": "+90 555 111 22 33",
    "whatsapp": "https://wa.me/905551112233",
    "instagram": "https://instagram.com/striastudio",
    "address": "Çankaya, Ankara",
    "lat": 39.9208,
    "lng": 32.8541,
    "hours": [{ "days": ["Monday", "Tuesday"], "open": "10:00", "close": "19:00" }],
    "campaign_enabled": false
  }
}`,
  },
  {
    method: "GET",
    path: "/gallery",
    description: "Ana siteye ait aktif galeri görsellerini ve iki dilde alt metinlerini döner.",
    response: `{
  "data": [
    {
      "image": "https://admin.striastudio.com.tr/storage/gallery/kas.webp",
      "alt_tr": "Doğal kaş uygulaması",
      "alt_en": "Natural brow treatment"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/faqs",
    description: "Ana siteye ait aktif sıkça sorulan soruları iki dilde döner.",
    response: `{
  "data": [
    {
      "q_tr": "İşlem ne kadar sürer?",
      "a_tr": "Hizmete göre süre değişir.",
      "q_en": "How long does it take?",
      "a_en": "Duration varies by service."
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/contact",
    description:
      "Bir iletişim veya randevu talebi oluşturur. Başarılı istekte 201 döner; locale gönderilmezse tr kullanılır.",
    fieldsTitle: "JSON gövdesi",
    fields: [
      { name: "name", type: "string, en fazla 120", required: true, description: "Ad soyad." },
      { name: "phone", type: "string, en fazla 40", required: true, description: "Telefon numarası." },
      { name: "email", type: "email, en fazla 160", description: "E-posta adresi." },
      { name: "service", type: "string, en fazla 80", description: "İlgilenilen hizmet." },
      { name: "preferred_date", type: "date", description: "Tercih edilen tarih; ör. 2026-07-20." },
      { name: "message", type: "string, en fazla 2000", description: "Ek mesaj." },
      { name: "locale", type: "tr | en", description: "Talep dili; varsayılan tr." },
    ],
    request: `{
  "name": "Ayşe Yılmaz",
  "phone": "05551112233",
  "email": "ayse@example.com",
  "service": "Microblading",
  "preferred_date": "2026-07-20",
  "message": "Öğleden sonra için bilgi rica ederim.",
  "locale": "tr"
}`,
    response: `{ "ok": true, "id": 42 }`,
  },
  {
    method: "POST",
    path: "/track",
    description:
      "Ana site veya tanımlı bir microsite için sayfa görüntüleme ve özel etkinlik kaydeder. Dakikada 120 istekle sınırlıdır.",
    fieldsTitle: "JSON gövdesi",
    fields: [
      { name: "type", type: "pageview | event", required: true, description: "Kayıt türü." },
      { name: "path", type: "string, en fazla 512", required: true, description: "Görüntülenen veya etkinliğin oluştuğu yol." },
      { name: "referrer", type: "string, en fazla 512", description: "Yönlendiren URL." },
      { name: "name", type: "string, en fazla 64", description: "type=event olduğunda zorunlu etkinlik adı." },
      { name: "site", type: "string, en fazla 40", description: "Microsite slug'ı; ana site için gönderilmez." },
      { name: "utm_source", type: "string, en fazla 255", description: "UTM kaynak değeri." },
      { name: "utm_medium", type: "string, en fazla 255", description: "UTM kanal değeri." },
      { name: "utm_campaign", type: "string, en fazla 255", description: "UTM kampanya değeri." },
    ],
    request: `{
  "type": "event",
  "path": "/hizmetler/microblading",
  "name": "whatsapp_click"
}`,
    responseTitle: "Başarılı yanıt",
    response: `204 No Content
Yanıt gövdesi yoktur.`,
  },
];

const writeFields: Field[] = [
  { name: "slug", type: "string", required: true, description: "Yazının URL slug'ı." },
  { name: "title_tr", type: "string", required: true, description: "Türkçe başlık." },
  { name: "body_tr", type: "HTML string", required: true, description: "Türkçe yazı gövdesi." },
  { name: "title_en", type: "string", description: "İngilizce başlık." },
  { name: "excerpt_tr", type: "string", description: "Türkçe kısa özet." },
  { name: "excerpt_en", type: "string", description: "İngilizce kısa özet." },
  { name: "body_en", type: "HTML string", description: "İngilizce yazı gövdesi." },
  { name: "meta_title_tr", type: "string", description: "Türkçe SEO başlığı." },
  { name: "meta_title_en", type: "string", description: "İngilizce SEO başlığı." },
  { name: "meta_desc_tr", type: "string", description: "Türkçe meta açıklaması." },
  { name: "meta_desc_en", type: "string", description: "İngilizce meta açıklaması." },
  {
    name: "site",
    type: "string | null",
    description: "null ana siteyi, bir microsite slug'ı ilgili microsite'ı belirtir.",
  },
  {
    name: "category",
    type: "string (slug)",
    description: "Kategori slug'ı; bulunmuyorsa otomatik oluşturulur.",
  },
  { name: "category_name_tr", type: "string", description: "Yeni kategori için Türkçe ad." },
  { name: "category_name_en", type: "string", description: "Yeni kategori için İngilizce ad." },
  {
    name: "tags[]",
    type: "string[] (slug)",
    description: "Etiket slug'ları; bulunmayan etiketler otomatik oluşturulur.",
  },
  { name: "is_published", type: "boolean", description: "Yayın durumu; varsayılan true." },
  {
    name: "published_at",
    type: "ISO 8601 datetime",
    description: "Yayın zamanı; varsayılan istek anı.",
  },
  {
    name: "cover_url",
    type: "URL",
    description: "jpg, png veya webp kapak görseli; en fazla 5 MB.",
  },
];

const methodColor: Record<Endpoint["method"] | "DELETE", string> = {
  GET: "bg-emerald-100 text-emerald-800",
  POST: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

function FieldsTable({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <div className="mt-5">
      <h3 className="mb-3 text-[15px] font-medium text-ink">{title}</h3>
      <div className="overflow-x-auto rounded-[14px] border border-line">
        <table className="w-full min-w-[660px] border-collapse text-left text-[13px]">
          <thead className="bg-blush/70 text-muted2">
            <tr>
              <th className="px-4 py-3 font-medium">Alan</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="px-4 py-3 align-top">
                  <code className="text-accent-dark">{field.name}</code>
                </td>
                <td className="px-4 py-3 align-top text-muted2">{field.type}</td>
                <td className="px-4 py-3 align-top text-muted2">
                  {field.required ? "Zorunlu" : "Opsiyonel"}
                </td>
                <td className="px-4 py-3 align-top leading-[1.55] text-muted2">
                  {field.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="mt-5">
      <h3 className="mb-3 text-[15px] font-medium text-ink">{title}</h3>
      <pre className="overflow-x-auto rounded-[14px] bg-ink px-5 py-4 text-[12.5px] leading-[1.7] text-cream">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-line bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-blush/35 px-5 py-4 sm:px-6">
        <span
          className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${methodColor[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <code className="break-all text-[14px] text-ink">{endpoint.path}</code>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[14px] leading-[1.7] text-muted2">{endpoint.description}</p>
        {endpoint.fields ? (
          <FieldsTable title={endpoint.fieldsTitle ?? "Parametreler"} fields={endpoint.fields} />
        ) : (
          <p className="mt-4 text-[13px] text-muted">Sorgu parametresi yoktur.</p>
        )}
        {endpoint.request && <CodeBlock title="Örnek istek gövdesi">{endpoint.request}</CodeBlock>}
        <CodeBlock title={endpoint.responseTitle ?? "Örnek JSON yanıt"}>
          {endpoint.response}
        </CodeBlock>
      </div>
    </article>
  );
}

export default function ApiDocsPage() {
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "API Dokümantasyonu", path: "/api-docs" },
  ];

  return (
    <>
      <Nav />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,112px)] pt-8">
        <header className="max-w-[820px]">
          <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
            Geliştiriciler
          </div>
          <h1 className="text-[clamp(32px,4.6vw,58px)] leading-[1.05]">
            API Dokümantasyonu
          </h1>
          <p className="mt-5 text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Stria Studio ana sitesinin içerik, iletişim ve analitik uçları ile token korumalı
            blog otomasyon uçları. Public okuma uçları kimlik doğrulama gerektirmez.
          </p>
        </header>

        <section className="mt-10 rounded-[18px] border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[20px] leading-tight">Genel bilgiler</h2>
          <dl className="mt-4 grid gap-4 text-[14px] sm:grid-cols-[150px_1fr]">
            <dt className="font-medium text-ink">Base URL</dt>
            <dd className="min-w-0 text-muted2">
              <code className="break-all rounded-md bg-blush px-2 py-1 text-accent-dark">
                {BASE_URL}
              </code>
            </dd>
            <dt className="font-medium text-ink">İçerik türü</dt>
            <dd className="text-muted2">
              POST gövdeleri ve içerik yanıtları <code>application/json</code> kullanır.
              Başarılı <code>/track</code> isteği gövdesiz <code>204</code> döner.
            </dd>
            <dt className="font-medium text-ink">Dil alanları</dt>
            <dd className="text-muted2">
              İçerikler <code>_tr</code> ve <code>_en</code> alanlarıyla birlikte döner; ayrı bir
              dil parametresi yoktur.
            </dd>
          </dl>
        </section>

        <section className="mt-[clamp(48px,7vw,80px)]" aria-labelledby="public-api-heading">
          <div className="mb-7 max-w-[760px]">
            <div className="mb-3 text-xs uppercase tracking-[0.14em] text-accent">Public API</div>
            <h2 id="public-api-heading" className="text-[clamp(26px,3.6vw,42px)] leading-tight">
              Okuma, iletişim ve takip uçları
            </h2>
          </div>
          <div className="space-y-5">
            {endpoints.map((endpoint) => (
              <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
            ))}
          </div>
        </section>

        <section className="mt-[clamp(56px,8vw,96px)]" aria-labelledby="write-api-heading">
          <div className="max-w-[820px]">
            <div className="mb-3 text-xs uppercase tracking-[0.14em] text-accent">Token korumalı</div>
            <h2 id="write-api-heading" className="text-[clamp(26px,3.6vw,42px)] leading-tight">
              Yazma API (otomasyon)
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-muted">
              Bu uçlar dış otomasyonların blog yazısı oluşturması, güncellemesi veya silmesi
              içindir. Her istekte aşağıdaki header zorunludur:
            </p>
            <div className="mt-4 overflow-x-auto rounded-[14px] bg-ink px-5 py-4 text-[13px] text-cream">
              <code>Authorization: Bearer &lt;ADMIN_API_TOKEN&gt;</code>
            </div>
            <p className="mt-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-[1.65] text-amber-900">
              Token, backend <code>.env</code> dosyasındaki <code>ADMIN_API_TOKEN</code> değeridir.
              Güvenlik nedeniyle token değeri bu sayfada yayınlanmaz.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-[18px] border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-blush/35 px-5 py-4 sm:px-6">
              <span className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${methodColor.POST}`}>
                POST
              </span>
              <code className="text-[14px] text-ink">/admin/posts</code>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[14px] leading-[1.7] text-muted2">
                Yazı oluşturur. Aynı <code>site</code> + <code>slug</code> birleşimi zaten varsa
                yeni kayıt açmak yerine mevcut yazıyı günceller (upsert).
              </p>
              <FieldsTable title="JSON gövdesi" fields={writeFields} />
              <CodeBlock title="Örnek curl">
                {`curl -X POST "${BASE_URL}/admin/posts" \\
  -H "Authorization: Bearer \$ADMIN_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "microblading-sonrasi-bakim",
    "title_tr": "Microblading Sonrası Bakım",
    "body_tr": "<p>İlk 24 saat boyunca kaşları kuru tutun.</p>",
    "excerpt_tr": "İyileşme sürecinde dikkat edilmesi gerekenler.",
    "site": null,
    "category": "bakim",
    "category_name_tr": "Bakım",
    "tags": ["microblading", "uygulama-sonrasi"],
    "is_published": true,
    "cover_url": "https://example.com/images/bakim.webp"
  }'`}
              </CodeBlock>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[18px] border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-blush/35 px-5 py-4 sm:px-6">
              <span
                className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${methodColor.DELETE}`}
              >
                DELETE
              </span>
              <code className="text-[14px] text-ink">/admin/posts/{`{slug}`}</code>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[14px] leading-[1.7] text-muted2">
                Slug ile belirtilen yazıyı siler.
              </p>
              <CodeBlock title="Örnek curl">
                {`curl -X DELETE "${BASE_URL}/admin/posts/microblading-sonrasi-bakim" \\
  -H "Authorization: Bearer \$ADMIN_API_TOKEN"`}
              </CodeBlock>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
