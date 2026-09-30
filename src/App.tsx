import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { PinLockScreen } from './components/auth/PinLockScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { KPICards } from './components/dashboard/KPICards';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryBreakdown } from './components/dashboard/CategoryBreakdown';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { AccountQuickView } from './components/dashboard/AccountQuickView';
import { UpcomingDueAlerts } from './components/loans_savings/UpcomingDueAlerts';
import { FarmDashboard } from './components/farm/FarmDashboard';
import { LoansSavingsHub } from './components/loans_savings/LoansSavingsHub';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetList } from './components/budgets/BudgetList';
import { AccountList } from './components/accounts/AccountList';
import { AccountModal } from './components/accounts/AccountModal';
import { TransferModal } from './components/accounts/TransferModal';
import { GoalList } from './components/goals/GoalList';
import { GoogleSheetSync } from './components/settings/GoogleSheetSync';
import { GeneralSettings } from './components/settings/GeneralSettings';
import { AIAssistant } from './components/ai/AIAssistant';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickAccessBar } from './components/dashboard/QuickAccessBar';
import { BottomNav } from './components/layout/BottomNav';
import type { Transaction, TransactionType } from './types/finance';

const MainApp: React.FC = () => {
  const { isAuthenticated, isPinLocked, user } = useAuth();
  const { settings, updateSettings, t } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [txModalPreset, setTxModalPreset] = useState<{
    type?: TransactionType;
    categoryId?: string;
    worker?: string;
  }>({});
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Sync user profile name to finance settings if user exists
  useEffect(() => {
    if (user && user.name && settings.userName !== user.name) {
      updateSettings({ userName: user.name });
    }
  }, [user, settings.userName, updateSettings]);

  // If user is not authenticated, render the high-end Login Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const handleOpenAddTransaction = () => {
    setTransactionToEdit(null);
    setTxModalPreset({});
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setTransactionToEdit(null);
    setTxModalPreset({ type: 'expense' });
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setTransactionToEdit(null);
    setTxModalPreset({ type: 'income' });
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddFarmLabor = () => {
    setTransactionToEdit(null);
    setTxModalPreset({ type: 'expense', categoryId: 'cat_farm_labor' });
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddMilkEntry = () => {
    setTransactionToEdit(null);
    setTxModalPreset({ type: 'income', categoryId: 'cat_milk_sale' });
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setTxModalPreset({});
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={handleOpenAddTransaction}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome & Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0 shadow-sm">
                    {user?.avatar || '👤'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {t('greeting')}, <span className="text-emerald-400">{user?.name || settings.userName || 'Kavin'}</span>
                      </h1>
                      {user?.role && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 font-medium border border-slate-800 shrink-0">
                          {user.role.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date().toLocaleDateString(settings.language === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="hidden sm:inline"> • {settings.language === 'ta' ? 'குடும்பம் & பண்ணை நிதி கண்ணோட்டம்' : 'Family & Agri Financial Overview'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {(user?.username === 'appa' || user?.name?.toLowerCase().includes('appa') || user?.username === 'amma' || user?.name?.toLowerCase().includes('amma')) ? (
                    <button
                      onClick={() => setActiveTab('farm')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>🌾 {settings.language === 'ta' ? 'பண்ணை & கால்நடை' : 'Farm & Livestock'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenAddTransaction}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>➕ {t('record')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 15-Day Due Alert Reminder Banner on Dashboard */}
              <UpcomingDueAlerts
                onPayLoan={() => setActiveTab('loans_savings')}
                onPayScheme={() => setActiveTab('loans_savings')}
              />

              {/* ⚡ 1-Tap Quick Easy Access Shortcuts */}
              <QuickAccessBar
                onAddExpense={handleOpenAddExpense}
                onAddIncome={handleOpenAddIncome}
                onAddFarmLabor={handleOpenAddFarmLabor}
                onAddMilkEntry={handleOpenAddMilkEntry}
                onOpenLoansSavings={() => setActiveTab('loans_savings')}
                onOpenTransfer={() => setIsTransferModalOpen(true)}
              />

              {/* KPI Cards */}
              <KPICards onNavigate={setActiveTab} />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CashFlowChart />
                </div>
                <div className="lg:col-span-1">
                  <CategoryBreakdown />
                </div>
              </div>

              {/* Accounts and Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <AccountQuickView
                    onOpenTransfer={() => setIsTransferModalOpen(true)}
                    onOpenAddAccount={() => setIsAccountModalOpen(true)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <RecentTransactions
                    onViewAll={() => setActiveTab('transactions')}
                    onEditTransaction={handleOpenEditTransaction}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farm' && <FarmDashboard />}

          {activeTab === 'transactions' && (
            <TransactionList
              onAddTransaction={handleOpenAddTransaction}
              onEditTransaction={handleOpenEditTransaction}
            />
          )}

          {activeTab === 'loans_savings' && <LoansSavingsHub />}

          {activeTab === 'budgets' && <BudgetList />}

          {activeTab === 'accounts' && <AccountList />}

          {activeTab === 'goals' && <GoalList />}

          {activeTab === 'sync'     && <GoogleSheetSync />}
          {activeTab === 'settings' && <GeneralSettings />}
          {activeTab === 'ai'       && <AIAssistant />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={handleOpenAddTransaction}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionToEdit={transactionToEdit}
        initialType={txModalPreset.type}
        initialCategoryId={txModalPreset.categoryId}
        initialWorker={txModalPreset.worker}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* PIN Lock Screen Overlay if active */}
      {isPinLocked && <PinLockScreen />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
