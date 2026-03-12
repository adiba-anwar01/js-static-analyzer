// Rule: Flags any call to eval() due to security and performance risks.
module.exports = function checkEvalUsage(ast) {
  const warnings = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'CallExpression' &&
      node.callee?.type === 'Identifier' &&
      node.callee.name === 'eval'
    ) {
      warnings.push({
        line: node.loc?.start.line || 0,
        type: 'Dangerous eval()',
        severity: 'High',
        message: 'Use of eval() is dangerous and can lead to code injection vulnerabilities. Avoid using eval().',
      });
    }

    for (const key of Object.keys(node)) {
      if (['type', 'loc', 'range'].includes(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof child === 'object') {
        walk(child);
      }
    }
  }

  walk(ast);
  return warnings;
};
