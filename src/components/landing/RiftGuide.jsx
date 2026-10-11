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
      <div className="rift-typing">
        <span className="rift-typing-dot" />
        <span className="rift-typing-dot" />
        <span className="rift-typing-dot" />
      </div>
    </div>
  );
}

function Bubble({ children, isUser, reducedMotion }) {
  return (
    <div
      className={`rift-bubble ${isUser ? "rift-user" : "rift-bot"} rise`}
      style={{ animationDuration: reducedMotion ? "0ms" : "0.4s" }}
    >
      <div className="rift-bubble-tail" aria-hidden="true" />
      <div className="rift-bubble-glow" aria-hidden="true" />
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
                <li key={j}><Icon name="check" size={13} className="rift-bullet" /> {item}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
      {cta && (
        <Link to={cta.to} className="rift-cta btn-cut btn-pri px-4 py-2 text-sm" style={{ animationDelay: reducedMotion ? "0ms" : "120ms" }}>
          {cta.label}
          <Icon name="play" size={12} className="ml-1" />
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
            className="rift-chip"
            role="listitem"
          >
            <span className="rift-chip-label">{q.label}</span>
            <Icon name="chevron-right" size={11} className="rift-chip-icon" />
          </button>
        );
      })}
    </div>
  );
}

function MoreQuestionsChip({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="rift-chip rift-chip-more">
      <Icon name="message-square" size={12} />
      <span>More questions</span>
      <Icon name="chevron-down" size={11} className="rift-chip-icon" />
    </button>
  );
}

