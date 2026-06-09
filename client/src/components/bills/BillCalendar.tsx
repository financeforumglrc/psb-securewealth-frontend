import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWealthStore } from '../../store/wealthStore';
import CosmosCard, { CosmosBadge, CosmosEmptyState } from '../ui/CosmosCard';
import type { RecurringBill } from '../../types';
import {
  isNotificationGranted,
  sendLocalNotification,
  scheduleBillReminder,
} from '../../services/notificationService';

export default function BillCalendar() {
  const bills = useWealthStore((s) => s.bills);
  const toggleBillPaid = useWealthStore((s) => s.toggleBillPaid);
  const payBill = useWealthStore((s) => s.payBill);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showPayModal, setShowPayModal] = useState<RecurringBill | null>(null);

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Compute bill statuses
  const computedBills = useMemo(() => {
    return bills.map((bill) => {
      const dueDate = new Date(currentYear, currentMonth, bill.dueDay);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let status: RecurringBill['status'] = bill.status;
      if (bill.status !== 'paid') {
        if (daysUntil < 0) status = 'overdue';
        else if (daysUntil <= 3) status = 'due';
        else status = 'upcoming';
      }
      return { ...bill, daysUntil, status };
    });
  }, [bills, currentMonth, currentYear, today]);

  // Smart alerts
  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'info' | 'danger'; icon: string; text: string }[] = [];
    const elec = computedBills.find((b) => b.name === 'Electricity Bill');
    if (elec && elec.predictedAmount && elec.amount > elec.predictedAmount * 1.3) {
      const pct = Math.round(((elec.amount - elec.predictedAmount) / elec.predictedAmount) * 100);
      list.push({ type: 'warning', icon: 'fa-bolt', text: `Electricity bill is ${pct}% higher than usual (₹${elec.amount.toLocaleString()} vs ₹${elec.predictedAmount.toLocaleString()})` });
    }
    const dueThisWeek = computedBills.filter((b) => b.status !== 'paid' && b.daysUntil !== undefined && b.daysUntil >= 0 && b.daysUntil <= 7);
    if (dueThisWeek.length >= 2) {
      const total = dueThisWeek.reduce((s, b) => s + b.amount, 0);
      list.push({ type: 'info', icon: 'fa-calendar-week', text: `${dueThisWeek.length} bills due this week (₹${total.toLocaleString()}). Ensure balance.` });
    }
    const overdue = computedBills.filter((b) => b.status === 'overdue');
    if (overdue.length > 0) {
      list.push({ type: 'danger', icon: 'fa-circle-exclamation', text: `${overdue.length} bill(s) overdue! Pay immediately.` });
    }
    return list;
  }, [computedBills]);

  const selectedBills = selectedDate ? computedBills.filter((b) => b.dueDay === selectedDate) : [];

  function getStatusColor(status: RecurringBill['status']) {
    switch (status) {
      case 'paid': return 'border-emerald-200 dark:border-emerald-800/40';
      case 'due': return 'border-amber-200 dark:border-amber-800/40';
      case 'overdue': return 'border-rose-200 dark:border-rose-800/40';
      default: return 'border-slate-200 dark:border-slate-700/50';
    }
  }

  function getStatusBg(status: RecurringBill['status']) {
    switch (status) {
      case 'paid': return 'bg-emerald-50/50 dark:bg-emerald-900/10';
      case 'due': return 'bg-amber-50/50 dark:bg-amber-900/10';
      case 'overdue': return 'bg-rose-50/50 dark:bg-rose-900/10';
      default: return 'bg-white dark:bg-slate-800/50';
    }
  }

  function getStatusBadge(status: RecurringBill['status'], days?: number) {
    switch (status) {
      case 'paid': return { text: 'Paid', color: 'success' as const };
      case 'overdue': return { text: 'Overdue', color: 'danger' as const };
      case 'due': return { text: days === 0 ? 'Due today' : `Due in ${days}d`, color: 'warning' as const };
      default: return { text: days === undefined ? 'Upcoming' : `In ${days}d`, color: 'info' as const };
    }
  }

  function navigateMonth(delta: number) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  }

  const totalDue = computedBills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const totalPaid = computedBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const paidCount = computedBills.filter((b) => b.status === 'paid').length;
  const progress = computedBills.length > 0 ? Math.round((paidCount / computedBills.length) * 100) : 0;

  // Heatmap data — daily spend
  const dailySpend = useMemo(() => {
    const map = new Map<number, number>();
    computedBills.forEach((b) => { map.set(b.dueDay, (map.get(b.dueDay) || 0) + b.amount); });
    return map;
  }, [computedBills]);

  const maxDaily = Math.max(...Array.from(dailySpend.values()), 1);

  // Browser push notifications for bill events
  const notifiedBillIdsRef = useRef<Set<string>>(new Set());

  const handleTogglePaid = useCallback((id: string) => {
    toggleBillPaid(id);
    const bill = computedBills.find((b) => b.id === id);
    if (bill && bill.status !== 'paid' && isNotificationGranted()) {
      sendLocalNotification(
        'Bill Paid',
        `${bill.name} of ₹${bill.amount.toLocaleString()} has been marked as paid.`,
        '/favicon.ico'
      );
    }
  }, [toggleBillPaid, computedBills]);

  const handlePayBill = useCallback((id: string) => {
    payBill(id);
    const bill = computedBills.find((b) => b.id === id);
    if (bill && isNotificationGranted()) {
      sendLocalNotification(
        'Bill Paid',
        `${bill.name} of ₹${bill.amount.toLocaleString()} has been paid successfully.`,
        '/favicon.ico'
      );
    }
  }, [payBill, computedBills]);

  useEffect(() => {
    if (!isNotificationGranted()) return;
    computedBills.forEach((bill) => {
      if (bill.status === 'paid') return;
      const key = `${bill.id}-${bill.status}`;
      if (notifiedBillIdsRef.current.has(key)) return;

      if (bill.status === 'due' || bill.status === 'overdue') {
        sendLocalNotification(
          bill.status === 'overdue' ? 'Bill Overdue' : 'Bill Due Soon',
          `${bill.name} of ₹${bill.amount.toLocaleString()} is ${bill.status === 'overdue' ? 'overdue' : 'due soon'}.`,
          '/favicon.ico'
        );
        notifiedBillIdsRef.current.add(key);

        // Schedule same-day reminder if due today
        if (bill.daysUntil === 0) {
          const dueDate = new Date(currentYear, currentMonth, bill.dueDay);
          scheduleBillReminder(bill.name, dueDate, bill.amount);
        }
      }
    });
  }, [computedBills, currentMonth, currentYear]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bill Calendar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{monthNames[currentMonth]} {currentYear} · {paidCount}/{computedBills.length} paid</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <i className="fas fa-chevron-left text-xs" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[120px] text-center">{monthNames[currentMonth]} {currentYear}</span>
          <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <i className="fas fa-chevron-right text-xs" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Due', value: `₹${totalDue.toLocaleString()}`, icon: 'fa-wallet', color: 'text-rose-500', bg: '#ef444420' },
          { label: 'Paid', value: `₹${totalPaid.toLocaleString()}`, icon: 'fa-check-circle', color: 'text-emerald-500', bg: '#10b98120' },
          { label: 'Bills', value: computedBills.length, icon: 'fa-file-invoice', color: 'text-primary', bg: '#0f766e20' },
          { label: 'Progress', value: `${progress}%`, icon: 'fa-chart-pie', color: progress === 100 ? 'text-emerald-500' : 'text-amber-500', bg: progress === 100 ? '#10b98120' : '#f59e0b20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CosmosCard variant="stat" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  <i className={`fas ${s.icon} ${s.color} text-[10px]`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </CosmosCard>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-3.5 rounded-xl text-sm border ${
                alert.type === 'danger' ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                'bg-primary/5 text-primary border-primary/20'
              }`}>
              <i className={`fas ${alert.icon} mt-0.5`} />
              <p className="font-medium text-xs">{alert.text}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calendar + Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar with heatmap */}
        <div className="lg:col-span-3">
          <CosmosCard variant="default" header={{ icon: 'fa-calendar-days', iconColor: '#0f766e', title: 'Payment Heatmap' }}>
            <div className="space-y-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((d) => (
                  <div key={d} className="text-center text-[10px] text-slate-400 font-bold py-1">{d}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayBills = computedBills.filter((b) => b.dueDay === day);
                  const spend = dailySpend.get(day) || 0;
                  const intensity = spend > 0 ? Math.max(0.1, spend / maxDaily) : 0;
                  const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
                  const isSelected = selectedDate === day;
                  const hasOverdue = dayBills.some((b) => b.status === 'overdue');
                  const hasDue = dayBills.some((b) => b.status === 'due');
                  const allPaid = dayBills.length > 0 && dayBills.every((b) => b.status === 'paid');

                  return (
                    <button key={day} onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-[11px] font-semibold ${
                        isSelected ? 'ring-2 ring-primary bg-primary/10' :
                        isToday ? 'bg-primary/15 text-primary' :
                        spend > 0 ? '' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={spend > 0 && !isSelected && !isToday ? {
                        background: `rgba(15, 118, 110, ${intensity * 0.2})`,
                        color: intensity > 0.5 ? '#0f766e' : undefined,
                      } : {}}>
                      {day}
                      {dayBills.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayBills.slice(0, 3).map((b, bi) => (
                            <div key={bi} className={`w-1 h-1 rounded-full ${
                              b.status === 'paid' ? 'bg-emerald-400' :
                              b.status === 'overdue' ? 'bg-rose-500' :
                              b.status === 'due' ? 'bg-amber-400' : 'bg-slate-300'
                            }`} />
                          ))}
                          {dayBills.length > 3 && <span className="text-[7px] text-slate-400">+</span>}
                        </div>
                      )}
                      {hasOverdue && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                      {hasDue && !hasOverdue && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                      {allPaid && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-2">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Overdue</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Due soon</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Paid</div>
                <div className="flex items-center gap-1"><div className="w-3 h-2 rounded" style={{ background: 'rgba(15,118,110,0.15)' }} /> High spend</div>
              </div>
            </div>
          </CosmosCard>
        </div>

        {/* Bills List */}
        <div className="lg:col-span-2 space-y-3">
          <CosmosCard variant="default" header={{ icon: 'fa-list', iconColor: '#1565C0', title: selectedDate ? `Day ${selectedDate}` : 'Upcoming Bills', subtitle: selectedDate ? `${selectedBills.length} bill(s)` : `${computedBills.filter((b) => b.status !== 'paid').length} pending` }}>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {(selectedDate ? selectedBills : computedBills.sort((a, b) => a.dueDay - b.dueDay)).map((bill) => {
                const badge = getStatusBadge(bill.status, bill.daysUntil);
                return (
                  <div key={bill.id} className={`p-3 rounded-xl border transition-all hover:shadow-sm ${getStatusColor(bill.status)} ${getStatusBg(bill.status)}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${bill.color} text-white flex items-center justify-center flex-shrink-0`}>
                        <i className={`fas ${bill.icon} text-[10px]`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-xs text-slate-800 dark:text-white truncate">{bill.name}</p>
                          <CosmosBadge color={badge.color} size="xs">{badge.text}</CosmosBadge>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {bill.autoDetected && <i className="fas fa-wand-magic-sparkles mr-1 text-secondary" />}
                          Due {bill.dueDay}{['st','nd','rd'][((bill.dueDay+90)%100-10)%10] || 'th'}
                        </p>
                        <div className="flex items-end justify-between mt-2">
                          <div>
                            <p className="text-base font-bold text-slate-800 dark:text-white">₹{bill.amount.toLocaleString()}</p>
                            {bill.predictedAmount && (
                              <p className="text-[9px] text-slate-400">
                                Avg ₹{bill.predictedAmount.toLocaleString()}
                                {bill.amount > bill.predictedAmount ? <span className="text-rose-500 ml-1">+{Math.round(((bill.amount - bill.predictedAmount) / bill.predictedAmount) * 100)}%</span> : <span className="text-emerald-500 ml-1">-{Math.round(((bill.predictedAmount - bill.amount) / bill.predictedAmount) * 100)}%</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {(bill.status !== 'paid') ? (
                            <>
                              <button onClick={() => setShowPayModal(bill)} className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                <i className="fas fa-credit-card mr-1" /> Pay
                              </button>
                              <label className="flex items-center gap-1 text-[9px] text-slate-500 cursor-pointer select-none">
                                <input type="checkbox" checked={false} onChange={() => handleTogglePaid(bill.id)} className="accent-primary" />
                                Paid
                              </label>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-medium">
                              <i className="fas fa-check-circle" /> Paid {bill.lastPaid ? `on ${bill.lastPaid}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(selectedDate ? selectedBills : computedBills).length === 0 && (
                <CosmosEmptyState icon="fa-check-double" title={selectedDate ? 'No bills' : 'All paid!'} subtitle={selectedDate ? 'No bills due on this date.' : 'All bills are paid for this month.'} />
              )}
            </div>
          </CosmosCard>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <i className={`fas ${showPayModal.icon} text-2xl text-primary`} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-1">Pay {showPayModal.name}</h3>
            <p className="text-center text-slate-500 text-sm mb-4">Amount: <span className="font-bold text-slate-800 dark:text-white">₹{showPayModal.amount.toLocaleString()}</span></p>
            <div className="space-y-2 mb-4">
              <button className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"><i className="fas fa-bolt mr-2" /> UPI / Instant Pay</button>
              <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors"><i className="fas fa-building-columns mr-2" /> Net Banking</button>
            </div>
            <button onClick={() => { handlePayBill(showPayModal.id); setShowPayModal(null); }} className="w-full py-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"><i className="fas fa-check mr-1" /> Mark as Paid (No Payment)</button>
            <button onClick={() => setShowPayModal(null)} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500">Cancel</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
