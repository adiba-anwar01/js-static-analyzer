/**
 * Rule: Nested Loops
 * Detects loops nested inside other loops (performance concern).
 */

const LOOP_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

function checkNestedLoops(ast) {
  const warnings = [];

  function walk(node, loopDepth) {
    if (!node || typeof node !== 'object') return;

    let currentDepth = loopDepth;

    if (LOOP_TYPES.has(node.type)) {
      currentDepth++;
      if (currentDepth >= 2) {
        const line = node.loc ? node.loc.start.line : 0;
        warnings.push({
          line,
          type: 'Nested Loop',
          severity: 'Medium',
          message: `Nested loop detected at depth ${currentDepth}. Consider refactoring to improve performance.`,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => walk(c, currentDepth));
      } else if (child && typeof child === 'object' && child.type) {
        walk(child, currentDepth);
      }
    }
  }

  walk(ast, 0);
  return warnings;
}

module.exports = checkNestedLoops;
