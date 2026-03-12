// Rule: Detects loops nested inside other loops (performance concern).
const LOOP_TYPES = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']);

module.exports = function checkNestedLoops(ast) {
  const warnings = [];

  function walk(node, depth = 0) {
    if (!node || typeof node !== 'object') return;

    let currentDepth = depth;
    if (LOOP_TYPES.has(node.type)) {
      currentDepth++;
      if (currentDepth >= 2) {
        warnings.push({
          line: node.loc?.start.line || 0,
          type: 'Nested Loop',
          severity: 'Medium',
          message: `Nested loop detected at depth ${currentDepth}. Consider refactoring to improve performance.`,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (['type', 'loc', 'range'].includes(key)) continue;
      
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => walk(c, currentDepth));
      } else if (child && typeof child === 'object') {
        walk(child, currentDepth);
      }
    }
  }

  walk(ast, 0);
  return warnings;
};
