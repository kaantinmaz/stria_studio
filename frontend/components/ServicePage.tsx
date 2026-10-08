"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ImageSlot } from "@/components/ImageSlot";
import { Faq } from "@/components/Faq";
import { WorkLightbox } from "@/components/WorkLightbox";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";
import { CallLabel } from "@/components/CallLabel";
import { useSettings } from "@/components/SettingsProvider";
import { MyLaminationBadge } from "@/components/MyLaminationBadge";
import { MyLaminationServiceSection } from "@/components/MyLaminationServiceSection";
import { ML_SERVICE_SCOPE } from "@/lib/mylamination";
import { formatHours, phoneHref, type ServiceFull, type ServiceListItem } from "@/lib/content";
import { isPlaceholder } from "@/lib/llms";
import type { ServiceDetails } from "@/lib/serviceDetails";
import { RatingBadge } from "@/components/RatingBadge";
import { GoogleRatingBadge } from "@/components/GoogleRatingBadge";
import { ServiceReviews } from "@/components/ServiceReviews";
import { UI } from "@/lib/i18n";
import { whatsappHref, serviceWhatsappText } from "@/lib/whatsapp";

// Ayrı domainde duran uzman rehber sitesi olan hizmetler. microbladingankara.com
// ve kastasarimiankara.com ana domaine 301 ile konsolide edildiği için burada
// yer almaz — redirect'e link vermek iç link değerini boşa harcar.
const SERVICE_GUIDES: Record<string, { href: string; label: string }> = {
  "kamuflaj-makyaj": {
    href: "https://catlakkamuflaj.com",
    label: "Kamuflaj Makyajı",
  },
};

// Work photos are labelled from the file name: "…-oncesi-1.jpg" / "…-sonrasi-2.jpg".
function workLabel(src: string): string | null {
  if (src.includes("-oncesi")) return "Öncesi";
  if (src.includes("-sonrasi")) return "Sonrası";
  return null;
}

