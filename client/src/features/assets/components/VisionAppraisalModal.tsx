import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWealthStore } from '@/shared/store/wealthStore';
import { backendApi } from '@/shared/lib/backendApi';
import type { Asset } from '@/shared/types';

interface Props {
  show: boolean;
  onClose: () => void;
}

type AppraisalState = 'idle' | 'scanning' | 'result' | 'added';

interface AppraisalResult {
  assetType: string;
  weightGrams: number;
  purity: string;
  marketValue: number;
  confidence: number;
}

export default function VisionAppraisalModal({ show, onClose }: Props) {
  const addAsset = useWealthStore((s) => s.addAsset);
  const [state, setState] = useState<AppraisalState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState('idle');
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG/PNG).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = String(e.target?.result || '');
      setPreview(base64);
      setState('scanning');
      try {
        const res = await backendApi.appraiseVision({ imageBase64: base64 });
        if (res.ok && res.data?.success) {
          setResult(res.data.data as AppraisalResult);
          setState('result');
        } else {
          setError(res.data?.error || 'Appraisal failed. Please try again.');
          setState('idle');
        }
      } catch {
        setError('Network error. Please try again.');
        setState('idle');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleAddToNetWorth = () => {
    if (!result) return;
    const asset: Asset = {
      id: `vision-${Date.now()}`,
      name: `${result.assetType} (Vision Appraisal)`,
      type: 'gold',
      value: result.marketValue,
      liquidity: 'high',
    };
    addAsset(asset);
    setState('added');
    setTimeout(handleClose, 1500);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <i className="fas fa-camera" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Vision Asset Appraisal</h3>
              <p className="text-[10px] text-slate-400">Upload a photo. AI estimates value in seconds.</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl mb-3">
                  <i className="fas fa-cloud-arrow-up" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Drop a photo or click to upload</p>
                <p className="text-[10px] text-slate-400 mt-1">JPG/PNG • Max 5MB</p>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
              </motion.div>
            )}

            {(state === 'scanning' || state === 'result' || state === 'added') && preview && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center"
              >
                <img src={preview} alt="Asset preview" className="w-full h-full object-cover opacity-80" />

                {state === 'scanning' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                    />
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-xs font-bold text-white flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin" /> AI analysing metal purity & weight…
                      </p>
                    </div>
                  </>
                )}

                {state === 'added' && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl mb-2">
                      <i className="fas fa-check" />
                    </div>
                    <p className="text-sm font-bold text-white">Added to Net Worth</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <i className="fas fa-triangle-exclamation mt-0.5" />
              {error}
            </motion.div>
          )}

          {state === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Asset Type</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{result.assetType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimated Weight</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{result.weightGrams} g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Purity</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{result.purity}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-bold">Market Value</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">₹{result.marketValue.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[9px] text-slate-400">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
            </motion.div>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2">
          {state === 'result' ? (
            <>
              <button
                onClick={handleAddToNetWorth}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus" /> Add to Net Worth
              </button>
              <button
                onClick={reset}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Scan Again
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {state === 'added' ? 'Done' : 'Cancel'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
