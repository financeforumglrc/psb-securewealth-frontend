import { useState } from 'react';

export default function ScamCallerID() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(true)} className="card text-left hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
            <i className="fas fa-phone-volume" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Scam Caller ID</h3>
            <p className="text-[10px] text-slate-400">Simulate scam call detection</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Demonstrates AI-powered caller identification that flags known scam numbers before you answer.</p>
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShow(false)}>
          <div className="bg-white dark:bg-dark-light rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-rose-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <i className="fas fa-phone-volume text-3xl" />
              </div>
              <p className="text-sm font-medium">Incoming Call</p>
              <h3 className="text-2xl font-bold mt-1">+91 98452 110XX</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                <i className="fas fa-triangle-exclamation" /> SCAM LIKELY
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium"><i className="fas fa-shield-halved mr-1" />This number has been reported 234 times for fraud.</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Common tactic: Pretends to be from your bank and asks for OTP.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShow(false)} className="py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
                  <i className="fas fa-phone-slash mr-1" />Decline
                </button>
                <button onClick={() => { alert('Number reported to cybercrime database'); setShow(false); }} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  <i className="fas fa-flag mr-1" />Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
