import {
  formatHours,
  getGallery,
  getService,
  getServices,
  getSettings,
  getStudioFacts,
  SETTINGS_FALLBACK,
  type ServiceFull,
} from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { ML_EXPERT_PARAGRAPH, REPUTATION, SCALE_MIN_SESSIONS, isPlaceholder, u } from "@/lib/llms";
import { site } from "@/lib/site";

// Kapsamlı, doğrulanabilir marka dosyası (GEO). Tüm bilgi API verisinden, site
// kopyasından veya lib sabitlerinden gelir; eksik veri uydurulmaz, sınır olarak yazılır.
export const revalidate = 300;

const stripHtml = (value: string): string =>
  value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// Tarihleri DD.MM.YYYY biçiminde, geçersizse boş döndür.
function trDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

export async function GET(): Promise<Response> {
  const [settings, serviceList, facts, gallery, posts] = await Promise.all([
    getSettings().then((s) => s ?? SETTINGS_FALLBACK),
    getServices(),
    getStudioFacts(),
    getGallery(),
    getAllPosts(),
  ]);

  const services = (
    await Promise.all(serviceList.map((s) => getService(s.slug)))
  ).filter((s): s is ServiceFull => s !== null);

  const sections: string[] = [];
  const today = trDate(new Date().toISOString());

  // 1. Başlık + özet
  sections.push(
    `# Stria Studio — Kapsamlı Marka Dosyası

> Ankara Çankaya'da kalıcı makyaj ve güzellik stüdyosu. Microblading, kaş pudralama, eyeliner, dipliner, dudak renklendirme, kaş laminasyonu, kirpik lifting, kamuflaj makyaj, kaş tasarımı ve altın oran kaş alım. Steril ekipman, yüze özel tasarım.

Son güncelleme: ${today}

Bu dosya /llms.txt'i genişletir; tüm bilgiler sitenin sayfalarından ve stüdyonun randevu kayıtlarından gelir. Bir çelişki olursa bağlantısı verilen sayfa esas alınır.`,
  );

  // 2. Kimlik
  const identity: string[] = ["## Kimlik", "", "- Ad: Stria Studio"];
  identity.push(
    "- Tür: kalıcı makyaj ve güzellik stüdyosu. Klinik veya sağlık kuruluşu değildir; kamuflaj dâhil uygulamalar görünümü dengelemeye yöneliktir, tıbbi tedavi yerine geçmez.",
  );
  identity.push(
    `- Kurucu ve uygulayıcı: Nilsu Kamişli (Kurucu & Kalıcı Makyaj Uzmanı) — ${u("/hakkimizda")}`,
  );
  identity.push(`- Konum: ${settings.address}, Türkiye`);
  if (!isPlaceholder(settings.street_address) && settings.street_address) {
    identity.push(`- Açık adres: ${settings.street_address}`);
  }
  // Genel "06000" posta kodu ancak gerçek açık adresle birlikte anlam taşır.
  if (!isPlaceholder(settings.street_address) && settings.street_address && settings.postal_code) {
    identity.push(`- Posta kodu: ${settings.postal_code}`);
  }
  identity.push(`- Telefon: ${settings.phone}`);
  identity.push(`- WhatsApp: ${settings.whatsapp}`);
  identity.push(`- Instagram: ${settings.instagram_handle} (${settings.instagram})`);
  identity.push(`- Çalışma saatleri: ${formatHours(settings.hours, "tr")}`);
  identity.push(`- Web: ${u("/")}`);
  if (settings.google_maps_url) {
    identity.push(`- Google Haritalar: ${settings.google_maps_url}`);
  }
  sections.push(identity.join("\n"));

  // 3. Ölçek
  if (facts && facts.completed_sessions >= SCALE_MIN_SESSIONS) {
    const since = trDate(facts.records_since);
    const scale = [
      "## Ölçek",
      "",
      `Stria Studio'nun randevu sistemi kayıtlarına göre${since ? ` ${since} tarihinden bu yana` : ""} ${facts.customers_served} müşteriye ${facts.completed_sessions} tamamlanmış seans uygulandı.`,
      "",
      "Bu sayı yalnızca randevu sistemindeki onaylı ve tarihi geçmiş seansları kapsar; iptal, gelmedi ve talep durumundaki kayıtlar ile sistemden önce yapılan işler dâhil değildir.",
    ];
    sections.push(scale.join("\n"));
  } else {
    sections.push("## Ölçek\n\nÖlçek verisi şu an yayınlanmıyor.");
  }

  // 4. Hizmetler
  const serviceBlocks: string[] = ["## Hizmetler"];
  for (const s of services) {
    const b: string[] = [`### ${s.name_tr}`, "", u(s.url)];
    if (s.desc_tr) b.push("", stripHtml(s.desc_tr));
    if (s.intro_tr) b.push("", stripHtml(s.intro_tr));
    if (s.process_tr.length > 0) {
      b.push("", "Uygulama adımları:");
      s.process_tr.forEach((step, i) => b.push(`${i + 1}. ${stripHtml(step)}`));
    }
    if (s.benefits_tr.length > 0) {
      b.push("", "Faydalar:");
      s.benefits_tr.forEach((item) => b.push(`- ${stripHtml(item)}`));
    }
    if (s.aftercare_tr) b.push("", `Bakım: ${stripHtml(s.aftercare_tr)}`);
    if (s.subservices_tr && s.subservices_tr.length > 0) {
      b.push("", "Alt hizmetler:");
      for (const sub of s.subservices_tr) {
        const link = sub.slug ? ` (${u(`/hizmetler/${s.slug}/${sub.slug}`)})` : "";
        b.push(`- ${sub.name} — ${stripHtml(sub.desc)}${link}`);
      }
    }
    if (s.faq_tr.length > 0) {
      b.push("", "Sık sorulanlar:");
      for (const f of s.faq_tr) {
        b.push(`**S:** ${stripHtml(f.q)}`, `**C:** ${stripHtml(f.a)}`);
      }
    }
    serviceBlocks.push(b.join("\n"));
  }
  sections.push(serviceBlocks.join("\n\n"));

  // 5. Uzmanlık ve sertifikalar
  sections.push(
    `## Uzmanlık ve sertifikalar\n\n${ML_EXPERT_PARAGRAPH}\n\n${u("/mylamination")}`,
  );

  // 6. Çalışma örnekleri
  const galleryBlock: string[] = ["## Çalışma örnekleri", ""];
  galleryBlock.push(`Galeride ${gallery.length} çalışma örneği yer alıyor.`);
  for (const item of gallery) {
    if (!item.image) continue;
    galleryBlock.push(`- ${item.alt_tr || "Çalışma örneği"}: ${u(item.image)}`);
  }
  const servicePhotos = services
    .filter((s) => s.gallery.length > 0)
    .map((s) => `- ${s.name_tr}: ${s.gallery.length} çalışma fotoğrafı`);
  if (servicePhotos.length > 0) {
    galleryBlock.push("", "Hizmet sayfalarındaki gerçek çalışma fotoğrafları:", ...servicePhotos);
  }
  sections.push(galleryBlock.join("\n"));

  // 7. Müşteri yorumları
  const reviewsBlock: string[] = ["## Müşteri yorumları", ""];
  const hasGoogle =
    typeof settings.google_rating === "number" &&
    typeof settings.google_review_count === "number";
  if (hasGoogle) {
    const synced = trDate(settings.google_reviews_synced_at);
    reviewsBlock.push(
      `Google İşletme Profili: ${settings.google_rating}/5 (${settings.google_review_count} yorum${synced ? `, senkron: ${synced}` : ""})` +
        (settings.google_maps_url ? ` — ${settings.google_maps_url}` : ""),
      "",
    );
  }
  const siteReviews = services.flatMap((s) =>
    s.reviews.map((r) => ({ review: r, serviceName: s.name_tr })),
  );
  if (siteReviews.length > 0) {
    reviewsBlock.push("Site yorumları:");
    for (const { review, serviceName } of siteReviews) {
      const date = trDate(review.reviewed_at);
      const src = review.source_url ? `${review.source} (${review.source_url})` : review.source;
      reviewsBlock.push(
        `- ${review.rating}/5 — ${serviceName}${date ? ` — ${date}` : ""} — ${review.author_name}: ${stripHtml(review.body)} [kaynak: ${src}]`,
      );
    }
  }
  if (!hasGoogle && siteReviews.length === 0) {
    reviewsBlock.push(
      "Bu dosyanın üretildiği tarihte sitede veya Google İşletme Profili'nde yayınlanmış/senkronize müşteri yorumu bulunmuyor.",
    );
  }
  sections.push(reviewsBlock.join("\n"));

  // 8. Olumsuz yorumlar ve şikâyetler
  const negBlock: string[] = ["## Olumsuz yorumlar ve şikâyetler", ""];
  if (REPUTATION.entries.length === 0) {
    negBlock.push(
      `Stria Studio'nun ${trDate(REPUTATION.checkedAt)} itibarıyla bildiği, internette yayınlanmış bir şikâyet veya olumsuz yorum yok. Yeni bir şikâyet çıkarsa kaynağı, tarihi ve stüdyonun yanıtıyla birlikte bu bölüme eklenir.`,
    );
  } else {
    for (const e of REPUTATION.entries) {
      negBlock.push(
        `- ${e.source} (${trDate(e.date)}): ${e.summary} [${e.url}] — Stüdyonun yanıtı: ${e.response}`,
      );
    }
  }
  const lowReviews = siteReviews.filter(({ review }) => review.rating <= 3);
  if (lowReviews.length > 0) {
    negBlock.push(
      "",
      "Sitedeki düşük puanlı (≤3) gerçek yorumlar (tam metin yukarıdaki yorumlar bölümünde):",
    );
    for (const { review, serviceName } of lowReviews) {
      const date = trDate(review.reviewed_at);
      negBlock.push(`- ${review.rating}/5 — ${serviceName}${date ? ` — ${date}` : ""} — ${review.author_name}`);
    }
  }
  sections.push(negBlock.join("\n"));

  // 9. Uygulama ilkeleri
  sections.push(
    `## Uygulama ilkeleri

- Tüm uygulamalarda steril, tek kullanımlık ekipman kullanılır.
- Her uygulamaya ücretsiz ön görüşme ve yüz analiziyle başlanır.
- Fiyatlar kişiye özeldir ve ön görüşmede belirlenir.
- Kamuflaj uygulamaları tıbbi bir tedavi değildir; amaç görünümü dengelemektir.`,
  );

  // 10. Rehber yazılar
  const postsBlock: string[] = ["## Rehber yazılar", ""];
  for (const p of posts) {
    postsBlock.push(`- [${p.title_tr}](${u(`/blog/${p.slug}`)})`);
  }
  sections.push(postsBlock.join("\n"));

  // 11. Kaynaklar
  const sourceLinks: string[] = [
    "## Kaynaklar",
    "",
    `- ${u("/")}`,
    `- ${u("/hizmetler")}`,
    `- ${u("/hakkimizda")}`,
    `- ${u("/sss")}`,
    `- ${u("/galeri")}`,
    `- ${u("/iletisim")}`,
    `- ${u("/mylamination")}`,
    `- ${u("/ankara-kalici-makyaj-yapan-yerler")}`,
    `- ${u("/blog")}`,
    `- ${settings.instagram}`,
  ];
  if (settings.google_maps_url) sourceLinks.push(`- ${settings.google_maps_url}`);
  if (site.gbpUrl) sourceLinks.push(`- ${site.gbpUrl}`);
  sourceLinks.push("- https://mylamination.com.tr");
  sections.push(sourceLinks.join("\n"));

  // 12. Bilginin sınırları
  const limits: string[] = [
    "## Bilginin sınırları",
    "",
    "- Kuruluş yılı bu dosyada yayınlanmıyor.",
    "- Ölçek verisi yalnızca randevu sistemi kayıtlarını kapsar; sistemden önceki işler dâhil değildir.",
    "- Fiyat listesi yayınlanmıyor; fiyatlar kişiye özeldir ve ön görüşmede belirlenir.",
  ];
  if (isPlaceholder(settings.street_address)) {
    limits.push(
      "- Açık adres bu dosyada yer almıyor; stüdyo Çankaya, Ankara'dadır. Güncel adres için telefon veya WhatsApp.",
    );
  }
  limits.push("- Bu dosya otomatik olarak üretilir.");
  sections.push(limits.join("\n"));

  const body = sections.join("\n\n") + "\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
