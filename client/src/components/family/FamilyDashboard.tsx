import { useWealthStore } from '../../store/wealthStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#8b5cf6'];

export default function FamilyDashboard() {
  const familyMembers = useWealthStore((s) => s.familyMembers);

  const combinedNetWorth = familyMembers.reduce((sum, m) => sum + m.netWorth, 0);
  const combinedMonthly = familyMembers.reduce((sum, m) => sum + m.monthlyContribution, 0);

  const pieData = familyMembers.map((m) => ({
    name: m.name.split(' ')[0],
    value: m.netWorth,
    fullName: m.name,
    relation: m.relation,
  }));

  const familyGoals = [
    { name: "Child's Education", target: 1500000, current: 780000, contributors: [{ name: 'Deepanshu', amount: 420000 }, { name: 'Priya', amount: 210000 }, { name: 'Rajesh', amount: 150000 }] },
    { name: 'Family Vacation', target: 300000, current: 95000, contributors: [{ name: 'Deepanshu', amount: 50000 }, { name: 'Priya', amount: 45000 }] },
    { name: 'Home Renovation', target: 800000, current: 320000, contributors: [{ name: 'Deepanshu', amount: 200000 }, { name: 'Priya', amount: 120000 }] },
  ];

  const protectionAlerts = [
    { id: 1, icon: 'fa-triangle-exclamation', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-100 dark:border-rose-800', title: "Unusual transaction on Father's account", desc: '₹25,000 to unknown payee blocked', time: '10 min ago' },
    { id: 2, icon: 'fa-circle-xmark', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800', title: "Sister's SIP payment failed", desc: 'Insufficient balance in linked account', time: '1 hour ago' },
    { id: 3, icon: 'fa-shield-halved', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10', title: 'Family protection score', desc: '92/100 — All accounts monitored', time: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-people-group text-primary" /> Family Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{familyMembers.length} members · Combined household wealth tracking</p>
        </div>
      </div>

      {/* Combined Net Worth */}
          <div className="card bg-gradient-to-br from-primary to-secondary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Combined Household Net Worth</p>
                <p className="text-3xl font-bold mt-1">₹{(combinedNetWorth / 1e7).toFixed(2)} Cr</p>
                <p className="text-xs text-white/70 mt-1">Monthly savings: ₹{combinedMonthly.toLocaleString()}/mo</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-people-group text-2xl" />
              </div>
            </div>
          </div>

          {/* Members + Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members List */}
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Family Members</h3>
              <div className="space-y-3">
                {familyMembers.map((member, idx) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.relation} • {member.assets.length} assets</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">₹{(member.netWorth / 1e5).toFixed(1)}L</p>
                      <p className="text-[10px] text-slate-400">₹{member.monthlyContribution.toLocaleString()}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Wealth Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${(Number(value) / 1e5).toFixed(1)}L`}
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-slate-600 dark:text-slate-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Family Goals */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              <i className="fas fa-bullseye text-primary mr-2" /> Family Goals
            </h3>
            <div className="space-y-4">
              {familyGoals.map((goal) => {
                const pct = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{goal.name}</p>
                      <span className="text-xs font-semibold text-slate-500">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar mb-3">
                      <div className="progress-bar-fill gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>₹{goal.current.toLocaleString()} of ₹{goal.target.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {goal.contributors.map((c) => (
                        <span key={c.name} className="px-2 py-0.5 bg-white dark:bg-slate-700 rounded-full text-[10px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                          {c.name}: ₹{c.amount.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family Protection Alerts */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              <i className="fas fa-shield-halved text-primary mr-2" /> Family Protection Alerts
            </h3>
            <div className="space-y-3">
              {protectionAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 ${alert.bg} rounded-xl border ${alert.border}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alert.color} bg-white/50 dark:bg-white/10`}>
                    <i className={`fas ${alert.icon} text-sm`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{alert.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{alert.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
}
