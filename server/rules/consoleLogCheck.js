/**
 * Rule: console.log / console statements
 * Flags console.log, console.warn, console.error, console.info calls in production code.
 */

const CONSOLE_METHODS = new Set(['log', 'warn', 'error', 'info', 'debug', 'trace']);

function checkConsoleLog(ast) {
  const warnings = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'CallExpression' &&
      node.callee &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'console' &&
      node.callee.property &&
      CONSOLE_METHODS.has(node.callee.property.name)
    ) {
      const method = node.callee.property.name;
      const line = node.loc ? node.loc.start.line : 0;
      warnings.push({
        line,
        type: 'Console Statement',
        severity: 'Low',
        message: `console.${method}() found. Remove or replace with a proper logging library before production deployment.`,
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

module.exports = checkConsoleLog;
