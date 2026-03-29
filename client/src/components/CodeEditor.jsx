import { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Trash2, Search } from 'lucide-react';

const SEVERITY_BORDER = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
};

export default function CodeEditor({ code, onChange, theme, warnings, jumpToLine, onClear }) {
  const monacoRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const decorationsRef = useRef([]);

  const applyDecorations = useCallback((editorInstance, monaco) => {
    if (!editorInstance || !monaco) return;

    const newDecorations = warnings.map((w) => ({
      range: new monaco.Range(w.line, 1, w.line, 1),
      options: {
        isWholeLine: true,
        className: '',
        lineNumberClassName: '',
        overviewRuler: {
          color: SEVERITY_BORDER[w.severity] || '#6366f1',
          position: monaco.editor.OverviewRulerLane.Right,
        },
        glyphMarginHoverMessage: { value: `**${w.type}** (${w.severity})\n\n${w.message}` },
        lineDecoration: '',
        linesDecorationsClassName:
          w.severity === 'High' ? 'decoration-high' :
          w.severity === 'Medium' ? 'decoration-medium' : 'decoration-low',
        marginClassName:
          w.severity === 'High' ? 'margin-high' :
          w.severity === 'Medium' ? 'margin-medium' : 'margin-low',
      },
    }));

    decorationsRef.current = editorInstance.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [warnings]);

  useEffect(() => {
    if (jumpToLine && editorInstanceRef.current) {
      editorInstanceRef.current.revealLineInCenter(jumpToLine);
      editorInstanceRef.current.setPosition({ lineNumber: jumpToLine, column: 1 });
      editorInstanceRef.current.focus();
    }
  }, [jumpToLine]);

  useEffect(() => {
    if (editorInstanceRef.current && monacoRef.current) {
      applyDecorations(editorInstanceRef.current, monacoRef.current);
    }
  }, [warnings, applyDecorations]);

  const handleEditorDidMount = (editor, monaco) => {
    editorInstanceRef.current = editor;
    monacoRef.current = monaco;

    const styleId = 'analyzer-decorations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .decoration-high   { background: rgba(239,68,68,0.18) !important; border-left: 3px solid #ef4444 !important; }
        .decoration-medium { background: rgba(245,158,11,0.15) !important; border-left: 3px solid #f59e0b !important; }
        .decoration-low    { background: rgba(59,130,246,0.12) !important; border-left: 3px solid #3b82f6 !important; }
        .margin-high   { background: #ef4444; width: 3px !important; }
        .margin-medium { background: #f59e0b; width: 3px !important; }
        .margin-low    { background: #3b82f6; width: 3px !important; }
      `;
      document.head.appendChild(style);
    }

    applyDecorations(editor, monaco);

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  const handleSearch = () => {
    editorInstanceRef.current?.getAction('actions.find')?.run();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="section-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            script.js
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSearch} className="btn-ghost px-2 py-1 text-xs" title="Search (Ctrl+F)">
            <Search size={13} />
            <span className="hidden md:inline">Search</span>
          </button>
          <button onClick={onClear} className="btn-ghost px-2 py-1 text-xs text-red-500 dark:text-red-400" title="Clear editor">
            <Trash2 size={13} />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="monaco-wrapper flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="javascript"
          value={code}
          onChange={(val) => onChange(val ?? '')}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "Consolas, 'Courier New', monospace",
            fontLigatures: false,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            formatOnPaste: true,
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
}
