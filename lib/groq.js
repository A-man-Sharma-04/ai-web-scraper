const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT =
  'You summarize web pages. Reply with a clear, factual summary of 3-5 sentences based only on the given content. ' +
  'Do not invent information. Reply with the summary only — no preamble, no bullet points.';

/**
 * Calls the Groq chat completions API (free tier) to summarize extracted page text.
 * Model is configurable via the GROQ_MODEL env var.
 */
export async function summarizeText(text, { title } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw httpError(
      500,
      'GROQ_API_KEY is not configured. Add your free key from console.groq.com to the .env file (see README).'
    );
  }
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  let res;
  try {
    res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Summarize the following web page.\n\nPage title: ${title || 'unknown'}\n\nPage content:\n${text}`,
          },
        ],
      }),
    });
  } catch (err) {
    throw httpError(502, `Could not reach the Groq API: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const detail = body ? ` — ${body.slice(0, 300)}` : '';
    throw httpError(res.status === 401 ? 500 : 502, `Groq API error (HTTP ${res.status})${detail}`);
  }

  const data = await res.json();
  const summary = data.choices?.[0]?.message?.content?.trim();
  if (!summary) {
    throw httpError(502, 'Groq returned an empty summary. Try again.');
  }
  return summary;
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
