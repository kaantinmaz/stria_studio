import Link from "next/link";
import { ImageSlot } from "@/components/ImageSlot";
import { Faq } from "@/components/Faq";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";
import { CallLabel } from "@/components/CallLabel";
import { site } from "@/lib/site";
import { SERVICES, type Service } from "@/lib/i18n";
import { type ServiceSeo } from "@/lib/services";

// Server-rendered TR service page body. Content lands in the HTML for Google + AI.
export function ServicePage({
  svc,
  display,
}: {
  svc: ServiceSeo;
  display: Service;
}) {
  const name = display.name.tr;
  // Work photos — owner fills svc.gallery; until then show 3 fillable placeholders.
  const shots = svc.gallery?.length ? svc.gallery : ["", "", ""];
  const related = svc.related
    .map((slug) => SERVICES.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s));

  return (
    <article>
      {/* header */}
      <header className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-[clamp(28px,4.5vw,64px)] px-[clamp(18px,5vw,56px)] pb-12 pt-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-[22px] bg-pink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-accent">
            {display.tag.tr} · Ankara
          </div>
          <h1 className="mb-5 text-[clamp(32px,4.6vw,58px)] leading-[1.05]">
            {name} <span className="text-accent">Ankara</span>
          </h1>
          <p className="mb-7 max-w-[520px] text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            {svc.intro}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={site.wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[9px] rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream"
            >
              <WhatsAppIcon size={16} />
              WhatsApp'tan Randevu
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-[9px] rounded-[28px] border border-line2 bg-white px-7 py-[15px] text-sm text-ink"
            >
              <PhoneIcon size={15} />
              <CallLabel label="Hemen Ara" />
            </a>
          </div>
        </div>
        <div className="relative h-[min(56vh,460px)] overflow-hidden rounded-[32px] shadow-[0_40px_90px_-50px_rgba(197,124,105,0.7)]">
          <ImageSlot
            src={display.img}
            alt={`${name} — Stria Studio Ankara`}
            placeholder={name}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </header>

      {/* benefits + process */}
      <section className="mx-auto grid max-w-[1160px] grid-cols-1 gap-[clamp(28px,4vw,56px)] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)] md:grid-cols-2">
        <div>
          <h2 className="mb-5 text-[clamp(22px,2.4vw,30px)]">Neden {name}?</h2>
          <ul className="flex flex-col gap-3">
            {svc.benefits.map((b) => (
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
            {svc.process.map((p, i) => (
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
            {svc.aftercare}
          </div>
        </div>
      </section>

      {/* work gallery — owner drops photos into ServiceSeo.gallery */}
      <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
        <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">Çalışmalarımızdan</h2>
        <p className="mb-7 max-w-[520px] text-[15px] leading-[1.6] text-muted">
          {name} uygulamalarımızdan örnek görüntüler.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
          {shots.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-line bg-white"
            >
              <ImageSlot
                src={src}
                placeholder={`${name} · görsel ${i + 1}`}
                alt={`${name} çalışma örneği ${i + 1} — Stria Studio Ankara`}
                sizes="(max-width: 768px) 50vw, 280px"
              />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <Faq title="Sıkça Sorulan Sorular" items={svc.faq} />

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
                {r.name.tr}
                <span className="text-accent">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
