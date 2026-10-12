// Rift Guide content — ALL text lives here so you can edit it without touching components.
// HOW TO ADD A QUESTION:
// 1. Add a new object to QUESTIONS with a unique `id` (string), a short `label` for the chip,
//    the full `question` text, and an `answer` array.
// 2. `answer` can contain strings (paragraphs) and/or an object `{ list: ["item1", "item2"] }` for bullet lists.
// 3. Optional `cta`: { label: "Button text", to: "/route" } — uses router Link for internal routes.
// 4. Optional `followUps`: array of question `id`s to show as follow-up chips after this answer.
// 5. Keep tone friendly, short (2-4 sentences or a short list), gaming flavor but clear.
// 6. NEVER claim anything not implemented. Verify every factual claim against the code.
// 7. If a fact contradicts the existing FAQ, note it in DEVIATIONS and do NOT edit the FAQ.

export const GREETING = ["Hey! I'm the Rift Guide — a pre-written FAQ bot, not AI. Pick a question below and I'll give you the straight answer."];

export const QUESTIONS = [
  {
    id: "what-can-it-do",
    label: "What can it do?",
    question: "What can Gamerift do right now?",
    answer: [
      "Browse a dashboard of demo streams and watch them in a looping player.",
      "Sign up and verify your email with a 6-digit OTP sent via an HTTPS email API (free hosting blocks SMTP ports).",
      "Follow channels to get live toast alerts and bell notifications when they go live.",
      "Event countdowns with reminders — you get a ping 30 min and 5 min before start.",
      "Go Pro with a sandbox payment (SSLCommerz test mode) to unlock a gold chat name, Pro badge, and zero ads.",
      "Chat in the stream sidebar: it shows simulated bot messages every few seconds plus your own messages (real multi-user chat over WebSocket is planned, not live yet).",
      "Admin panel for managing streams, events, Pro plans, coupons, and broadcasts."
    ],
    cta: { label: "Create free account", to: "/register" },
    followUps: ["are-streams-real", "live-notifications", "payments"]
  },
  {
    id: "are-streams-real",
    label: "Are streams real?",
    question: "Are the streams real?",
    answer: [
      "No. Each stream is a muted, looping YouTube embed (or MP4) presented like a live stream. Viewer counts and trending numbers are demo data — that's why items are tagged DEMO LOOP and (demo numbers).",
      "Real live streaming needs video ingest, transcoding, CDN delivery, and lots of bandwidth, which free hosting cannot provide. A real implementation would need paid infrastructure and a streaming backend."
    ],
    followUps: ["why-not-fully-real", "whats-next"]
  },
  {
    id: "live-notifications",
    label: "Live notifications",
    question: "How do live notifications work?",
    answer: [
      "When something happens — a payment succeeds, someone replies to your comment, an event is about to start, an admin sends a broadcast, or a followed channel goes live — the server saves a notification and instantly pushes it to your browser over a WebSocket (STOMP over SockJS).",
      "The toast appears top-right on desktop, full-width on mobile, and the bell badge updates without a refresh.",
      "If the connection drops, the client reconnects and reloads your list so nothing is lost.",
      "You can toggle each type (live, events, replies, payments) on or off in Settings → Notifications.",
      "Note: after a long idle period the free server sleeps, so the first connection can take a while to wake up."
    ],
    followUps: ["slow-first-load", "email-otp"]
  },
  {
    id: "payments",
    label: "Payments",
    question: "How do payments work?",
    answer: [
      "Pro uses SSLCommerz in sandbox (test) mode. You pick a plan, optionally apply a coupon (GG10 for 10% off, WELCOME50 for ৳50 off), and get redirected to SSLCommerz's secure hosted page showing available payment methods.",
      "After you pay, the server asks SSLCommerz directly to confirm the amount and order (it doesn't trust the browser alone), then activates Pro once, even if the callback repeats.",
      "No real money moves in sandbox mode. Going live with real payments needs an approved SSLCommerz merchant account and business verification.",
      "Plans: Player One (৳99/30d), Squad (৳249/90d, best value), Legend (৳899/365d)."
    ],
    cta: { label: "See Pro", to: "/app/pro" },
    followUps: ["email-otp", "why-not-fully-real"]
  },
  {
    id: "email-otp",
    label: "Email OTP",
    question: "How does the email OTP work?",
    answer: [
      "At sign-up the server generates a 6-digit code and sends it via an email HTTPS API (the free hosting blocks standard SMTP ports).",
      "The code is single-use and expires after a short period (the backend enforces expiry and one-time use). Enter it on the verification page to activate your account."
    ],
    followUps: ["what-can-it-do", "slow-first-load"]
  },
  {
    id: "whats-next",
    label: "What's next?",
    question: "What are you building next?",
    answer: [
      "In progress / planned:",
      { list: [
        "Real multi-user live chat on the existing WebSocket connection (currently simulated bots).",
        "Mobile app (the landing page already says \"Coming in next release\").",
        "More admin/moderation tools."
      ]},
      "Needs paid infrastructure:",
      { list: [
        "Real live streaming ingest and transcoding.",
        "Always-on servers (free tier sleeps after ~15 min idle).",
        "Live payments with a merchant account."
      ]},
      "Plans are goals, not promises."
    ],
    followUps: ["why-not-fully-real", "built-with"]
  },
  {
    id: "why-not-fully-real",
    label: "Why not fully real?",
    question: "Why isn't everything fully real?",
    answer: [
      "This is a student project built entirely on free tiers: free hosting (Render) for backend and frontend, MongoDB Atlas free tier, free email API plan, and SSLCommerz sandbox.",
      "Free tiers have hard limits: the server sleeps after ~15 minutes without traffic, has 512 MB RAM and a fraction of a CPU, cannot use SMTP mail ports, has ephemeral disk (uploaded files vanish on restart), and limited database storage.",
      "Real live video, chat at scale, and real-money payments need paid infrastructure and business verification."
    ],
    followUps: ["slow-first-load", "whats-next"]
  },
  {
    id: "slow-first-load",
    label: "Slow first load?",
    question: "Why was the first load slow?",
    answer: [
      "Free hosting puts the server to sleep after about 15 minutes with no visitors. The first visitor wakes it, which can take up to a minute. After that it's fast."
    ],
    followUps: ["why-not-fully-real", "email-otp"]
  },
  {
    id: "built-with",
    label: "Built with?",
    question: "What is it built with?",
    answer: [
      "Spring Boot (Java) REST API with WebSocket/STOMP for real-time features.",
      "MongoDB Atlas for data.",
      "React + Vite frontend with Tailwind CSS (custom design system).",
      "JWT authentication with email OTP verification.",
      "SSLCommerz sandbox for payments.",
      "Email HTTPS API for OTP delivery (SMTP blocked on free tier).",
      "Hosted on Render (free tier)."
    ],
    followUps: ["why-not-fully-real", "whats-next"]
  },
  {
    id: "can-i-stream",
    label: "Can I stream?",
    question: "Can I stream myself?",
    answer: [
      "Not yet. Admins add streams for now, and a real live option is marked Coming soon."
    ],
    followUps: ["what-can-it-do", "whats-next"]
  }
];