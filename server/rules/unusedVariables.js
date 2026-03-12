/**
 * Rule: Unused Variables
 * Detects variables declared but never referenced elsewhere in the code.
 */

function checkUnusedVariables(ast) {
  const warnings = [];
  const declared = new Map(); // name -> { line, used }

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    // Track variable declarations
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((decl) => {
        if (decl.id && decl.id.name) {
          const name = decl.id.name;
          if (!declared.has(name)) {
            declared.set(name, {
              line: decl.loc ? decl.loc.start.line : 0,
              used: false,
              kind: node.kind,
            });
          }
        }
      });
    }

    // Track function parameter names
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      if (node.id && node.id.name) {
        declared.set(node.id.name, {
          line: node.loc ? node.loc.start.line : 0,
          used: false,
          kind: 'function',
        });
      }
      node.params.forEach((param) => {
        if (param.name) {
          declared.set(param.name, {
            line: param.loc ? param.loc.start.line : 0,
            used: true, // params are considered used
            kind: 'param',
          });
        }
      });
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof child === 'object' && child.type) {
        walk(child);
      }
    }
  }

  // Second pass: mark identifiers as used
  function markUsed(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'Identifier') {
      if (declared.has(node.name)) {
        declared.get(node.name).used = true;
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(markUsed);
      } else if (child && typeof child === 'object' && child.type) {
        markUsed(child);
      }
    }
  }

  walk(ast);

  // Unmark declarations themselves so we detect truly unused
  function unmarkDeclarations(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
      // Don't mark the declaration itself as a usage
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(unmarkDeclarations);
      } else if (child && typeof child === 'object' && child.type) {
        unmarkDeclarations(child);
      }
    }
  }

  // Re-scan for usages by looking at ALL identifiers that are not declarators
  const usedNames = new Set();
  function collectUsages(node, isDeclarator = false) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'VariableDeclarator') {
      // Walk the init but mark the id as the declarator
      collectUsages(node.id, true);
      if (node.init) collectUsages(node.init, false);
      return;
    }

    if (node.type === 'Identifier' && !isDeclarator) {
      usedNames.add(node.name);
    }

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => collectUsages(c, false));
      } else if (child && typeof child === 'object' && child.type) {
        collectUsages(child, false);
      }
    }
  }

  collectUsages(ast);

  // Report unused (exclude params and function declarations with common names)
  declared.forEach((info, name) => {
    if (info.kind === 'param') return; // skip params
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
}

module.exports = checkUnusedVariables;
