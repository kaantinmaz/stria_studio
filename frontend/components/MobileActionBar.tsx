"use client";

import { useSettings } from "@/components/SettingsProvider";
import { useLang } from "@/components/LanguageProvider";
import { phoneHref } from "@/lib/content";
import { PhoneIcon, WhatsAppIcon } from "@/components/Icons";

// Fixed bottom action bar, mobile only (below md). Replaces the stacked floating
// FABs with two equal, thumb-friendly primary actions. Links are plain anchors so
// the delegated click tracking in Analytics still fires (tel: + wa.me/whatsapp).
export function MobileActionBar() {
  const settings = useSettings();
  const { t } = useLang();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[55] flex items-stretch gap-2 border-t border-line2 bg-cream/90 px-3 pt-2 backdrop-blur-[14px] md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
    >
      <a
        href={phoneHref(settings.phone)}
        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[22px] border border-line2 bg-white text-[14px] font-medium text-ink"
      >
        <PhoneIcon size={15} />
        {t.callLabel}
      </a>
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 flex-[1.4] items-center justify-center gap-2 rounded-[22px] bg-ink text-[14px] font-medium text-cream"
      >
        <WhatsAppIcon size={17} />
        {t.waBookCta}
      </a>
    </div>
  );
}
