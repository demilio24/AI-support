# Nils Platform AI Support Chatbot — Setup & Deployment Guide

> **Internal reference for Agentical AI**
> Last updated: March 2026

---

## Project Overview

White-labeled AI support chatbot embedded across Nils Platform (GoHighLevel) sub-accounts. Users click a chat bubble, ask questions, and get instant answers grounded in help articles and compliance docs. All GHL/LeadConnector branding is stripped — end users only see "Nils Platform."

### Architecture

```
User → widget.js (embedded via <script>) → n8n webhook
  → Gemini 2.5 Flash + File Search Store (RAG) → formatted response → widget
```

### Key Identifiers

| Item | Value |
|------|-------|
| File Search Store | `fileSearchStores/nils-platform-support-docs-4womudfm7mg8` |
| Store Display Name | Nils Platform Support Docs |
| Gemini Credential (n8n) | `Google Gemini(PaLM) Api account` (ID: `A2Qg4q87pqlKX1Fb`) |
| Chat Webhook Path | `/webhook/ghl-chat` (POST) |
| Gemini Model | `gemini-2.5-flash` |
| Client Domain | `help.nilsdigital.com` |
| Crawl Source | `help.leadconnectorhq.com/support/solutions` |

---

## File Structure

```
nils-support-chatbot/
├── widget/
│   ├── widget.js                  # Production chat widget (retractable)
│   └── index.html                 # Local test page
├── workflows/
│   ├── GHL Support Chatbot - Chat Handler.json
│   ├── Nils Chatbot - Knowledge Ingestion (LeadConnector Crawler).json
│   ├── Create Gemini File Search Store.json
│   └── Upload Files Manually - Gemini File Search Store.json
├── knowledge/
│   └── nils-faq-knowledge.txt     # 33 Q&A pairs (Spanish + English)
└── docs/
    ├── SETUP.md                   # This file
    └── Client_Getting_Started_Guide.docx
```

---

## Deployment Steps

### 1. File Search Store — DONE

Already created by Emilio via native n8n Gemini node.

- **Store name:** `fileSearchStores/nils-platform-support-docs-4womudfm7mg8`
- **Created:** 2026-03-04

### 2. Upload FAQ Content — DONE

FAQ file (`nils-faq-knowledge.txt`) uploaded via the manual upload workflow. The workflow uses n8n Chat Trigger with file upload enabled and the native Gemini node to upload to the store.

### 3. Ingest Help Articles

Import `Nils Chatbot - Knowledge Ingestion (LeadConnector Crawler).json` into self-hosted n8n.

**What it does:**
1. Fetches `help.leadconnectorhq.com/support/solutions` (server-rendered Freshdesk)
2. Discovers all folder and article links
3. Crawls each folder for nested articles
4. Deduplicates all discovered URLs
5. Fetches each article, strips HTML, preserves structure
6. Rebrands: LeadConnector/GHL/HighLevel → "Nils Platform"
7. Rewrites URLs: `help.leadconnectorhq.com` → `help.nilsdigital.com`
8. Uploads cleaned text to File Search Store (batched, 3 at a time)
9. Runs weekly (Monday 3 AM) + manual trigger available

**Configure before running:**
- Set `fileSearchStoreId` in the Config node to: `nils-platform-support-docs-4womudfm7mg8`
- Set `GOOGLE_AI_API_KEY` as n8n environment variable (self-hosted supports this)
- Or use Emilio's credential if running on his n8n cloud instance

**SPA Note:** `help.nilsdigital.com` is a Vue.js SPA (Firebase-backed) and cannot be crawled via HTTP requests. The LeadConnector help center has identical content and is server-rendered, so we crawl that instead. Branding replacement handles the rest.

### 4. Activate Chat Handler

The workflow `GHL Support Chatbot - Chat Handler.json` is already configured with Emilio's credential and the correct File Search Store ID.

