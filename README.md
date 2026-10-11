# ⚡ AI Web Scraper

Paste any web page URL → the backend scrapes the page's main text → a **free** Groq LLM returns a short AI summary.

> **Live demo:** _add your Vercel URL here after deploying — see [Deployment](#-deployment) below._

## ✨ Features

- 🔗 Paste a URL and click **Summarize**
- 🕷 Backend fetches the page and extracts readable text (title, meta description, main content) with Cheerio
- 🤖 Sends the text to Groq's free API (`openai/gpt-oss-120b`) for a 3–5 sentence summary
- ⏳ Animated loading state (spinner + skeleton) while the backend works
- 🚨 Friendly error banners for invalid URLs, unreachable sites, and missing API keys
- 🧩 One shared request handler used by both the local Express server and the Vercel serverless function

## 🧱 Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React 18 + Vite (plain CSS, no UI framework) |
| Backend   | Node.js + Express (local) / Vercel Functions (prod) |
| Scraping  | native `fetch` + Cheerio                     |
| AI        | Groq API (free tier, OpenAI-compatible REST) |

## 🗂 Project Structure

```
ai-web-scraper/
├── client/            # React frontend sources (Vite root)
│   ├── index.html
│   └── src/           # App.jsx, main.jsx, styles.css
├── server/            # Express backend (local development)
│   └── index.js
├── api/               # Vercel serverless function (production)
│   └── summarize.js
├── lib/               # Shared core logic (scraper, Groq client, request handler)
├── vite.config.js     # Vite config (root: client/, dev proxy → :3001)
├── vercel.json        # Vercel build config (builds client, serves api/ functions)
├── .env.example       # Template for your .env file
└── package.json       # Single package.json for frontend + backend
```

## 🚀 Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org) **18 or newer**

### 1. Get a FREE Groq API key

1. Go to **https://console.groq.com/keys** (sign up is free, no credit card).
2. Click **Create API Key** and copy it.

### 2. Put your key in a `.env` file

Create your `.env` file **in the project root** (the same folder as `package.json` — *not* inside `client/` or `server/`):

```bash
cp .env.example .env
```

Then open `.env` and paste your key:

```env
GROQ_API_KEY=gsk_your_real_key_here
```

> ⚠️ `.env` is git-ignored, so your key is never committed. The backend loads it automatically via `dotenv`.

### 3. Install dependencies

```bash
npm install
```

(one install for everything — frontend and backend share a single `package.json`)

### 4. Run both frontend and backend

```bash
npm run dev
```

This starts both processes together:

- **Backend (Express API):** http://localhost:3001
- **Frontend (Vite dev server):** http://localhost:5173

Open **http://localhost:5173** in your browser and summarize away.

### Running them separately (two terminals)

If you prefer not to use `npm run dev` (which uses `concurrently`):

```bash
# Terminal 1 — backend on :3001
npm run dev:server

# Terminal 2 — frontend on :5173 (proxies /api to :3001)
npm run dev:client
```

## 📡 API Reference

### `POST /api/summarize`

| Field | Type   | Description                    |
| ----- | ------ | ------------------------------ |
| `url` | string | The web page URL to summarize  |

**Success response (200):**

```json
{
  "url": "https://en.wikipedia.org/wiki/Web_scraping",
  "title": "Web scraping - Wikipedia",
  "description": "Web scraping is the practice of...",
  "wordCount": 8423,
  "model": "openai/gpt-oss-120b",
  "summary": "Web scraping is the practice of programmatically extracting data from websites..."
}
```

**Error responses** all return `{ "error": "human-readable message" }`:

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 400    | Missing or malformed URL                    |
| 422    | Page had no readable text / wasn't HTML     |
| 500    | `GROQ_API_KEY` missing, or Groq auth failed |
| 502    | Site unreachable, or the Groq API failed    |

Quick test with `curl`:

```bash
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Web_scraping"}'
```

## ▲ Deployment (Vercel)

The repo deploys to Vercel as a **single project** — `vercel.json` builds the React client into static files (`dist/`) and exposes `api/summarize.js` as a serverless function at `/api/summarize`, so no CORS is needed in production.

1. Push the repo to GitHub (or fork it).
2. Go to **https://vercel.com/new** and **Import** the repository.
3. **Root Directory**: leave it as `./` (the project root). Vercel sometimes auto-detects `client/` as the root in monorepos — if you see that, set it back to `./`.
4. Under **Environment Variables**, add:
   - Name: `GROQ_API_KEY`
   - Value: your Groq key (`gsk_...`)
5. Click **Deploy** — no other settings need changing.
6. Your live URL (e.g. `https://ai-web-scraper-<your-name>.vercel.app`) appears when the build finishes. Add it to the *Live demo* line at the top of this README.

Already imported the project? Check **Settings → General → Root Directory** is `./`, then hit **Redeploy** on the latest deployment.

## ⚠️ Notes & Limitations

- The scraper does a **plain HTML fetch** — it does not render JavaScript or bypass bot protections (Cloudflare, paywalls, login walls). For JS-heavy sites you'd add a headless browser such as Playwright.
- Page text is truncated to **12,000 characters** before being sent to the LLM — plenty for a short summary and keeps requests fast.
- Groq's free tier has rate limits (roughly 30 requests/min). This demo app is not for bulk scraping.
- Your API key lives only in `.env` (local) or Vercel environment variables (prod) — never in the frontend code.
