import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  Sprout,
  Receipt,
  Plus,
  Coins,
  BrainCircuit,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  const { settings, pendingWageTransactions, loans, savings } = useFinance();
  const isTa = settings.language === 'ta';

  const farmBadges = pendingWageTransactions.length;
  const duesCount = loans.filter(l => l.status === 'active').length + savings.filter(s => s.status === 'active').length;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden glass-panel border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-xl px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around relative">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <LayoutDashboard size={19} className={activeTab === 'dashboard' ? 'text-emerald-400' : ''} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">
            {isTa ? 'முகப்பு' : 'Home'}
          </span>
        </button>

        {/* 2. Farm & Agri */}
        <button
          onClick={() => setActiveTab('farm')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'farm'
              ? 'text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <Sprout size={19} className={activeTab === 'farm' ? 'text-emerald-400' : ''} />
            {farmBadges > 0 && (
              <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {farmBadges}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 whitespace-nowrap">
            {isTa ? 'பண்ணை' : 'Farm'}
          </span>
        </button>

        {/* 3. Center Elevated Floating Add Button */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            onClick={onOpenQuickAdd}
            className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer ring-4 ring-slate-950"
            title={isTa ? 'புதிய வரவு / செலவு பதிவு' : 'Quick Record'}
          >
            <Plus size={22} className="text-white" />
          </button>
          <span className="text-[9px] font-medium text-slate-400 mt-0.5">
            {isTa ? 'பதிவு' : 'Record'}
          </span>
        </div>

        {/* 4. Ledger / Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <Receipt size={19} className={activeTab === 'transactions' ? 'text-emerald-400' : ''} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">
            {isTa ? 'கணக்கு ஏடு' : 'Ledger'}
          </span>
        </button>

        {/* 5. Loans & Chit Funds */}
        <button
          onClick={() => setActiveTab('loans_savings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'loans_savings'
              ? 'text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <Coins size={19} className={activeTab === 'loans_savings' ? 'text-emerald-400' : ''} />
            {duesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {duesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 whitespace-nowrap">
            {isTa ? 'கடன்/சீட்டு' : 'Loans/Chit'}
          </span>
        </button>

        {/* 6. AI Assistant */}
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <BrainCircuit size={19} className={activeTab === 'ai' ? 'text-emerald-400' : ''} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">
            {isTa ? 'AI' : 'AI'}
          </span>
        </button>
      </div>
    </nav>
  );
};
