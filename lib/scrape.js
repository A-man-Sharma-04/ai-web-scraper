import * as cheerio from 'cheerio';

const MAX_TEXT_CHARS = 12000;
const FETCH_TIMEOUT_MS = 15000;

/**
 * Fetches a web page and extracts its main readable text.
 * Intentionally simple: plain HTML fetch, no JS rendering or bot-protection bypass.
 */
export async function scrapePage(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // Drop everything that isn't page content
  $(
    'script, style, noscript, iframe, svg, nav, header, footer, aside, form, button, [aria-hidden="true"]'
  ).remove();

  const title =
    $('title').text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    new URL(url).hostname;

  const description =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const source = $('main').length ? $('main') : $('article').length ? $('article') : $('body');
  const text = source
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_CHARS);

  if (!text) {
    throw httpError(
      422,
      'No readable text found on that page — it may be rendered entirely with JavaScript.'
    );
  }

  return {
    title,
    description,
    text,
    textLength: text.length,
    wordCount: text.split(/\s+/).length,
  };
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AIWebScraper/1.0; +https://github.com/A-man-Sharma-04/ai-web-scraper)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'the request timed out' : err.message;
    throw httpError(502, `Could not reach the site (${reason}). Check the URL and try again.`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw httpError(502, `The site responded with HTTP ${res.status} ${res.statusText}.`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType && !contentType.includes('html')) {
    throw httpError(422, `That URL does not point to an HTML page (got "${contentType}").`);
  }

  return res.text();
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
