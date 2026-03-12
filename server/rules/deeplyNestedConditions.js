// Rule: Flags if/else chains nested conditionally more than 3 levels deep.
module.exports = function checkDeeplyNestedConditions(ast) {
  const warnings = [];
  const DEPTH_LIMIT = 3;

  function walk(node, depth = 0) {
    if (!node || typeof node !== 'object') return;

    let currentDepth = depth;
    if (node.type === 'IfStatement') {
      currentDepth++;
      if (currentDepth > DEPTH_LIMIT) {
        warnings.push({
          line: node.loc?.start.line || 0,
          type: 'Deeply Nested Condition',
          severity: 'Medium',
          message: `Condition nested ${currentDepth} levels deep (limit: ${DEPTH_LIMIT}). Consider early returns or extracting conditions to improve readability.`,
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
