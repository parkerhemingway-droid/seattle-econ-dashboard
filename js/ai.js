// Databricks Model Serving integration for AI signals and narrative summaries.
// Databricks serving endpoints expose an OpenAI-compatible /chat/completions API.
// Credentials are stored only in localStorage — never sent anywhere except your workspace.

const AI = (() => {
  let token    = localStorage.getItem('db_token')    || '';
  let workspace = localStorage.getItem('db_workspace') || '';
  let endpoint  = localStorage.getItem('db_endpoint')  || '';

  function setConfig(cfg) {
    workspace = (cfg.workspace || '').trim().replace(/\/$/, '');
    endpoint  = (cfg.endpoint  || '').trim();
    token     = (cfg.token     || '').trim();
    localStorage.setItem('db_workspace', workspace);
    localStorage.setItem('db_endpoint',  endpoint);
    localStorage.setItem('db_token',     token);
  }

  function hasKey() {
    return !!(token && workspace && endpoint);
  }

  // Databricks serving endpoints use the OpenAI chat/completions format.
  // URL: https://<workspace>/serving-endpoints/<endpoint>/invocations
  async function callModel(prompt, maxTokens = 120) {
    if (!hasKey()) return null;
    const url = `${workspace}/serving-endpoints/${endpoint}/invocations`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Databricks AI error:', res.status, err);
        return null;
      }
      const data = await res.json();
      // OpenAI-compatible response shape
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.warn('Databricks fetch error:', e);
      return null;
    }
  }

  // Test connectivity — used to show status after saving config
  async function testConnection() {
    const result = await callModel('Reply with only the word "ok".', 10);
    return result !== null;
  }

  // One-line signal for a metric card
  async function metricSignal(metric) {
    const changeDir = metric.yoyChange > 0 ? 'up' : 'down';
    const prompt = `You are a concise economic analyst. In 1–2 sentences (max 25 words), give a signal/interpretation for this metric in the context of the Greater Seattle economy.

Metric: ${metric.name}
Value: ${metric.value}${metric.unit}
Period change: ${metric.periodChange > 0 ? '+' : ''}${metric.periodChange}${metric.unit}
Year-over-year: ${changeDir} ${Math.abs(metric.yoyChange)}${metric.unit}
Date: ${metric.date}

Be direct. No hedging. Focus on what it means for Seattle.`;
    return callModel(prompt, 80);
  }

  // Narrative summary for Today dashboard
  async function todayNarrative(context) {
    const metricsText = context.keyMetrics.map(m => `- ${m.name}: ${m.value} (${m.change})`).join('\n');
    const prompt = `You are a sharp economic analyst covering the Greater Seattle metro area. Write a 3-4 sentence daily market summary for ${context.date} based on these key data points:

${metricsText}

Focus on Seattle-specific implications. Highlight the most important signal. Be concrete, not vague.`;
    return callModel(prompt, 200);
  }

  // Housing section narrative
  async function housingNarrative() {
    const prompt = `Write a 3-4 sentence housing market narrative for the Greater Seattle area as of June 2026. Key facts: median sale price $875K (+4.5% YoY), active inventory 3,241 homes (highest since 2019, +24% YoY), days on market 18 (up from 13 YoY), mortgage rate 6.82%, price-to-income ratio 10.4x. Is this a buyer's or seller's market? What should buyers/sellers know?`;
    return callModel(prompt, 200);
  }

  // Batch signals — sequential with small delay to avoid hammering the endpoint
  async function batchSignals(metrics, onSignal) {
    for (const metric of metrics) {
      const signal = await metricSignal(metric);
      if (signal) onSignal(metric.id, signal);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Restore saved config fields into the sidebar inputs on page load
  function restoreInputs() {
    const ws = document.getElementById('db-workspace-input');
    const ep = document.getElementById('db-endpoint-input');
    if (ws && workspace) ws.value = workspace;
    if (ep && endpoint)  ep.value = endpoint;
    // Don't restore token into a password field for security
  }

  return { setConfig, hasKey, testConnection, metricSignal, todayNarrative, housingNarrative, batchSignals, restoreInputs };
})();
