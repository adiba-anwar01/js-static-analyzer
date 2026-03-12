const express = require('express');
const cors = require('cors');
const { analyze, RULES } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/rules', (req, res) => {
  res.json({ rules: RULES.map(({ id, name, enabled }) => ({ id, name, enabled })) });
});

app.post('/analyze', (req, res) => {
  const { code, disabledRules = [] } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "code" string field.' });
  }

  const { warnings, parseError } = analyze(code, disabledRules);

  const stats = {
    total: warnings.length,
    high: warnings.filter(w => w.severity === 'High').length,
    medium: warnings.filter(w => w.severity === 'Medium').length,
    low: warnings.filter(w => w.severity === 'Low').length,
    byType: warnings.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {})
  };

  res.json({ warnings, stats, parseError });
});

app.listen(PORT, () => console.log(`🔍 JS Analyzer Server running on http://localhost:${PORT}`));
