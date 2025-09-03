import React, { useRef, useState } from 'react';
import { FileSearchIcon, XIcon, FileUploadIcon } from './Icons';

interface ToolsPanelProps {
  onAnalyzeFile: (fileContent: string) => void;
}


export const ToolsPanel: React.FC<ToolsPanelProps> = ({ onAnalyzeFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsModalOpen(false); // Close modal on file selection

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onAnalyzeFile(content);
      }
    };
    reader.onerror = (e) => {
        console.error("Error reading file:", e);
    }
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 h-full border border-gray-700 flex flex-col justify-start">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Payment Tools</h2>
          
          <div>
              <h3 className="text-base font-semibold text-green-400 mb-2">Financial File Analysis</h3>
              <p className="text-sm text-gray-400 mb-4">
                  Analyze local files like exported transaction histories (CSV), financial reports, or logs to get summaries and deep insights.
              </p>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json,.txt,.md,.csv"
              />
              <button 
                  onClick={() => setIsModalOpen(true)}
                  title="Start file analysis"
                  aria-label="Start file analysis"
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-500 transition-all duration-200">
                  <FileSearchIcon className="w-5 h-5" />
                  Analyze Local File
              </button>
          </div>
      </div>

      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-analysis-title"
        >
            <div 
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg text-gray-200 p-6 relative transform transition-all animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close dialog"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 id="file-analysis-title" className="text-xl font-bold text-green-400 mb-4">AI File Analysis Guide</h2>
                <p className="text-gray-400 mb-6">
                    For your security, I don't access your files automatically. Please select a text-based file, and I'll analyze its contents for you. This works best for:
                </p>
                
                <ul className="space-y-4 text-sm mb-8">
                    <li className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="font-semibold text-gray-200">📊 Transaction History (CSV)</p>
                        <p className="text-gray-400 mt-1">Export from your bank or accounting software to identify spending patterns and income sources.</p>
                    </li>
                    <li className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="font-semibold text-gray-200">📝 Log Files (.txt, .log)</p>
                        <p className="text-gray-400 mt-1">Analyze payment gateway logs or system reports to find errors and summarize activity.</p>
                    </li>
                    <li className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="font-semibold text-gray-200">🧾 Scanned Invoices (.txt)</p>
                        <p className="text-gray-400 mt-1">Use an OCR tool to convert image-based invoices to text, then upload for data extraction.</p>
                    </li>
                </ul>

                <button 
                    onClick={handleFileButtonClick}
                    title="Select a file to upload and analyze"
                    aria-label="Select a file to upload and analyze"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 transition-all duration-200">
                    <FileUploadIcon className="w-5 h-5" />
                    Select File to Analyze
                </button>
            </div>
        </div>
      )}
    </>
  );
};
