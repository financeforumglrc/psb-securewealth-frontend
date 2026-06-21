import { motion } from 'framer-motion';
import { Crown, Code, Briefcase, Wheat, GraduationCap, HeartPulse, type LucideIcon } from 'lucide-react';

export type PersonaKey = 'hni' | 'tech' | 'business' | 'farmer' | 'student' | 'senior';

export interface DemoPersona {
  key: PersonaKey;
  name: string;
  role: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  fraudBlocked: number;
  netWorth: string;
  aaItems: { bank: string; type: string; amount: string; icon: string }[];
  aaTotal: string;
  goals: { name: string; target: number; current: number; year: number; color: 'cyan' | 'blue' | 'purple'; sip: number }[];
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    key: 'hni',
    name: 'Deepanshu Sharma',
    role: 'Ultra HNI',
    tagline: 'Wealth preservation across family offices.',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    fraudBlocked: 2500000,
    netWorth: '₹5.24 Cr',
    aaItems: [
      { bank: 'HDFC Bank', type: 'Family Office Account', amount: '₹2,10,00,000', icon: '🏦' },
      { bank: 'ICICI Direct', type: 'Equity Portfolio', amount: '₹1,85,50,000', icon: '💹' },
      { bank: 'Bajaj Allianz', type: 'ULIP Policy', amount: '₹78,00,000', icon: '🛡️' },
      { bank: 'Zerodha', type: 'International ETFs', amount: '₹50,50,000', icon: '📈' },
    ],
    aaTotal: '₹5,24,00,000',
    goals: [
      { name: 'Legacy Trust', target: 10000000, current: 3200000, year: 2030, color: 'purple', sip: 150000 },
      { name: 'Daughter’s Ivy League', target: 3500000, current: 1200000, year: 2032, color: 'cyan', sip: 75000 },
      { name: 'Second Home — London', target: 15000000, current: 4500000, year: 2029, color: 'blue', sip: 200000 },
    ],
  },
  {
    key: 'tech',
    name: 'Mrigesh Mohanty',
    role: 'Tech Lead',
    tagline: 'Goal-based investing + tax optimization.',
    icon: Code,
    color: 'from-cyan-500 to-blue-600',
    fraudBlocked: 850000,
    netWorth: '₹1.84 Cr',
    aaItems: [
      { bank: 'SBI', type: 'Salary Account', amount: '₹4,20,000', icon: '🏦' },
      { bank: 'Zerodha', type: 'Equity + ETFs', amount: '₹95,50,000', icon: '💹' },
      { bank: 'HDFC Mutual', type: 'Tax Saver ELSS', amount: '₹42,00,000', icon: '📈' },
      { bank: 'LIC', type: 'Term + Endowment', amount: '₹42,30,000', icon: '🛡️' },
    ],
    aaTotal: '₹1,84,00,000',
    goals: [
      { name: 'Financial Independence', target: 5000000, current: 1800000, year: 2032, color: 'cyan', sip: 45000 },
      { name: 'EV Car', target: 2500000, current: 800000, year: 2027, color: 'blue', sip: 35000 },
      { name: 'Home Down Payment', target: 6000000, current: 2200000, year: 2028, color: 'purple', sip: 50000 },
    ],
  },
  {
    key: 'business',
    name: 'Ishita Anand',
    role: 'Business Owner',
    tagline: 'Cash-flow smoothing + fraud shield.',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-600',
    fraudBlocked: 1200000,
    netWorth: '₹2.45 Cr',
    aaItems: [
      { bank: 'ICICI Current', type: 'Business Account', amount: '₹62,00,000', icon: '🏦' },
      { bank: 'Axis Mutual', type: 'Liquid Funds', amount: '₹48,00,000', icon: '📈' },
      { bank: 'Zerodha', type: 'Equity Portfolio', amount: '₹85,00,000', icon: '💹' },
      { bank: 'HDFC Life', type: 'Income Replacement', amount: '₹50,00,000', icon: '🛡️' },
    ],
    aaTotal: '₹2,45,00,000',
    goals: [
      { name: 'Factory Expansion', target: 8000000, current: 2800000, year: 2027, color: 'emerald' as any, sip: 100000 },
      { name: 'Child Education', target: 4000000, current: 1200000, year: 2035, color: 'cyan', sip: 40000 },
      { name: 'Retirement Corpus', target: 12000000, current: 3500000, year: 2045, color: 'purple', sip: 75000 },
    ],
  },
  {
    key: 'farmer',
    name: 'Balbir Singh',
    role: 'Progressive Farmer',
    tagline: 'Crop loans, PM-KISAN, and rural wealth.',
    icon: Wheat,
    color: 'from-green-500 to-lime-600',
    fraudBlocked: 180000,
    netWorth: '₹28.5 L',
    aaItems: [
      { bank: 'Punjab & Sind Bank', type: 'Kisan Account', amount: '₹3,20,000', icon: '🏦' },
      { bank: 'PM-KISAN', type: 'Government Benefit', amount: '₹1,20,000', icon: '🇮🇳' },
      { bank: 'NABARD Deposit', type: 'Term Deposit', amount: '₹8,50,000', icon: '📈' },
      { bank: 'LIC Jeevan', type: 'Life Cover', amount: '₹15,60,000', icon: '🛡️' },
    ],
    aaTotal: '₹28,50,000',
    goals: [
      { name: 'Tractor Upgrade', target: 1200000, current: 450000, year: 2026, color: 'green' as any, sip: 18000 },
      { name: 'Daughter’s College', target: 800000, current: 220000, year: 2030, color: 'cyan', sip: 12000 },
      { name: 'Irrigation Solar', target: 600000, current: 150000, year: 2027, color: 'blue', sip: 10000 },
    ],
  },
  {
    key: 'student',
    name: 'Ananya Rao',
    role: 'College Student',
    tagline: 'First salary, subscriptions, and savings.',
    icon: GraduationCap,
    color: 'from-violet-500 to-fuchsia-600',
    fraudBlocked: 45000,
    netWorth: '₹2.1 L',
    aaItems: [
      { bank: 'SBI Youth', type: 'Student Account', amount: '₹42,000', icon: '🏦' },
      { bank: 'Groww', type: 'Digital Gold', amount: '₹18,000', icon: '🪙' },
      { bank: 'PPF', type: 'Small Savings', amount: '₹75,000', icon: '📈' },
      { bank: 'PhonePe', type: 'Wallet + UPI', amount: '₹15,000', icon: '📱' },
    ],
    aaTotal: '₹1,50,000',
    goals: [
      { name: 'Laptop + Upskill', target: 120000, current: 45000, year: 2025, color: 'violet' as any, sip: 5000 },
      { name: 'Emergency Buffer', target: 100000, current: 30000, year: 2026, color: 'cyan', sip: 4000 },
      { name: 'Study Abroad', target: 1000000, current: 80000, year: 2028, color: 'purple', sip: 15000 },
    ],
  },
  {
    key: 'senior',
    name: 'Lakshmi Iyer',
    role: 'Retired Teacher',
    tagline: 'Pension, FDs, medical safety, and scams.',
    icon: HeartPulse,
    color: 'from-rose-400 to-pink-600',
    fraudBlocked: 320000,
    netWorth: '₹42 L',
    aaItems: [
      { bank: 'Bank of Baroda', type: 'Pension Account', amount: '₹2,80,000', icon: '🏦' },
      { bank: 'Post Office', type: 'Senior Citizen FD', amount: '₹22,00,000', icon: '📮' },
      { bank: 'LIC Pension', type: 'Annuity Plan', amount: '₹12,00,000', icon: '🛡️' },
      { bank: 'SBI RD', type: 'Recurring Deposit', amount: '₹5,20,000', icon: '📈' },
    ],
    aaTotal: '₹42,00,000',
    goals: [
      { name: 'Medical Corpus', target: 1500000, current: 600000, year: 2027, color: 'rose' as any, sip: 20000 },
      { name: 'Grandchild Gift', target: 500000, current: 200000, year: 2026, color: 'cyan', sip: 15000 },
      { name: 'Travel Fund', target: 400000, current: 120000, year: 2027, color: 'blue', sip: 12000 },
    ],
  },
];

export const DEFAULT_PERSONA = DEMO_PERSONAS[1];

interface PersonaSelectorProps {
  active: PersonaKey;
  onChange: (key: PersonaKey) => void;
}

export function PersonaSelector({ active, onChange }: PersonaSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
      {DEMO_PERSONAS.map((p) => {
        const Icon = p.icon;
        const isActive = active === p.key;
        return (
          <motion.button
            key={p.key}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(p.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${
              isActive
                ? 'bg-slate-800 border-cyan-500/60 text-white shadow-lg shadow-cyan-500/15'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <span>{p.name}</span>
            {isActive && <span className="text-xs text-cyan-400 hidden sm:inline">• {p.role}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
