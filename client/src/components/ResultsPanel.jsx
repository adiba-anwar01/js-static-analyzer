import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Copy,
  ChevronDown,
  ChevronRight,
  Filter,
  Settings,
  CheckSquare,
  Square,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  High: { icon: AlertCircle, badgeClass: 'badge-high', dotColor: 'bg-red-500' },
  Medium: { icon: AlertTriangle, badgeClass: 'badge-medium', dotColor: 'bg-amber-500' },
  Low: { icon: Info, badgeClass: 'badge-low', dotColor: 'bg-blue-500' },
};

function WarningItem({ warning, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.Low;
  const Icon = cfg.icon;

  return (
    <div
      className="group mb-2 cursor-pointer overflow-hidden rounded-md border border-slate-200 transition hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500"
      onClick={() => { onClick(warning.line); setExpanded((e) => !e); }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Icon
          size={14}
          className={
            warning.severity === 'High' ? 'shrink-0 text-red-500' :
            warning.severity === 'Medium' ? 'shrink-0 text-amber-500' :
            'shrink-0 text-blue-500'
          }
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
              {warning.type}
            </span>
            <span className={`badge ${cfg.badgeClass}`}>{warning.severity}</span>
            <span className="badge badge-info ml-auto shrink-0">Line {warning.line}</span>
          </div>
          {!expanded && (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {warning.message}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronDown size={12} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronRight size={12} className="shrink-0 text-slate-400" />
        )}
      </div>
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 pb-3 pt-0 dark:border-slate-700 dark:bg-slate-800">
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {warning.message}
          </p>
          <span className="mt-2 inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Click to jump -&gt; Line {warning.line}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({
  warnings,
  allWarnings,
  severityFilter,
  onFilterChange,
  onWarningClick,
  onCopyResults,
  hasAnalyzed,
  isAnalyzing,
  availableRules,
  disabledRules,
  onToggleRule,
}) {
  const [showRules, setShowRules] = useState(false);

  const severityGroups = ['High', 'Medium', 'Low'];
  const counts = {
    All: allWarnings.length,
    High: allWarnings.filter((w) => w.severity === 'High').length,
    Medium: allWarnings.filter((w) => w.severity === 'Medium').length,
    Low: allWarnings.filter((w) => w.severity === 'Low').length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="section-header shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Analysis Results
          </span>
          {allWarnings.length > 0 && (
            <span className="badge badge-info">{allWarnings.length} issues</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCopyResults} className="btn-ghost px-2 py-1 text-xs" title="Copy results">
            <Copy size={12} />
            <span className="hidden md:inline">Copy</span>
          </button>
          <button
            onClick={() => setShowRules((s) => !s)}
            className={`btn-ghost px-2 py-1 text-xs ${showRules ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' : ''}`}
            title="Toggle rules"
          >
            <Settings size={12} />
            <span className="hidden md:inline">Rules</span>
          </button>
        </div>
      </div>

      {showRules && availableRules.length > 0 && (
        <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Active Rules</p>
          <div className="grid grid-cols-1 gap-1">
            {availableRules.map((rule) => {
              const isDisabled = disabledRules.includes(rule.id);
              return (
                <button
                  key={rule.id}
                  onClick={() => onToggleRule(rule.id)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {isDisabled ? (
                    <Square size={12} className="shrink-0 text-slate-400" />
                  ) : (
                    <CheckSquare size={12} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
                  )}
                  <span className={isDisabled ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}>
                    {rule.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <Filter size={12} className="shrink-0 text-slate-400" />
        {['All', 'High', 'Medium', 'Low'].map((level) => (
          <button
            key={level}
            onClick={() => onFilterChange(level)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
              severityFilter === level
                ? level === 'All'
                  ? 'bg-indigo-600 text-white'
                  : level === 'High'
                  ? 'bg-red-500 text-white'
                  : level === 'Medium'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {level} {counts[level] > 0 ? `(${counts[level]})` : ''}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing code...</p>
          </div>
        )}

        {!isAnalyzing && !hasAnalyzed && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <AlertCircle size={24} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ready to analyze</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Click "Analyze Code" or enable real-time analysis
              </p>
            </div>
          </div>
        )}

        {!isAnalyzing && hasAnalyzed && warnings.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckSquare size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No issues found!</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {severityFilter !== 'All' ? `No ${severityFilter} severity warnings` : 'Your code looks clean'}
              </p>
            </div>
          </div>
        )}

        {!isAnalyzing && warnings.length > 0 && (
          <>
            {severityGroups.map((severity) => {
              const group = warnings.filter((w) => w.severity === severity);
              if (group.length === 0) return null;
              const cfg = SEVERITY_CONFIG[severity];
              return (
                <div key={severity} className="mb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {severity} ({group.length})
                    </span>
                  </div>
                  {group.map((w, i) => (
                    <WarningItem key={i} warning={w} onClick={onWarningClick} />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
