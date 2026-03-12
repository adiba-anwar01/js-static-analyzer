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
import { toast } from 'react-hot-toast';

const SEVERITY_CONFIG = {
  High:   { icon: AlertCircle,   badgeClass: 'badge-high',   dotColor: 'bg-red-500',   label: 'High' },
  Medium: { icon: AlertTriangle, badgeClass: 'badge-medium', dotColor: 'bg-amber-500', label: 'Medium' },
  Low:    { icon: Info,          badgeClass: 'badge-low',    dotColor: 'bg-blue-500',  label: 'Low' },
};

function WarningItem({ warning, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.Low;
  const Icon = cfg.icon;

  return (
    <div
      className="group border border-slate-200 dark:border-surface-700 rounded-lg mb-2 overflow-hidden hover:border-brand-400 dark:hover:border-brand-500 transition-colors duration-150 cursor-pointer animate-fade-in"
      onClick={() => { onClick(warning.line); setExpanded((e) => !e); }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Icon
          size={14}
          className={
            warning.severity === 'High' ? 'text-red-500 shrink-0' :
            warning.severity === 'Medium' ? 'text-amber-500 shrink-0' :
            'text-blue-500 shrink-0'
          }
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {warning.type}
            </span>
            <span className={`badge ${cfg.badgeClass}`}>{warning.severity}</span>
            <span className="badge badge-info ml-auto shrink-0">Line {warning.line}</span>
          </div>
          {!expanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {warning.message}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronDown size={12} className="text-slate-400 shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-slate-400 shrink-0" />
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-850">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
            {warning.message}
          </p>
          <span className="inline-block mt-2 text-xs text-brand-500 font-medium">
            Click to jump → Line {warning.line}
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
    <div className="flex flex-col h-full">
      {/* Panel Header */}
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
          {/* Copy button */}
          <button onClick={onCopyResults} className="btn-ghost text-xs py-1 px-2" title="Copy results">
            <Copy size={12} />
            <span className="hidden md:inline">Copy</span>
          </button>
          {/* Rules toggle */}
          <button
            onClick={() => setShowRules((s) => !s)}
            className={`btn-ghost text-xs py-1 px-2 ${showRules ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-500' : ''}`}
            title="Toggle rules"
          >
            <Settings size={12} />
            <span className="hidden md:inline">Rules</span>
          </button>
        </div>
      </div>

      {/* Rules Panel */}
      {showRules && availableRules.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-850 shrink-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Active Rules</p>
          <div className="grid grid-cols-1 gap-1">
            {availableRules.map((rule) => {
              const isDisabled = disabledRules.includes(rule.id);
              return (
                <button
                  key={rule.id}
                  onClick={() => onToggleRule(rule.id)}
                  className="flex items-center gap-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-surface-700 rounded-md px-2 py-1 transition-colors"
                >
                  {isDisabled ? (
                    <Square size={12} className="text-slate-400 shrink-0" />
                  ) : (
                    <CheckSquare size={12} className="text-brand-500 shrink-0" />
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

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-900 shrink-0 overflow-x-auto">
        <Filter size={12} className="text-slate-400 shrink-0" />
        {['All', 'High', 'Medium', 'Low'].map((level) => (
          <button
            key={level}
            onClick={() => onFilterChange(level)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
              severityFilter === level
                ? level === 'All'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : level === 'High'
                  ? 'bg-red-500 text-white shadow-sm'
                  : level === 'Medium'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-700'
            }`}
          >
            {level} {counts[level] > 0 ? `(${counts[level]})` : ''}
          </button>
        ))}
      </div>

      {/* Warnings List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing code…</p>
          </div>
        )}

        {!isAnalyzing && !hasAnalyzed && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <AlertCircle size={24} className="text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ready to analyze</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Click "Analyze Code" or enable real-time analysis
              </p>
            </div>
          </div>
        )}

        {!isAnalyzing && hasAnalyzed && warnings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckSquare size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No issues found!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
