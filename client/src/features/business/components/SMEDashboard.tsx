import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import CashFlowTimeline from './CashFlowTimeline';
import SurplusFundAdvisor from './SurplusFundAdvisor';
import WorkingCapitalHealth from './WorkingCapitalHealth';
import KhataOverview from './KhataOverview';
import GSTEstimator from './GSTEstimator';
import InvoiceTracker from './InvoiceTracker';
import VendorPaymentPlanner from './VendorPaymentPlanner';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'fa-grid-2' },
  { id: 'cashflow', label: 'Cash Flow', icon: 'fa-chart-column' },
  { id: 'working-capital', label: 'Working Capital', icon: 'fa-heart-pulse' },
  { id: 'surplus', label: 'Surplus Advisor', icon: 'fa-piggy-bank' },
  { id: 'gst', label: 'GST Estimator', icon: 'fa-calculator' },
  { id: 'invoices', label: 'Invoices', icon: 'fa-file-invoice-dollar' },
  { id: 'vendors', label: 'Vendor Payments', icon: 'fa-handshake' },
];

export default function SMEDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    const tab = TABS.find((t) => t.id === activeTab);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Khata Business Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Section: ${tab?.label || 'Overview'}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 40);
    doc.setFontSize(10);
    doc.text(
      'This report is generated from PSB SecureWealth Khata for demonstration purposes.',
      14,
      52,
      { maxWidth: 180 }
    );
    doc.text(
      'Khata helps SMEs track cash flow, working capital, surplus deployment, GST estimates, invoices, and vendor payments.',
      14,
      64,
      { maxWidth: 180 }
    );
    doc.save(`khata-${activeTab}-report.pdf`);
  };

  return (
    <div className="space-y-4" ref={contentRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-book-open text-primary" /> Khata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Cash flow, GST, invoices, vendor discounts and working capital — all in one business ledger.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPDF}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-file-pdf" /> Export PDF
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            <i className="fas fa-building" /> Business
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${tab.icon}`} />
              {tab.label}
              {active && (
                <motion.div layoutId="smeTab" className="absolute bottom-[-9px] left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full min-w-0"
      >
        {activeTab === 'overview' && <KhataOverview onNavigate={setActiveTab} />}
        {activeTab === 'cashflow' && <CashFlowTimeline />}
        {activeTab === 'surplus' && <SurplusFundAdvisor />}
        {activeTab === 'working-capital' && <WorkingCapitalHealth />}
        {activeTab === 'gst' && <GSTEstimator />}
        {activeTab === 'invoices' && <InvoiceTracker />}
        {activeTab === 'vendors' && <VendorPaymentPlanner />}
      </motion.div>
    </div>
  );
}
