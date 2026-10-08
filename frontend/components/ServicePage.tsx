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
import { phoneHref, type ServiceFull, type ServiceListItem } from "@/lib/content";
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
}: {
  svc: ServiceFull;
  services: ServiceListItem[];
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
