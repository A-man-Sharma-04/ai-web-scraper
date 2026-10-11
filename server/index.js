import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { summarizeHandler } from '../lib/handler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.post('/api/summarize', summarizeHandler);

app.listen(PORT, () => {
  console.log(`✅ Backend ready on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn(
      '⚠️  GROQ_API_KEY is not set — add it to the .env file in the project root (see README).'
    );
  }
});
