"use client";

import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { site } from "@/lib/site";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";

type Status = "idle" | "sending" | "ok" | "err";

// text-base (16px) so iOS Safari doesn't auto-zoom the viewport on input focus.
const field =
  "w-full rounded-[14px] border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition focus:border-accent focus:bg-white";
const label = "mb-[6px] block text-[11px] uppercase tracking-[0.12em] text-accent";

export function ContactForm() {
  const { lang, t } = useLang();
  const services = useServices();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch(`${site.apiUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email") || null,
          service: fd.get("service") || null,
          preferred_date: fd.get("preferred_date") || null,
          message: fd.get("message") || null,
          locale: lang,
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
    <div className="reveal rounded-[28px] border border-line bg-white p-[clamp(24px,3vw,40px)]">
      <h3 className="mb-5 text-[22px]">{t.formTitle}</h3>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={label} htmlFor="cf-name">
            {t.formName}
          </label>
          <input id="cf-name" name="name" required maxLength={120} className={field} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="cf-phone">
              {t.formPhone}
            </label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              required
              maxLength={40}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="cf-email">
              {t.formEmail}{" "}
              <span className="lowercase tracking-normal text-muted">
                {t.formEmailOpt}
              </span>
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              maxLength={160}
              className={field}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="cf-service">
              {t.formService}
            </label>
            <select id="cf-service" name="service" defaultValue="" className={field}>
              <option value="" disabled>
                {t.formServicePick}
              </option>
              {services.map((s) => {
                const name = pickLang(s.name_tr, s.name_en, lang);
                return (
                  <option key={s.slug} value={name}>
                    {name}
                  </option>
                );
              })}
              <option value={t.formServiceOther}>{t.formServiceOther}</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="cf-date">
              {t.formDate}
            </label>
            <input id="cf-date" name="preferred_date" type="date" className={field} />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="cf-message">
            {t.formMessage}
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={3}
            maxLength={2000}
            className={`${field} resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 inline-flex items-center justify-center rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream transition hover:bg-accent-dark disabled:opacity-60"
        >
          {status === "sending" ? t.formSending : t.formSubmit}
        </button>

        {status === "ok" && (
          <p className="text-sm text-accent" role="status">
            {t.formOk}
          </p>
        )}
        {status === "err" && (
          <p className="text-sm text-accent-dark" role="alert">
            {t.formErr}
          </p>
        )}
      </form>
    </div>
  );
}
