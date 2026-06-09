import { useState, useEffect, useCallback } from 'react';
import { useWealthStore } from '../../store/wealthStore';
import { useVoiceNarration } from '../../hooks/useVoiceNarration';

const FD_SCHEMES = [
  { id: 'fd-1', bank: 'SBI', rate: 7.5, seniorRate: 8.0, amount: 500000, tenure: '5 years', maturity: '2029' },
  { id: 'fd-2', bank: 'HDFC', rate: 7.6, seniorRate: 8.1, amount: 300000, tenure: '3 years', maturity: '2027' },
  { id: 'fd-3', bank: 'ICICI', rate: 7.4, seniorRate: 7.9, amount: 200000, tenure: '1 year', maturity: '2026' },
];

const NOMINEES = [
  { id: 'nom-1', name: 'Deepanshu Sharma (Son)', relation: 'Son', percentage: 60, contact: '+91 98765 43210' },
  { id: 'nom-2', name: 'Priya Sharma (Daughter)', relation: 'Daughter', percentage: 40, contact: '+91 98765 43211' },
];

function SpeakOnHover({ text, children, className = '' }: { text: string; children: React.ReactNode; className?: string }) {
  const { speak, stopSpeaking, enabled } = useVoiceNarration();
  const seniorMode = useWealthStore((s) => s.seniorMode);
  const handleEnter = useCallback(() => {
    if (seniorMode || enabled) speak(text);
  }, [seniorMode, enabled, speak, text]);

  return (
    <div
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={stopSpeaking}
      onFocus={handleEnter}
      onBlur={stopSpeaking}
      tabIndex={0}
      aria-label={text}
    >
      {children}
    </div>
  );
}

