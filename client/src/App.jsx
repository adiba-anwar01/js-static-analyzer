import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import ResultsPanel from './components/ResultsPanel';
import StatusBar from './components/StatusBar';
import StatsDashboard from './components/StatsDashboard';

const API_BASE = 'http://localhost:5000';

export default function App() {

  const [code, setCode] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [stats, setStats] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [realTime, setRealTime] = useState(false);
  const [availableRules, setAvailableRules] = useState([]);
  const [disabledRules, setDisabledRules] = useState([]);
  const [jumpToLine, setJumpToLine] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    axios.get(`${API_BASE}/rules`).then((res) => {
      setAvailableRules(res.data.rules);
    }).catch(() => { });
  }, []);

  const analyze = useCallback(async (sourceCode) => {
    if (!sourceCode.trim()) return;
    setIsAnalyzing(true);
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, {
        code: sourceCode,
        disabledRules,
      });
      setWarnings(data.warnings || []);
      setStats(data.stats || null);
      setHasAnalyzed(true);
    } catch (err) {
      toast.error('Could not connect to analyzer server. Make sure it is running on port 5000.');
      setWarnings([]);
      setStats(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [disabledRules]);

  useEffect(() => {
    if (!realTime) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyze(code);
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [code, realTime, analyze]);

  const handleAnalyze = () => analyze(code);

  const handleClear = () => {
    setCode('');
    setWarnings([]);
    setStats(null);
    setHasAnalyzed(false);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.js') && !file.name.endsWith('.mjs') && !file.name.endsWith('.cjs')) {
      toast.error('Please upload a .js file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setWarnings([]);
      setStats(null);
      setHasAnalyzed(false);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDownloadJSON = () => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      warnings,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const handleDownloadText = () => {
    const lines = [
      'JavaScript Static Code Analysis Report',
      `Generated: ${new Date().toLocaleString()}`,
      '='.repeat(50),
      `Total Issues: ${stats?.total ?? 0}  High: ${stats?.high ?? 0}  Medium: ${stats?.medium ?? 0}  Low: ${stats?.low ?? 0}`,
      '='.repeat(50),
      '',
      ...warnings.map(
        (w, i) => `[${i + 1}] Line ${w.line} | ${w.severity} | ${w.type}\n    ${w.message}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Text report downloaded');
  };

  const handleCopyResults = () => {
    const text = warnings
      .map((w) => `Line ${w.line} | ${w.severity} | ${w.type}: ${w.message}`)
      .join('\n');
    navigator.clipboard.writeText(text || 'No warnings found.');
    toast.success('Results copied to clipboard');
  };

  const handleWarningClick = (line) => {
    setJumpToLine(line);
    setTimeout(() => setJumpToLine(null), 100);
  };

  const toggleRule = (ruleId) => {
    setDisabledRules((prev) =>
      prev.includes(ruleId) ? prev.filter((r) => r !== ruleId) : [...prev, ruleId]
    );
  };

  const filteredWarnings =
    severityFilter === 'All'
      ? warnings
      : warnings.filter((w) => w.severity === severityFilter);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      className={`flex flex-col h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden transition-all duration-200 ${dragActive ? 'ring-4 ring-inset ring-brand-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-surface-800 !text-slate-800 dark:!text-slate-100 !shadow-lg !border !border-slate-200 dark:!border-surface-700',
        }}
      />

      <Navbar
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onFileUpload={handleFileUpload}
        onDownloadJSON={handleDownloadJSON}
        onDownloadText={handleDownloadText}
        hasResults={warnings.length > 0}
      />

      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex flex-col w-1/2 border-r border-slate-200 dark:border-surface-700 overflow-hidden">
          <CodeEditor
            code={code}
            onChange={setCode}
            theme={theme}
            warnings={warnings}
            jumpToLine={jumpToLine}
            onClear={handleClear}
            editorRef={editorRef}
          />
        </div>

        <div className="flex flex-col w-1/2 overflow-hidden">
          <ResultsPanel
            warnings={filteredWarnings}
            allWarnings={warnings}
            severityFilter={severityFilter}
            onFilterChange={setSeverityFilter}
            onWarningClick={handleWarningClick}
            onCopyResults={handleCopyResults}
            hasAnalyzed={hasAnalyzed}
            isAnalyzing={isAnalyzing}
            availableRules={availableRules}
            disabledRules={disabledRules}
            onToggleRule={toggleRule}
          />
        </div>
      </div>

      {hasAnalyzed && stats && (
        <StatsDashboard stats={stats} warnings={warnings} />
      )}

      <StatusBar
        stats={stats}
        isAnalyzing={isAnalyzing}
        realTime={realTime}
        onRealTimeToggle={() => setRealTime((r) => !r)}
        onAnalyze={handleAnalyze}
        hasAnalyzed={hasAnalyzed}
      />
    </div>
  );
}