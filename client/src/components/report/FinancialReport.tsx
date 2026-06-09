import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useWealthStore } from '../../store/wealthStore';
import { exportUserDataToFile, saveBlobToFile } from '../../services/exportService';

interface Props {
  onClose: () => void;
  format: 'pdf' | 'html';
}

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

export default function FinancialReport({ onClose, format }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const marketData = useWealthStore((s) => s.marketData);
  const transactions = useWealthStore((s) => s.transactions);

  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const pieData = [
    { name: 'Bank/FD', value: assets.filter((a) => a.type === 'bank').reduce((s, a) => s + a.value, 0) },
    { name: 'Mutual Funds', value: assets.filter((a) => a.type === 'mutualFund').reduce((s, a) => s + a.value, 0) },
    { name: 'Stocks', value: assets.filter((a) => a.type === 'stock').reduce((s, a) => s + a.value, 0) },
    { name: 'Gold', value: assets.filter((a) => a.type === 'gold').reduce((s, a) => s + a.value, 0) },
    { name: 'Property', value: assets.filter((a) => a.type === 'property').reduce((s, a) => s + a.value, 0) },
  ].filter((d) => d.value > 0);

  const blockedCount = transactions.filter((t) => t.status === 'BLOCKED').length;
  const blockedAmount = transactions.filter((t) => t.status === 'BLOCKED').reduce((s, t) => s + t.amount, 0);

  const healthScore = Math.min(Math.round((user.monthlySavings / user.monthlyIncome) * 200 + 40), 100);

  const recommendations = [
    { title: 'Increase SIP by ₹2,000', desc: 'Your equity allocation is below target for your age. Increasing SIP will improve long-term returns.', why: 'Based on your Moderate risk profile and 30% tax bracket.', impact: '+₹8.4L in 10 years' },
    { title: 'Open PPF Account', desc: 'You have no tax-free debt exposure. PPF offers 7.1% tax-free returns under EEE status.', why: 'Section 80C limit underutilized by ₹45,000.', impact: 'Save ₹14,040/year in taxes' },
    { title: 'Rebalance Gold Allocation', desc: 'Physical gold is 4.5% of portfolio. Consider sovereign gold bonds for 2.5% extra return.', why: 'SGBs offer interest + no storage cost vs physical gold.', impact: '+₹5,000/year' },
  ];

  const taxOpportunities = [
    { section: '80C (PPF/ELSS/NSC)', limit: 150000, used: 105000, remaining: 45000 },
    { section: '80D (Health Insurance)', limit: 25000, used: 0, remaining: 25000 },
    { section: '80CCD(1B) (NPS)', limit: 50000, used: 0, remaining: 50000 },
    { section: 'Home Loan Interest', limit: 200000, used: 0, remaining: 200000 },
  ];

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    setError(null);
    try {
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      } as unknown as Record<string, unknown>);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `SecureWealth_Report_${dateStr}.pdf`;

      const pdfBlob = pdf.output('blob');
      await saveBlobToFile(pdfBlob, fileName, 'PDF', { 'application/pdf': ['.pdf'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJSON = async () => {
    setError(null);
    try {
      await exportUserDataToFile(assets, goals, transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] rotate-[-30deg] select-none">
        <span className="text-6xl font-black text-primary tracking-widest">SecureWealth Twin — Confidential</span>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-halved text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Financial Report</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} • {format.toUpperCase()} Format</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {format === 'pdf' ? (
            <>
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />
                {isGenerating ? 'Generating PDF...' : 'Save to File'}
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-file-code" /> Export JSON
              </button>
            </>
          ) : (
            <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
              <i className="fas fa-print" /> Print
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <i className="fas fa-times" /> Close
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="sticky top-[60px] z-10 bg-rose-100 dark:bg-rose-900/30 border-b border-rose-200 dark:border-rose-800 px-6 py-2">
          <p className="text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <i className="fas fa-circle-exclamation" /> {error}
          </p>
        </div>
      )}

      {/* Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <i className="fas fa-spinner fa-spin text-3xl text-primary" />
            <p className="text-lg font-medium text-slate-800 dark:text-slate-100">Generating PDF...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we prepare your report</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div ref={reportRef} className="max-w-4xl mx-auto p-8 space-y-8 bg-white">
        {/* Header Block */}
        <div className="text-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Monthly Financial Report</h1>
          <p className="text-sm text-slate-500">Prepared for {user.name} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-medium">
            <i className="fas fa-lock" /> Confidential — SecureWealth Twin
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">₹{(netWorth / 1e7).toFixed(2)}Cr</p>
            <p className="text-xs text-slate-500">Net Worth</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-secondary">{healthScore}/100</p>
            <p className="text-xs text-slate-500">Financial Health</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">₹{user.monthlySavings.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Monthly Savings</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">{goals.length}</p>
            <p className="text-xs text-slate-500">Active Goals</p>
          </div>
        </div>

        {/* Asset Allocation Donut */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-primary pl-3">Asset Allocation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-slate-700">{d.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">₹{(d.value / 1e5).toFixed(1)}L</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-medium">
                <span className="text-slate-500">Total</span>
                <span className="text-slate-800">₹{(netWorth / 1e7).toFixed(2)}Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Progress Table */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-secondary pl-3">Goal Progress</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-2 font-medium">Goal</th>
                  <th className="pb-2 font-medium text-right">Target</th>
                  <th className="pb-2 font-medium text-right">Current</th>
                  <th className="pb-2 font-medium text-right">Progress</th>
                  <th className="pb-2 font-medium text-right">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((g) => {
                  const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                  return (
                    <tr key={g.id} className="border-b border-slate-50">
                      <td className="py-2.5 font-medium text-slate-800">{g.name}</td>
                      <td className="py-2.5 text-right text-slate-600">₹{g.targetAmount.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-600">₹{g.currentAmount.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {pct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500">{new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Recommendations */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-accent pl-3">AI Investment Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-bold text-slate-800">{i + 1}. {rec.title}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{rec.impact}</span>
                </div>
                <p className="text-xs text-slate-600 mb-1.5">{rec.desc}</p>
                <p className="text-[10px] text-slate-400"><i className="fas fa-lightbulb text-accent mr-1" />{rec.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Protection Layer Summary */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-rose-500 pl-3">Protection Layer Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{transactions.filter((t) => t.status === 'ALLOWED').length}</p>
              <p className="text-xs text-emerald-600">Transactions Allowed</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl text-center border border-rose-100">
              <p className="text-2xl font-bold text-rose-700">{blockedCount}</p>
              <p className="text-xs text-rose-600">Threats Blocked</p>
              <p className="text-[10px] text-rose-400">₹{blockedAmount.toLocaleString()} protected</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{transactions.filter((t) => t.status === 'DELAYED').length}</p>
              <p className="text-xs text-amber-600">Cooling Vault Activations</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-primary">
              <i className="fas fa-shield-halved mr-1" />
              Your protection layer has analyzed {transactions.length} transactions this month with a fraud prevention accuracy of 99.4%.
            </p>
          </div>
        </div>

        {/* Tax Saving Opportunities */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">Tax Saving Opportunities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-2 font-medium">Section</th>
                  <th className="pb-2 font-medium text-right">Limit</th>
                  <th className="pb-2 font-medium text-right">Used</th>
                  <th className="pb-2 font-medium text-right">Remaining</th>
                  <th className="pb-2 font-medium text-right">Tax Save</th>
                </tr>
              </thead>
              <tbody>
                {taxOpportunities.map((t) => {
                  const taxSave = Math.round(t.remaining * (user.taxBracket / 100));
                  return (
                    <tr key={t.section} className="border-b border-slate-50">
                      <td className="py-2.5 font-medium text-slate-800">{t.section}</td>
                      <td className="py-2.5 text-right text-slate-600">₹{t.limit.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-600">₹{t.used.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-rose-600">₹{t.remaining.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">₹{taxSave.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right">
            <p className="text-sm font-bold text-emerald-700">
              Total untapped tax savings: ₹{taxOpportunities.reduce((s, t) => s + Math.round(t.remaining * (user.taxBracket / 100)), 0).toLocaleString()}/year
            </p>
          </div>
        </div>

        {/* Market Outlook */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Market Outlook</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-lg font-bold text-slate-800">{marketData.niftyPe}</p>
              <p className="text-[10px] text-slate-500">NIFTY P/E Ratio</p>
              <p className="text-[10px] text-amber-600">Above avg</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-lg font-bold text-slate-800">{marketData.repoRate}%</p>
              <p className="text-[10px] text-slate-500">RBI Repo Rate</p>
              <p className="text-[10px] text-emerald-600">Stable</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-lg font-bold text-slate-800">₹{marketData.goldPrice.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Gold (10g)</p>
              <p className="text-[10px] text-emerald-600">+2.3% MoM</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-lg font-bold text-slate-800">₹{marketData.usdInr}</p>
              <p className="text-[10px] text-slate-500">USD/INR</p>
              <p className="text-[10px] text-amber-600">Volatile</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700">
              <i className="fas fa-chart-line mr-1" />
              With NIFTY P/E at {marketData.niftyPe} and repo rate at {marketData.repoRate}%, consider staggered SIP entry and increase debt allocation by 5%.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-200 pt-6 pb-4">
          <p className="text-xs text-slate-400">
            This report is generated by SecureWealth Twin AI and is for informational purposes only.
            Consult a SEBI-registered investment advisor before making financial decisions.
          </p>
          <p className="text-[10px] text-slate-300 mt-1">© 2026 SecureWealth Twin • PSB Hackathon Series</p>
        </div>
      </div>
    </div>
  );
}
