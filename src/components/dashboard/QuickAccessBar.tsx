import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingDown,
  TrendingUp,
  Users,
  Coins,
  ArrowLeftRight,
  Milk,
} from 'lucide-react';

interface QuickAccessBarProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddFarmLabor: () => void;
  onAddMilkEntry: () => void;
  onOpenLoansSavings: () => void;
  onOpenTransfer: () => void;
}

export const QuickAccessBar: React.FC<QuickAccessBarProps> = ({
  onAddExpense,
  onAddIncome,
  onAddFarmLabor,
  onAddMilkEntry,
  onOpenLoansSavings,
  onOpenTransfer,
}) => {
  const { settings, loans, savings } = useFinance();
  const isTa = settings.language === 'ta';

  const activeDuesCount = loans.filter(l => l.status === 'active').length + savings.filter(s => s.status === 'active').length;

  const quickActions = [
    {
      id: 'expense',
      titleTa: 'செலவு பதிவு',
      titleEn: 'Add Expense',
      subTa: 'மளிகை & பில்கள்',
      subEn: 'Daily Expenses',
      icon: TrendingDown,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      badge: 'Debit',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      onClick: onAddExpense,
    },
    {
      id: 'income',
      titleTa: 'வரவு பதிவு',
      titleEn: 'Add Income',
      subTa: 'சம்பளம் & வரவுகள்',
      subEn: 'Inflow & Revenue',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Credit',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      onClick: onAddIncome,
    },
    {
      id: 'farm_labor',
      titleTa: 'பண்ணை கூலி',
      titleEn: 'Farm Wages',
      subTa: 'ஆட்கள் வேலை கூலி',
      subEn: 'Coolie Wages',
      icon: Users,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Agri',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      onClick: onAddFarmLabor,
    },
    {
      id: 'milk_entry',
      titleTa: 'பால் & உற்பத்தி',
      titleEn: 'Dairy & Yield',
      subTa: 'தினசரி பால் வரவு',
      subEn: 'Livestock Sales',
      icon: Milk,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      badge: 'Dairy',
      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      onClick: onAddMilkEntry,
    },
    {
      id: 'loans_savings',
      titleTa: 'கடன் & சீட்டு',
      titleEn: 'Loans & Chit',
      subTa: 'தவணை & சேமிப்பு',
      subEn: 'EMIs & Chit Funds',
      icon: Coins,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      badge: activeDuesCount > 0 ? `${activeDuesCount} Due` : 'Dues',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      onClick: onOpenLoansSavings,
    },
    {
      id: 'transfer',
      titleTa: 'பணப் பரிமாற்றம்',
      titleEn: 'Fund Transfer',
      subTa: 'வங்கி / ரொக்க மாற்றம்',
      subEn: 'Account Transfer',
      icon: ArrowLeftRight,
      iconColor: 'text-slate-300',
      iconBg: 'bg-slate-800 border-slate-700',
      badge: 'Transfer',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      onClick: onOpenTransfer,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {isTa ? 'விரைவு செயல்பாடுகள்' : 'Quick Actions'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all text-left flex flex-col justify-between min-h-[88px] cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-7 h-7 rounded-lg ${action.iconBg} border flex items-center justify-center ${action.iconColor}`}>
                  <Icon size={15} />
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${action.badgeClass}`}>
                  {action.badge}
                </span>
              </div>

              <div className="mt-2">
                <h3 className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                  {isTa ? action.titleTa : action.titleEn}
                </h3>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                  {isTa ? action.subTa : action.subEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
