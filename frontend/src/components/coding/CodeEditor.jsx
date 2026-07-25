import React from 'react';
import Editor from '@monaco-editor/react';

export function CodeEditor({ code, onChange, language = 'javascript' }) {
  const handleEditorChange = (value) => {
    onChange(value || '');
  };

  return (
    <div className="w-full h-[400px] border border-black/10 rounded-2xl overflow-hidden shadow-sm bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          lineNumbers: 'on',
          folding: true,
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
