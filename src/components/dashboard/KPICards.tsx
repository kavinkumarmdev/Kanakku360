import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardsProps {
  onNavigate?: (tab: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ onNavigate }) => {
  const {
    totalNetWorth,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    netSavingsThisMonth,
    savingsRateThisMonth,
    settings,
    t,
  } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Net Worth */}
      <div
        onClick={() => onNavigate?.('accounts')}
        className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm group"
        title="View All Accounts"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiTotalNetWorth')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Wallet size={15} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(totalNetWorth, settings.currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
            {t('kpiAcrossAccounts')}
          </p>
        </div>
      </div>

      {/* Income This Month */}
      <div
        onClick={() => onNavigate?.('transactions')}
        className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm group"
        title="View Ledger & Income Entries"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiIncome')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp size={15} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-400 tracking-tight">
            +{formatCurrency(totalIncomeThisMonth, settings.currency)}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight size={12} className="shrink-0" />
              {t('kpiInflowRecorded')}
            </span>
          </div>
        </div>
      </div>

      {/* Expense This Month */}
      <div
        onClick={() => onNavigate?.('transactions')}
        className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm group"
        title="View Ledger & Expenses"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiExpenses')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <TrendingDown size={15} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold text-rose-400 tracking-tight">
            -{formatCurrency(totalExpenseThisMonth, settings.currency)}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownRight size={12} className="shrink-0" />
              {t('kpiTotalExpenditures')}
            </span>
          </div>
        </div>
      </div>

      {/* Net Savings & Savings Rate */}
      <div
        onClick={() => onNavigate?.('budgets')}
        className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm group"
        title="View Budgets & Limits"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('kpiNetSavings')}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {savingsRateThisMonth}%
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <PiggyBank size={15} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className={`text-2xl font-bold tracking-tight ${netSavingsThisMonth >= 0 ? 'text-slate-100' : 'text-rose-400'}`}>
            {formatCurrency(netSavingsThisMonth, settings.currency)}
          </h3>
          <div className="w-full bg-slate-800/90 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, savingsRateThisMonth))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
