// Rule: Detects variables declared but never referenced.
module.exports = function checkUnusedVariables(ast) {
  const warnings = [];
  const declared = new Map();

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        if (decl.id?.name && !declared.has(decl.id.name)) {
          declared.set(decl.id.name, {
            line: decl.loc?.start.line || 0,
            used: false,
            kind: node.kind,
          });
        }
      });
    }

    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      if (node.id?.name) {
        declared.set(node.id.name, { line: node.loc?.start.line || 0, used: false, kind: 'function' });
      }
      node.params?.forEach(param => {
        if (param.name) declared.set(param.name, { line: param.loc?.start.line || 0, used: true, kind: 'param' });
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

  const usedNames = new Set();
  function collectUsages(node, isDeclarator = false) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'VariableDeclarator') {
      collectUsages(node.id, true);
      if (node.init) collectUsages(node.init, false);
      return;
    }

    if (node.type === 'Identifier' && !isDeclarator) {
      usedNames.add(node.name);
    }

    for (const key of Object.keys(node)) {
      if (['type', 'loc', 'range'].includes(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => collectUsages(c, false));
      } else if (child && typeof child === 'object') {
        collectUsages(child, false);
      }
    }
  }

  collectUsages(ast);

  declared.forEach((info, name) => {
    if (info.kind === 'param') return;
    if (!usedNames.has(name) && info.line > 0) {
      warnings.push({
        line: info.line,
        type: 'Unused Variable',
        severity: 'Low',
        message: `Variable "${name}" is declared but never used.`,
      });
    }
  });

  return warnings;
};
