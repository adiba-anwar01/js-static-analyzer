// Rule: Detects var, let, and const declarations that share a name within the same scope.
// (var allows re-declaration unlike let/const, but we can still flag all duplicates)
module.exports = function checkDuplicateVarDeclarations(ast) {
  const warnings = [];

  function walk(node, scopeStack) {
    if (!node || typeof node !== 'object') return;

    const isNewScope = [
      'BlockStatement', 'FunctionDeclaration', 'FunctionExpression',
      'ArrowFunctionExpression', 'ForStatement', 'ForInStatement',
      'ForOfStatement', 'CatchClause', 'Program'
    ].includes(node.type);

    let currentScopeStack = scopeStack;
    if (isNewScope) {
      currentScopeStack = [...scopeStack, new Map()];
    }

    const currentScope = currentScopeStack[currentScopeStack.length - 1];

    if (node.type === 'VariableDeclaration' && ['var', 'let', 'const'].includes(node.kind)) {
      node.declarations.forEach(decl => {
        if (decl.id?.name) {
          const name = decl.id.name;
          const line = decl.loc?.start.line || 0;

          if (currentScope.has(name)) {
            warnings.push({
              line,
              type: 'Duplicate Variable Declaration',
              severity: 'Medium',
              message: `Variable "${name}" is declared more than once in the same scope (first declared at line ${currentScope.get(name)}).`,
            });
          } else {
            currentScope.set(name, line);
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