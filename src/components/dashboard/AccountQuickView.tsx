import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { Plus, ArrowRightLeft } from 'lucide-react';

interface AccountQuickViewProps {
  onOpenTransfer: () => void;
  onOpenAddAccount: () => void;
}

export const AccountQuickView: React.FC<AccountQuickViewProps> = ({
  onOpenTransfer,
  onOpenAddAccount,
}) => {
  const { accounts, settings, t } = useFinance();

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800/80 shadow-lg flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">{t('walletsAndAccounts')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('walletsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTransfer}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-700"
            title={t('transferFunds')}
          >
            <ArrowRightLeft size={16} />
          </button>
          <button
            onClick={onOpenAddAccount}
            className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition cursor-pointer border border-indigo-500/20"
            title={t('addAccount')}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {accounts.map(account => {
          const isNegative = Number(account.balance) < 0;
          return (
            <div
              key={account.id}
              className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/75 transition-all transform hover:-translate-y-0.5 flex items-center justify-between gap-3 group shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform shadow-inner"
                  style={{ backgroundColor: `${account.color || '#6366f1'}22` }}
                >
                  <IconRenderer
                    name={account.icon || 'Building2'}
                    color={account.color || '#6366f1'}
                    size={20}
                  />
                </div>
                <div className="min-w-0 truncate">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white transition truncate">
                    {account.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider truncate">
                      {account.type.replace('_', ' ')}
                    </span>
                    {account.accountNumber && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        •• {account.accountNumber.slice(-4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs sm:text-base font-black whitespace-nowrap block ${
                    isNegative ? 'text-rose-400' : 'text-slate-100'
                  }`}
                >
                  {formatCurrency(account.balance, settings.currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
