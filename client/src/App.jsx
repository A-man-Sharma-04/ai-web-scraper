import { useState } from 'react';

const EXAMPLE_URL = 'https://en.wikipedia.org/wiki/Web_scraping';

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSummarize(e) {
    e.preventDefault();
    const target = url.trim();
    if (!target || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed with HTTP ${res.status}.`);
      }
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="badge">⚡ AI Web Scraper</span>
        <h1>Summarize any web page</h1>
        <p className="subtitle">
          Paste a URL below — the backend scrapes the page&rsquo;s main text and a free Groq LLM
          turns it into a short summary.
        </p>
      </header>

      <form className="url-form" onSubmit={handleSummarize}>
        <input
          className="url-input"
          type="text"
          placeholder="https://example.com/interesting-article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          aria-label="Web page URL"
        />
        <button className="submit-btn" type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" /> Working…
            </>
          ) : (
            'Summarize'
          )}
        </button>
      </form>

      <button
        type="button"
        className="example-chip"
        onClick={() => setUrl(EXAMPLE_URL)}
        disabled={loading}
      >
        Try an example: en.wikipedia.org/wiki/Web_scraping
      </button>

      {loading && (
        <section className="card loading-card" aria-live="polite">
          <div className="loading-head">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <span>Scraping the page and generating a summary…</span>
          </div>
          <div className="skeleton">
            <div className="skeleton-line w-70" />
            <div className="skeleton-line w-100" />
            <div className="skeleton-line w-90" />
            <div className="skeleton-line w-60" />
          </div>
        </section>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <strong>Something went wrong:</strong> {error}
        </div>
      )}

      {result && (
        <section className="card result-card">
          <h2 className="result-title">{result.title}</h2>
          <div className="result-meta">
            <a href={result.url} target="_blank" rel="noreferrer">
              {hostnameOf(result.url)}
            </a>
            <span className="dot">•</span>
            <span>{result.wordCount.toLocaleString()} words scraped</span>
          </div>
          <div className="summary-block">
            <div className="summary-label">
              AI Summary <span className="groq-chip">Groq · Llama 3.3</span>
            </div>
            <p className="summary-text">{result.summary}</p>
          </div>
        </section>
      )}

      <footer className="footer">
        Built with React + Vite, Express, Cheerio and Groq ·{' '}
        <a href="https://github.com/A-man-Sharma-04/ai-web-scraper" target="_blank" rel="noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}
