"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";


const URL_RE = /(https?:\/\/[^\s<>()]+[^\s<>().,!?;:'"])/g;

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener" className="underline underline-offset-2 break-all">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

const STORAGE_KEY = "stria-chat";
const COMPLETIONS = [
  "merhaba",
  "hizmetler",
  "hizmetleriniz",
  "randevu",
  "randevu almak istiyorum",
  "fiyat",
  "fiyatlarınız",
  "adres",
  "adresiniz",
  "telefon",
  "çalışma saatleri",
  "iyileşme",
  "iyileşme süreci",
  "bakım",
  "kalıcılık",
  "kalıcı",
  "ne kadar",
  "nerede",
  "nasıl yapılır",
  "ağrı",
  "acır mı",
  "whatsapp",
  "iletişim",
  "teşekkürler",
  "öncesi",
  "sonrası",
  "uygun muyum",
  "hamilelik",
  "rötuş",
  "mikroblading",
  "microblading",
  "kıl tekniği",
  "kaş",
  "kaşlarım",
  "pigment",
  "seyrek kaş",
  "kaş pudralama",
] as const;
const GREETING =
  "Merhaba! Mikroblading Ankara hakkında sorularınızı yanıtlayabilirim. Randevu ve fiyat için sizi WhatsApp'a yönlendirebilirim.";
const ERROR_MESSAGE = "Şu an yanıt veremiyorum. WhatsApp'tan yazabilirsiniz 👉";

type Message = {
  role: "user" | "assistant";
  content: string;
  kind?: "error";
};

function initialMessages(): Message[] {
  return [{ role: "assistant", content: GREETING }];
}

function isStoredMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<Message>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length > 0 &&
    message.content.length <= 1000 &&
    (message.kind === undefined || message.kind === "error")
  );
}

export function ChatWidget({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastWord = input.match(/(?:^|\s)(\S*)$/)?.[1] ?? "";
  const normalizedLastWord = lastWord.toLocaleLowerCase("tr");
  const suggestions =
    normalizedLastWord.length >= 2
      ? COMPLETIONS.filter((completion) =>
          completion.toLocaleLowerCase("tr").startsWith(normalizedLastWord)
        ).slice(0, 3)
      : [];


  // Compact panel expands to fullscreen when the input is focused on mobile;
  // track the visual viewport so the keyboard never pushes the header off-screen.
  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!expanded) {
      setVvHeight(null);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVvHeight(Math.round(vv.height));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [expanded]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isStoredMessage)) {
            setMessages(parsed);
          }
        }
      } catch {
        // Storage may be unavailable or contain invalid data; start a fresh chat.
      }
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Keep chat usable when storage is unavailable.
    }
  }, [hydrated, messages]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (window.innerWidth >= 640) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [loading, messages, open]);

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  function applySuggestion(suggestion: string) {
    const prefix = input.slice(0, input.length - lastWord.length);
    setInput(`${prefix}${suggestion} `);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${site.apiUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          site: "mikroblading-ankara",
          messages: nextMessages.slice(-12).map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload: unknown = await response.json();
      const reply =
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        payload.data &&
        typeof payload.data === "object" &&
        "reply" in payload.data &&
        typeof payload.data.reply === "string"
          ? payload.data.reply.trim()
          : "";

      if (!reply) throw new Error("Empty assistant reply");

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply.slice(0, 1000) },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: ERROR_MESSAGE, kind: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Mikroblading Ankara Asistan"
          className={`flex flex-col overflow-hidden border border-line bg-cream shadow-[0_20px_60px_rgba(66,48,46,0.22)] ${
            expanded
              ? "fixed inset-x-0 top-0 z-[55] w-full"
              : "fixed bottom-44 right-3 z-[55] h-[min(560px,70vh)] max-h-[70vh] w-[calc(100vw-1.5rem)] rounded-[24px]"
          } sm:inset-auto sm:bottom-44 sm:right-5 sm:h-[min(560px,70vh)] sm:max-h-[70vh] sm:w-[360px] sm:rounded-[24px]`}
          style={expanded ? { height: vvHeight ? `${vvHeight}px` : "100dvh" } : undefined}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-blush px-5 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent-dark">
                Online Asistan
              </p>
              <h2 className="mt-0.5 flex flex-wrap items-center gap-2 text-[17px] leading-tight text-ink">
                <span>Mikroblading Ankara Asistan</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-600/20 bg-green-50 px-2 py-0.5 text-[10px] font-medium leading-none text-green-700">
                  <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Canlı
                </span>
              </h2>
            </div>
            <button
              type="button"
              aria-label="Sohbeti kapat"
              onClick={close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line2 bg-cream text-2xl leading-none text-ink transition hover:bg-white hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-dark"
            >
              ×
            </button>
          </header>

          <div
            ref={listRef}
            aria-live="polite"
            aria-busy={loading}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-5"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-ink text-cream"
                      : "rounded-bl-md border border-line bg-white text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap"><Linkified text={message.content} /></p>
                  {message.kind === "error" && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block break-all font-medium text-accent-dark underline underline-offset-2"
                    >
                      {whatsapp}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start" role="status" aria-label="Asistan yazıyor">
                <div className="flex h-11 items-center gap-1 rounded-[18px] rounded-bl-md border border-line bg-white px-4 shadow-sm">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                      style={{ animationDelay: `${dot * 140}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-line bg-white p-3">
            {suggestions.length > 0 && (
              <div className="mb-2 flex gap-2 overflow-x-auto" aria-label="Kelime önerileri">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applySuggestion(suggestion)}
                    className="shrink-0 rounded-full border border-line2 bg-cream px-3 py-1.5 text-xs text-ink transition hover:border-accent hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-dark"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <label htmlFor="chat-message" className="sr-only">
              Mesajınız
            </label>
            <div className="flex items-end gap-2 rounded-[18px] border border-line2 bg-cream p-2 focus-within:border-accent">
              <textarea
                ref={inputRef}
                id="chat-message"
                onFocus={() => {
                  if (window.innerWidth < 640) setExpanded(true);
                }}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Tab" && !event.shiftKey && suggestions.length > 0) {
                    event.preventDefault();
                    applySuggestion(suggestions[0]);
                    return;
                  }
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                maxLength={1000}
                rows={1}
                disabled={loading}
                placeholder="Sorunuzu yazın…"
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base sm:text-sm leading-6 text-ink outline-none placeholder:text-muted disabled:opacity-60"
              />
              <button
                type="button"
                aria-label="Mesajı gönder"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-dark"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 14-3-6-7-1Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m12 13 7-8" />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-center text-[11px] text-muted">
              Enter ile gönder · Shift+Enter ile yeni satır
            </p>
          </div>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        aria-label={open ? "Sohbet penceresini kapat" : "Mikroblading Ankara Asistan'ı aç"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-24 right-5 z-[49] flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-ink text-cream shadow-[0_10px_28px_rgba(66,48,46,0.28)] transition hover:-translate-y-0.5 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-dark sm:right-5"
      >
        {open ? (
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-7 w-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 11.5a7.5 7.5 0 0 1-8 7.48 8.2 8.2 0 0 1-3.1-.8L4 20l1.55-4.25A7.5 7.5 0 1 1 20 11.5Z"
            />
            <path strokeLinecap="round" d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
          </svg>
        )}
      </button>
    </>
  );
}