export default function RiftGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showAllChips, setShowAllChips] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [firstVisit, setFirstVisit] = useState(true);
  const [launcherHover, setLauncherHover] = useState(false);

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
    setTooltipVisible(false);
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

    // Remove the last chips message
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

    const delay = reducedMotion ? 0 : 600;
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

  return (
    <>
      <style jsx>{`
        /* ==========================================================================
           RIFT GUIDE - Immersive Chat Widget
           ========================================================================== */

        /* Launcher */
        .rift-launcher {
          position: fixed;
          bottom: calc(4rem + 16px);
          right: 1rem;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #fff;
          background: linear-gradient(135deg, #a24bff 0%, #7c3aed 50%, #19e3d2 100%);
          background-size: 200% 200%;
          border: none;
          cursor: pointer;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
          box-shadow: 
            0 8px 32px -8px rgba(162, 75, 255, 0.5),
            0 0 0 1px rgba(162, 75, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: launcher-bg-shift 6s ease infinite, launcher-pulse 3s ease-in-out infinite;
          transition: transform 0.2s, box-shadow 0.2s, clip-path 0.2s;
        }
        .rift-launcher:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 12px 40px -10px rgba(162, 75, 255, 0.7),
            0 0 0 1px rgba(162, 75, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
        }
        .rift-launcher:focus-visible {
          outline: 2px solid #19e3d2;
          outline-offset: 3px;
        }
        @keyframes launcher-bg-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes launcher-pulse {
          0%, 100% { box-shadow: 0 8px 32px -8px rgba(162, 75, 255, 0.5), 0 0 0 1px rgba(162, 75, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 12px 48px -10px rgba(162, 75, 255, 0.8), 0 0 0 1px rgba(25, 227, 210, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-launcher { animation: none; }
        }
        .rift-launcher .livedot {
          width: 8px; height: 8px; border-radius: 50%; background: #fff;
          box-shadow: 0 0 12px #fff, 0 0 24px #ff3b5c;
          animation: launcher-dot-pulse 1.5s ease-out infinite;
        }
        @keyframes launcher-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 12px #fff, 0 0 24px #ff3b5c; }
          50% { transform: scale(1.3); opacity: 0.7; box-shadow: 0 0 20px #fff, 0 0 40px #ff3b5c; }
        }

        /* Tooltip */
        .rift-tooltip {
          position: fixed;
          bottom: calc(4rem + 16px);
          right: calc(100% + 1rem);
          z-index: 39;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: #e8e8ef;
          background: linear-gradient(135deg, #14141d, #11111a);
          border: 1px solid #24243a;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(162, 75, 255, 0.2);
          animation: tooltip-in 0.3s cubic-bezier(0.2, 1.2, 0.4, 1) both;
          max-width: 240px;
        }
        @keyframes tooltip-in {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: none; }
        }
        .rift-tooltip::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -8px;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 8px solid #a24bff;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          filter: drop-shadow(2px 0 4px rgba(162, 75, 255, 0.4));
        }

        /* Panel */
        .rift-panel {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 50;
          width: 400px;
          max-height: 75vh;
          background: linear-gradient(145deg, #0f0f16 0%, #14141d 100%);
          border: 1px solid #24243a;
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
          box-shadow: 
            0 24px 64px -16px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(162, 75, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          animation: panel-enter 0.35s cubic-bezier(0.2, 1.2, 0.4, 1) both;
          overflow: hidden;
        }
        @keyframes panel-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.96); clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%); }
          to { opacity: 1; transform: none; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-panel { animation: none; }
        }

        /* Panel background layers */
        .rift-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 60% 40% at 10% 10%, rgba(162, 75, 255, 0.12), transparent),
            radial-gradient(ellipse 50% 50% at 90% 90%, rgba(25, 227, 210, 0.08), transparent);
          pointer-events: none;
          z-index: -1;
        }
        .rift-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: -1;
        }

        .rift-panel-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }

        /* Header */
        .rift-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #24243a;
          background: linear-gradient(180deg, rgba(162, 75, 255, 0.08), transparent);
          position: relative;
        }
        .rift-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 1.25rem;
          right: 1.25rem;
          height: 1px;
          background: linear-gradient(90deg, transparent, #a24bff, #19e3d2, transparent);
          opacity: 0.4;
        }
        .rift-header h2 {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          background: linear-gradient(100deg, #fff 10%, #a24bff 40%, #19e3d2 80%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .rift-header p {
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8b8ba7;
        }
        .rift-startover {
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #24243a;
          color: #c3c3d6;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
          transition: all 0.2s;
        }
        .rift-startover:hover {
          border-color: #19e3d2;
          color: #19e3d2;
          background: rgba(25, 227, 210, 0.08);
        }
        .rift-close {
          display: grid;
          place-items: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 10px;
          border: 1px solid #24243a;
          background: #11111a;
          color: #8b8ba7;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
        }
        .rift-close:hover {
          border-color: #ff3b5c;
          color: #ff3b5c;
          background: rgba(255, 59, 92, 0.1);
          transform: rotate(90deg);
        }

        /* Messages area */
        .rift-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .rift-messages::-webkit-scrollbar { width: 5px; }
        .rift-messages::-webkit-scrollbar-track { background: transparent; }
        .rift-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a24bff, #19e3d2);
          border-radius: 3px;
        }

        /* Bubbles */
        .rift-bubble {
          position: relative;
          max-width: 88%;
          animation: bubble-rise 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both;
        }
        @keyframes bubble-rise {
          from { opacity: 0; transform: translateY(16px) scale(0.94); }
          to { opacity: 1; transform: none; }
        }
        .rift-bubble.typing { animation: none; opacity: 1; }

        .rift-bot {
          align-self: flex-start;
          border-radius: 18px 18px 18px 5px;
          background: linear-gradient(145deg, #16161f 0%, #11111a 100%);
          border: 1px solid #24243a;
          box-shadow: 
            0 8px 24px -8px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(25, 227, 210, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }
        .rift-user {
          align-self: flex-end;
          border-radius: 18px 18px 5px 18px;
          background: linear-gradient(135deg, #a24bff 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 
            0 8px 24px -8px rgba(162, 75, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .rift-bubble-tail {
          position: absolute;
          width: 20px;
          height: 20px;
          background: inherit;
          border: inherit;
          pointer-events: none;
        }
        .rift-bot .rift-bubble-tail {
          bottom: -6px;
          left: 14px;
          clip-path: polygon(0 100%, 50% 0, 100% 100%);
          border-right: none;
          border-top: none;
        }
        .rift-user .rift-bubble-tail {
          bottom: -6px;
          right: 14px;
          clip-path: polygon(0 100%, 50% 0, 100% 100%);
          border-left: none;
          border-top: none;
        }

        .rift-bubble-glow {
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(25, 227, 210, 0.08), transparent 60%);
          opacity: 0.5;
          pointer-events: none;
        }
        .rift-user .rift-bubble-glow {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent 60%);
        }

        .rift-bubble-content {
          position: relative;
          z-index: 1;
          padding: 0.875rem 1rem;
        }
        .rift-user-text {
          font-size: 0.875rem;
          line-height: 1.45;
          font-weight: 500;
        }

        /* Typing indicator */
        .rift-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.75rem 1rem;
        }
        .rift-typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #19e3d2;
          opacity: 0.4;
          animation: typing-bounce 1.3s ease-in-out infinite;
        }
        .rift-typing-dot:nth-child(2) { animation-delay: 0.12s; }
        .rift-typing-dot:nth-child(3) { animation-delay: 0.24s; }
        @keyframes typing-bounce {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.4; }
          50% { transform: scale(1.2) translateY(-3px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rift-typing-dot { animation: none; opacity: 0.6; transform: none; }
        }

        /* Answer content */
        .rift-answer { color: #e8e8ef; line-height: 1.6; }
        .rift-paragraph {
          margin: 0 0 0.6rem;
          font-size: 0.825rem;
          line-height: 1.65;
        }
        .rift-paragraph:last-child { margin-bottom: 0; }
        .rift-list {
          margin: 0.5rem 0 0.75rem;
          padding-left: 1.25rem;
          font-size: 0.825rem;
          line-height: 1.7;
        }
        .rift-list li { position: relative; margin: 0.35rem 0; }
        .rift-bullet {
          color: #19e3d2;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        .rift-cta {
          display: inline-flex;
          align-items: center;
          margin-top: 0.5rem;
          animation: cta-enter 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both;
        }
        @keyframes cta-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }

        /* Chips */
        .rift-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .rift-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.6rem 0.85rem;
          background: linear-gradient(145deg, #11111a, #16161f);
          border: 1px solid #24243a;
          color: #f3f3fa;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
          cursor: pointer;
          transition: all 0.18s;
          position: relative;
          overflow: hidden;
        }
        .rift-chip::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(162, 75, 255, 0.15), rgba(25, 227, 210, 0.08));
          opacity: 0;
          transition: opacity 0.2s;
        }
        .rift-chip:hover {
          border-color: #a24bff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px -6px rgba(162, 75, 255, 0.4);
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
        }
        .rift-chip:hover::before { opacity: 1; }
        .rift-chip:focus-visible {
          outline: 2px solid #a24bff;
          outline-offset: 2px;
        }
        .rift-chip-icon {
          opacity: 0.6;
          transition: transform 0.2s;
        }
        .rift-chip:hover .rift-chip-icon { transform: translateX(2px); opacity: 1; }

        .rift-chip-more {
          border-color: #2563ff;
          color: #2563ff;
          background: linear-gradient(145deg, rgba(37, 99, 255, 0.1), rgba(37, 99, 255, 0.03));
        }
        .rift-chip-more:hover {
          border-color: #3b82f6;
          box-shadow: 0 6px 20px -6px rgba(37, 99, 255, 0.4);
        }
        .rift-chip-more::before {
          background: linear-gradient(135deg, rgba(37, 99, 255, 0.2), rgba(37, 99, 255, 0.08));
        }

        .rift-chips-container { display: flex; flex-direction: column; gap: 0.5rem; }

        /* Hint */
        .rift-hint {
          flex-shrink: 0;
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #24243a;
          background: linear-gradient(0deg, rgba(162, 75, 255, 0.04), transparent);
        }
        .rift-hint p {
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b6b8a;
          text-align: center;
        }

        /* Mobile bottom sheet */
        @media (max-width: 639px) {
          .rift-panel {
            left: env(safe-area-inset-left);
            right: env(safe-area-inset-right);
            width: auto;
            max-width: none;
            max-height: 85dvh;
            bottom: 0;
            border-radius: 20px 20px 0 0;
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
            border-radius: 16px 16px 0 0;
            clip-path: none;
          }
          .rift-tooltip {
            left: env(safe-area-inset-left);
            right: env(safe-area-inset-right);
            bottom: calc(4rem + 16px + env(safe-area-inset-bottom) + 56px);
            max-width: none;
            width: auto;
          }
          .rift-tooltip::after { display: none; }
          .rift-startover { display: inline-flex; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .rift-panel { width: 380px; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .rift-launcher, .rift-panel, .rift-bubble, .rift-typing-dot,
          .rift-cta, .rift-tooltip, .rift-chip, .rift-bubble-glow {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={openPanel}
        onMouseEnter={() => setLauncherHover(true)}
        onMouseLeave={() => setLauncherHover(false)}
        className="rift-launcher"
        aria-label="Ask the Rift"
        aria-expanded={open}
        aria-controls="rift-guide-panel"
      >
        <span className="livedot" />
        <Icon name="message-square" size={16} />
        <span>ASK THE RIFT</span>
        <div className="rift-launcher-glow" aria-hidden="true" />
      </button>

      {/* Tooltip */}
      {tooltipVisible && !open && (
        <div className="rift-tooltip" role="tooltip">
          <div className="flex items-center justify-between gap-2">
            <span>Ask what Gamerift can do</span>
            <button onClick={() => setTooltipVisible(false)} className="text-muted hover:text-white p-0.5" aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          id="rift-guide-panel"
          className="rift-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Rift Guide"
          tabIndex={-1}
        >
          <div className="rift-panel-inner">
            <header className="rift-header">
              <div>
                <h2>RIFT GUIDE</h2>
                <p>Pre-written answers, not AI</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="rift-startover hidden sm:inline-flex"
                  aria-label="Start over"
                >
                  <Icon name="rotate-ccw" size={11} className="mr-1" />
                  Start over
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rift-close"
                  aria-label="Close"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </header>

            <div
              className="rift-messages"
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
                        <MoreQuestionsChip onClick={handleMoreQuestions} />
                      )}
                    </div>
                  );
                }
                return null;
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="rift-hint">
              <p>Pick a question above</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}