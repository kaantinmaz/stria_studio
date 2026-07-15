"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const STORAGE_KEY = "stria-chat";
const CHAT_ENDPOINT = `${site.apiUrl.replace(/\/$/, "")}/api/chat`;
const WELCOME_MESSAGE =
  "Merhaba! Kaş Tasarımı Ankara hakkında sorularınızı yanıtlayabilirim. Randevu ve fiyat için sizi WhatsApp'a yönlendirebilirim.";
const ERROR_MESSAGE = "Şu an yanıt veremiyorum. WhatsApp'tan yazabilirsiniz 👉";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isFallback?: boolean;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { role: "assistant", content: WELCOME_MESSAGE },
];

function getStoredMessages(): ChatMessage[] | null {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (message) =>
          typeof message === "object" &&
          message !== null &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.length >= 1 &&
          message.content.length <= 1000 &&
          (message.isFallback === undefined || typeof message.isFallback === "boolean"),
      )
    ) {
      return null;
    }
    return parsed as ChatMessage[];
  } catch {
    return null;
  }
}

export function ChatWidget({ whatsapp }: { whatsapp: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const storageReadyRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const storedMessages = getStoredMessages();
      storageReadyRef.current = true;
      if (storedMessages) {
        setMessages(storedMessages);
        return;
      }
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      } catch {
        // The in-memory welcome message is enough when storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // The chat still works when storage is unavailable or full.
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [isOpen, isLoading, messages]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    window.requestAnimationFrame(() => openButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeChat, isOpen]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    const requestMessages = nextMessages.slice(-12).map(({ role, content: text }) => ({
      role,
      content: text,
    }));

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: "kas-tasarimi-ankara",
          messages: requestMessages,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload: unknown = await response.json();
      const reply =
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        typeof payload.data === "object" &&
        payload.data !== null &&
        "reply" in payload.data &&
        typeof payload.data.reply === "string"
          ? payload.data.reply.trim().slice(0, 1000)
          : "";

      if (!reply) throw new Error("Invalid chat response");
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: ERROR_MESSAGE, isFallback: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 sm:right-6">
      {isOpen ? (
        <section
          id="stria-chat-dialog"
          role="dialog"
          aria-label="Kaş Tasarımı Ankara Asistan"
          className="flex h-[min(560px,70vh)] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-[2px] border border-line2 bg-cream"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line2 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-dark">
                Stria Studio
              </p>
              <h2 className="mt-1 truncate font-display text-[17px] leading-tight text-ink">
                Kaş Tasarımı Ankara Asistan
              </h2>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Sohbeti kapat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-line2 text-2xl font-light leading-none text-ink transition hover:border-accent hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div
            role="log"
            aria-live="polite"
            aria-busy={isLoading}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-[2px] border px-3.5 py-2.5 text-[13px] leading-5 ${
                  message.role === "user"
                    ? "ml-auto border-accent bg-accent text-cream"
                    : "mr-auto border-line2 bg-blush text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {message.isFallback && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block font-medium text-accent-dark underline decoration-accent/50 underline-offset-4 hover:decoration-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                role="status"
                aria-label="Asistan yanıt yazıyor"
                className="mr-auto flex h-10 items-center gap-1 rounded-[2px] border border-line2 bg-blush px-4 text-accent-dark"
              >
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    aria-hidden="true"
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-line2 bg-cream p-3">
            <label htmlFor="stria-chat-input" className="sr-only">
              Mesajınız
            </label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="stria-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                maxLength={1000}
                disabled={isLoading}
                placeholder="Mesajınızı yazın…"
                className="max-h-24 min-h-11 flex-1 resize-y rounded-[2px] border border-line2 bg-cream px-3 py-2.5 text-base leading-5 text-ink outline-none placeholder:text-muted transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={isLoading || !input.trim()}
                aria-label="Mesajı gönder"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-accent bg-accent text-cream transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-line2 disabled:bg-blush disabled:text-muted"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m4 4 16 8-16 8 3-8-3-8Z" />
                  <path d="M7 12h13" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted2">
              Enter ile gönder · Shift+Enter ile yeni satır
            </p>
          </div>
        </section>
      ) : (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Kaş Tasarımı Ankara Asistanı aç"
          aria-controls="stria-chat-dialog"
          aria-expanded="false"
          className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-accent bg-cream text-accent-dark transition hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 15a3 3 0 0 1-3 3H9l-5 3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8Z" />
            <path d="M8 9h8M8 13h5" />
          </svg>
        </button>
      )}
    </div>
  );
}
