import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorker } from 'tesseract.js';
import { useWealthStore } from '@/shared/store/wealthStore';
import type { Transaction } from '@/shared/types';

interface ExtractedData {
  merchant: string;
  amount: number;
  date: string;
  items: string[];
  category: string;
}

function inferCategory(text: string, merchant: string): string {
  const combined = (text + ' ' + merchant).toLowerCase();
  if (combined.match(/grocery|food|restaurant|zomato|swiggy|bigbasket|blinkit|instamart|eat|dining|biryani|pizza|burger|vegetable/)) return 'Food';
  if (combined.match(/petrol|fuel|shell|bp|indian oil|ola|uber|rapido|auto|taxi|transport|metro|train/)) return 'Transport';
  if (combined.match(/electric|water|broadband|wifi|mobile|recharge|bill|utility/)) return 'Utilities';
  if (combined.match(/amazon|flipkart|myntra|fashion|shopping|mall|retail/)) return 'Shopping';
  if (combined.match(/pharmacy|med|hospital|clinic|health|doctor|lab/)) return 'Health';
  if (combined.match(/netflix|hotstar|prime|spotify|movie|entertainment|cinema/)) return 'Entertainment';
  if (combined.match(/sip|mutual|fund|invest|stock|broker/)) return 'Investment';
  return 'Food';
}

function extractMerchant(lines: string[]): string {
  for (const line of lines.slice(0, 10)) {
    const clean = line.trim();
    if (clean.length >= 3 && clean.length <= 40 && !/^\d+$/.test(clean) && !/^\d{1,2}[./-]/.test(clean)) {
      if (/^[A-Z][A-Z0-9\s&.-]+$/.test(clean) || /^[A-Z][a-z]+/.test(clean)) {
        return clean;
      }
    }
  }
  const first = lines.find((l) => l.trim().length >= 3);
  return first?.trim() || 'Unknown Merchant';
}

function extractAmount(text: string): number {
  const patterns = [
    /(?:grand\s*total|total\s*amount|amount\s*due|net\s*amount|final\s*amount|bill\s*total|total)[\s:]*[₹Rs.]?\s*([\d,]+\.?\d{0,2})/i,
    /[₹]\s*([\d,]+\.?\d{0,2})/,
    /Rs\.?\s*([\d,]+\.?\d{0,2})/i,
    /total[\s:]*([\d,]+\.?\d{0,2})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0) return val;
    }
  }
  return 0;
}

