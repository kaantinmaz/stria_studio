"use client";

import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Faq } from "@/components/Faq";
import { WorkLightbox } from "@/components/WorkLightbox";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";
import { CallLabel } from "@/components/CallLabel";
import { useSettings } from "@/components/SettingsProvider";
import { phoneHref, type ServiceFull, type SubService } from "@/lib/content";

export function SubServicePage({ svc, sub }: { svc: ServiceFull; sub: SubService }) {
  const settings = useSettings();
  const introParagraphs = sub.intro?.split("\n\n").filter(Boolean);
  const intro = introParagraphs?.length ? introParagraphs : [sub.desc];
  const siblings = (svc.subservices_tr ?? []).filter(
    (item): item is SubService & { slug: string } =>
      Boolean(item.slug && item.slug !== sub.slug),
  );
  const hasBenefits = Boolean(sub.benefits?.length);

  return (
    <article>
      <header className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-[clamp(28px,4.5vw,64px)] px-[clamp(18px,5vw,56px)] pb-12 pt-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-[22px] bg-pink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-accent">
            {svc.tag_tr} · Ankara
          </div>
          <h1 className="mb-5 text-[clamp(32px,4.6vw,58px)] leading-[1.05]">
            {sub.name} <span className="text-accent">Ankara</span>
          </h1>
          <div className="mb-7 max-w-[520px] space-y-4 text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            {intro.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={settings.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[9px] rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream"
            >
              <WhatsAppIcon size={16} />
              WhatsApp&apos;tan Randevu
            </a>
            <a
              href={phoneHref(settings.phone)}
              className="inline-flex items-center gap-[9px] rounded-[28px] border border-line2 bg-white px-7 py-[15px] text-sm text-ink"
            >
              <PhoneIcon size={15} />
              <CallLabel label="Hemen Ara" />
            </a>
          </div>
        </div>
        <div className="relative h-[min(56vh,460px)] overflow-hidden rounded-[32px] shadow-[0_40px_90px_-50px_rgba(229,135,146,0.7)]">
          <HeroCarousel
            images={svc.hero_images?.length ? svc.hero_images : (svc.image ? [svc.image] : [])}
            alt={`${sub.name} — Stria Studio Ankara`}
          />
        </div>
      </header>

      <section
        className={`mx-auto grid max-w-[1160px] grid-cols-1 gap-[clamp(28px,4vw,56px)] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)] ${hasBenefits ? "md:grid-cols-2" : ""}`}
      >
        {hasBenefits && (
          <div>
            <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">Neden {sub.name}?</h2>
            <ul className="flex flex-col gap-3">
              {sub.benefits?.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2"
                >
                  <span className="mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-pink text-[11px] text-accent">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">Nasıl uygulanır?</h2>
          <ol className="flex flex-col gap-3">
            {svc.process_tr.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-[15px] leading-[1.6] text-muted2"
              >
                <span className="mt-[1px] flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-ink text-[11px] text-cream">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-[18px] bg-blush px-5 py-4 text-[14px] leading-[1.6] text-muted2">
            <span className="font-medium text-ink">Bakım: </span>
            {svc.aftercare_tr}
          </div>
        </div>
      </section>

      {sub.gallery && sub.gallery.length > 0 && (
        <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
          <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">Çalışmalarımızdan</h2>
          <p className="mb-7 max-w-[520px] text-[15px] leading-[1.6] text-muted">
            {sub.name} uygulamamızdan kareler.
          </p>
          <WorkLightbox images={sub.gallery} altBase={sub.name} />
        </section>
      )}

      {sub.faq && sub.faq.length > 0 && (
        <Faq title="Sıkça Sorulan Sorular" items={sub.faq} />
      )}

      <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
        <h2 className="mb-6 text-[clamp(20px,2.2vw,28px)]">
          Diğer {svc.name_tr} Uygulamaları
        </h2>
        <div className="flex flex-wrap gap-3">
          {siblings.map((sibling) => (
            <Link
              key={sibling.slug}
              href={`/hizmetler/${svc.slug}/${sibling.slug}`}
              className="inline-flex items-center gap-2 rounded-[24px] border border-line bg-white px-5 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {sibling.name}
              <span className="text-accent">→</span>
            </Link>
          ))}
          <Link
            href={`/hizmetler/${svc.slug}`}
            className="inline-flex items-center gap-2 rounded-[24px] border border-line bg-white px-5 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {svc.name_tr} sayfasına dön
            <span className="text-accent">→</span>
          </Link>
        </div>
      </section>
    </article>
  );
}