export default function SeniorMode() {
  const toggleSeniorMode = useWealthStore((s) => s.toggleSeniorMode);
  const { speak } = useVoiceNarration();
  const [activeTab, setActiveTab] = useState<'deposits' | 'pension' | 'medical' | 'nominee' | 'safety'>('deposits');
  const [showFamilyConnect, setShowFamilyConnect] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [showEmergencyCalled, setShowEmergencyCalled] = useState(false);

  // Pension calculator state
  const [pensionAmount, setPensionAmount] = useState(25000);
  const [expenses, setExpenses] = useState(35000);
  const shortfall = Math.max(0, expenses - pensionAmount);

  // Medical corpus
  const medicalTarget = 1000000;
  const medicalCurrent = 650000;
  const medicalPercent = (medicalCurrent / medicalTarget) * 100;

  useEffect(() => {
    speak('Senior citizen mode is now active. All buttons are larger and text will be read aloud when you hover. Your fixed deposits, pension, and medical fund are shown here.');
  }, [speak]);

  const handleEmergencyCall = () => {
    setShowEmergencyCalled(true);
    speak('Calling your emergency contact now. Please stay calm.');
    setTimeout(() => setShowEmergencyCalled(false), 5000);
  };

  const totalFD = FD_SCHEMES.reduce((s, fd) => s + fd.amount, 0);
  const totalSeniorBenefit = FD_SCHEMES.reduce((s, fd) => s + (fd.amount * (fd.seniorRate - fd.rate) / 100), 0);

  return (
    <div className="space-y-6 senior-mode">
      {/* Header */}
      <SpeakOnHover text="Senior Citizen Wealth Center. Simple and safe." className="card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl shadow-lg">
              <i className="fas fa-person-cane" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Senior Citizen Center</h2>
              <p className="text-base text-slate-500">Simple. Safe. Comfortable.</p>
            </div>
          </div>
          <button
            onClick={toggleSeniorMode}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors text-base"
          >
            <i className="fas fa-arrow-left mr-2" /> Back to Normal View
          </button>
        </div>
      </SpeakOnHover>

      {/* Emergency Button */}
      <SpeakOnHover text="Big red emergency button. Press to call your son or daughter." className="w-full">
        <button
          onClick={handleEmergencyCall}
          className="w-full py-5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-xl"
        >
          <i className="fas fa-phone-volume text-2xl" />
          <span>Call My Son / Daughter</span>
        </button>
      </SpeakOnHover>

      {showEmergencyCalled && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center animate-fade-in">
          <p className="text-lg font-bold text-emerald-700">
            <i className="fas fa-phone mr-2" /> Calling Deepanshu Sharma...
          </p>
          <p className="text-base text-emerald-500">Please stay calm. Help is on the way.</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SpeakOnHover text={`Fixed deposits total ${totalFD.toLocaleString()} rupees`}>
          <div className="card bg-blue-50 border-2 border-blue-200 text-center">
            <p className="text-sm text-blue-600 font-medium">Fixed Deposits</p>
            <p className="text-2xl font-bold text-blue-800">₹{totalFD.toLocaleString()}</p>
          </div>
        </SpeakOnHover>
        <SpeakOnHover text={`Monthly pension is ${pensionAmount.toLocaleString()} rupees`}>
          <div className="card bg-emerald-50 border-2 border-emerald-200 text-center">
            <p className="text-sm text-emerald-600 font-medium">Monthly Pension</p>
            <p className="text-2xl font-bold text-emerald-800">₹{pensionAmount.toLocaleString()}</p>
          </div>
        </SpeakOnHover>
        <SpeakOnHover text={`Medical fund is ${medicalCurrent.toLocaleString()} out of ${medicalTarget.toLocaleString()}`}>
          <div className="card bg-amber-50 border-2 border-amber-200 text-center">
            <p className="text-sm text-amber-600 font-medium">Medical Fund</p>
            <p className="text-2xl font-bold text-amber-800">₹{(medicalCurrent / 1e5).toFixed(1)}L</p>
          </div>
        </SpeakOnHover>
        <SpeakOnHover text={`Extra interest benefit ${Math.round(totalSeniorBenefit).toLocaleString()} rupees per year`}>
          <div className="card bg-violet-50 border-2 border-violet-200 text-center">
            <p className="text-sm text-violet-600 font-medium">Extra Interest</p>
            <p className="text-2xl font-bold text-violet-800">+₹{Math.round(totalSeniorBenefit).toLocaleString()}/yr</p>
          </div>
        </SpeakOnHover>
      </div>

      {/* Big Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[
          { id: 'deposits' as const, label: 'Fixed Deposits', icon: 'fa-building-columns' },
          { id: 'pension' as const, label: 'Pension', icon: 'fa-money-bill-wave' },
          { id: 'medical' as const, label: 'Medical', icon: 'fa-heart-pulse' },
          { id: 'nominee' as const, label: 'Nominee', icon: 'fa-users' },
          { id: 'safety' as const, label: 'Safety', icon: 'fa-shield-halved' },
        ].map((tab) => (
          <SpeakOnHover key={tab.id} text={tab.label}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-base whitespace-nowrap transition-all min-h-[56px] ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-amber-300'
              }`}
            >
              <i className={`fas ${tab.icon} text-lg`} /> {tab.label}
            </button>
          </SpeakOnHover>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* FIXED DEPOSITS */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <SpeakOnHover text="Senior Citizen Savings Scheme. You can invest up to 30 lakhs at 8.2 percent interest">
              <div className="card bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-2xl">
                    <i className="fas fa-landmark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-emerald-800">Senior Citizen Savings Scheme (SCSS)</h3>
                    <p className="text-base text-emerald-600">Invest up to ₹30 Lakhs · 8.2% interest · Government backed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-700">8.2%</p>
                    <p className="text-sm text-emerald-500">per year</p>
                  </div>
                </div>
              </div>
            </SpeakOnHover>

            {FD_SCHEMES.map((fd) => (
              <SpeakOnHover key={fd.id} text={`${fd.bank} fixed deposit. Amount ${fd.amount.toLocaleString()}. Your senior rate is ${fd.seniorRate} percent. Normal rate is ${fd.rate} percent`}>
                <div className="card border-2 border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                        <i className="fas fa-building-columns" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{fd.bank} Fixed Deposit</h4>
                        <p className="text-base text-slate-500">{fd.tenure} · Matures {fd.maturity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">₹{fd.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className="text-sm text-slate-400 line-through">{fd.rate}%</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                          {fd.seniorRate}% (Senior)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-base text-amber-700 font-medium">
                      <i className="fas fa-star mr-2" />
                      You earn ₹{Math.round(fd.amount * (fd.seniorRate - fd.rate) / 100).toLocaleString()} EXTRA per year as a senior citizen!
                    </p>
                  </div>
                </div>
              </SpeakOnHover>
            ))}
          </div>
        )}

        {/* PENSION */}
        {activeTab === 'pension' && (
          <div className="space-y-6">
            <SpeakOnHover text="Pension Calculator. Calculate if your pension covers your expenses">
              <div className="card border-2 border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <i className="fas fa-calculator text-blue-500" /> Pension Calculator
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium text-slate-600 mb-2">Monthly Pension</label>
                    <input
                      type="number"
                      value={pensionAmount}
                      onChange={(e) => setPensionAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-slate-600 mb-2">Monthly Expenses</label>
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(Number(e.target.value))}
                      className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-slate-500">Pension</p>
                      <p className="text-2xl font-bold text-emerald-600">₹{pensionAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Expenses</p>
                      <p className="text-2xl font-bold text-rose-600">₹{expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Shortfall</p>
                      <p className={`text-2xl font-bold ${shortfall > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{shortfall.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {shortfall > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                    <p className="text-base font-bold text-amber-800 flex items-center gap-2">
                      <i className="fas fa-lightbulb text-amber-500" />
                      Suggestion: Reverse Mortgage
                    </p>
                    <p className="text-base text-amber-700 mt-1">
                      Your property (₹85L value) can provide ~₹15,000/month through reverse mortgage.
                      This covers your shortfall!
                    </p>
                    <button className="mt-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-base transition-colors">
                      Learn More About Reverse Mortgage
                    </button>
                  </div>
                )}
              </div>
            </SpeakOnHover>
          </div>
        )}

        {/* MEDICAL */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <SpeakOnHover text="Medical Emergency Fund. Target 10 lakhs. Current balance 6.5 lakhs">
              <div className="card border-2 border-rose-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <i className="fas fa-heart-pulse text-rose-500" /> Medical Emergency Fund
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base text-slate-600">Current</span>
                  <span className="text-base text-slate-600">Target</span>
                </div>
                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000"
                    style={{ width: `${medicalPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-rose-600">₹{medicalCurrent.toLocaleString()}</span>
                  <span className="text-lg text-slate-400">₹{medicalTarget.toLocaleString()}</span>
                </div>
                <p className="text-base text-slate-500 mt-2">
                  {Math.round(medicalPercent)}% complete · Need ₹{(medicalTarget - medicalCurrent).toLocaleString()} more
                </p>
              </div>
            </SpeakOnHover>

            <SpeakOnHover text="Health Insurance. 5 lakh cover. Renewal due in 3 months">
              <div className="card border-2 border-blue-200 bg-blue-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center text-white text-2xl">
                    <i className="fas fa-file-medical" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800">Health Insurance</h4>
                    <p className="text-base text-slate-500">Cover: ₹5,00,000 · Star Health Senior Citizen Plan</p>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-amber-100 text-amber-700 text-base font-bold rounded-full">
                      <i className="fas fa-clock mr-1" /> Renews in 3 months
                    </span>
                  </div>
                </div>
              </div>
            </SpeakOnHover>
          </div>
        )}

        {/* NOMINEE */}
        {activeTab === 'nominee' && (
          <div className="space-y-6">
            <SpeakOnHover text="Nominee Management. Decide who gets your wealth after you">
              <div className="card border-2 border-violet-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <i className="fas fa-users text-violet-500" /> Nominee Management
                </h3>
                <p className="text-base text-slate-500 mb-4">
                  Decide who receives your wealth. You can update this anytime.
                </p>
                <div className="space-y-3">
                  {NOMINEES.map((nom) => (
                    <div key={nom.id} className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center text-white text-xl">
                          <i className="fas fa-user" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">{nom.name}</p>
                          <p className="text-base text-slate-500">{nom.contact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-700">{nom.percentage}%</p>
                        <p className="text-sm text-violet-500">of wealth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpeakOnHover>

            <SpeakOnHover text="Family Connect. Send a read-only summary to your children">
              <button
                onClick={() => setShowFamilyConnect(true)}
                className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-xl"
              >
                <i className="fas fa-paper-plane text-2xl" />
                <span>Family Connect — Send Summary to Children</span>
              </button>
            </SpeakOnHover>

            {showFamilyConnect && (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-3">
                  <i className="fas fa-check" />
                </div>
                <p className="text-xl font-bold text-emerald-700">Summary Sent!</p>
                <p className="text-base text-emerald-600 mt-1">
                  Deepanshu and Priya have received a read-only summary of your accounts.
                </p>
                <button
                  onClick={() => setShowFamilyConnect(false)}
                  className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-base"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* SAFETY */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            <SpeakOnHover text="Simple Safety Tips. Never share your OTP. Do not click unknown links. Call your bank if unsure">
              <div className="card border-2 border-rose-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <i className="fas fa-shield-halved text-rose-500" /> Simple Safety Rules
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: 'fa-lock', text: 'NEVER share your OTP or PIN with anyone', color: 'bg-rose-100 text-rose-700' },
                    { icon: 'fa-link', text: 'Do NOT click links in unknown messages', color: 'bg-amber-100 text-amber-700' },
                    { icon: 'fa-phone', text: 'If unsure, CALL your bank directly', color: 'bg-blue-100 text-blue-700' },
                    { icon: 'fa-user-shield', text: 'Bank employees will NEVER ask for your password', color: 'bg-emerald-100 text-emerald-700' },
                  ].map((tip, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl ${tip.color}`}>
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl flex-shrink-0">
                        <i className={`fas ${tip.icon}`} />
                      </div>
                      <p className="text-lg font-bold">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SpeakOnHover>

            <SpeakOnHover text="Emergency Contact. Enter your son or daughters phone number for quick calling">
              <div className="card border-2 border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Emergency Contact</h3>
                <div className="flex gap-3">
                  <input
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Enter son/daughter phone number"
                    className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-base transition-colors">
                    Save
                  </button>
                </div>
                <p className="text-base text-slate-500 mt-2">
                  This number will be used for the "Call My Son/Daughter" button.
                </p>
              </div>
            </SpeakOnHover>
          </div>
        )}
      </div>
    </div>
  );
}