function extractDate(text: string): string {
  const patterns = [
    /\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/,
    /\b(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const parts = m[1].split(/[./-]/);
      if (parts.length === 3) {
        const a = parseInt(parts[0]);
        const b = parseInt(parts[1]);
        const c = parseInt(parts[2]);
        if (c > 2000 && c < 2100) {
          const date = new Date(c, b - 1, a);
          if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
        }
        if (a > 2000 && a < 2100) {
          const date = new Date(a, b - 1, c);
          if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
        }
        const y = c < 50 ? 2000 + c : 1900 + c;
        const date1 = new Date(y, b - 1, a);
        const date2 = new Date(y, a - 1, b);
        if (!isNaN(date1.getTime())) return date1.toISOString().split('T')[0];
        if (!isNaN(date2.getTime())) return date2.toISOString().split('T')[0];
      }
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractItems(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    const clean = line.trim();
    const lower = clean.toLowerCase();
    if (clean.length < 3 || clean.length > 55) continue;
    if (/(total|tax|gst|subtotal|grand|discount|offer|save|thank|visit|call|www\.|\.com|phone|cash|card|upi|change|paid|payable)/.test(lower)) continue;
    if (/^\d+$/.test(clean)) continue;
    if (/[a-zA-Z]{2,}/.test(clean) && /\d/.test(clean)) {
      items.push(clean);
    }
  }
  return items.slice(0, 10);
}

function parseReceiptText(text: string): ExtractedData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const merchant = extractMerchant(lines);
  const amount = extractAmount(text);
  const date = extractDate(text);
  const items = extractItems(lines);
  const category = inferCategory(text, merchant);
  return { merchant, amount, date, items, category };
}

export default function ScanReceipt() {
  const [showScanner, setShowScanner] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Food');
  const [items, setItems] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const addTransaction = useWealthStore((s) => s.addTransaction);
  const transactions = useWealthStore((s) => s.transactions);

  const diningSpend = transactions
    .filter((t) => t.category === 'Food' && t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  const resetAll = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageUrl(null);
    setIsAnalyzing(false);
    setOcrProgress(0);
    setOcrStatus('');
    setError(null);
    setShowForm(false);
    setMerchant('');
    setAmount('');
    setDate('');
    setCategory('Food');
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = useCallback(() => {
    setShowScanner(false);
    resetAll();
  }, [resetAll]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setShowForm(false);
    setOcrProgress(0);
    setOcrStatus('Preparing image...');

    const url = URL.createObjectURL(file);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = url;
    setImageUrl(url);
    setIsAnalyzing(true);

    try {
      const worker = await createWorker('eng', undefined, {
        logger: (m) => {
          setOcrProgress(Math.round(m.progress * 100));
          setOcrStatus(m.status);
        },
      });

      const ret = await worker.recognize(url);
      await worker.terminate();

      const extracted = parseReceiptText(ret.data.text);
      setMerchant(extracted.merchant);
      setAmount(extracted.amount.toString());
      setDate(extracted.date);
      setCategory(extracted.category);
      setItems(extracted.items);
      setShowForm(true);
      setOcrStatus('Analysis complete!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed. Please try a clearer image.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    const amt = parseFloat(amount);
    if (!merchant.trim() || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid merchant name and amount.');
      return;
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      description: `${merchant.trim()} — Receipt Scan${items.length > 0 ? ` (${items.length} items)` : ''}`,
      category,
      amount: amt,
      type: 'debit',
      status: 'ALLOWED',
      riskLevel: 'LOW',
    };

    addTransaction(tx);
    setShowSuccess(true);
    handleClose();
    setTimeout(() => setShowSuccess(false), 4000);
  }, [merchant, amount, date, category, items, addTransaction, handleClose]);

  const handleItemChange = useCallback((index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, '']);
  }, []);

  return (
    <>
      {/* Trigger Button + Dining Insight */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => setShowScanner(true)}
          className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 min-h-[44px]"
        >
          <i className="fas fa-camera" />
          Scan Receipt
        </button>

        {diningSpend > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-300">
            <i className="fas fa-chart-line" />
            <span>
              You spent <strong>₹{diningSpend.toLocaleString()}</strong> on dining this month.
              <span className="text-rose-500 dark:text-rose-400 ml-1">23% higher than last month</span>
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Close scanner"
              >
                <i className="fas fa-xmark" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <i className="fas fa-camera text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scan Receipt</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {showForm ? 'Review and edit extracted details' : 'Take a photo or upload a receipt image'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!showForm ? (
                  <motion.div
                    key="capture"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!imageUrl ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-3 transition-colors group"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <i className="fas fa-image text-2xl text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Tap to capture or upload</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Camera on mobile, file picker on desktop</p>
                        </div>
                      </button>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-4">
                        <img src={imageUrl} alt="Receipt preview" className="w-full object-contain max-h-[300px] bg-slate-900" />
                        {isAnalyzing && (
                          <>
                            <motion.div
                              className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(27,94,32,0.8)]"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                                <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">
                                  {ocrStatus || 'Analyzing receipt...'}
                                </p>
                                <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ocrProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ocrProgress}%</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {imageUrl && !isAnalyzing && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors min-h-[48px] shadow-lg shadow-primary/20"
                        >
                          <i className="fas fa-rotate-right mr-2" /> Choose Another
                        </button>
                      </div>
                    )}

                    {error && !isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-xl flex items-start gap-2"
                      >
                        <i className="fas fa-circle-exclamation text-rose-500 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-xl flex items-start gap-2"
                      >
                        <i className="fas fa-circle-exclamation text-rose-500 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                        Merchant
                      </label>
                      <input
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="input-psb dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                        placeholder="e.g. BigBasket"
                      />
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-2 gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-psb dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                          Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="input-psb dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-psb dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Utilities</option>
                        <option>Shopping</option>
                        <option>Health</option>
                        <option>Entertainment</option>
                        <option>Investment</option>
                        <option>Housing</option>
                        <option>Income</option>
                        <option>Other</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Items
                        </label>
                        <button
                          onClick={handleAddItem}
                          className="text-xs text-primary hover:text-primary-dark font-medium px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <i className="fas fa-plus mr-1" /> Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        <AnimatePresence>
                          {items.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleItemChange(i, e.target.value)}
                                className="input-psb flex-1 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                                placeholder="Item name"
                              />
                              <button
                                onClick={() => handleRemoveItem(i)}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center"
                                aria-label="Remove item"
                              >
                                <i className="fas fa-trash text-xs" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {items.length === 0 && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No items extracted</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex gap-2 pt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors min-h-[48px] shadow-lg shadow-primary/20"
                      >
                        <i className="fas fa-plus mr-2" /> Add to Transactions
                      </button>
                      <button
                        onClick={resetAll}
                        className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[48px]"
                      >
                        Scan Another
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[90] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium"
          >
            <i className="fas fa-check-circle text-lg" />
            <div>
              <p>Receipt scanned and categorized by AI!</p>
              <p className="text-[10px] text-emerald-100">Added to your transactions</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
