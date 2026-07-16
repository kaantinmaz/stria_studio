"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLang } from "@/components/LanguageProvider";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";
import { site } from "@/lib/site";

const DONE_KEY = "stria-engage-done";
const VISIBLE_DELAY_MS = 30_000;
const MAX_FOLLOW_UPS = 3;
const URL_RE = /(https?:\/\/[^\s<>()]+[^\s<>().,!?;:'"])/g;

const CONCERNS = [
  { id: "pain", tr: "Acır mı?", en: "Will it hurt?" },
  { id: "natural", tr: "Doğal durur mu?", en: "Will it look natural?" },
  {
    id: "results",
    tr: "Kalıcılığı ve sonuç",
    en: "Longevity and results",
  },
  { id: "price", tr: "Fiyat", en: "Price" },
  {
    id: "hygiene",
    tr: "Hijyen ve güven",
    en: "Hygiene and safety",
  },
  {
    id: "healing",
    tr: "İyileşme süreci",
    en: "Healing process",
  },
] as const;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  showWhatsAppLink?: boolean;
};

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener"
            className="break-all underline underline-offset-2"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function EngageSurvey({ whatsappUrl }: { whatsappUrl: string }) {
  const { lang } = useLang();
  const services = useServices();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [noConcerns, setNoConcerns] = useState(false);
  const [extraConcern, setExtraConcern] = useState("");
  const [apiMessages, setApiMessages] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [followUps, setFollowUps] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasShownRef = useRef(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const markDone = useCallback(() => {
    try {
      sessionStorage.setItem(DONE_KEY, "1");
    } catch {
      // The survey still stays dismissed when storage is unavailable.
    }
  }, []);

  const close = useCallback(() => {
    markDone();
    setVisible(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setMounted(false), 500);
  }, [markDone]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DONE_KEY)) return;
    } catch {
      // Continue with the in-memory once-per-mount guard.
    }

    let elapsed = 0;
    let visibleSince: number | null = null;
    let interval: number | undefined;

    const stopTimer = () => {
      if (interval !== undefined) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };

    const checkElapsed = () => {
      if (hasShownRef.current || visibleSince === null) return;

      if (elapsed + performance.now() - visibleSince >= VISIBLE_DELAY_MS) {
        hasShownRef.current = true;
        stopTimer();
        markDone();
        setMounted(true);
      }
    };

    const onVisibilityChange = () => {
      const now = performance.now();

      if (document.visibilityState === "visible") {
        visibleSince = now;
      } else if (visibleSince !== null) {
        elapsed += now - visibleSince;
        visibleSince = null;
      }

      checkElapsed();
    };

    if (document.visibilityState === "visible") {
      visibleSince = performance.now();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    interval = window.setInterval(checkElapsed, 250);

    return stopTimer;
  }, [markDone]);

  useEffect(() => {
    if (!mounted) return;

    let secondFrame: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setVisible(true));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [close, mounted]);

  useEffect(() => {
    if (step !== 3) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [displayMessages, isSending, step]);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const serviceNames = selectedServices
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service) => service !== undefined)
    .map((service) => pickLang(service.name_tr, service.name_en, lang));

  const concernNames = selectedConcerns
    .map((id) => CONCERNS.find((concern) => concern.id === id))
    .filter((concern) => concern !== undefined)
    .map((concern) => (lang === "tr" ? concern.tr : concern.en));

  const toggleService = (slug: string) => {
    setSelectedServices((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  const toggleConcern = (id: string) => {
    setNoConcerns(false);
    setSelectedConcerns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const chooseNoConcerns = () => {
    setNoConcerns(true);
    setSelectedConcerns([]);
    setExtraConcern("");
  };

  const requestAssistant = async (messages: ChatMessage[]) => {
    const requestMessages = messages.slice(-12);
    setIsSending(true);

    try {
      const response = await fetch(`${site.apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: null,
          intent: "engage",
          messages: requestMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) throw new Error("assistant_unavailable");

      const result = (await response.json()) as {
        data?: { reply?: unknown };
      };
      const assistantReply = result.data?.reply;
      if (typeof assistantReply !== "string" || !assistantReply.trim()) {
        throw new Error("assistant_unavailable");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: assistantReply.trim().slice(0, 1000),
      };
      setApiMessages((current) => [...current, assistantMessage].slice(-12));
      setDisplayMessages((current) => [...current, assistantMessage]);
    } catch {
      setDisplayMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            lang === "tr"
              ? "Şu an yanıt veremiyorum. WhatsApp’tan yazabilirsiniz 👉"
              : "I can’t reply right now. You can message us on WhatsApp 👉",
          showWhatsAppLink: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const startConversation = () => {
    const concernText = concernNames.join(", ");
    const note = extraConcern.trim();
    let seed: string;

    if (lang === "tr") {
      seed = `Şu hizmetlerle ilgileniyorum: ${serviceNames.join(", ")}. `;
      seed +=
        noConcerns || (!concernText && !note)
          ? "Belirgin bir endişem yok."
          : `Endişelerim: ${concernText || "belirtilmedi"}.`;
      if (note) seed += ` Ek not: ${note}`;
    } else {
      seed = `I’m interested in these services: ${serviceNames.join(", ")}. `;
      seed +=
        noConcerns || (!concernText && !note)
          ? "I don’t have a specific concern."
          : `My concerns: ${concernText || "not specified"}.`;
      if (note) seed += ` Additional note: ${note}`;
    }

    const seedMessage: ChatMessage = { role: "user", content: seed };
    const summary: ChatMessage = {
      role: "user",
      content:
        lang === "tr"
          ? `Seçtiğim hizmetler: ${serviceNames.join(", ")}${
              noConcerns || (!concernText && !note)
                ? " · Belirgin bir endişem yok"
                : ` · Merak ettiklerim: ${[concernText, note]
                    .filter(Boolean)
                    .join(", ")}`
            }`
          : `Selected services: ${serviceNames.join(", ")}${
              noConcerns || (!concernText && !note)
                ? " · No specific concerns"
                : ` · On my mind: ${[concernText, note]
                    .filter(Boolean)
                    .join(", ")}`
            }`,
    };

    setApiMessages([seedMessage]);
    setDisplayMessages([summary]);
    setStep(3);
    void requestAssistant([seedMessage]);
  };

  const sendReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = reply.trim();
    if (!content || isSending || followUps >= MAX_FOLLOW_UPS) return;

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...apiMessages, userMessage].slice(-12);
    const nextFollowUps = followUps + 1;

    setApiMessages(nextMessages);
    setDisplayMessages((current) => [...current, userMessage]);
    setReply("");
    setFollowUps(nextFollowUps);
    if (nextFollowUps >= MAX_FOLLOW_UPS) markDone();
    void requestAssistant(nextMessages);
  };

  if (!mounted) return null;

  return (
    <section
      role="dialog"
      aria-label={lang === "tr" ? "Hizmet anketi" : "Service survey"}
      className={`fixed inset-x-0 bottom-0 z-[65] flex max-h-[70vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-b-0 border-line bg-cream shadow-[0_28px_80px_-24px_rgba(66,48,46,0.55)] transition-transform duration-500 motion-reduce:transition-none sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-1/2 sm:max-h-[max(340px,calc(100vh-340px))] sm:w-[min(340px,calc(100vw-24px))] sm:-translate-y-1/2 sm:rounded-l-[28px] sm:rounded-r-none sm:border-b sm:border-r-0 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <header className="flex flex-none items-center justify-between border-b border-line bg-white/70 px-5 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
            {lang === "tr" ? "Sana özel" : "Personalized"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {lang === "tr" ? `Adım ${step} / 3` : `Step ${step} / 3`}
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          onClick={close}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line2 bg-white text-ink transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ✕
        </button>
      </header>

      {step === 1 && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5">
          <h2 className="pr-4 text-[22px] leading-tight text-ink">
            {lang === "tr"
              ? "Hangi hizmetle ilgileniyorsun?"
              : "Which service are you interested in?"}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {services.map((service) => {
              const selected = selectedServices.includes(service.slug);
              return (
                <button
                  key={service.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleService(service.slug)}
                  className={`cursor-pointer rounded-full border px-3.5 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    selected
                      ? "border-ink bg-ink text-cream"
                      : "border-line2 bg-white text-ink hover:border-accent hover:bg-blush"
                  }`}
                >
                  {pickLang(service.name_tr, service.name_en, lang)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={selectedServices.length === 0}
            onClick={() => setStep(2)}
            className="mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            {lang === "tr" ? "Devam et" : "Continue"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5">
          <h2 className="pr-4 text-[22px] leading-tight text-ink">
            {lang === "tr"
              ? "Aklına takılan bir endişe var mı?"
              : "Any concerns on your mind?"}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {CONCERNS.map((concern) => {
              const selected = selectedConcerns.includes(concern.id);
              return (
                <button
                  key={concern.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleConcern(concern.id)}
                  className={`cursor-pointer rounded-full border px-3.5 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    selected
                      ? "border-ink bg-ink text-cream"
                      : "border-line2 bg-white text-ink hover:border-accent hover:bg-blush"
                  }`}
                >
                  {lang === "tr" ? concern.tr : concern.en}
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={noConcerns}
              onClick={chooseNoConcerns}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                noConcerns
                  ? "border-ink bg-ink text-cream"
                  : "border-line2 bg-white text-ink hover:border-accent hover:bg-blush"
              }`}
            >
              {lang === "tr" ? "Endişem yok" : "No concerns"}
            </button>
          </div>
          <label className="mt-5 block text-xs text-muted2">
            {lang === "tr" ? "Eklemek istediğin bir şey" : "Anything you’d like to add"}
            <input
              type="text"
              value={extraConcern}
              onChange={(event) => {
                setExtraConcern(event.target.value);
                if (event.target.value) setNoConcerns(false);
              }}
              maxLength={200}
              placeholder={lang === "tr" ? "İsteğe bağlı" : "Optional"}
              className="mt-2 min-h-11 w-full rounded-[18px] border border-line2 bg-white px-4 py-2.5 text-base text-ink outline-none placeholder:text-muted/70 focus:border-accent sm:text-sm"
            />
          </label>
          <button
            type="button"
            onClick={startConversation}
            className="mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {lang === "tr" ? "Devam et" : "Continue"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            aria-live="polite"
            aria-busy={isSending}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5"
          >
            {displayMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-[20px] px-4 py-3 text-[13px] leading-[1.5] ${
                    message.role === "user"
                      ? "rounded-br-md bg-ink text-cream"
                      : "rounded-bl-md border border-line bg-white text-ink"
                  }`}
                >
                  <Linkified text={message.content} />
                  {message.showWhatsAppLink && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={markDone}
                      className="mt-2 block break-all font-medium text-accent underline decoration-accent/40 underline-offset-2"
                    >
                      {lang === "tr" ? "WhatsApp’tan yaz" : "Chat on WhatsApp"}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div
                className="flex justify-start"
                aria-label={lang === "tr" ? "Asistan yazıyor" : "Assistant is typing"}
              >
                <div className="flex items-center gap-1 rounded-[20px] rounded-bl-md border border-line bg-white px-4 py-4">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose motion-reduce:animate-none"
                      style={{ animationDelay: `${dot * 140}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {followUps < MAX_FOLLOW_UPS ? (
            <form onSubmit={sendReply} className="flex-none border-t border-line bg-white/70 p-3">
              <label htmlFor="stria-engage-reply" className="sr-only">
                {lang === "tr" ? "Yanıtın" : "Your reply"}
              </label>
              <div className="flex items-center gap-2 rounded-[20px] border border-line2 bg-white p-1.5 pl-4 focus-within:border-accent">
                <input
                  id="stria-engage-reply"
                  type="text"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={1000}
                  readOnly={isSending}
                  placeholder={lang === "tr" ? "Yanıtını yaz..." : "Type your reply..."}
                  className="min-h-9 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted/70 sm:text-[13px]"
                />
                <button
                  type="submit"
                  aria-label={lang === "tr" ? "Yanıtı gönder" : "Send reply"}
                  disabled={isSending || !reply.trim()}
                  className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full bg-rose text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="flex-none border-t border-line bg-white/70 px-4 py-3 text-center text-xs text-muted2">
              {lang === "tr"
                ? "Devam etmek için bize WhatsApp’tan yazabilirsin."
                : "Continue the conversation with us on WhatsApp."}
            </p>
          )}

          <footer className="flex flex-none items-center gap-3 border-t border-line bg-cream px-4 py-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={markDone}
              className="flex min-h-10 flex-1 items-center justify-center rounded-full bg-rose px-4 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {lang === "tr" ? "WhatsApp’tan yaz" : "Chat on WhatsApp"}
            </a>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer px-2 py-2 text-xs text-muted2 underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {lang === "tr" ? "Kapat" : "Close"}
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}
