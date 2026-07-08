"use client";

import { useLang } from "@/components/LanguageProvider";
import { Faq } from "@/components/Faq";
import { pickLang, type FaqItem } from "@/lib/content";

export function HomeFaq({ faqs, title }: { faqs: FaqItem[]; title: string }) {
  const { lang } = useLang();
  const items = faqs.map((f) => ({
    q: pickLang(f.q_tr, f.q_en, lang),
    a: pickLang(f.a_tr, f.a_en, lang),
  }));
  if (items.length === 0) return null;
  return <Faq title={title} items={items} />;
}
