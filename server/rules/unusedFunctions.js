// Rule: Detects functions declared but never called or referenced.
module.exports = function checkUnusedFunctions(ast) {
  const warnings = [];
  const declared = new Map();

  function walk(node, isDeclId = false) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) {
        declared.set(node.id.name, { line: node.loc?.start.line || 0, used: false });
        walk(node.id, true);
      }
      
      node.params?.forEach(p => walk(p, false));
      if (node.body) walk(node.body, false);
      return;
    }

    if (node.type === 'Identifier' && !isDeclId) {
      if (declared.has(node.name)) {
        declared.get(node.name).used = true;
      }
    }

    for (const key of Object.keys(node)) {
      if (['type', 'loc', 'range'].includes(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => walk(c, false));
      } else if (child && typeof child === 'object') {
        walk(child, false);
      }
    }
  }

  walk(ast);

  declared.forEach((info, name) => {
    if (!info.used && info.line > 0) {
      warnings.push({
        line: info.line,
        type: 'Unused Function',
        severity: 'Medium',
        message: `Function "${name}" is declared but never called or referenced.`,
      });
    }
  });

  return warnings;
};