// Giriş paragrafı — mobilde ~4 satıra kırpılır, "Devamını oku" ile açılır.
// Metin SEO için her zaman DOM'da; yalnızca CSS ile gizlenir.
function IntroText({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-7 max-w-[520px]">
      <p
        className={`text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted md:line-clamp-none ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-1 inline-flex min-h-[44px] items-center text-sm text-accent underline underline-offset-4 md:hidden"
      >
        {expanded ? "Daha az göster" : "Devamını oku"}
      </button>
    </div>
  );
}

// Client-rendered TR service page body (settings-driven contact links).
export function ServicePage({
  svc,
  services,
  details,
  guides,
}: {
  svc: ServiceFull;
  services: ServiceListItem[];
  details?: ServiceDetails;
  guides: { slug: string; title: string }[];
}) {
  const settings = useSettings();
  const name = svc.name_tr;
  const guide = SERVICE_GUIDES[svc.slug];
  const mlScope = ML_SERVICE_SCOPE[svc.slug];
  // Work photos — owner fills svc.gallery; hidden until real photos exist.
  const shots = svc.gallery ?? [];
  const related = svc.related
    .map((slug) => {
      const item = services.find((s) => s.slug === slug);
      return item ? { slug, name: item.name_tr } : null;
    })
    .filter((r): r is { slug: string; name: string } => Boolean(r));

  return (
    <main>
      {/* header */}
      <header className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-[clamp(28px,4.5vw,64px)] px-[clamp(18px,5vw,56px)] pb-12 pt-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-[22px] bg-pink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-accent">
            {svc.tag_tr} · Ankara
          </div>
          <h1 className="mb-5 text-[clamp(32px,4.6vw,58px)] leading-[1.05]">
            {name} <span className="text-accent">Ankara</span>
          </h1>
          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <RatingBadge value={svc.rating_avg} count={svc.rating_count} size={15} />
            <GoogleRatingBadge />
          </div>
          <IntroText text={svc.intro_tr} />
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <a
              href={whatsappHref(settings.whatsapp, serviceWhatsappText(name))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-[9px] rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream md:w-auto"
            >
              <WhatsAppIcon size={16} />
              WhatsApp&apos;tan Randevu
            </a>
            <a
              href={phoneHref(settings.phone)}
              className="inline-flex w-full items-center justify-center gap-[9px] rounded-[28px] border border-line2 bg-white px-7 py-[15px] text-sm text-ink md:w-auto"
            >
              <PhoneIcon size={15} />
              <CallLabel label="Hemen Ara" />
            </a>
          </div>
          {mlScope && <MyLaminationBadge scope={mlScope} className="mt-7" />}
        </div>
        <div className="relative h-[320px] overflow-hidden rounded-[32px] shadow-[0_40px_90px_-50px_rgba(229,135,146,0.7)] md:h-[min(56vh,460px)]">
          <HeroCarousel
            images={svc.hero_images?.length ? svc.hero_images : (svc.image ? [svc.image] : [])}
            alt={`${name} — Stria Studio Ankara`}
          />
        </div>
      </header>

      {/* Kısa bilgiler — AI motorlarının ve aramanın tek bakışta alıntılayabileceği özet. */}
      {details && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pb-[clamp(8px,2vw,24px)]">
          <div className="rounded-[28px] border border-line bg-white p-[clamp(20px,3vw,36px)]">
            <h2 className="mb-1 text-[clamp(22px,2.4vw,30px)]">{name}: kısa bilgiler</h2>
            <p className="mb-6 text-[13px] text-muted">
              Son güncelleme:{" "}
              <time dateTime={details.updated}>
                {new Date(details.updated).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            </p>
            <dl className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              {details.facts.map((f) => (
                <div key={f.label} className="border-b border-line pb-3">
                  <dt className="mb-1 text-xs uppercase tracking-[0.12em] text-accent">{f.label}</dt>
                  <dd className="text-[15px] leading-[1.6] text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* benefits + process */}
      <section className="mx-auto grid max-w-[1160px] grid-cols-1 gap-[clamp(28px,4vw,56px)] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)] md:grid-cols-2">
        <div>
          <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">Neden {name}?</h2>
          <ul className="flex flex-col gap-3">
            {svc.benefits_tr.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2">
                <span className="mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-pink text-[11px] text-accent">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">Nasıl uygulanır?</h2>
          <ol className="flex flex-col gap-3">
            {svc.process_tr.map((p, i) => (
              <li key={p} className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2">
                <span className="mt-[1px] flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-ink text-[11px] text-cream">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-[18px] bg-blush px-5 py-4 text-[14px] leading-[1.6] text-muted2">
            <span className="font-medium text-ink">Bakım: </span>
            {svc.aftercare_tr}
          </div>
        </div>
      </section>

      {details && (
        <section className="mx-auto grid max-w-[1160px] grid-cols-1 gap-[clamp(20px,3vw,40px)] px-[clamp(18px,5vw,56px)] pb-[clamp(24px,4vw,48px)] md:grid-cols-2">
          <div className="rounded-[24px] bg-blush p-[clamp(20px,3vw,32px)]">
            <h2 className="mb-4 text-[clamp(20px,2.2vw,26px)]">{name} kimler için uygun?</h2>
            <ul className="flex flex-col gap-3">
              {details.suitable.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2">
                  <span className="mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-pink text-[11px] text-accent">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-line bg-white p-[clamp(20px,3vw,32px)]">
            <h2 className="mb-4 text-[clamp(20px,2.2vw,26px)]">Ne zaman ertelenir?</h2>
            <ul className="flex flex-col gap-3">
              {details.postpone.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2">
                  <span className="mt-[9px] h-[6px] w-[6px] flex-none rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-[1.6] text-muted">
              Emin değilseniz ücretsiz ön görüşmede birlikte değerlendiririz.
            </p>
          </div>
        </section>
      )}

      {details?.comparison && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pb-[clamp(24px,4vw,48px)]">
          <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">{details.comparison.caption}</h2>
          <div className="overflow-x-auto rounded-[22px] border border-line bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-[1.6]">
              <caption className="sr-only">{details.comparison.caption}</caption>
              <thead>
                <tr className="bg-blush">
                  <th scope="col" className="px-5 py-4 font-medium text-muted">
                    Özellik
                  </th>
                  {details.comparison.columns.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-5 py-4 font-medium ${i === 0 ? "text-accent" : "text-ink"}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.comparison.rows.map((r) => (
                  <tr key={r.label} className="border-t border-line">
                    <th scope="row" className="px-5 py-4 font-medium text-ink">
                      {r.label}
                    </th>
                    {r.values.map((v, i) => (
                      <td key={i} className={`px-5 py-4 ${i === 0 ? "text-ink" : "text-muted2"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {mlScope && <MyLaminationServiceSection scope={mlScope} serviceName={name} />}

      {/* Uygulayan uzman — sayfanın kimin elinden çıktığını gösterir (E-E-A-T). */}
      <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(24px,4vw,48px)]">
        <div className="flex flex-col items-start gap-6 rounded-[28px] bg-blush p-[clamp(20px,3vw,36px)] sm:flex-row sm:items-center">
          <div className="relative h-[120px] w-[120px] flex-none overflow-hidden rounded-full">
            <ImageSlot
              src="/images/nilsu-kamisli.jpg"
              alt="Nilsu Kamişli — Stria Studio kurucusu, kalıcı makyaj uzmanı"
              sizes="120px"
            />
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.14em] text-accent">Uzmanınız</div>
            <h2 className="mb-1 text-[clamp(22px,2.4vw,30px)]">{UI.tr.founderName}</h2>
            <div className="mb-3 text-sm font-medium tracking-[0.04em] text-accent">{UI.tr.founderRole}</div>
            <p className="max-w-[720px] text-[15px] leading-[1.7] text-muted2">{UI.tr.founderText}</p>
            <Link href="/hakkimizda#nilsu-kamisli" className="mt-3 inline-block text-sm text-accent underline underline-offset-4">
              Nilsu Kamişli hakkında
            </Link>
          </div>
        </div>
      </section>

      {svc.subservices_tr && svc.subservices_tr.length > 0 && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
          <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">Alt Uygulamalar</h2>
          <p className="mb-7 max-w-[620px] text-[15px] leading-[1.6] text-muted">
            {name} kapsamında sunduğumuz uygulamalar.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {svc.subservices_tr.map((subservice) => (
              <div key={subservice.name} className="flex flex-col gap-3">
                {subservice.slug ? (
                  <Link
                    href={`/hizmetler/${svc.slug}/${subservice.slug}`}
                    className="rounded-[22px] border border-line bg-blush px-6 py-5 transition-colors hover:border-accent"
                  >
                    <h3 className="mb-2 text-[18px] leading-[1.35] text-ink">
                      {subservice.name}
                    </h3>
                    <p className="text-[14px] leading-[1.7] text-muted2">{subservice.desc}</p>
                    <p className="mt-4 text-[14px] text-accent">Detaylı bilgi →</p>
                  </Link>
                ) : (
                  <article className="rounded-[22px] border border-line bg-blush px-6 py-5">
                    <h3 className="mb-2 text-[18px] leading-[1.35] text-ink">
                      {subservice.name}
                    </h3>
                    <p className="text-[14px] leading-[1.7] text-muted2">{subservice.desc}</p>
                  </article>
                )}
                {subservice.gallery && subservice.gallery.length > 0 && (
                  <WorkLightbox
                    images={subservice.gallery.slice(0, 3)}
                    altBase={subservice.name}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* work gallery — owner drops photos into ServiceFull.gallery; hidden when empty */}
      {shots.length > 0 && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
        <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">Çalışmalarımızdan</h2>
        <p className="mb-7 max-w-[520px] text-[15px] leading-[1.6] text-muted">
          {name} uygulamalarımızdan örnek görüntüler.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
          {shots.map((src, i) => {
            const label = workLabel(src);
            // Number repeated labels ("sonrası 1/2/3") so each alt stays unique.
            const sameLabel = label ? shots.filter((s) => workLabel(s) === label) : [];
            const suffix =
              sameLabel.length > 1 ? ` ${sameLabel.indexOf(src) + 1}` : "";
            return (
              <div
                key={i}
                className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-line bg-white"
              >
                <ImageSlot
                  src={src}
                  placeholder={`${name} · görsel ${i + 1}`}
                  alt={
                    label
                      ? `${name} ${label.toLocaleLowerCase("tr")}${suffix} — Stria Studio Ankara`
                      : `${name} çalışma örneği ${i + 1} — Stria Studio Ankara`
                  }
                  sizes="(max-width: 768px) 50vw, 280px"
                />
                {label && (
                  <span className="absolute left-3 top-3 rounded-[14px] bg-cream/90 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-ink backdrop-blur">
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        </section>
      )}

      <ServiceReviews
        reviews={svc.reviews}
        ratingAvg={svc.rating_avg}
        ratingCount={svc.rating_count}
      />

      {/* FAQ */}
      <Faq title="Sıkça Sorulan Sorular" items={svc.faq_tr} />

      {guides.length > 0 && (
        <section className="mx-auto max-w-[820px] px-[clamp(18px,5vw,56px)] pb-[clamp(32px,5vw,64px)]">
          <h2 className="mb-5 text-[clamp(20px,2.2vw,28px)]">{name} rehberleri</h2>
          <ul className="flex flex-col gap-2">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/blog/${g.slug}`}
                  className="inline-flex items-start gap-2 text-[15px] leading-[1.6] text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                >
                  <span className="text-accent">→</span>
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide && (
        <section className="mx-auto max-w-[820px] px-[clamp(18px,5vw,56px)] pb-[clamp(32px,5vw,64px)]">
          <p className="text-center text-[14px] leading-[1.7] text-muted">
            Bu hizmet hakkında soru-cevap, fiyat ve iyileşme rehberi için özel sitemiz:{" "}
            <a
              href={guide.href}
              target="_blank"
              rel="noopener"
              className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              {guide.label}
            </a>
            .
          </p>
        </section>
      )}

      {/* Konum — yerel arama ve "Ankara'da nerede" sorguları için sayfa içinde NAP. */}
      {!isPlaceholder(settings.address) && settings.address && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pb-[clamp(16px,3vw,32px)]">
          <div className="rounded-[24px] bg-blush p-[clamp(20px,3vw,32px)]">
            <h2 className="mb-3 text-[clamp(20px,2.2vw,26px)]">{name} Ankara&apos;da nerede yapılır?</h2>
            <p className="mb-2 max-w-[760px] text-[15px] leading-[1.7] text-muted2">
              {name}, Stria Studio&apos;da uygulanır: {settings.address}. Randevuyla çalışıyoruz.
            </p>
            {settings.hours?.length > 0 && (
              <p className="mb-4 text-[15px] leading-[1.7] text-muted2">
                Çalışma saatleri: {formatHours(settings.hours, "tr")}
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {settings.google_maps_url && (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener"
                  className="text-accent underline underline-offset-4"
                >
                  Google Haritalar&apos;da aç
                </a>
              )}
              <Link href="/iletisim" className="text-accent underline underline-offset-4">
                Yol tarifi ve iletişim
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
          <h2 className="mb-6 text-[clamp(20px,2.2vw,28px)]">İlgili hizmetler</h2>
          <div className="flex flex-wrap gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/hizmetler/${r.slug}`}
                className="inline-flex items-center gap-2 rounded-[24px] border border-line bg-white px-5 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {r.name}
                <span className="text-accent">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