**Nodes:**
1. **Webhook** — POST `/webhook/ghl-chat`, CORS enabled (`*`)
2. **Parse Input** — Validates message, builds conversation context (last 6 exchanges)
3. **Gemini + File Search** — Calls `gemini-2.5-flash` with File Search tool, system prompt enforces white-labeling, temperature 0.3
4. **Format Response** — Extracts answer + citations, rebrands text, rewrites citation URLs from `help.leadconnectorhq.com` → `help.nilsdigital.com`
5. **Respond to Webhook** — Returns `{ answer, sourceUrl, sourceTitle }`

Activate the workflow so the webhook goes live. Note the full webhook URL for widget.js.

### 5. Deploy Widget

**widget.js config (top of file):**
```javascript
const CONFIG = {
  webhookUrl: "YOUR_N8N_WEBHOOK_URL",  // ← Set to the live webhook URL
  // ... rest stays as-is
};
```

**Hosting on VPS (nginx):**
```nginx
location /widget/widget.js {
    alias /var/www/nils-chatbot/widget/widget.js;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=3600";
    types { application/javascript js; }
}
```

**Embed in GHL:**

Sub-account level: Settings → Custom Code → Body section:
```html
<script src="https://your-vps-domain.com/widget/widget.js"></script>
```

### 6. Test End-to-End

1. Open a GHL sub-account page (or `index.html` locally)
2. Click the chat bubble
3. Ask: "How do I set up payment methods?" (English)
4. Ask: "¿Cómo programo un resumen mensual?" (Spanish — should match FAQ)
5. Verify no GHL/LeadConnector branding in responses
6. Verify citation URLs point to `help.nilsdigital.com`
7. Test retract: Hover launcher → click × → verify "Help" tab appears → click tab → launcher returns
8. Test mobile: Chat window should be responsive and fill screen width

---

## Widget Features

- **Retractable**: Hover the launcher → × dismiss button appears → hides launcher → slim "Help" tab on screen edge → click to restore. Fixes overlap with GHL's own bottom-right buttons.
- **Multi-language**: Gemini responds in whatever language the user writes in
- **Markdown rendering**: Bold, lists, links, code blocks
- **Source citations**: Shows clickable article link below bot responses
- **Conversation context**: Sends last 10 messages for multi-turn continuity
- **Auto-resize textarea**: Input grows as user types
- **Mobile responsive**: Full-width chat on small screens
- **No AI branding**: Zero mention of AI, Gemini, or ChatGPT anywhere

---

## Costs

All costs are on Emilio's Google AI API key / billing.

| Component | Cost |
|-----------|------|
| File Search Store storage | Free |
| Search/retrieval at query time | Free |
| Initial document indexing | ~$0.01 per large document (one-time) |
| Gemini 2.5 Flash responses | ~$0.10/1M input, ~$0.40/1M output |
| **Estimated monthly (1K chats)** | **$2–5** |

---

## Maintenance

**Adding new help articles:** Run the ingestion workflow manually or wait for the weekly schedule. New articles on `help.leadconnectorhq.com` get auto-discovered.

**Adding new FAQ/compliance docs:** Use the `Upload Files Manually` workflow in Emilio's n8n — trigger the chat, attach the file, it uploads to the store.

**Updating the widget:** Push changes to GitHub → pull on VPS → nginx serves the updated file. The GHL script tag stays the same.

**Monitoring:** Check n8n execution logs for failed ingestions or chat errors. The ingestion summary node outputs success/failure counts.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Widget not appearing | Check browser console. Verify script URL is HTTPS and accessible. |
| No responses / timeout | Test webhook URL with curl. Check n8n workflow is active. |
| Generic answers (not grounded) | Verify File Search Store has documents. Run ingestion workflow. |
| GHL branding leaking | Format Response node handles this. If persistent, tighten system prompt. |
| CORS errors | Webhook node has `allowedOrigins: *`. Also set nginx CORS headers. |
| Ingestion finds 0 articles | Check if `help.leadconnectorhq.com` structure changed. Inspect Extract All Links output. |
| FAQ not found by chatbot | Verify FAQ was uploaded to the correct store. Test with a direct question from the FAQ. |
| Widget overlaps GHL buttons | Users can retract the widget via the × dismiss button on hover. |
