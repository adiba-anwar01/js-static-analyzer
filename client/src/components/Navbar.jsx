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
    <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600">
          <Code2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
            JavaScript Static Code Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Esprima AST</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.mjs,.cjs"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost"
          title="Upload .js file"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDownloadOpen((o) => !o)}
            disabled={!hasResults}
            className="btn-ghost disabled:opacity-40"
            title="Download report"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={12} />
          </button>
          {downloadOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
              onMouseLeave={() => setDownloadOpen(false)}
            >
              <button
                onClick={() => { onDownloadJSON(); setDownloadOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Code2 size={14} /> Export as JSON
              </button>
              <button
                onClick={() => { onDownloadText(); setDownloadOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FileText size={14} /> Export as Text
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onThemeToggle}
          className="btn-ghost ml-1"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
