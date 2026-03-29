import { Play, Loader2, Zap, ZapOff } from 'lucide-react';

export default function StatusBar({ stats, isAnalyzing, realTime, onRealTimeToggle, onAnalyze, hasAnalyzed }) {
  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {stats ? (
          <>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Issues:
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {stats.total}
            </span>
            {stats.high > 0 && (
              <span className="badge border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300">
                {stats.high} High
              </span>
            )}
            {stats.medium > 0 && (
              <span className="badge border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-300">
                {stats.medium} Medium
              </span>
            )}
            {stats.low > 0 && (
              <span className="badge border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-300">
                {stats.low} Low
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-500">
            {hasAnalyzed ? 'No issues detected' : 'Run analysis to see results'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRealTimeToggle}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
            realTime
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
          title="Toggle real-time analysis"
        >
          {realTime ? <Zap size={12} /> : <ZapOff size={12} />}
          Real-time
        </button>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? (
            <Loader2 size={13} className="spin" />
          ) : (
            <Play size={13} />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
    </footer>
  );
}
