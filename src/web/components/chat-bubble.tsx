import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Markdown from "react-markdown";

// Bat icon using the actual Batman silhouette image
// variant: "black" for bubble, "white" for header, "orange" for message avatars
function BatIcon({
  className,
  variant = "orange",
}: {
  className?: string;
  variant?: "white" | "orange" | "black";
}) {
  const filterMap = {
    white: "invert(1) brightness(2)",
    orange:
      "invert(48%) sepia(79%) saturate(537%) hue-rotate(345deg) brightness(97%) contrast(89%)",
    black: "none",
  };
  return (
    <img
      src="/chatbat-icon.png"
      alt="Alfred"
      className={className}
      style={{
        filter: filterMap[variant],
        objectFit: "contain",
      }}
      draggable={false}
    />
  );
}

function MessageContent({ content }: { content: string }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-[#fafaf9]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#e8793b]/90">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-none space-y-1 mb-2 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2">
            <span className="text-[#e8793b] mt-1.5 text-[6px] shrink-0">●</span>
            <span>{children}</span>
          </li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e8793b] underline underline-offset-2 hover:text-[#f09456] transition-colors"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-[#0a0a0b] px-1.5 py-0.5 rounded text-[#e8793b] text-xs">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}

function MessagePart({ part }: { part: UIMessage["parts"][number] }) {
  if (part.type === "text") {
    return <MessageContent content={part.text} />;
  }
  return null;
}

// ─── Popup / Tooltip nudge near the bubble ───────────────────────
function BubblePopup({
  isOpen,
  hasOpened,
}: {
  isOpen: boolean;
  hasOpened: boolean;
}) {
  // "intro" = timed auto-popup, "hover" = tooltip on hover, "hidden" = gone
  const [phase, setPhase] = useState<"waiting" | "intro" | "hidden" | "hover">(
    "waiting"
  );
  const [visible, setVisible] = useState(false); // controls opacity
  const introShownRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── 1. Auto-appear after 4 s (once per session) ──
  useEffect(() => {
    if (introShownRef.current || isOpen || hasOpened) return;

    timerRef.current = setTimeout(() => {
      setPhase("intro");
      // small RAF delay so the opacity transition kicks in
      requestAnimationFrame(() => setVisible(true));
      introShownRef.current = true;

      // auto-hide after 9 s
      fadeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setPhase("hidden"), 500); // wait for fade-out
      }, 9000);
    }, 4000);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, [isOpen, hasOpened]);

  // ── 2. Click anywhere → dismiss immediately ──
  useEffect(() => {
    if (phase !== "intro") return;
    const dismiss = () => {
      setVisible(false);
      clearTimeout(fadeTimerRef.current);
      setTimeout(() => setPhase("hidden"), 500);
    };
    window.addEventListener("click", dismiss, { once: true });
    return () => window.removeEventListener("click", dismiss);
  }, [phase]);

  // ── 3. Hide popup when chat opens ──
  useEffect(() => {
    if (isOpen) {
      setVisible(false);
      clearTimeout(fadeTimerRef.current);
      clearTimeout(timerRef.current);
      setTimeout(() => {
        if (phase === "intro" || phase === "waiting") setPhase("hidden");
        if (phase === "hover") setPhase("hidden");
      }, 300);
    }
  }, [isOpen, phase]);

  // ── 4. Hover tooltip (only when chat hasn't been opened & intro already finished/dismissed) ──
  const onBubbleMouseEnter = useCallback(() => {
    if (isOpen || hasOpened) return;
    if (phase === "hidden" || (phase === "waiting" && introShownRef.current)) {
      setPhase("hover");
      requestAnimationFrame(() => setVisible(true));
    }
  }, [isOpen, hasOpened, phase]);

  const onBubbleMouseLeave = useCallback(() => {
    if (phase !== "hover") return;
    setVisible(false);
    setTimeout(() => setPhase("hidden"), 500);
  }, [phase]);

  // Don't render anything while chat is open or after user opened it
  const shouldRender =
    !isOpen && (phase === "intro" || phase === "hover");

  return {
    onBubbleMouseEnter,
    onBubbleMouseLeave,
    popup: shouldRender ? (
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          bottom: "22px",
          left: "76px",
          maxWidth: "260px",
        }}
      >
        <div
          className="relative transition-all duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(6px) scale(0.96)",
          }}
        >
          {/* Arrow pointing left toward the bubble */}
          <div
            className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderRight: "7px solid #1a1a1d",
            }}
          />
          <div className="bg-[#1a1a1d] border border-[#2a2a2d] rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_16px_rgba(232,121,59,0.06)]">
            <p className="text-[#d4d4d4] text-[13px] leading-[1.55]">
              Bruce Wayne had Alfred. So does Keerthan.{" "}
              <span className="text-[#e8793b] font-medium">
                Click to ask anything.
              </span>
            </p>
          </div>
        </div>
      </div>
    ) : null,
  };
}

