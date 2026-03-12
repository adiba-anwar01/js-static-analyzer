/**
 * Rule: Deeply Nested Conditions
 * Flags if/else chains nested more than 3 levels deep.
 */

function checkDeeplyNestedConditions(ast) {
  const warnings = [];
  const DEPTH_LIMIT = 3;

  function walk(node, depth) {
    if (!node || typeof node !== 'object') return;

    let currentDepth = depth;

    if (node.type === 'IfStatement') {
      currentDepth++;
      if (currentDepth > DEPTH_LIMIT) {
        const line = node.loc ? node.loc.start.line : 0;
        warnings.push({
          line,
          type: 'Deeply Nested Condition',
          severity: 'Medium',
          message: `Condition nested ${currentDepth} levels deep (limit: ${DEPTH_LIMIT}). Consider early returns or extracting conditions to improve readability.`,
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

module.exports = checkDeeplyNestedConditions;
