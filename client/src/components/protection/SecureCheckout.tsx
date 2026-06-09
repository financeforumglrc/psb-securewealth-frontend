import { useState, useEffect } from 'react';

interface SecureCheckoutProps {
  show: boolean;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Verifying device fingerprint...', width: '25%', delay: 400 },
  { label: 'Running fraud detection...', width: '50%', delay: 900 },
  { label: 'Encrypting transaction data...', width: '75%', delay: 1400 },
  { label: 'Confirming with RBI network...', width: '100%', delay: 1900 },
];

export default function SecureCheckout({ show, onComplete }: SecureCheckoutProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    if (!show) return;
    setProgress(0);
    setCurrentStep(-1);
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        setProgress(parseInt(step.width));
      }, step.delay);
    });
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 z-[80] flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-6 max-w-sm px-6">
        <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fingerprint text-4xl text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Secure Transaction in Progress</h3>
          <p className="text-sm text-slate-400 mt-2">Please do not close or refresh this window</p>
        </div>
        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
              <i className={`fas ${i <= currentStep ? 'fa-circle-check text-emerald-400' : 'fa-circle text-slate-600'}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
