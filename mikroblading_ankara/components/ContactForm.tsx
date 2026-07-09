"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "ok" | "err";

const field =
  "w-full rounded-[14px] border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition focus:border-accent focus:bg-white";
const label = "mb-[6px] block text-[11px] uppercase tracking-[0.12em] text-accent";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch(`${site.apiUrl}/api/microsites/${site.slug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email") || null,
          service: "Mikroblading",
          preferred_date: fd.get("preferred_date") || null,
          message: fd.get("message") || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="rounded-[28px] border border-line bg-white p-[clamp(24px,3vw,40px)]">
      <h3 className="mb-5 text-[22px]">Randevu / Bilgi Formu</h3>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={label} htmlFor="cf-name">Ad Soyad</label>
          <input id="cf-name" name="name" required maxLength={120} className={field} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="cf-phone">Telefon</label>
            <input id="cf-phone" name="phone" type="tel" required maxLength={40} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="cf-email">
              E-posta <span className="lowercase tracking-normal text-muted">(opsiyonel)</span>
            </label>
            <input id="cf-email" name="email" type="email" maxLength={160} className={field} />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="cf-date">Tercih ettiğiniz tarih</label>
          <input id="cf-date" name="preferred_date" type="date" className={field} />
        </div>

        <div>
          <label className={label} htmlFor="cf-message">Mesajınız</label>
          <textarea id="cf-message" name="message" rows={3} maxLength={2000} className={`${field} resize-y`} />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 inline-flex items-center justify-center rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream transition hover:bg-accent-dark disabled:opacity-60"
        >
          {status === "sending" ? "Gönderiliyor…" : "Randevu Talebi Gönder"}
        </button>

        {status === "ok" && (
          <p className="text-sm text-accent-dark" role="status">
            Talebiniz alındı. En kısa sürede sizi arayacağız.
          </p>
        )}
        {status === "err" && (
          <p className="text-sm text-accent-dark" role="alert">
            Bir hata oluştu. Lütfen WhatsApp'tan ulaşın.
          </p>
        )}
      </form>
    </div>
  );
}
