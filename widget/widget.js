(function () {
  "use strict";

  // ─── CONFIG ────────────────────────────────────────────────────────
  const CONFIG = {
    webhookUrl: "https://nilsdigital.app.n8n.cloud/webhook-test/ghl-chat", // Replace with your n8n webhook URL
    brandName: "Nils Platform",
    brandColor: "#046BD2",
    brandColorHover: "#0357A8",
    brandColorLight: "#E8F2FC",
    placeholderText: "Ask a question...",
    welcomeMessage:
      "Hi! I'm your platform support assistant. Ask me anything about the platform, compliance, or how to get things done.",
    fallbackMessage:
      "I couldn't find a clear answer to that. Please email us at **info@nilsdigital.com** and we'll get back to you shortly.",
    position: "right", // 'left' or 'right'
    zIndex: 999999,
  };

  // ─── STYLES ────────────────────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    #nils-chat-widget * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* ── Launcher Button ── */
    #nils-chat-launcher {
      position: fixed;
      bottom: 24px;
      ${CONFIG.position}: 24px;
      z-index: ${CONFIG.zIndex};
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, ${CONFIG.brandColor} 0%, #0357A8 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(4, 107, 210, 0.4), 0 1px 3px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), 
                  box-shadow 0.25s ease,
                  background 0.2s ease;
    }

    #nils-chat-launcher:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 22px rgba(4, 107, 210, 0.5), 0 2px 6px rgba(0,0,0,0.1);
    }

    /* ── Dismiss button (hide launcher) ── */
    #nils-chat-dismiss {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #6b7280;
      border: 2px solid #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 0.2s ease, transform 0.2s ease, background 0.15s ease;
      z-index: ${CONFIG.zIndex + 1};
    }

    #nils-chat-launcher:hover #nils-chat-dismiss,
    #nils-chat-dismiss:hover {
      opacity: 1;
      transform: scale(1);
    }

    #nils-chat-dismiss:hover {
      background: #ef4444;
    }

    #nils-chat-dismiss svg {
      width: 9px;
      height: 9px;
      fill: #ffffff;
    }

    /* ── Retracted tab (bring launcher back) ── */
    #nils-chat-retracted-tab {
      position: fixed;
      bottom: 24px;
      ${CONFIG.position}: 0;
      z-index: ${CONFIG.zIndex};
      background: linear-gradient(135deg, ${CONFIG.brandColor} 0%, #0357A8 100%);
      color: #ffffff;
      border: none;
      cursor: pointer;
      padding: 10px 14px 10px 12px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.2px;
      display: none;
      align-items: center;
      gap: 6px;
      ${CONFIG.position === "right" ? "border-radius: 10px 0 0 10px;" : "border-radius: 0 10px 10px 0;"}
      box-shadow: 0 4px 12px rgba(4, 107, 210, 0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      writing-mode: horizontal-tb;
    }

    #nils-chat-retracted-tab:hover {
      ${CONFIG.position === "right" ? "transform: translateX(-4px);" : "transform: translateX(4px);"}
      box-shadow: 0 6px 20px rgba(4, 107, 210, 0.4);
    }

    #nils-chat-retracted-tab svg {
      width: 14px;
      height: 14px;
      fill: #ffffff;
      flex-shrink: 0;
    }

    #nils-chat-launcher svg {
      width: 24px;
      height: 24px;
      fill: #ffffff;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    #nils-chat-launcher .nils-icon-close {
      position: absolute;
      opacity: 0;
      transform: rotate(-90deg) scale(0.6);
    }

    #nils-chat-launcher.nils-open .nils-icon-chat {
      opacity: 0;
      transform: rotate(90deg) scale(0.6);
    }

    #nils-chat-launcher.nils-open .nils-icon-close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* ── Chat Window ── */
    #nils-chat-window {
      position: fixed;
      bottom: 96px;
      ${CONFIG.position}: 24px;
      z-index: ${CONFIG.zIndex - 1};
      width: 370px;
      max-width: calc(100vw - 32px);
      height: 450px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #nils-chat-window.nils-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* ── Header ── */
    .nils-chat-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, ${CONFIG.brandColor} 0%, #0357A8 100%);
      color: #ffffff;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nils-chat-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nils-chat-header-avatar svg {
      width: 20px;
      height: 20px;
      fill: #ffffff;
    }

    .nils-chat-header-info {
      flex: 1;
      min-width: 0;
    }

    .nils-chat-header-title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.2px;
      line-height: 1.3;
    }

    .nils-chat-header-subtitle {
      font-size: 11.5px;
      opacity: 0.75;
      margin-top: 1px;
      font-weight: 400;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .nils-online-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
      display: inline-block;
      flex-shrink: 0;
    }

    /* ── Messages Area ── */
    .nils-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      background: #fafbfc;
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

    /* ── Message Bubbles ── */
    .nils-msg {
      max-width: 70%;
      padding: 12px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      color: #1a1a1a;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      animation: nils-msg-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes nils-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .nils-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 5px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .nils-msg-user {
      align-self: flex-end;
      background: ${CONFIG.brandColor};
      color: #ffffff;
      border-bottom-right-radius: 5px;
      box-shadow: 0 1px 3px rgba(4, 107, 210, 0.25);
    }

    .nils-msg-bot p {
      margin-bottom: 9px;
      word-wrap: break-word;
    }
    .nils-msg-bot p:last-child { margin-bottom: 0; }
    .nils-msg-bot p:first-child { margin-top: 0; }

    .nils-msg-bot strong { font-weight: 600; }

    .nils-msg-bot a {
      color: ${CONFIG.brandColor};
      text-decoration: none;
      font-weight: 500;
    }

    .nils-msg-bot a:hover {
      text-decoration: underline;
    }

    .nils-msg-bot ul, .nils-msg-bot ol {
      margin: 4px 0;
      padding-left: 18px;
    }

    .nils-msg-bot li {
      margin-bottom: 3px;
    }

    .nils-msg-bot code {
      background: #f1f3f5;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12.5px;
      font-family: 'SF Mono', Menlo, monospace;
    }

    /* ── Source Link ── */
    .nils-source-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      padding: 5px 10px;
      background: ${CONFIG.brandColorLight};
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
    .nils-typing {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 12px 18px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      border-bottom-left-radius: 5px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .nils-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9ca3af;
      animation: nils-bounce 1.2s ease-in-out infinite;
    }

    .nils-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .nils-typing-dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes nils-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    /* ── Input Area ── */
    .nils-chat-input-area {
      padding: 12px 14px;
      border-top: 1px solid #eef0f2;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
      background: #ffffff;
    }

    .nils-chat-input {
      flex: 1;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13.5px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      resize: none;
      outline: none;
      max-height: 80px;
      line-height: 1.4;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      color: #1a1a1a;
      background: #f9fafb;
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
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, ${CONFIG.brandColor} 0%, #0357A8 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .nils-chat-send:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(4, 107, 210, 0.35);
    }

    .nils-chat-send:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .nils-chat-send svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
    }

    /* ── Footer ── */
    .nils-chat-footer {
      text-align: center;
      padding: 6px 14px;
      font-size: 10.5px;
      color: #b0b8c4;
      background: #f9fafb;
      border-top: 1px solid #eef0f2;
      letter-spacing: 0.1px;
    }

    .nils-chat-footer a {
      color: #8892a0;
      text-decoration: none;
      font-weight: 500;
    }

    .nils-chat-footer a:hover {
      color: ${CONFIG.brandColor};
    }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #nils-chat-window {
        width: calc(100vw - 16px);
        height: calc(100vh - 120px);
        bottom: 88px;
        ${CONFIG.position}: 8px;
        border-radius: 14px;
      }
      .nils-chat-header { padding: 14px 16px; }
      .nils-chat-messages { padding: 16px 16px; }
      .nils-msg { max-width: 80%; }
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
      <!-- Launcher -->
      <button id="nils-chat-launcher" aria-label="Open support chat">
        <span id="nils-chat-dismiss" title="Hide chat" aria-label="Hide chat widget">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </span>
        <svg class="nils-icon-chat" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
        </svg>
        <svg class="nils-icon-close" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Retracted Tab (shown when launcher is hidden) -->
      <button id="nils-chat-retracted-tab" aria-label="Show support chat">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
        Help
      </button>

      <!-- Chat Window -->
      <div id="nils-chat-window">
        <div class="nils-chat-header">
          <div class="nils-chat-header-avatar">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>
          </div>
          <div class="nils-chat-header-info">
            <div class="nils-chat-header-title">${CONFIG.brandName}</div>
            <div class="nils-chat-header-subtitle"><span class="nils-online-dot"></span> Online · Replies instantly</div>
          </div>
        </div>
        <div class="nils-chat-messages" id="nils-messages"></div>
        <div class="nils-chat-input-area">
          <textarea 
            class="nils-chat-input" 
            id="nils-input" 
            placeholder="${CONFIG.placeholderText}" 
            rows="1"
          ></textarea>
          <button class="nils-chat-send" id="nils-send" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="nils-chat-footer">Powered by <a href="https://nilsdigital.com" target="_blank" rel="noopener">${CONFIG.brandName}</a></div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // ─── MARKDOWN PARSER (lightweight) ─────────────────────────────────
  function parseMarkdown(text) {
    if (!text) return "";
    let html = text
      // escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // inline code
      .replace(/`(.+?)`/g, "<code>$1</code>")
      // links
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );

    // Split into paragraphs
    const blocks = html.split(/\n\n+/);
    return blocks
      .map((block) => {
        // Unordered list
        if (/^[\-\*] /m.test(block)) {
          const items = block
            .split(/\n/)
            .filter((l) => l.trim())
            .map((l) => `<li>${l.replace(/^[\-\*]\s+/, "")}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
        // Ordered list
        if (/^\d+\. /m.test(block)) {
          const items = block
            .split(/\n/)
            .filter((l) => l.trim())
            .map((l) => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`)
            .join("");
          return `<ol>${items}</ol>`;
        }
        // Regular paragraph
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
  }

  // ─── CHAT LOGIC ────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let isRetracted = false;
  let conversationHistory = [];
  let sessionId = "sess_" + Math.random().toString(36).substring(2, 12);

  function retractWidget() {
    // Close chat if open
    if (isOpen) {
      toggleChat();
    }
    const launcher = document.getElementById("nils-chat-launcher");
    const tab = document.getElementById("nils-chat-retracted-tab");
    launcher.style.display = "none";
    tab.style.display = "flex";
    isRetracted = true;
  }

  function restoreWidget() {
    const launcher = document.getElementById("nils-chat-launcher");
    const tab = document.getElementById("nils-chat-retracted-tab");
    launcher.style.display = "flex";
    tab.style.display = "none";
    isRetracted = false;
  }

  function toggleChat() {
    const launcher = document.getElementById("nils-chat-launcher");
    const window_ = document.getElementById("nils-chat-window");
    isOpen = !isOpen;
    launcher.classList.toggle("nils-open", isOpen);
    window_.classList.toggle("nils-visible", isOpen);

    if (isOpen) {
      // Add welcome message on first open
      const msgs = document.getElementById("nils-messages");
      if (msgs.children.length === 0) {
        addBotMessage(CONFIG.welcomeMessage);
      }
      setTimeout(() => document.getElementById("nils-input").focus(), 300);
    }
  }

  function addBotMessage(text, sourceUrl, sourceTitle) {
    const msgs = document.getElementById("nils-messages");
    const msgEl = document.createElement("div");
    msgEl.className = "nils-msg nils-msg-bot";

    let content = parseMarkdown(text);

    if (sourceUrl) {
      content += `
        <a class="nils-source-link" href="${sourceUrl}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          ${sourceTitle || "View article"}
        </a>`;
    }

    msgEl.innerHTML = content;
    msgs.appendChild(msgEl);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    const msgs = document.getElementById("nils-messages");
    const msgEl = document.createElement("div");
    msgEl.className = "nils-msg nils-msg-user";
    msgEl.textContent = text;
    msgs.appendChild(msgEl);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById("nils-messages");
    const typing = document.createElement("div");
    typing.className = "nils-typing";
    typing.id = "nils-typing-indicator";
    typing.innerHTML = `
      <div class="nils-typing-dot"></div>
      <div class="nils-typing-dot"></div>
      <div class="nils-typing-dot"></div>
    `;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("nils-typing-indicator");
    if (el) el.remove();
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
          history: conversationHistory.slice(-10), // Last 10 messages for context
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
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }

  // ─── INIT ──────────────────────────────────────────────────────────
  function init() {
    buildWidget();

    // Event listeners
    document
      .getElementById("nils-chat-launcher")
      .addEventListener("click", toggleChat);

    document.getElementById("nils-send").addEventListener("click", sendMessage);

    // Dismiss button — hide the launcher, show edge tab
    document.getElementById("nils-chat-dismiss").addEventListener("click", (e) => {
      e.stopPropagation(); // Don't trigger launcher click
      retractWidget();
    });

    // Retracted tab — restore the launcher
    document.getElementById("nils-chat-retracted-tab").addEventListener("click", restoreWidget);

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
