import type { Metadata } from "next";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { about } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Hakkımızda — Ankara'da Güvenilir Mikroblading | Stria Studio",
  description:
    "Stria Studio, Ankara Çankaya'da sertifikalı uygulayıcılarla mikroblading ve kaş tasarımı yapar. Hijyen, deneyim ve doğal sonuç odaklı yaklaşımımız.",
  path: "/hakkimizda",
});

export default async function AboutPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <Breadcrumbs items={[{ name: "Hakkımızda", path: "/hakkimizda" }]} />
      <Section narrow eyebrow="Hakkımızda" heading={about.heading}>
        <div className="mt-6 space-y-4">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-[17px] leading-relaxed text-muted2">{p}</p>
          ))}
        </div>

        <h2 className="mt-12 text-[22px] text-ink">Neden bizi tercih etmelisiniz?</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {about.credentials.map((c) => (
            <li key={c} className="flex items-start gap-3 rounded-[16px] border border-line bg-white px-4 py-4 text-[15px] text-muted2">
              <CheckIcon className="mt-[2px] h-5 w-5 shrink-0 text-accent" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Section>
      <CTABanner settings={s} />
    </>
  );
}
