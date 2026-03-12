import { Play, Loader2, Zap, ZapOff } from 'lucide-react';

export default function StatusBar({ stats, isAnalyzing, realTime, onRealTimeToggle, onAnalyze, hasAnalyzed }) {
  return (
    <footer className="flex items-center justify-between px-4 py-2 bg-brand-600 dark:bg-surface-900 border-t border-brand-700 dark:border-surface-700 shrink-0 gap-4 flex-wrap">
      {/* Left: Severity breakdown */}
      <div className="flex items-center gap-3">
        {stats ? (
          <>
            <span className="text-xs text-white/70 dark:text-slate-400">
              Issues:
            </span>
            <span className="text-xs font-bold text-white dark:text-slate-100">
              {stats.total}
            </span>
            {stats.high > 0 && (
              <span className="badge bg-red-500/20 text-red-200 dark:bg-red-900/30 dark:text-red-400 border border-red-400/30">
                {stats.high} High
              </span>
            )}
            {stats.medium > 0 && (
              <span className="badge bg-amber-500/20 text-amber-200 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-400/30">
                {stats.medium} Medium
              </span>
            )}
            {stats.low > 0 && (
              <span className="badge bg-blue-400/20 text-blue-200 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-400/30">
                {stats.low} Low
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-white/50 dark:text-slate-500">
            {hasAnalyzed ? 'No issues detected' : 'Run analysis to see results'}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Real-time toggle */}
        <button
          onClick={onRealTimeToggle}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            realTime
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-white/10 dark:bg-surface-700 text-white/70 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-surface-600'
          }`}
          title="Toggle real-time analysis"
        >
          {realTime ? <Zap size={12} /> : <ZapOff size={12} />}
          Real-time
        </button>

        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold
                     bg-white dark:bg-brand-500 text-brand-600 dark:text-white
                     hover:bg-slate-50 dark:hover:bg-brand-600 shadow-sm
                     transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <Loader2 size={13} className="spin" />
          ) : (
            <Play size={13} />
          )}
          {isAnalyzing ? 'Analyzing…' : 'Analyze Code'}
        </button>
      </div>
    </footer>
  );
}
