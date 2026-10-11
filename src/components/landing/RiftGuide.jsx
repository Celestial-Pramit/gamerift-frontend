import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";
import { GREETING, QUESTIONS } from "../../data/riftGuideContent.js";

const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
const INITIAL_CHIPS = QUESTIONS.map((q) => q.id);

function TypingIndicator({ reducedMotion }) {
  if (reducedMotion) return null;
  return (
    <div className="rift-bubble rift-bot typing" aria-hidden="true">
      <div className="rift-typing-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function Bubble({ children, isUser, reducedMotion }) {
  return (
    <div
      className={`rift-bubble ${isUser ? "rift-user" : "rift-bot"} rise`}
      style={{ animationDuration: reducedMotion ? "0ms" : "0.5s" }}
    >
      <div className="rift-bubble-content">{children}</div>
    </div>
  );
}

function AnswerContent({ answer, cta, reducedMotion }) {
  return (
    <div className="rift-answer">
      {answer.map((part, i) => {
        if (typeof part === "string") {
          return <p key={i} className="rift-paragraph">{part}</p>;
        }
        if (part && Array.isArray(part.list)) {
          return (
            <ul key={i} className="rift-list">
              {part.list.map((item, j) => (
                <li key={j}><Icon name="check" size={14} className="rift-bullet" /> {item}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
      {cta && (
        <Link to={cta.to} className="rift-cta btn-cut btn-pri px-4 py-2 text-sm" style={{ animationDelay: reducedMotion ? "0ms" : "100ms" }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function ChipRow({ chips, onClick, ariaLabel }) {
  return (
    <div className="rift-chip-row" role="list" aria-label={ariaLabel}>
      {chips.map((id) => {
        const q = QUESTION_MAP[id];
        if (!q) return null;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onClick(q.id)}
            className="rift-chip btn-cut"
            role="listitem"
          >
            {q.label}
          </button>
        );
      })}
    </div>
  );
}

export default function RiftGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showAllChips, setShowAllChips] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [firstVisit, setFirstVisit] = useState(true);

  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const launcherRef = useRef(null);
  const previousActiveRef = useRef(null);

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tooltip after 4s on first visit
  useEffect(() => {
    if (!firstVisit) return;
    const timer = setTimeout(() => {
      setTooltipVisible(true);
      setFirstVisit(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [firstVisit]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, reducedMotion]);

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveRef.current = document.activeElement;
      setTimeout(() => panelRef.current?.focus(), 100);
    } else if (previousActiveRef.current) {
      (previousActiveRef.current).focus();
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && open) close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openPanel() {
    if (open) return;
    setOpen(true);
    setMessages([
      { id: "greeting", type: "bot", content: GREETING },
      { id: "chips-initial", type: "chips", chips: INITIAL_CHIPS }
    ]);
    setShowAllChips(false);
  }

  function close() {
    setOpen(false);
    setTooltipVisible(false);
  }

  function handleChipClick(questionId) {
    const q = QUESTION_MAP[questionId];
    if (!q) return;

    // Add user question bubble
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, type: "user", content: q.question }]);

    // Remove the chip row that was clicked (find and remove the last chips message)
    setMessages((prev) => {
      const idx = prev.findLastIndex((m) => m.type === "chips");
      if (idx >= 0) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      return prev;
    });

    // Typing indicator then answer
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [...prev, { id: typingId, type: "typing" }]);

    const delay = reducedMotion ? 0 : 700;
    setTimeout(() => {
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== typingId);
        const followUpChips = (q.followUps || []).filter((id) => QUESTION_MAP[id]);
        const chipsToShow = followUpChips.length > 0
          ? [...followUpChips, "more-questions"]
          : ["more-questions"];
        return [
          ...next,
          { id: `bot-${Date.now()}`, type: "bot", content: q.answer, cta: q.cta },
          { id: `chips-${Date.now()}`, type: "chips", chips: chipsToShow }
        ];
      });
    }, delay);
  }

  function handleMoreQuestions() {
    setShowAllChips(true);
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "chips"),
      { id: `chips-all-${Date.now()}`, type: "chips", chips: INITIAL_CHIPS }
    ]);
  }

  function handleStartOver() {
    setMessages([
      { id: "greeting", type: "bot", content: GREETING },
      { id: "chips-initial", type: "chips", chips: INITIAL_CHIPS }
    ]);
    setShowAllChips(false);
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  const chipLabel = showAllChips || messages.length <= 2 ? "All questions" : "Follow-ups";

  return (
    <>
      {/* Launcher button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={openPanel}
        className="rift-launcher btn-cut btn-pri fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-3 text-sm"
        style={{ bottom: "calc(4rem + 16px)" }} /* 16px gap above TOP button (which is at bottom-4 = 1rem) */
        aria-label="Ask the Rift"
        aria-expanded={open}
        aria-controls="rift-guide-panel"
      >
        <span className="livedot" />
        <Icon name="chat" size={16} />
        <span className="font-head font-bold">ASK THE RIFT</span>
      </button>

      {/* Tooltip */}
      {tooltipVisible && !open && (
        <div className="rift-tooltip panel fixed bottom-4 right-4 z-40 px-3 py-2 text-sm" style={{ right: "calc(100% + 12px)", bottom: "calc(4rem + 16px)" }}>
          <div className="flex items-center justify-between gap-2">
            <span>Ask what Gamerift can do</span>
            <button onClick={() => setTooltipVisible(false)} className="text-muted hover:text-white" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          id="rift-guide-panel"
          className="rift-panel fixed bottom-4 right-4 z-50 panel"
          role="dialog"
          aria-modal="true"
          aria-label="Rift Guide"
          tabIndex={-1}
        >
          <div className="rift-panel-inner">
            {/* Header */}
            <header className="rift-header flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="font-head text-lg font-bold">RIFT GUIDE</h2>
                <p className="mono text-[10px] text-muted">Pre-written answers, not AI</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="rift-startover btn-cut btn-sec px-3 py-1.5 text-xs hidden sm:inline-flex"
                  aria-label="Start over"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rift-close grid h-9 w-9 place-items-center rounded-lg border border-line bg-card text-muted hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              className="rift-messages overflow-y-auto p-4 space-y-3"
              role="log"
              aria-live="polite"
              aria-atomic="false"
            >
              {messages.map((msg) => {
                if (msg.type === "user") {
                  return (
                    <Bubble key={msg.id} isUser={true} reducedMotion={reducedMotion}>
                      <p className="rift-user-text">{msg.content}</p>
                    </Bubble>
                  );
                }
                if (msg.type === "bot") {
                  return (
                    <Bubble key={msg.id} isUser={false} reducedMotion={reducedMotion}>
                      <AnswerContent answer={msg.content} cta={msg.cta} reducedMotion={reducedMotion} />
                    </Bubble>
                  );
                }
                if (msg.type === "typing") {
                  return <TypingIndicator key={msg.id} reducedMotion={reducedMotion} />;
                }
                if (msg.type === "chips") {
                  const label = msg.chips.includes("more-questions") && msg.chips.length > 1
                    ? "Follow-up questions"
                    : "All questions";
                  return (
                    <div key={msg.id} className="rift-chips-container">
                      <ChipRow chips={msg.chips} onClick={handleChipClick} ariaLabel={label} />
                      {msg.chips.includes("more-questions") && msg.chips.length > 1 && (
                        <button
                          type="button"
                          onClick={handleMoreQuestions}
                          className="rift-chip btn-cut btn-sec mt-2"
                        >
                          More questions
                        </button>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Hint line */}
            <div className="rift-hint border-t border-line px-4 py-3">
              <p className="mono text-[10px] text-muted text-center">Pick a question above</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet styles handled in CSS */}
      <style jsx>{`
        .rift-panel {
          width: 380px;
          max-height: 70vh;
          border-radius: 16px;
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
          display: flex;
          flex-direction: column;
          animation: rift-slideup 0.25s cubic-bezier(0.2, 1.2, 0.4, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-panel { animation: none; }
        }
        @keyframes rift-slideup {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }

        .rift-panel-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }

        .rift-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .rift-bubble {
          max-width: 85%;
          animation: rise 0.5s ease both;
        }
        .rift-bot {
          align-self: flex-start;
          border-radius: 16px 16px 16px 4px;
          background: #14141d;
          border: 1px solid #24243a;
          box-shadow: 0 4px 16px -4px rgba(25, 227, 210, 0.15);
        }
        .rift-user {
          align-self: flex-end;
          border-radius: 16px 16px 4px 16px;
          background: linear-gradient(135deg, #a24bff, #8a2be2);
          color: white;
        }
        .rift-bubble-content {
          padding: 12px 14px;
        }
        .rift-user-text {
          font-size: 14px;
          line-height: 1.4;
        }

        .rift-typing-dots {
          display: flex;
          gap: 4px;
          padding: 8px 14px;
        }
        .rift-typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #19e3d2;
          opacity: 0.4;
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .rift-typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .rift-typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing-bounce {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-typing-dots span { animation: none; opacity: 0.6; }
        }

        .rift-answer { color: #e8e8ef; }
        .rift-paragraph {
          margin: 0 0 0.5rem;
          font-size: 13px;
          line-height: 1.5;
        }
        .rift-paragraph:last-child { margin-bottom: 0; }
        .rift-list {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
          font-size: 13px;
          line-height: 1.6;
        }
        .rift-list li { position: relative; margin: 0.25rem 0; }
        .rift-bullet {
          color: #19e3d2;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        .rift-cta {
          display: inline-flex;
          margin-top: 0.5rem;
          animation: rise 0.5s ease both;
        }

        .rift-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rift-chip {
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 8px 12px;
          background: #11111a;
          border: 1px solid #24243a;
          color: #f3f3fa;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          transition: 0.15s;
        }
        .rift-chip:hover {
          border-color: #a24bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px -4px rgba(162, 75, 255, 0.4);
        }
        .rift-chip:focus-visible {
          outline: 2px solid #a24bff;
          outline-offset: 2px;
        }
        .rift-chips-container { display: flex; flex-direction: column; gap: 8px; }

        .rift-hint {
          flex-shrink: 0;
        }

        .rift-startover {
          font-family: var(--font-head);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .rift-close:hover { background: #1a1a24; }

        .rift-tooltip {
          width: max-content;
          max-width: 220px;
          border-radius: 8px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          animation: rift-tooltip-in 0.2s ease-out both;
        }
        @keyframes rift-tooltip-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: none; }
        }

        /* Launcher */
        .rift-launcher {
          border-radius: 12px;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
          box-shadow: 0 8px 24px -8px rgba(162, 75, 255, 0.5), 0 0 0 1px rgba(162, 75, 255, 0.3);
          animation: rift-launcher-pulse 3s ease-in-out infinite;
        }
        @keyframes rift-launcher-pulse {
          0%, 100% { box-shadow: 0 8px 24px -8px rgba(162, 75, 255, 0.5), 0 0 0 1px rgba(162, 75, 255, 0.3); }
          50% { box-shadow: 0 8px 32px -8px rgba(162, 75, 255, 0.7), 0 0 0 1px rgba(162, 75, 255, 0.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-launcher { animation: none; }
        }

        /* Mobile bottom sheet */
        @media (max-width: 639px) {
          .rift-panel {
            left: env(safe-area-inset-left);
            right: env(safe-area-inset-right);
            width: auto;
            max-width: none;
            max-height: 80dvh;
            bottom: 0;
            border-radius: 16px 16px 0 0;
            clip-path: none;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .rift-launcher {
            bottom: calc(4rem + 16px + env(safe-area-inset-bottom));
            right: env(safe-area-inset-right);
            left: env(safe-area-inset-left);
            width: auto;
            justify-content: center;
            padding: 1rem;
            border-radius: 12px 12px 0 0;
            clip-path: none;
          }
          .rift-tooltip {
            left: env(safe-area-inset-left);
            right: env(safe-area-inset-right);
            bottom: calc(4rem + 16px + env(safe-area-inset-bottom) + 48px);
            max-width: none;
            width: auto;
          }
          .rift-startover { display: inline-flex; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .rift-panel {
            width: 360px;
          }
        }
      `}</style>
    </>
  );
}