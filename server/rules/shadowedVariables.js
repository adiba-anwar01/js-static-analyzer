// Rule: Detects variables declared in an inner scope shadowing a variable in an outer scope.
module.exports = function checkShadowedVariables(ast) {
  const warnings = [];

  function walk(node, scopeStack) {
    if (!node || typeof node !== 'object') return;

    const isNewScope = [
      'BlockStatement', 'FunctionDeclaration', 'FunctionExpression',
      'ArrowFunctionExpression', 'ForStatement', 'ForInStatement',
      'ForOfStatement', 'CatchClause', 'Program'
    ].includes(node.type);

    let currentScopeStack = scopeStack;
    let localScope = null;

    if (isNewScope) {
      localScope = new Set();
      if (Array.isArray(node.params)) {
        node.params.forEach(p => { if (p.name) localScope.add(p.name); });
      }
      if (node.param?.name) {
        localScope.add(node.param.name);
      }
      currentScopeStack = [...scopeStack, localScope];
    }

    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        if (decl.id?.name) {
          const name = decl.id.name;

          let isShadowed = false;
          for (let i = 0; i < currentScopeStack.length - 1; i++) {
            if (currentScopeStack[i].has(name)) {
              isShadowed = true;
              break;
            }
          }

          if (isShadowed) {
            warnings.push({
              line: decl.loc?.start.line || 0,
              type: 'Shadowed Variable',
              severity: 'Medium',
              message: `Variable "${name}" shadows a variable declared in an outer scope.`,
            });
          }

          if (localScope) {
            localScope.add(name);
          } else {
            currentScopeStack[currentScopeStack.length - 1].add(name);
          }
        }
      });
    }

    for (const key of Object.keys(node)) {
      if (['type', 'loc', 'range'].includes(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => walk(c, currentScopeStack));
      } else if (child && typeof child === 'object') {
        walk(child, currentScopeStack);
      }
    }
  }

  walk(ast, []);
  return warnings;
};
