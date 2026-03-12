/**
 * Rule: Duplicate Variable Declarations
 * Detects `var`, `let`, and `const` declarations that share a name within the same scope/file.
 * (var allows re-declaration unlike let/const, but we can still flag all duplicates)
 */

function checkDuplicateVarDeclarations(ast) {
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
      localScope = new Map();
      currentScopeStack = [...scopeStack, localScope];
    }

    // Check all kinds of variable declarations
    if (
      node.type === 'VariableDeclaration' &&
      ['var', 'let', 'const'].includes(node.kind)
    ) {
      node.declarations.forEach((decl) => {
        if (decl.id && decl.id.name) {
          const name = decl.id.name;
          const line = decl.loc ? decl.loc.start.line : 0;

          const currentScope = currentScopeStack[currentScopeStack.length - 1];

          if (currentScope.has(name)) {
            warnings.push({
              line,
              type: 'Duplicate Variable Declaration',
              severity: 'Medium',
              message: `Variable "${name}" is declared more than once in the same scope (first declared at line ${currentScope.get(
                name
              )}).`,
            });
          } else {
            currentScope.set(name, line);
          }
        }
      });
    }

    // Recursively walk child nodes
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

module.exports = checkDuplicateVarDeclarations;