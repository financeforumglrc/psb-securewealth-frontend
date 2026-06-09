import { useState } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onGenerate: (format: 'pdf' | 'html') => void;
}

export default function ReportGeneratorModal({ show, onClose, onGenerate }: Props) {
  const [format, setFormat] = useState<'pdf' | 'html'>('html');
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onGenerate(format);
      onClose();
    }, 2000);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Generate Financial Report</h3>
            <p className="text-xs text-white/80 mt-0.5">Monthly summary with AI insights</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {generating ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Generating your report...</p>
              <p className="text-xs text-slate-400 mt-1">Analyzing portfolio, goals, and market data</p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Report Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('html')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      format === 'html'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`fas fa-globe text-lg ${format === 'html' ? 'text-primary' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${format === 'html' ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>HTML View</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Interactive, printable, shareable</p>
                  </button>

                  <button
                    onClick={() => setFormat('pdf')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      format === 'pdf'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`fas fa-file-pdf text-lg ${format === 'pdf' ? 'text-primary' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${format === 'pdf' ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>PDF Export</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Professional document format</p>
                  </button>
                </div>
              </div>

              {/* Report Contents Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Report Includes</label>
                <div className="space-y-1.5">
                  {[
                    { icon: 'fa-chart-pie', label: 'Net worth summary with donut chart' },
                    { icon: 'fa-bullseye', label: 'Goal progress table' },
                    { icon: 'fa-lightbulb', label: 'AI investment recommendations' },
                    { icon: 'fa-shield-halved', label: 'Protection layer summary' },
                    { icon: 'fa-receipt', label: 'Tax saving opportunities' },
                    { icon: 'fa-globe', label: 'Market outlook summary' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <i className={`fas ${item.icon} text-primary text-xs w-4`} />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleGenerate} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <i className="fas fa-wand-magic-sparkles" /> Generate Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
