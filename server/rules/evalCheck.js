/**
 * Rule: eval() Usage
 * Flags any call to eval() which is a security and performance risk.
 */

function checkEvalUsage(ast) {
  const warnings = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'CallExpression' &&
      node.callee &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'eval'
    ) {
      const line = node.loc ? node.loc.start.line : 0;
      warnings.push({
        line,
        type: 'Dangerous eval()',
        severity: 'High',
        message:
          'Use of eval() is dangerous and can lead to code injection vulnerabilities. Avoid using eval().',
      });
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof child === 'object' && child.type) {
        walk(child);
      }
    }
  }

  walk(ast);
  return warnings;
}

module.exports = checkEvalUsage;
