import { scrapePage } from './scrape.js';
import { summarizeText } from './groq.js';

/**
 * Shared POST /api/summarize handler, used by both:
 *   - the Express server (server/index.js) for local development
 *   - the Vercel serverless function (api/summarize.js) for production
 *
 * Works with any req/res pair that supports req.body (object or JSON string),
 * res.setHeader(), res.status() and res.json().
 */
export async function summarizeHandler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const body = typeof req.body === 'string' ? parseJson(req.body) : req.body || {};
    const url = (body.url || '').trim();

    if (!url) {
      return res
        .status(400)
        .json({ error: 'Missing URL. Send JSON like { "url": "https://example.com" }.' });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res
        .status(400)
        .json({ error: `"${url}" is not a valid URL. Include the http:// or https:// part.` });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return res.status(400).json({ error: 'Only http:// and https:// URLs are supported.' });
    }

    const page = await scrapePage(parsed.href);
    const { summary, model } = await summarizeText(page.text, { title: page.title });

    return res.status(200).json({
      url: parsed.href,
      title: page.title,
      description: page.description,
      wordCount: page.wordCount,
      model,
      summary,
    });
  } catch (err) {
    console.error('[summarize] request failed:', err.message);
    return res
      .status(err.status || 500)
      .json({ error: err.message || 'Something went wrong while summarizing the page.' });
  }
}

function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
