// Rule: Flags functions that exceed 50 lines (maintainability).
const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

module.exports = function checkLongFunctions(ast) {
  const warnings = [];
  const LIMIT = 50;

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (FUNCTION_TYPES.has(node.type) && node.loc) {
      const start = node.loc.start.line;
      const end = node.loc.end.line;
      const lineCount = end - start + 1;

      if (lineCount > LIMIT) {
        const name = node.id?.name ? `"${node.id.name}"` : '(anonymous function)';
        warnings.push({
          line: start,
          type: 'Long Function',
          severity: 'Medium',
          message: `Function ${name} is ${lineCount} lines long (limit: ${LIMIT}). Consider breaking it into smaller functions.`,
        });
      }
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
