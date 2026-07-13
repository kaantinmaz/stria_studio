import type { Metadata } from "next";
import { getSettings, SETTINGS_FALLBACK, phoneHref, formatHours } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Container, Section } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { StudioMap } from "@/components/StudioMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppIcon, PhoneIcon, InstagramIcon, MapPinIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "İletişim & Randevu — Kaş Tasarımı Ankara | Stria Studio",
  description:
    "Ankara Çankaya'da kaş tasarımı randevusu için bize ulaşın. Telefon, WhatsApp, adres ve çalışma saatleri. Ücretsiz ön görüşme.",
  path: "/iletisim",
});

export default async function ContactPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <Breadcrumbs items={[{ name: "İletişim", path: "/iletisim" }]} />
      <Section as="h1" eyebrow="İletişim" heading="Randevu & iletişim"
        intro="Ücretsiz ön görüşme için formu doldurun ya da WhatsApp'tan yazın. En kısa sürede size dönüş yaparız.">
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <ul className="space-y-4 text-[15px] text-muted2">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-[2px] h-5 w-5 shrink-0 text-accent" />
                <span><strong className="text-ink">Adres</strong><br />{s.street_address}, {s.locality} / {s.region}</span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-[2px] h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="text-ink">Telefon</strong><br />
                  <a href={phoneHref(s.phone)} className="hover:text-accent-dark">{s.phone_local}</a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <WhatsAppIcon className="mt-[2px] h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="text-ink">WhatsApp</strong><br />
                  <a href={s.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-accent-dark">Mesaj gönder</a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <InstagramIcon className="mt-[2px] h-5 w-5 shrink-0 text-accent" />
                <span>
                  <strong className="text-ink">Instagram</strong><br />
                  <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent-dark">{s.instagram_handle}</a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-[2px] h-5 w-5 shrink-0" />
                <span><strong className="text-ink">Çalışma saatleri</strong><br />{formatHours(s.hours)}</span>
              </li>
            </ul>
            <StudioMap settings={s} />
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
