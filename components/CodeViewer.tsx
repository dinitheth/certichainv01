import React from 'react';
import { Copy } from 'lucide-react';

interface Props {
  title: string;
  code: string;
}

const CodeViewer: React.FC<Props> = ({ title, code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl mb-8">
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
        <h3 className="font-mono text-slate-200 text-sm font-semibold">{title}</h3>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;