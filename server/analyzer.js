const esprima = require('esprima');

const checkUnusedVariables = require('./rules/unusedVariables');
const checkNestedLoops = require('./rules/nestedLoops');
const checkEvalUsage = require('./rules/evalCheck');
const checkConsoleLog = require('./rules/consoleLogCheck');
const checkLongFunctions = require('./rules/longFunctions');
const checkDeeplyNestedConditions = require('./rules/deeplyNestedConditions');
const checkDuplicateVarDeclarations = require('./rules/duplicateVarDeclarations');
const checkUnusedFunctions = require('./rules/unusedFunctions');
const checkShadowedVariables = require('./rules/shadowedVariables');

const RULES = [
  { id: 'unusedVariables', name: 'Unused Variables', fn: checkUnusedVariables, enabled: true },
  { id: 'nestedLoops', name: 'Nested Loops', fn: checkNestedLoops, enabled: true },
  { id: 'evalCheck', name: 'Dangerous eval()', fn: checkEvalUsage, enabled: true },
  { id: 'consoleLog', name: 'Console Statements', fn: checkConsoleLog, enabled: true },
  { id: 'longFunctions', name: 'Long Functions', fn: checkLongFunctions, enabled: true },
  { id: 'deeplyNestedConditions', name: 'Deeply Nested Conditions', fn: checkDeeplyNestedConditions, enabled: true },
  { id: 'duplicateVarDeclarations', name: 'Duplicate Variable Declarations', fn: checkDuplicateVarDeclarations, enabled: true },
  { id: 'unusedFunctions', name: 'Unused Functions', fn: checkUnusedFunctions, enabled: true },
  { id: 'shadowedVariables', name: 'Shadowed Variables', fn: checkShadowedVariables, enabled: true },
];

function analyze(code, disabledRules = []) {
  let ast;
  
  try {
    ast = esprima.parseScript(code, {
      tolerant: true,
      range: true,
      loc: true,
      comment: true,
    });
  } catch (err) {
    const parseError = err.description || err.message || 'Parse error';
    return {
      warnings: [{
        line: err.lineNumber || 1,
        type: 'Syntax Error',
        severity: 'High',
        message: `Syntax error: ${parseError}`,
      }],
      parseError,
    };
  }

  const allWarnings = [];

  for (const rule of RULES) {
    if (!rule.enabled || disabledRules.includes(rule.id)) continue;
    
    try {
      allWarnings.push(...rule.fn(ast));
    } catch (e) {
      console.error(`Error in rule "${rule.id}":`, e.message);
    }
  }

  allWarnings.sort((a, b) => a.line - b.line);

  return { warnings: allWarnings, parseError: null };
}

module.exports = { analyze, RULES };
