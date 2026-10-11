import { summarizeHandler } from '../lib/handler.js';

// Vercel serverless function — same logic as the Express route.
export const config = { maxDuration: 30 };

export default summarizeHandler;
