"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { useServices } from "@/components/ServicesProvider";
import { pickLang, phoneHref, formatHours } from "@/lib/content";
import { InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";

const heading = "mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-cream";
const link = "text-[13px] leading-none text-[#d6c3bd] transition-colors hover:text-cream";

export function Footer() {
  const { lang, t } = useLang();
  const settings = useSettings();
  const services = useServices();

  const explore = [
    { href: "/hizmetler", label: t.navServices },
    { href: "/galeri", label: t.navGallery },
    { href: "/hakkimizda", label: t.navAbout },
    { href: "/iletisim", label: t.navContact },
    { href: "/blog", label: t.navBlog },
    { href: "/sss", label: t.navFaq },
    { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
    { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
    { href: "/cerez-politikasi", label: "Çerez Politikası" },
    {
      href: "/ankara-kalici-makyaj-yapan-yerler",
      label: lang === "tr" ? "Stüdyo Seçim Rehberi" : "Studio Selection Guide",
    },
  ];

  return (
    <footer className="bg-ink px-[clamp(18px,5vw,56px)] pb-10 pt-[clamp(52px,7vw,88px)] text-[#d6c3bd]">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        {/* brand + social */}
        <div>
          <Image
            src="/logo.png"
            alt="Stria Studio"
            width={772}
            height={371}
            className="mb-4 h-10 w-auto [filter:brightness(0)_invert(1)]"
          />
          <p className="mb-6 max-w-[280px] text-[13px] leading-[1.6]">
            {t.footerTag}
          </p>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#9a857e]">
            {t.footerFollow}
          </div>
          <div className="mt-3 flex gap-3">
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-[#d6c3bd] transition-colors hover:border-cream hover:text-cream"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href={settings.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-[#d6c3bd] transition-colors hover:border-cream hover:text-cream"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>

        {/* services */}
        <div>
          <Link href="/hizmetler" className={`${heading} block hover:text-cream`}>
            {t.navServices}
          </Link>
          <ul className="flex flex-col gap-[14px]">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={s.url} className={link}>
                  {pickLang(s.name_tr, s.name_en, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* explore */}
        <div>
          <div className={heading}>{t.footerExplore}</div>
          <ul className="flex flex-col gap-[14px]">
            {explore.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className={link}>
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <div className={heading}>{t.navContact}</div>
          <ul className="flex flex-col gap-[14px]">
            <li className="flex items-start gap-[10px] text-[13px] leading-[1.5]">
              <PinIcon size={14} className="mt-[2px] flex-none text-rose" />
              {settings.address}
            </li>
            <li>
              <a href={phoneHref(settings.phone)} className={`flex items-center gap-[10px] ${link}`}>
                <PhoneIcon size={14} className="flex-none text-rose" />
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={settings.instagram} target="_blank" rel="noreferrer" className={link}>
                {settings.instagram_handle}
              </a>
            </li>
            <li className="text-[13px] leading-[1.5]">{formatHours(settings.hours, lang)}</li>
          </ul>
          <a
            href={settings.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-[24px] bg-rose px-5 py-[11px] text-[12.5px] text-white"
          >
            <WhatsAppIcon size={15} />
            {t.navCta}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1160px] flex-col gap-2 border-t border-cream/[0.14] pt-6 text-[11px] tracking-[0.06em] text-[#9a857e] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Stria Studio · {t.footerRights}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>Çankaya, Ankara</span>
          <span>
            Web Tasarım:{" "}
            <a
              href="https://crabdigital.com.tr"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-cream"
            >
              Crab Digital
            </a>
          </span>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-[1160px] text-[10.5px] leading-[1.65] text-[#9a857e]">
        Bu web sitesindeki tüm içerikler yalnızca bilgilendirme amaçlıdır; tıbbi
        öneri niteliği taşımaz, teşhis ve tedavi amacıyla kullanılamaz. Bu site
        sağlık hizmeti vermemektedir. Uzmana danışılmadan yapılan uygulamalardan
        doğabilecek sonuçlardan Stria Studio sorumlu tutulamaz. Çerezleri veri
        politikamızdaki amaçlarla sınırlı ve mevzuata uygun şekilde kullanıyoruz.
        Bu siteyi ziyaret eden kişi bu uyarıları okumuş ve kabul etmiş sayılır.
      </p>
    </footer>
  );
}
