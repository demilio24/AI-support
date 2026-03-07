# Nils Platform - AI Support Chatbot

White-labeled AI support chatbot for Nils Platform (GoHighLevel). Embedded via a single `<script>` tag across all sub-accounts.

## Architecture

- **Widget**: Vanilla JS chat widget (`widget/widget.js`) — retractable, multi-language, no AI branding
- **Backend**: n8n workflows calling Google Gemini 2.5 Flash with File Search (RAG)
- **Knowledge Base**: Google File Search Store — auto-ingested from help articles + manually uploaded FAQ

## File Search Store

- **Store ID**: `fileSearchStores/nils-platform-support-docs-4womudfm7mg8`
- **Sources**: LeadConnector help center (auto-crawled weekly) + Spanish/English FAQ (33 Q&A pairs)

## Quick Start

1. File Search Store — already created ✅
2. FAQ uploaded — already done ✅
3. Import `workflows/Nils Chatbot - Knowledge Ingestion (LeadConnector Crawler).json` into n8n and run to crawl help articles
4. Import `workflows/GHL Support Chatbot - Chat Handler.json` into n8n and activate
5. Set the webhook URL in `widget/widget.js`
6. Host widget on VPS and embed via `<script>` tag in GHL
7. See `docs/SETUP.md` for full deployment instructions

## Workflows

| Workflow | Purpose |
|----------|---------|
| Chat Handler | Webhook → Gemini + File Search → formatted response |
| Knowledge Ingestion | Crawls LeadConnector help center → rebrands → uploads to store |
| Create File Search Store | One-click store creation (already run) |
| Upload Files Manually | Drag-and-drop file upload to store via n8n chat UI |
