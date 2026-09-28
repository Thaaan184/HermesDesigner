import express from 'express';

const app = express();
app.use(express.json({ limit: '4mb' }));

const NINEROUTER_URL = process.env.NINEROUTER_URL || 'http://100.96.207.8:20128';
const MODEL = process.env.AI_MODEL || 'Hermes';
const API_KEY = process.env.NINEROUTER_API_KEY || 'sk-hermesdesigner-vm-key-2026';

app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  try {
    const upstream = await fetch(`${NINEROUTER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a professional graphic designer. Generate ONLY valid raw JSON. No markdown code blocks, no explanation, no ``` prefix/suffix. Output must start with { and end with }.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 4096,
        stream: false,
      }),
    });
    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(502).json({ error: `Upstream error: ${err}` });
    }
    const data = await upstream.json();
    const result = data.choices?.[0]?.message?.content ?? '';
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL, router: NINEROUTER_URL }));

const PORT = parseInt(process.env.API_PORT || '4000', 10);
app.listen(PORT, () => console.log(`[API] Hermes Design API on port ${PORT} -> ${NINEROUTER_URL}`));
