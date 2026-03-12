import { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Trash2, Search } from 'lucide-react';

const SEVERITY_COLORS = {
  High:   'rgba(239, 68, 68, 0.15)',
  Medium: 'rgba(245, 158, 11, 0.12)',
  Low:    'rgba(59, 130, 246, 0.10)',
};
const SEVERITY_BORDER = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#3b82f6',
};

export default function CodeEditor({ code, onChange, theme, warnings, jumpToLine, onClear, editorRef }) {
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
        // Using inline style via afterContentClassName is tricky, use linesDecorationsClassName
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

  // Jump to line
  useEffect(() => {
    if (jumpToLine && editorInstanceRef.current) {
      editorInstanceRef.current.revealLineInCenter(jumpToLine);
      editorInstanceRef.current.setPosition({ lineNumber: jumpToLine, column: 1 });
      editorInstanceRef.current.focus();
    }
  }, [jumpToLine]);

  // Reapply decorations when warnings change
  useEffect(() => {
    if (editorInstanceRef.current && monacoRef.current) {
      applyDecorations(editorInstanceRef.current, monacoRef.current);
    }
  }, [warnings, applyDecorations]);

  const handleEditorDidMount = (editor, monaco) => {
    editorInstanceRef.current = editor;
    monacoRef.current = monaco;
    if (editorRef) editorRef.current = editor;

    // Inject decoration CSS
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

    // Auto format on mount
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  const handleSearch = () => {
    editorInstanceRef.current?.getAction('actions.find')?.run();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="section-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
            script.js
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSearch} className="btn-ghost text-xs py-1 px-2" title="Search (Ctrl+F)">
            <Search size={13} />
            <span className="hidden md:inline">Search</span>
          </button>
          <button onClick={onClear} className="btn-ghost text-xs py-1 px-2 text-red-500 dark:text-red-400" title="Clear editor">
            <Trash2 size={13} />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden monaco-wrapper">
        <Editor
          height="100%"
          language="javascript"
          value={code}
          onChange={(val) => onChange(val ?? '')}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
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
