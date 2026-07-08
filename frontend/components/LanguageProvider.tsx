"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { UI, type Dict, type Lang } from "@/lib/i18n";

type Ctx = { lang: Lang; t: Dict; toggle: () => void };

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");

  const toggle = useCallback(
    () => setLang((l) => (l === "tr" ? "en" : "tr")),
    [],
  );

  // Keep <html lang> in sync for accessibility.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Scroll-reveal: mirror the design's IntersectionObserver behaviour.
  useEffect(() => {
    // This code only runs from a loaded JS chunk. Marking the doc here (not in
    // CSS/inline) guarantees content stays visible if the chunk never loads.
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    const id = setTimeout(() => {
      document
        .querySelectorAll(".reveal:not(.in)")
        .forEach((el) => io.observe(el));
    }, 60);
    return () => {
      clearTimeout(id);
      io.disconnect();
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: UI[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
