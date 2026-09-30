import {
  LayoutDashboard,
  Sprout,
  Receipt,
  PieChart,
  Wallet,
  Target,
  Settings,
  X,
  LogOut,
  Coins,
  Sun,
  Moon,
  Globe,
  BrainCircuit,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import type { TranslationKey } from '../../utils/i18n';

import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { transactions, accounts, budgets, goals, loans, savings, pendingWageTransactions, settings, updateSettings, t } = useFinance();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    const nextLang = settings.language === 'ta' ? 'en' : 'ta';
    updateSettings({ language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { id: string; labelKey: TranslationKey; icon: any; badge: number | null; highlight?: boolean }[] = [
    { id: 'dashboard',    labelKey: 'navDashboard',    icon: LayoutDashboard, badge: null },
    { id: 'farm',         labelKey: 'navFarm',         icon: Sprout,          badge: pendingWageTransactions.length > 0 ? pendingWageTransactions.length : null },
    { id: 'transactions', labelKey: 'navTransactions', icon: Receipt,         badge: transactions.length },
    { id: 'loans_savings',labelKey: 'navLoansSavings', icon: Coins,           badge: (loans.length + savings.length) > 0 ? (loans.length + savings.length) : null },
    { id: 'budgets',      labelKey: 'navBudgets',      icon: PieChart,        badge: budgets.length },
    { id: 'accounts',     labelKey: 'navAccounts',     icon: Wallet,          badge: accounts.length },
    { id: 'goals',        labelKey: 'navGoals',        icon: Target,          badge: goals.length },
    { id: 'ai',           labelKey: 'navAI',          icon: BrainCircuit,    badge: null },
    { id: 'settings',     labelKey: 'navSettings',     icon: Settings,        badge: null },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold border border-slate-700/70 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {/* Active left indicator pill */}
                {isActive && (
                  <span className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-emerald-500" />
                )}

                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold shrink-0 ml-1.5 border border-amber-500/30">
                    {t('setupPrompt')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Theme, Language, Logout */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition cursor-pointer"
          title={t('authLogout')}
        >
          <LogOut size={14} />
          <span>{t('authLogout')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
            title={settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {settings.theme === 'light' ? (
              <Moon size={14} className="text-indigo-400" />
            ) : (
              <Sun size={14} className="text-amber-400" />
            )}
          </button>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition flex items-center gap-1"
            title="Switch Language"
          >
            <Globe size={12} className="text-indigo-400" />
            <span>{settings.language === 'ta' ? 'EN' : 'த'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Pinned Sidebar with widened width */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 glass-panel border-r border-slate-800/80 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <BrandLogo size="sm" onClick={() => handleNavClick('dashboard')} />
              <div className="flex items-center gap-1.5">
                {/* Mobile Drawer Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:bg-slate-800 transition"
                  title={settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                  {settings.theme === 'light' ? (
                    <Moon size={15} className="text-indigo-400" />
                  ) : (
                    <Sun size={15} className="text-amber-400" />
                  )}
                </button>
                {/* Mobile Drawer Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
                  title="Switch Language"
                >
                  <Globe size={13} className="text-indigo-400" />
                  <span>{settings.language === 'ta' ? 'EN' : 'த'}</span>
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
