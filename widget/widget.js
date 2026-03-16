(function () {
  "use strict";

  // ─── CONFIG ────────────────────────────────────────────────────────
  const CONFIG = {
    webhookUrl: "https://nilsdigital.app.n8n.cloud/webhook/f61815ce-f800-4913-a5d3-69303910022f/chat",
    brandName: "Support Assistant",
    brandColor: "#046bd2",
    brandColorHover: "#0358b0",
    placeholderText: "Ask a question...",
    welcomeMessage:
      "Hey! 👋 Got a question? Ask away and I'll guide you.",
    fallbackMessage:
      "I couldn't find a clear answer to that. Please email us at **info@nilsdigital.com** and we'll get back to you shortly.",
    tabLabel: "Support",
    position: "right",
    zIndex: 99999,
  };

  // ─── STYLES ────────────────────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    #nils-chat-widget *,
    #nils-chat-widget *::before,
    #nils-chat-widget *::after {
      margin: 0;
      padding: 10;
      box-sizing: border-box;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* ── Collapsed Side Tab ── */
    #nils-widget-tab {
      position: fixed;
      ${CONFIG.position}: 0;
      bottom: 140px;
      z-index: ${CONFIG.zIndex};
      background: ${CONFIG.brandColor};
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.06em;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      padding: 20px 11px;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      border: none;
      box-shadow: -2px 0 14px rgba(4,107,210,0.22);
      transition: background 0.15s ease, padding 0.15s ease;
      user-select: none;
    }

    #nils-widget-tab:hover {
      background: ${CONFIG.brandColorHover};
      padding-bottom: 26px;
    }

    #nils-widget-tab.nils-hidden {
      display: none;
    }

    .nils-tab-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #5ddb8c;
      flex-shrink: 0;
    }

    /* ── Chat Panel ── */
    #nils-chat-panel {
      position: fixed;
      bottom: 0;
      ${CONFIG.position}: 0;
      z-index: ${CONFIG.zIndex - 1};
      width: 355px;
      max-width: calc(100vw - 16px);
      height: 500px;
      max-height: calc(100vh - 40px);
      background: #fff;
      border-radius: 14px 0 0 0;
      box-shadow: -3px 0 28px rgba(0,0,0,0.12), 0 -2px 14px rgba(0,0,0,0.07);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateX(${CONFIG.position === "right" ? "100%" : "-100%"});
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(.4,0,.2,1),
                  opacity 0.22s ease,
                  bottom 0.28s ease,
                  ${CONFIG.position} 0.28s ease,
                  border-radius 0.28s ease;
    }

    #nils-chat-panel.nils-open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: all;
      bottom: 24px;
      ${CONFIG.position}: 20px;
      border-radius: 14px;
    }

    /* ── Header ── */
    .nils-panel-header {
      background: linear-gradient(135deg, ${CONFIG.brandColor} 0%, #035ab5 100%);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .nils-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.14);
      border: 1.5px solid rgba(255,255,255,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nils-avatar svg {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .nils-header-info {
      flex: 1;
      min-width: 0;
    }

    .nils-h-name {
      color: #fff;
      font-weight: 600;
      font-size: 13.5px;
      margin-bottom: 3px;
    }

    .nils-h-status {
      color: rgba(255,255,255,0.70);
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .nils-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #5ddb8c;
      animation: nils-pulse-dot 2s infinite;
      flex-shrink: 0;
    }

    @keyframes nils-pulse-dot {
      0%, 100% { box-shadow: 0 0 0 2px rgba(93,219,140,0.25); }
      50% { box-shadow: 0 0 0 5px rgba(93,219,140,0.08); }
    }

    .nils-btn-collapse {
      background: rgba(255,255,255,0.11);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 7px;
      color: rgba(255,255,255,0.82);
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      padding: 5px 9px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.14s ease;
    }

    .nils-btn-collapse:hover {
      background: rgba(255,255,255,0.22);
      color: #fff;
    }

    /* ── Messages Area ── */
    .nils-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      scroll-behavior: smooth;
      background: #ffffff;
    }

    .nils-chat-messages::-webkit-scrollbar {
      width: 4px;
    }

    .nils-chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .nils-chat-messages::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 10px;
    }

    /* ── Message Wrapper ── */
    .nils-msg-wrap {
      display: flex;
      flex-direction: column;
      animation: nils-msg-in 0.18s ease;
    }

    .nils-msg-wrap.nils-user {
      align-items: flex-end;
    }

    .nils-msg-wrap.nils-bot {
      align-items: flex-start;
    }

    @keyframes nils-msg-in {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: none; }
    }

    /* ── Message Bubbles ── */
    .nils-bubble {
      max-width: 72%;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      word-break: break-word;
    }

    .nils-msg-wrap.nils-user .nils-bubble {
      background: ${CONFIG.brandColor};
      color: #fff;
      border-bottom-right-radius: 3px;
    }

    .nils-msg-wrap.nils-bot .nils-bubble {
      background: #f2f3f5;
      color: #1a202c;
      border-bottom-left-radius: 3px;
    }

    /* ── Bot message rich content ── */
    .nils-msg-wrap.nils-bot .nils-bubble strong {
      font-weight: 600;
    }

    .nils-msg-wrap.nils-bot .nils-bubble a {
      color: ${CONFIG.brandColor};
      text-decoration: none;
      font-weight: 500;
    }

    .nils-msg-wrap.nils-bot .nils-bubble a:hover {
      text-decoration: underline;
    }

    /* ── Source Link ── */
    .nils-source-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      padding: 5px 10px;
      background: #e8f2fc;
      border-radius: 8px;
      font-size: 12px;
      color: ${CONFIG.brandColor};
      text-decoration: none;
      font-weight: 500;
      transition: background 0.15s ease;
    }

    .nils-source-link:hover {
      background: #d4e8fa;
      text-decoration: none;
    }

    .nils-source-link svg {
      width: 13px;
      height: 13px;
      fill: ${CONFIG.brandColor};
      flex-shrink: 0;
    }

    /* ── Typing Indicator ── */
    .nils-typing-bubble {
      background: #f2f3f5;
      padding: 11px 14px;
      border-radius: 12px;
      border-bottom-left-radius: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nils-typing-bubble span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #9aabb8;
      animation: nils-typing-bounce 1.1s infinite;
    }

    .nils-typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
    .nils-typing-bubble span:nth-child(3) { animation-delay: 0.30s; }

    @keyframes nils-typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); background: ${CONFIG.brandColor}; }
    }

    /* ── Input Area ── */
    .nils-input-row {
      border-top: 1px solid #edf0f4;
      padding: 10px 11px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
      background: #fff;
      flex-shrink: 0;
    }

    .nils-chat-input {
      flex: 1;
      border: 1.5px solid #e2e8f0;
      border-radius: 9px;
      padding: 8px 10px;
      font-family: inherit;
      font-size: 13px;
      color: #1a202c;
      background: #f8fafc;
      resize: none;
      outline: none;
      min-height: 36px;
      max-height: 88px;
      line-height: 1.45;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .nils-chat-input::placeholder {
      color: #9ca3af;
    }

    .nils-chat-input:focus {
      border-color: ${CONFIG.brandColor};
      background: #fff;
      box-shadow: 0 0 0 3px rgba(4, 107, 210, 0.08);
    }

    .nils-chat-send {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: ${CONFIG.brandColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transition: all 0.14s ease;
    }

    .nils-chat-send:hover {
      background: ${CONFIG.brandColorHover};
      transform: scale(1.05);
    }

    .nils-chat-send:disabled {
      background: #b4cce8;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }

    .nils-chat-send svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* ── Footer ── */
    .nils-panel-footer {
      text-align: center;
      font-size: 10.5px;
      color: #bac4cf;
      padding: 8px 0 12px;
    }

    .nils-panel-footer a {
      color: #8892a0;
      text-decoration: none;
      font-weight: 500;
    }

    .nils-panel-footer a:hover {
      color: ${CONFIG.brandColor};
    }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #nils-chat-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 80px);
      }

      #nils-chat-panel.nils-open {
        bottom: 8px;
        ${CONFIG.position}: 8px;
      }

      .nils-panel-header { padding: 12px; }
      .nils-chat-messages { padding: 10px; }
      .nils-bubble { max-width: 90%; }
    }
  `;

  // ─── HTML STRUCTURE ────────────────────────────────────────────────
  function buildWidget() {
    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Widget container
    const container = document.createElement("div");
    container.id = "nils-chat-widget";
    container.innerHTML = `
      <!-- Side Tab -->
      <button id="nils-widget-tab" aria-label="Open support chat">
        <span class="nils-tab-dot"></span>
        ${CONFIG.tabLabel}
      </button>

      <!-- Chat Panel -->
      <div id="nils-chat-panel">
        <div class="nils-panel-header">
          <div class="nils-avatar">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div class="nils-header-info">
            <div class="nils-h-name">${CONFIG.brandName}</div>
            <div class="nils-h-status"><span class="nils-status-dot"></span>Online · here to help</div>
          </div>
          <button class="nils-btn-collapse" id="nils-btn-collapse" aria-label="Hide chat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Hide
          </button>
        </div>

        <div class="nils-chat-messages" id="nils-messages"></div>

        <div class="nils-input-row">
          <textarea
            class="nils-chat-input"
            id="nils-input"
            placeholder="${CONFIG.placeholderText}"
            rows="1"
          ></textarea>
          <button class="nils-chat-send" id="nils-send" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="none"/>
            </svg>
          </button>
        </div>
        <div class="nils-panel-footer">Powered by <a href="https://nilsdigital.com" target="_blank" rel="noopener">Nils Platform</a></div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // ─── MARKDOWN PARSER (lightweight) ─────────────────────────────────
  function parseMarkdown(text) {
    if (!text) return "";
    return text
      // escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // newlines to br
      .replace(/\n/g, "<br>");
  }

  // ─── CHAT LOGIC ────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let hasOpened = false;
  let conversationHistory = [];
  let sessionId = "sess_" + Math.random().toString(36).substring(2, 12);

  function openPanel() {
    const panel = document.getElementById("nils-chat-panel");
    const tab = document.getElementById("nils-widget-tab");

    panel.classList.add("nils-open");
    tab.classList.add("nils-hidden");
    isOpen = true;

    if (!hasOpened) {
      hasOpened = true;
      addBotMessage(CONFIG.welcomeMessage);
    }

    setTimeout(() => {
      const input = document.getElementById("nils-input");
      if (input) input.focus();
      scrollBottom();
    }, 300);
  }

  function collapsePanel() {
    const panel = document.getElementById("nils-chat-panel");
    const tab = document.getElementById("nils-widget-tab");

    panel.classList.remove("nils-open");
    tab.classList.remove("nils-hidden");
    isOpen = false;
  }

  function addBotMessage(text, sourceUrl, sourceTitle) {
    const msgs = document.getElementById("nils-messages");
    const wrap = document.createElement("div");
    wrap.className = "nils-msg-wrap nils-bot";

    let content = parseMarkdown(text);

    if (sourceUrl) {
      content += `
        <a class="nils-source-link" href="${sourceUrl}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          ${sourceTitle || "View article"}
        </a>`;
    }

    wrap.innerHTML = `<div class="nils-bubble">${content}</div>`;
    msgs.appendChild(wrap);
    scrollBottom();
  }

  function addUserMessage(text) {
    const msgs = document.getElementById("nils-messages");
    const wrap = document.createElement("div");
    wrap.className = "nils-msg-wrap nils-user";
    wrap.innerHTML = `<div class="nils-bubble">${escapeHtml(text)}</div>`;
    msgs.appendChild(wrap);
    scrollBottom();
  }

  function showTyping() {
    const msgs = document.getElementById("nils-messages");
    const wrap = document.createElement("div");
    wrap.className = "nils-msg-wrap nils-bot";
    wrap.id = "nils-typing-indicator";
    wrap.innerHTML = `<div class="nils-typing-bubble"><span></span><span></span><span></span></div>`;
    msgs.appendChild(wrap);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById("nils-typing-indicator");
    if (el) el.remove();
  }

  function scrollBottom() {
    const msgs = document.getElementById("nils-messages");
    if (msgs) msgs.scrollTo({ top: msgs.scrollHeight, behavior: "smooth" });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function sendMessage() {
    const input = document.getElementById("nils-input");
    const sendBtn = document.getElementById("nils-send");
    const text = input.value.trim();

    if (!text || isLoading) return;

    // Update UI
    addUserMessage(text);
    input.value = "";
    input.style.height = "auto";
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    // Track conversation
    conversationHistory.push({ role: "user", content: text });

    try {
      const response = await fetch(CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          history: conversationHistory.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      hideTyping();

      const answer = data.answer || data.response || data.output || CONFIG.fallbackMessage;
      const sourceUrl = data.sourceUrl || data.source_url || null;
      const sourceTitle = data.sourceTitle || data.source_title || null;

      addBotMessage(answer, sourceUrl, sourceTitle);
      conversationHistory.push({ role: "assistant", content: answer });
    } catch (err) {
      console.error("Chat error:", err);
      hideTyping();
      addBotMessage(
        "Something went wrong connecting to support. Please try again in a moment, or email us at **info@nilsdigital.com**."
      );
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ─── AUTO-RESIZE TEXTAREA ──────────────────────────────────────────
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 88) + "px";
  }

  // ─── INIT ──────────────────────────────────────────────────────────
  function init() {
    buildWidget();

    // Side tab → open panel
    document.getElementById("nils-widget-tab").addEventListener("click", openPanel);

    // Hide button → collapse panel
    document.getElementById("nils-btn-collapse").addEventListener("click", collapsePanel);

    // Send button
    document.getElementById("nils-send").addEventListener("click", sendMessage);

    // Textarea events
    const input = document.getElementById("nils-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener("input", () => autoResize(input));
  }

  // Boot when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
