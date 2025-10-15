'use client';

import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleInsert = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => handleInsert('**', '**'),
      className: 'font-bold',
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => handleInsert('*', '*'),
      className: 'italic',
    },
    {
      label: 'Heading',
      icon: 'H',
      action: () => handleInsert('\n## '),
      className: 'font-bold',
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => handleInsert('`', '`'),
      className: 'font-mono',
    },
    {
      label: 'Link',
      icon: '🔗',
      action: () => handleInsert('[', '](url)'),
    },
    {
      label: 'Image',
      icon: '🖼️',
      action: () => handleInsert('![alt](', ')'),
    },
    {
      label: 'List',
      icon: '•',
      action: () => handleInsert('\n- '),
    },
    {
      label: 'Quote',
      icon: '" "',
      action: () => handleInsert('\n> '),
    },
  ];

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-2 flex items-center gap-1">
        <div className="flex items-center gap-1 pr-2 border-r border-gray-800">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              onClick={button.action}
              className={`px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition ${button.className}`}
              title={button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-4 py-1.5 text-sm rounded transition ${
              activeTab === 'write'
                ? 'bg-cosmos-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 text-sm rounded transition ${
              activeTab === 'preview'
                ? 'bg-cosmos-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {activeTab === 'write' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your content in Markdown...'}
            className="w-full h-[500px] p-6 bg-gray-950 text-white font-mono text-sm resize-none focus:outline-none"
            style={{ lineHeight: '1.6' }}
          />
        ) : (
          <div className="h-[500px] overflow-y-auto p-6 bg-gray-950">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-500 text-center py-12">
                Nothing to preview. Start writing in the Write tab!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer with character count */}
      <div className="bg-gray-900/50 border-t border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Supports GitHub Flavored Markdown with syntax highlighting
        </div>
        <div className="text-xs text-gray-400">
          {value.length} characters • {value.split(/\s+/).filter((w) => w).length} words
        </div>
      </div>
    </div>
  );
}
