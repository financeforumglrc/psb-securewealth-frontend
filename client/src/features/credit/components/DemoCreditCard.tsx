import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';

export default function DemoCreditCard() {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const userName = useWealthStore((s) => s.user?.name || 'Account Holder');

  const cardData = {
    number: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
    name: userName,
  };

  const handleCopy = () => {
    const text = `Card: ${cardData.number}\nExpiry: ${cardData.expiry}\nCVV: ${cardData.cvv}\nName: ${cardData.name}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-credit-card text-lg" />
          <span className="text-xs font-bold opacity-70">VISA PLATINUM</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full">Test Only</span>
      </div>

      <div className="mb-4">
        <p className="text-lg font-mono tracking-widest">
          {showDetails ? cardData.number : '**** **** **** 1111'}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] opacity-60 uppercase">Cardholder</p>
          <p className="text-sm font-medium">{cardData.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] opacity-60 uppercase">Expires</p>
          <p className="text-sm font-medium">{cardData.expiry}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] opacity-60 uppercase">CVV</p>
          <p className="text-sm font-medium">{showDetails ? cardData.cvv : '***'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
        >
          <i className={`fas fa-${showDetails ? 'eye-slash' : 'eye'} mr-1`} />
          {showDetails ? 'Hide' : 'Reveal'}
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
        >
          <i className={`fas fa-${copied ? 'check' : 'copy'} mr-1`} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="text-[9px] opacity-50 mt-3 text-center">
        Virtual card powered by PSB SecureWealth. No physical card required.
      </p>
    </div>
  );
}
