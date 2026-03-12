/**
 * Rule: Shadowed Variables
 * Detects variables declared in an inner scope that share the same name
 * as a variable declared in an outer scope.
 */

function checkShadowedVariables(ast) {
  const warnings = [];

  function walk(node, scopeStack) {
    if (!node || typeof node !== 'object') return;

    // Create a new scope level for BlockStatements, Functions, and Loops
    const isNewScope =
      node.type === 'BlockStatement' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'ForStatement' ||
      node.type === 'ForInStatement' ||
      node.type === 'ForOfStatement' ||
      node.type === 'CatchClause' ||
      node.type === 'Program';

    let currentScopeStack = scopeStack;
    let localScope = null;

    if (isNewScope) {
      localScope = new Set();
      // Track function parameters in local scope
      if (node.params && Array.isArray(node.params)) {
        node.params.forEach((p) => {
          if (p.name) localScope.add(p.name);
        });
      }
      // Track catch clause parameter
      if (node.param && node.param.name) {
        localScope.add(node.param.name);
      }
      currentScopeStack = [...scopeStack, localScope];
    }

    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl) => {
        if (decl.id && decl.id.name) {
          const name = decl.id.name;

          // Check if it exists in any PARENT scope
          // currentScopeStack looks like [global, func, block]
          // The current local scope is currentScopeStack[currentScopeStack.length - 1]
          let isShadowed = false;
          for (let i = 0; i < currentScopeStack.length - 1; i++) {
            if (currentScopeStack[i].has(name)) {
              isShadowed = true;
              break;
            }
          }

          if (isShadowed) {
            const line = decl.loc ? decl.loc.start.line : 0;
            warnings.push({
              line,
              type: 'Shadowed Variable',
              severity: 'Medium',
              message: `Variable "${name}" shadows a variable declared in an outer scope.`,
            });
          }

          // Add to current local scope
          if (localScope) {
            localScope.add(name);
          } else {
            // If it's a declaration not strictly in a new scope node (e.g. init of a for loop)
            currentScopeStack[currentScopeStack.length - 1].add(name);
          }
        }
      });
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'range') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => walk(c, currentScopeStack));
      } else if (child && typeof child === 'object' && child.type) {
        walk(child, currentScopeStack);
      }
    }
  }

  walk(ast, []);
  return warnings;
}

module.exports = checkShadowedVariables;
