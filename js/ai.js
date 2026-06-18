// Claude API integration for AI-generated metric signals and narrative summaries.
// API key is stored in localStorage (never sent anywhere except api.anthropic.com).

const AI = (() => {
  let apiKey = localStorage.getItem('claude_api_key') || '';

  function setKey(key) {
    apiKey = key.trim();
    localStorage.setItem('claude_api_key', apiKey);
  }

  function hasKey() {
    return !!apiKey;
  }

  async function callClaude(prompt, maxTokens = 120) {
    if (!apiKey) return null;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Claude API error:', err);
        return null;
      }
      const data = await res.json();
      return data.content?.[0]?.text?.trim() || null;
    } catch (e) {
      console.warn('Claude fetch error:', e);
      return null;
    }
  }

  // Generate a one-line signal for a single metric card
  async function metricSignal(metric) {
    const changeDir = metric.yoyChange > 0 ? 'up' : 'down';
    const prompt = `You are a concise economic analyst. In 1–2 sentences (max 25 words), give a signal/interpretation for this metric in the context of the Greater Seattle economy.

Metric: ${metric.name}
Value: ${metric.value}${metric.unit}
Period change: ${metric.periodChange > 0 ? '+' : ''}${metric.periodChange}${metric.unit}
Year-over-year: ${changeDir} ${Math.abs(metric.yoyChange)}${metric.unit}
Date: ${metric.date}

Be direct. No hedging phrases like "it's worth noting". Focus on what it means for Seattle.`;
    return callClaude(prompt, 80);
  }

  // Generate a narrative summary for Today dashboard
  async function todayNarrative(context) {
    const metricsText = context.keyMetrics.map(m => `- ${m.name}: ${m.value} (${m.change})`).join('\n');
    const prompt = `You are a sharp economic analyst covering the Greater Seattle metro area. Write a 3-4 sentence daily market summary for ${context.date} based on these key data points:

${metricsText}

Focus on Seattle-specific implications. Highlight the most important signal. Be concrete, not vague.`;
    return callClaude(prompt, 200);
  }

  // Generate housing section narrative
  async function housingNarrative() {
    const prompt = `Write a 3-4 sentence housing market narrative for the Greater Seattle area as of June 2026. Key facts: median sale price $875K (+4.5% YoY), active inventory 3,241 homes (highest since 2019, +24% YoY), days on market 18 (up from 13 YoY), mortgage rate 6.82%, price-to-income ratio 10.4x. Is this a buyer's or seller's market? What should buyers/sellers know?`;
    return callClaude(prompt, 200);
  }

  // Generate signals for a batch of metrics (to avoid rate limiting, done sequentially with delay)
  async function batchSignals(metrics, onSignal) {
    for (const metric of metrics) {
      const signal = await metricSignal(metric);
      if (signal) onSignal(metric.id, signal);
      await new Promise(r => setTimeout(r, 300)); // small delay to avoid hammering
    }
  }

  return { setKey, hasKey, metricSignal, todayNarrative, housingNarrative, batchSignals };
})();
