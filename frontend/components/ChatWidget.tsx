"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
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
const WELCOME_MESSAGE =
  "Merhaba! Stria hakkında sorularınızı yanıtlayabilirim. Randevu ve fiyat için sizi WhatsApp'a yönlendirebilirim.";
const ERROR_MESSAGE = "Şu an yanıt veremiyorum. WhatsApp'tan yazabilirsiniz 👉";
const WORD_COMPLETIONS = [
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
  "microblading",
  "kaş pudralama",
  "kalıcı eyeliner",
  "dipliner",
  "dudak renklendirme",
  "kaş laminasyonu",
  "kirpik lifting",
  "kaş tasarımı",
  "kalıcı makyaj",
  "galeri",
];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  showWhatsAppLink?: boolean;
};

function isStoredMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<ChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length > 0 &&
    message.content.length <= 1000 &&
    (message.showWhatsAppLink === undefined ||
      typeof message.showWhatsAppLink === "boolean")
  );
}

function loadStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [{ role: "assistant", content: WELCOME_MESSAGE }];
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [{ role: "assistant", content: WELCOME_MESSAGE }];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [{ role: "assistant", content: WELCOME_MESSAGE }];
    }

    const messages = parsed.filter(isStoredMessage);
    return messages.length
      ? messages
      : [{ role: "assistant", content: WELCOME_MESSAGE }];
  } catch {
    return [{ role: "assistant", content: WELCOME_MESSAGE }];
  }
}

export function ChatWidget({ whatsappUrl }: { whatsappUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastWordMatch = input.match(/\S+$/u);
  const lastWord = lastWordMatch?.[0] ?? "";
  const normalizedLastWord = lastWord.toLocaleLowerCase("tr");
  const completions =
    normalizedLastWord.length >= 2
      ? WORD_COMPLETIONS.filter((completion) =>
          completion.toLocaleLowerCase("tr").startsWith(normalizedLastWord)
        ).slice(0, 3)
      : [];

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Chat remains usable when storage is unavailable or full.
    }
  }, [messages]);
  // Compact panel expands to fullscreen when the input is focused on mobile;
  // track the visual viewport so the keyboard never pushes the header off-screen.
  useEffect(() => {
    if (!isOpen) setExpanded(false);
  }, [isOpen]);

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
    if (!isOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    if (window.innerWidth >= 640) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isOpen, isSending, messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    const requestMessages = nextMessages.slice(-12);

    setMessages(nextMessages);
    setInput("");
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
          messages: requestMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      if (!response.ok) throw new Error("assistant_unavailable");

      const result = (await response.json()) as {
        data?: { reply?: unknown };
      };
      const reply = result.data?.reply;
      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("assistant_unavailable");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply.trim().slice(0, 1000) },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: ERROR_MESSAGE,
          showWhatsAppLink: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const applyCompletion = (completion: string) => {
    if (!lastWordMatch || lastWordMatch.index === undefined) return;

    setInput(`${input.slice(0, lastWordMatch.index)}${completion} `);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab" && completions.length > 0) {
      event.preventDefault();
      applyCompletion(completions[0]);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-[70] sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label="Stria Asistan"
          className={`flex flex-col overflow-hidden border border-line bg-cream shadow-[0_28px_80px_-24px_rgba(66,48,46,0.55)] ${
            expanded
              ? "fixed inset-x-0 top-0 z-[60] w-full"
              : "absolute bottom-[72px] right-0 max-h-[70vh] w-[min(360px,calc(100vw-32px))] rounded-[28px]"
          } sm:absolute sm:inset-auto sm:bottom-[72px] sm:right-0 sm:z-auto sm:h-auto sm:max-h-[70vh] sm:w-[min(360px,calc(100vw-32px))] sm:rounded-[28px]`}
          style={expanded ? { height: vvHeight ? `${vvHeight}px` : "100dvh" } : undefined}
        >
          <header className="flex items-center justify-between border-b border-line bg-white/70 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] text-ink">Stria Asistan</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none"
                  />
                  Canlı
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted">Size nasıl yardımcı olabilirim?</p>
            </div>
            <button
              type="button"
              aria-label="Sohbeti kapat"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line2 bg-white text-ink transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div
            aria-live="polite"
            aria-busy={isSending}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[20px] px-4 py-3 text-[13px] leading-[1.5] ${
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
                      className="mt-2 block break-all font-medium text-accent underline decoration-accent/40 underline-offset-2"
                    >
                      {whatsappUrl}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start" aria-label="Asistan yazıyor">
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

          <form onSubmit={onSubmit} className="border-t border-line bg-white/70 p-3">
            {completions.length > 0 && (
              <div
                aria-label="Kelime önerileri"
                className="mb-2 flex gap-2 overflow-x-auto px-1 pb-0.5"
              >
                {completions.map((completion) => (
                  <button
                    key={completion}
                    type="button"
                    onClick={() => applyCompletion(completion)}
                    className="flex-none cursor-pointer whitespace-nowrap rounded-full border border-line2 bg-white px-3 py-1.5 text-[11px] text-ink transition-colors hover:border-accent hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {completion}
                  </button>
                ))}
              </div>
            )}
            <label htmlFor="stria-chat-input" className="sr-only">
              Mesajınız
            </label>
            <div className="flex items-end gap-2 rounded-[22px] border border-line2 bg-white p-1.5 pl-4 focus-within:border-accent">
              <textarea
                ref={inputRef}
                id="stria-chat-input"
                onFocus={() => {
                  if (window.innerWidth < 640) setExpanded(true);
                }}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onInputKeyDown}
                maxLength={1000}
                rows={1}
                disabled={isSending}
                placeholder="Mesajınızı yazın..."
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent py-2 text-base sm:text-[13px] leading-5 text-ink outline-none placeholder:text-muted/70 disabled:opacity-60"
              />
              <button
                type="submit"
                aria-label="Mesajı gönder"
                disabled={isSending || !input.trim()}
                className="flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full bg-rose text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
              >
                <svg
                  aria-hidden="true"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Stria Asistan'ı kapat" : "Stria Asistan'ı aç"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-ink text-cream shadow-[0_14px_34px_-10px_rgba(66,48,46,0.65)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isOpen ? (
          <svg
            aria-hidden="true"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" />
          </svg>
        )}
      </button>
    </div>
  );
}
