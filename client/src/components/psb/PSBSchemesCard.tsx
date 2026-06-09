import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCHEMES = [
  {
    id: 'pmjdy',
    name: 'PM Jan Dhan Yojana',
    icon: 'fa-wallet',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    desc: 'Zero balance savings account with free RuPay debit card, accident insurance cover of ₹2 lakh, and overdraft facility.',
    eligibility: 'All Indian citizens above 10 years',
    benefit: '₹2L accident insurance + overdraft',
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi',
    icon: 'fa-child',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    desc: 'Savings scheme for girl child with highest interest rate (8.2% p.a.) and tax benefits under Section 80C.',
    eligibility: 'Girl child below 10 years',
    benefit: '8.2% p.a. + tax exemption',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    icon: 'fa-person-cane',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    desc: 'Guaranteed pension of ₹1,000 to ₹5,000 per month after 60 years of age. Government co-contribution available.',
    eligibility: '18-40 years age group',
    benefit: '₹1K-5K monthly pension after 60',
  },
  {
    id: 'pmvvy',
    name: 'PM Vaya Vandana',
    icon: 'fa-hand-holding-heart',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    desc: 'Pension scheme for senior citizens providing assured return of 7.4% p.a. for 10 years.',
    eligibility: 'Senior citizens (60+ years)',
    benefit: '7.4% assured return for 10 years',
  },
  {
    id: 'pmjjby',
    name: 'PM Jeevan Jyoti Bima',
    icon: 'fa-heart-pulse',
    color: 'text-red-600',
    bg: 'bg-red-50',
    desc: 'Life insurance cover of ₹2 lakh at just ₹436 per annum. Available through savings bank account.',
    eligibility: '18-50 years with bank account',
    benefit: '₹2L life cover @ ₹436/year',
  },
];

export default function PSBSchemesCard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card-psb bg-white">
      <div className="flex items-center gap-2 mb-4">
        <i className="fas fa-landmark-flag text-primary text-lg" />
        <h2 className="text-lg font-bold text-primary">Government Schemes</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">Available through PSB Bank · Govt. of India</p>

      <div className="space-y-2">
        {SCHEMES.map((scheme) => (
          <div key={scheme.id} className="border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-9 h-9 ${scheme.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${scheme.icon} ${scheme.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{scheme.name}</p>
                <p className="text-[10px] text-gray-500">{scheme.benefit}</p>
              </div>
              <i className={`fas fa-chevron-${expanded === scheme.id ? 'up' : 'down'} text-gray-400 text-xs`} />
            </button>

            <AnimatePresence>
              {expanded === scheme.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 bg-gray-50 text-xs space-y-1.5">
                    <p className="text-gray-600">{scheme.desc}</p>
                    <p className="text-gray-500"><span className="font-semibold">Eligibility:</span> {scheme.eligibility}</p>
                    <button
                      onClick={() => alert(`${scheme.name}: You will be redirected to the official PSB portal to complete your application.`)}
                      className="mt-1 text-primary font-semibold text-[11px] hover:underline"
                    >
                      Learn more & Apply →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
