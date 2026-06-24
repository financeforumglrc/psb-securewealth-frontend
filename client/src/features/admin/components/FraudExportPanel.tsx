import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText, Download, Loader2, Calendar, Filter } from 'lucide-react';
import { fraudService, categoryLabel } from '@/features/admin/services/fraudService';
import type { FraudExportFormat, FraudCaseFilters } from '@/features/admin/lib/fraudTypes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import jsPDF from 'jspdf';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function FraudExportPanel() {
  const { t } = useTranslation();
  const [format, setFormat] = useState<FraudExportFormat>('xlsx');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FraudCaseFilters>({ limit: 1000 });
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await fraudService.exportCases(format, filters);
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadBlob(blob, `fraud-cases-${new Date().toISOString().slice(0, 10)}.${ext}`);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSummary = async () => {
    setPdfLoading(true);
    try {
      const res = await fraudService.getCases({ ...filters, limit: 100 });
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text('Fraud Intelligence Center — Case Summary', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);

      let y = 40;
      doc.setFontSize(11);
      doc.text(`Total matching cases: ${res.total}`, 14, y);
      y += 10;

      res.cases.slice(0, 50).forEach((c, i) => {
        if (y > 180) {
          doc.addPage();
          y = 20;
        }
        const line = `${i + 1}. ${c.caseRef} | ${c.status.replace(/_/g, ' ')} | ${c.priority} | ${categoryLabel(c.category)} | Risk ${c.riskScore} | ${c.summary.slice(0, 90)}...`;
        doc.setFontSize(9);
        doc.text(line, 14, y);
        y += 6;
      });

      doc.save(`fraud-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err: any) {
      alert(err.message || 'PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          {t('fraudIntelExportTitle')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t('fraudIntelExportSubtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Min Risk Score</label>
            <input
              type="number"
              min={0}
              max={100}
              value={filters.minRisk ?? ''}
              onChange={(e) => setFilters(f => ({ ...f, minRisk: e.target.value ? parseInt(e.target.value, 10) : undefined, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setFormat('xlsx')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
              format === 'xlsx'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            {t('fraudIntelExcel')}
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
              format === 'csv'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            <FileText className="w-5 h-5" />
            {t('fraudIntelCsv')}
          </button>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {loading ? 'Generating export...' : (format === 'xlsx' ? t('fraudIntelDownloadExcel') : t('fraudIntelDownloadCsv'))}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          {t('fraudIntelPdfTitle')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t('fraudIntelPdfSubtitle')}
        </p>
        <button
          onClick={handlePdfSummary}
          disabled={pdfLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60"
        >
          {pdfLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {pdfLoading ? 'Generating PDF...' : t('fraudIntelDownloadPdf')}
        </button>
      </motion.div>
    </div>
  );
}
