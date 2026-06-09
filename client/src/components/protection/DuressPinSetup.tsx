import { useState } from 'react';
import { setDuressPin, getDuressPin, clearDuressPin } from '../../services/duressService';

export default function DuressPinSetup() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saved, setSaved] = useState(!!getDuressPin());
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    setError('');
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setDuressPin(pin);
    setSaved(true);
    setShowForm(false);
    setPin('');
    setConfirmPin('');
  };

  const handleClear = () => {
    clearDuressPin();
    setSaved(false);
    setPin('');
    setConfirmPin('');
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
          <i className="fas fa-user-secret" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Coerced Transaction Shield</h3>
          <p className="text-[10px] text-slate-400">Silent alert & account lockdown</p>
        </div>
      </div>

      {saved ? (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
            <i className="fas fa-shield-halved text-emerald-500" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Duress PIN is active and secure.</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            During any transfer, entering your duress PIN will simulate a fake success, silently alert authorities, and lock your account for 24 hours.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Change PIN
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
            >
              Disable
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a secret duress PIN. If you are forced to make a transaction, use this PIN instead of your real one.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Set Duress PIN
          </button>
        </div>
      )}

      {showForm && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">New 6-Digit Duress PIN</label>
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold tracking-widest"
              placeholder="●●●●●●"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">Confirm PIN</label>
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold tracking-widest"
              placeholder="●●●●●●"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Save PIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
