// Rule: Flags console log calls in production code.
const CONSOLE_METHODS = new Set(['log', 'warn', 'error', 'info', 'debug', 'trace']);

module.exports = function checkConsoleLog(ast) {
  const warnings = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'CallExpression' &&
      node.callee?.type === 'MemberExpression' &&
      node.callee.object?.type === 'Identifier' &&
      node.callee.object.name === 'console' &&
      CONSOLE_METHODS.has(node.callee.property?.name)
    ) {
      const method = node.callee.property.name;
      warnings.push({
        line: node.loc?.start.line || 0,
        type: 'Console Statement',
        severity: 'Low',
        message: `console.${method}() found. Remove or replace with a proper logging library before production deployment.`,
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
