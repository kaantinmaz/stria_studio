"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/Icons";

const LINKS = [
  { href: "/mikroblading-fiyatlari", label: "Fiyatlar" },
  { href: "/mikroblading-nasil-yapilir", label: "Nasıl Yapılır" },
  { href: "/galeri", label: "Galeri" },
  { href: "/blog", label: "Blog" },
  { href: "/sss", label: "S.S.S." },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function Nav({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4">
        <Link href="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="text-[19px] font-medium tracking-tight text-ink">
            Mikroblading<span className="text-accent"> Ankara</span>
          </span>
          <span className="mt-[3px] text-[10px] uppercase tracking-[0.22em] text-muted">
            Stria Studio · Çankaya
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Ana menü">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] text-muted2 transition hover:text-accent-dark"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] text-cream transition hover:bg-accent-dark"
          >
            <WhatsAppIcon className="h-4 w-4" /> Randevu
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
          aria-label="Menüyü aç/kapat"
          aria-expanded={open}
        >
          <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-cream px-5 pb-5 pt-2 lg:hidden" aria-label="Mobil menü">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/60 py-3 text-[15px] text-ink"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-cream"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp'tan Randevu
          </a>
        </nav>
      )}
    </header>
  );
}
