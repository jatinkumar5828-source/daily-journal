import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Type,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'What happened today? Write your thoughts, experiences, and memories here...',
  autoFocus = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  // Compute word and character count
  const updateCounts = useCallback((htmlText: string) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlText;
    const text = tempEl.textContent || tempEl.innerText || '';
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    setStats({ words, chars });
  }, []);

  // Sync initial and external content
  useEffect(() => {
    if (editorRef.current && !isComposingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
        updateCounts(value || '');
      }
    }
  }, [value, updateCounts]);

  // Autofocus when requested
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      updateCounts(content);
      onChange(content);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleHeading = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs transition-colors overflow-hidden">
      {/* Distraction-free Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 border-b border-stone-200/70 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/80 no-print">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Style: Paragraph / Headings */}
          <button
            type="button"
            title="Normal text"
            onClick={() => handleHeading('p')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Large Heading (H1)"
            onClick={() => handleHeading('h1')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Medium Heading (H2)"
            onClick={() => handleHeading('h2')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Small Heading (H3)"
            onClick={() => handleHeading('h3')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="Bullet List"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            title="Align Left"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Center"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Right"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Word and Character Count */}
        <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 tabular-nums font-mono">
          <span>{stats.words} words</span>
          <span>·</span>
          <span>{stats.chars} chars</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleInput();
        }}
        className="journal-editor-content font-journal min-h-[380px] p-6 lg:p-8 text-lg leading-relaxed text-stone-800 dark:text-stone-200 outline-none focus:outline-none prose dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:font-sans [&_h2]:text-xl [&_h2]:font-medium [&_h2]:mb-2 [&_h2]:font-sans [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-1 [&_p]:mb-3.5 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3.5 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3.5"
      />
    </div>
  );
};
