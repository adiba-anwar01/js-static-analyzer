/**
 * Rule: Unused Functions
 * Detects functions declared but never referenced/called elsewhere in the code.
 */

function checkUnusedFunctions(ast) {
  const warnings = [];
  const declared = new Map(); // name -> { line, used }

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    // Track function declarations
    if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
      const name = node.id.name;
      if (!declared.has(name)) {
        declared.set(name, {
          line: node.loc ? node.loc.start.line : 0,
          used: false,
        });
      }
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

  // Second pass: mark function identifiers as used
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

  // Unmark the declarations themselves
  function unmarkDeclarations(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
      // It's the declaration, not a usage
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

  // A more robust way: collect usages by looking at all identifiers except the FunctionDeclaration.id
  const usedNames = new Set();
  function collectUsages(node, isDeclId = false) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'FunctionDeclaration') {
      if (node.id) collectUsages(node.id, true);
      // Walk params and body
      node.params.forEach((p) => collectUsages(p, false));
      if (node.body) collectUsages(node.body, false);
      return;
    }

    if (node.type === 'Identifier' && !isDeclId) {
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

  // Report unused
  declared.forEach((info, name) => {
    if (!usedNames.has(name) && info.line > 0) {
      warnings.push({
        line: info.line,
        type: 'Unused Function',
        severity: 'Medium',
        message: `Function "${name}" is declared but never called or referenced.`,
      });
    }
  });

  return warnings;
}

module.exports = checkUnusedFunctions;
