import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import type { Loan, SavingScheme } from '../../types/finance';
import {
  Bell,
  Clock,
  Receipt,
  Coins,
} from 'lucide-react';

interface UpcomingDueAlertsProps {
  onPayLoan?: (loan: Loan) => void;
  onPayScheme?: (scheme: SavingScheme) => void;
}

export interface DueItem {
  id: string;
  type: 'loan' | 'scheme';
  title: string;
  institution: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  rawLoan?: Loan;
  rawScheme?: SavingScheme;
}

export const UpcomingDueAlerts: React.FC<UpcomingDueAlertsProps> = ({
  onPayLoan,
  onPayScheme,
}) => {
  const { loans, savings, settings } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper: get interval in months from SavingFrequency
  const getFrequencyMonths = (freq: string): number => {
    if (freq === 'every_1_month' || freq === 'monthly') return 1;
    if (freq === 'every_2_month') return 2;
    if (freq === 'every_3_month' || freq === 'quarterly') return 3;
    if (freq === 'every_4_month') return 4;
    if (freq === 'every_5_month') return 5;
    if (freq === 'every_6_month') return 6;
    if (freq === 'every_7_month') return 7;
    if (freq === 'yearly') return 12;
    return 1; // fallback
  };

  const dueItems: DueItem[] = [];

  // 1. Process Loans
  loans
    .filter(l => l.status === 'active' && l.type === 'borrowed')
    .forEach(ln => {
      let targetDueDateStr = ln.dueDate;
      if (!targetDueDateStr && ln.startDate) {
        const stDate = new Date(ln.startDate);
        const dayOfMonth = stDate.getDate();
        const nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if (nextDue < today) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        targetDueDateStr = nextDue.toISOString().split('T')[0];
      }

      if (targetDueDateStr) {
        const dueDate = new Date(targetDueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffMs = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 15) {
          const totalPrincipalPaid = (ln.payments || []).reduce(
            (sum, p) => sum + Number(p.principalPaid || 0),
            0
          );
          const remainingPrincipal = Math.max(0, ln.principalAmount - totalPrincipalPaid);
          const emiDue = ln.emiAmount || Math.min(remainingPrincipal, Math.round(ln.principalAmount / (ln.tenureMonths || 12)));

          dueItems.push({
            id: `loan_${ln.id}`,
            type: 'loan',
            title: ln.name,
            institution: ln.lenderBorrower,
            amount: emiDue,
            dueDate: targetDueDateStr,
            daysRemaining: diffDays,
            isOverdue: diffDays < 0,
            rawLoan: ln,
          });
        }
      }
    });

  // 2. Process Savings & Chit Funds
  savings
    .filter(s => s.status === 'active')
    .forEach(sch => {
      let targetDueDateStr = sch.dueDate;
      if (!targetDueDateStr) {
        // Use frequency-aware interval: start from startDate, find the next due
        const freqMonths = getFrequencyMonths(sch.frequency);
        const startDt = new Date(sch.startDate);
        startDt.setHours(0, 0, 0, 0);
        const dayOfMonth = sch.dueDayOfMonth || startDt.getDate();
        const completedCount = (sch.installments || []).length;

        // Next installment is based on completed count + 1 interval
        let nextDue = new Date(
          startDt.getFullYear(),
          startDt.getMonth() + completedCount * freqMonths,
          dayOfMonth
        );

        // If somehow already past, advance one interval
        if (nextDue < today) {
          nextDue = new Date(
            nextDue.getFullYear(),
            nextDue.getMonth() + freqMonths,
            dayOfMonth
          );
        }
        targetDueDateStr = nextDue.toISOString().split('T')[0];
      }

      if (targetDueDateStr) {
        const dueDate = new Date(targetDueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffMs = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const alertWindow = 15; // always show within 15 days

        if (diffDays <= alertWindow) {
          const monthlyDue = Math.round(sch.totalValue / (sch.totalInstallments || 1));
          dueItems.push({
            id: `scheme_${sch.id}`,
            type: 'scheme',
            title: sch.name,
            institution: sch.institution,
            amount: monthlyDue,
            dueDate: targetDueDateStr,
            daysRemaining: diffDays,
            isOverdue: diffDays < 0,
            rawScheme: sch,
          });
        }
      }
    });

  // Sort by urgency: overdue first, then closest due date
  dueItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (dueItems.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-slate-900/60 space-y-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5 text-amber-400">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bell size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Upcoming Due Reminders</span>
              <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {dueItems.length} Due (Next 15 Days)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Loan EMIs & Chit Fund installments scheduled for settlement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {dueItems.map(item => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
              item.isOverdue
                ? 'bg-rose-950/20 border-rose-500/30'
                : item.daysRemaining <= 5
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  {item.type === 'loan' ? (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Loan EMI
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Chit Fund
                    </span>
                  )}
                  <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {item.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.institution}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-white block">
                  {formatCurrency(item.amount, settings.currency)}
                </span>
                <span
                  className={`text-[10px] font-medium inline-flex items-center gap-1 ${
                    item.isOverdue
                      ? 'text-rose-400'
                      : item.daysRemaining <= 5
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  <Clock size={10} />
                  {item.isOverdue
                    ? `Overdue by ${Math.abs(item.daysRemaining)}d`
                    : item.daysRemaining === 0
                    ? 'Due Today'
                    : `Due in ${item.daysRemaining}d`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[10px]">
              <span className="text-slate-400">Due: {item.dueDate}</span>

              {item.type === 'loan' && onPayLoan && item.rawLoan && (
                <button
                  type="button"
                  onClick={() => onPayLoan(item.rawLoan!)}
                  className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Receipt size={10} />
                  <span>Pay EMI</span>
                </button>
              )}

              {item.type === 'scheme' && onPayScheme && item.rawScheme && (
                <button
                  type="button"
                  onClick={() => onPayScheme(item.rawScheme!)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Coins size={10} />
                  <span>Pay Chit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
