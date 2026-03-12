/**
 * JavaScript Static Code Analyzer — Express Server
 */

const express = require('express');
const cors = require('cors');
const { analyze, RULES } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Get available rules
app.get('/rules', (req, res) => {
  res.json({
    rules: RULES.map(({ id, name, enabled }) => ({ id, name, enabled })),
  });
});

/**
 * POST /analyze
 * Body: { code: string, disabledRules?: string[] }
 * Returns: { warnings: Warning[], stats: object, parseError: string|null }
 */
app.post('/analyze', (req, res) => {
  const { code, disabledRules = [] } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "code" string field.' });
  }

  const { warnings, parseError } = analyze(code, disabledRules);

  // Build stats summary
  const stats = {
    total: warnings.length,
    high: warnings.filter((w) => w.severity === 'High').length,
    medium: warnings.filter((w) => w.severity === 'Medium').length,
    low: warnings.filter((w) => w.severity === 'Low').length,
  };

  // Group warnings by type
  const byType = {};
  warnings.forEach((w) => {
    if (!byType[w.type]) byType[w.type] = 0;
    byType[w.type]++;
  });
  stats.byType = byType;

  return res.json({ warnings, stats, parseError });
});

app.listen(PORT, () => {
  console.log(`🔍 JS Analyzer Server running on http://localhost:${PORT}`);
});
