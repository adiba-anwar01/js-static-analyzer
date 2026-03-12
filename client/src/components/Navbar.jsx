import { useRef } from 'react';
import {
  Code2,
  Sun,
  Moon,
  Upload,
  Download,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ theme, onThemeToggle, onFileUpload, onDownloadJSON, onDownloadText, hasResults }) {
  const fileInputRef = useRef(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
    e.target.value = '';
  };

  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-surface-900 border-b border-slate-200 dark:border-surface-700 shadow-sm z-10 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 shadow-md">
          <Code2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            JavaScript Static Code Analyzer
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Powered by Esprima AST</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.mjs,.cjs"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost text-slate-600 dark:text-slate-300"
          title="Upload .js file"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Download dropdown */}
        <div className="relative">
          <button
            onClick={() => setDownloadOpen((o) => !o)}
            disabled={!hasResults}
            className="btn-ghost text-slate-600 dark:text-slate-300 disabled:opacity-40"
            title="Download report"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={12} />
          </button>
          {downloadOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in"
              onMouseLeave={() => setDownloadOpen(false)}
            >
              <button
                onClick={() => { onDownloadJSON(); setDownloadOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-surface-700 text-slate-700 dark:text-slate-200"
              >
                <Code2 size={14} /> Export as JSON
              </button>
              <button
                onClick={() => { onDownloadText(); setDownloadOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-surface-700 text-slate-700 dark:text-slate-200"
              >
                <FileText size={14} /> Export as Text
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="btn-ghost text-slate-600 dark:text-slate-300 ml-1"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