// ─── Suggested questions (shown before first message) ────────────
const SUGGESTED_QUESTIONS = [
  "What has Keerthan actually built?",
  "How does he handle not knowing something?",
  "What is he like outside of work?",
  "Can you roast him a little?",
  "Why is the chatbot called Alfred?",
];

// ─── Main Component ──────────────────────────────────────────────
export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent/messages",
      headers: { "x-session-id": sessionIdRef.current },
    }),
  });

  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";
  const isError = status === "error";
  const [reportSent, setReportSent] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [slowResponse, setSlowResponse] = useState(false);

  const handleChipClick = (question: string) => {
    if (isLoading) return;
    sendMessage({ text: question });
  };

  const { popup, onBubbleMouseEnter, onBubbleMouseLeave } = BubblePopup({
    isOpen,
    hasOpened,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Reset report state when error clears
  useEffect(() => {
    if (!isError) {
      setReportSent(false);
      setReportSending(false);
    }
  }, [isError]);

  // Show "taking longer than usual" after 10 seconds of waiting
  useEffect(() => {
    if (isLoading) {
      setSlowResponse(false);
      const timer = setTimeout(() => setSlowResponse(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setSlowResponse(false);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleReportIssue = async () => {
    if (reportSending || reportSent) return;
    setReportSending(true);
    try {
      const lastUserMsg = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      const lastUserText =
        lastUserMsg?.parts
          ?.filter((p) => p.type === "text" && "text" in p)
          .map((p) => (p as { type: "text"; text: string }).text)
          .join("") || "";

      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorMessage: error?.message || "Unknown chat error",
          userMessage: lastUserText,
          userAgent: navigator.userAgent,
        }),
      });
      setReportSent(true);
    } catch {
      console.error("[Alfred] Failed to send error report");
    } finally {
      setReportSending(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const lastUserText =
      lastUserMsg?.parts
        ?.filter((p) => p.type === "text" && "text" in p)
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("") || "";
    if (lastUserText) {
      sendMessage({ text: lastUserText });
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 left-5 z-50 w-[380px] max-w-[calc(100vw-40px)] transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-[#111113] border border-[#1e1e21] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(232,121,59,0.08)] overflow-hidden flex flex-col h-[540px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#e8793b] to-[#d46a2e] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm p-1.5">
                <BatIcon className="w-full h-full" variant="white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Alfred
                </p>
                <p className="text-white/70 text-xs">
                  Knows everything about him — on and off paper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors duration-150 cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {/* Welcome message + suggested question chips */}
            {messages.length === 0 && (
              <>
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#e8793b]/15 flex items-center justify-center shrink-0 mt-0.5 p-1">
                    <BatIcon className="w-full h-full" variant="orange" />
                  </div>
                  <div className="bg-[#1a1a1d] rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                    <p className="text-[#d4d4d4] text-sm leading-relaxed">
                      Hey, I'm{" "}
                      <span className="text-[#e8793b] font-semibold">
                        Alfred
                      </span>
                      . Ask me anything about Keerthan.
                    </p>
                  </div>
                </div>

                {/* Suggested question chips */}
                <div className="flex flex-wrap gap-2 pl-[38px]">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChipClick(q)}
                      className="text-[13px] leading-snug text-[#d4d4d4] bg-[#1a1a1d] border border-[#2a2a2d] rounded-xl px-3.5 py-2 hover:border-[#e8793b]/50 hover:text-[#e8793b] transition-all duration-200 cursor-pointer text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Message thread */}
            {messages.map((message) => (
              <div key={message.id} className="flex gap-2.5">
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#e8793b]/15 flex items-center justify-center shrink-0 mt-0.5 p-1">
                    <BatIcon className="w-full h-full" variant="orange" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-[#e8793b] text-[#0a0a0b] rounded-tr-md"
                      : "bg-[#1a1a1d] text-[#d4d4d4] rounded-tl-md"
                  }`}
                >
                  {message.parts.map((part, i) => (
                    <MessagePart key={i} part={part} />
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#e8793b]/15 flex items-center justify-center shrink-0 mt-0.5 p-1">
                  <BatIcon className="w-full h-full" variant="orange" />
                </div>
                <div className="bg-[#1a1a1d] rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#e8793b]/60 animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 rounded-full bg-[#e8793b]/60 animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 rounded-full bg-[#e8793b]/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                  {slowResponse && (
                    <p className="text-[#8a8a8a] text-xs mt-2">This is taking longer than usual...</p>
                  )}
                </div>
              </div>
            )}

            {/* Error state with Try Again + Report Issue buttons */}
            {isError && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="bg-[#1a1a1d] border border-red-500/20 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                  <p className="text-red-400 text-sm mb-2">
                    Something went wrong. Alfred hit a snag.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRetry}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#e8793b]/15 text-[#e8793b] border border-[#e8793b]/30 hover:bg-[#e8793b]/25 transition-all duration-200 cursor-pointer"
                    >
                      Try again
                    </button>
                    <button
                      onClick={handleReportIssue}
                      disabled={reportSending || reportSent}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        reportSent
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-[#1a1a1d] text-[#8a8a8a] border border-[#2a2a2d] hover:text-[#d4d4d4] hover:border-[#3a3a3d]"
                      } disabled:cursor-not-allowed`}
                    >
                      {reportSending
                        ? "Sending..."
                        : reportSent
                          ? "Report sent — thanks!"
                          : "Report issue"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-[#1e1e21] bg-[#0f0f11] shrink-0"
          >
            <div className="flex items-center gap-2 bg-[#111113] border border-[#252528] rounded-xl px-3 py-1 focus-within:border-[#e8793b]/50 transition-colors duration-200">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isError ? "Hit 'Try again' or report the issue above" : "Ask Alfred anything..."}
                maxLength={500}
                className="flex-1 bg-transparent text-[#fafaf9] text-sm py-2 outline-none placeholder:text-[#6a6a6a]"
                disabled={isLoading || isError}
              />
              <button
                type="submit"
                disabled={isLoading || isError || !input.trim()}
                className="w-8 h-8 rounded-lg bg-[#e8793b] flex items-center justify-center transition-all duration-200 hover:bg-[#d46a2e] disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-[#0a0a0b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Bubble - Bottom Left — bigger, black bat on orange */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={onBubbleMouseEnter}
        onMouseLeave={onBubbleMouseLeave}
        aria-label={isOpen ? "Close chat" : "Chat with Alfred"}
        className={`fixed bottom-5 left-5 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer shadow-[0_4px_20px_rgba(232,121,59,0.35)] hover:shadow-[0_6px_28px_rgba(232,121,59,0.5)] hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-[#1a1a1d] border border-[#2a2a2b]"
            : "bg-[#e8793b] border border-[#e8793b]"
        }`}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-[#e8793b]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <BatIcon className="w-9 h-9" variant="black" />
        )}
      </button>

      {/* Popup message */}
      {popup}

      {/* Pulse ring animation when not opened yet */}
      {!hasOpened && !isOpen && (
        <div className="fixed bottom-5 left-5 z-40 w-16 h-16 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-[#e8793b]/30 animate-ping" />
        </div>
      )}
    </>
  );
}
