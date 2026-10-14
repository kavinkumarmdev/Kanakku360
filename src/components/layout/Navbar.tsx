import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Settings as SettingsIcon, Menu, Globe, Lock, LogOut, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { BrandLogo } from '../common/BrandLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  onOpenQuickAdd,
  onOpenMobileMenu,
}) => {
  const { settings, updateSettings, totalNetWorth, t } = useFinance();
  const { user, availableUsers, loginAsUser, logout, lockWithPin } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const nextLang = settings.language === 'ta' ? 'en' : 'ta';
    updateSettings({ language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile menu trigger + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <div className="shrink-0 min-w-0">
            <BrandLogo size="md" onClick={() => setActiveTab('dashboard')} />
          </div>
        </div>

        {/* Center: Net Worth badge on large screens */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shrink-0 hover:border-slate-700 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-400 font-medium">{t('netWorth')}:</span>
          <span className={`font-bold tracking-tight text-sm ${totalNetWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(totalNetWorth, settings.currency)}
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button - hidden on mobile, visible on sm+ */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition shrink-0 cursor-pointer"
            title={settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {settings.theme === 'light' ? (
              <Moon size={15} className="text-indigo-400 shrink-0" />
            ) : (
              <Sun size={15} className="text-amber-400 shrink-0" />
            )}
          </button>

          {/* Language Switcher Pill - hidden on mobile, visible on sm+ */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition shrink-0 cursor-pointer"
            title="Switch between தமிழ் and English"
          >
            <Globe size={14} className="text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">{settings.language === 'ta' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            title={t('record')}
          >
            <Plus size={16} className="shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">{t('record')}</span>
          </button>

          {/* Settings Icon - hidden on mobile */}
          <button
            onClick={() => setActiveTab('settings')}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title={t('settings')}
          >
            <SettingsIcon size={17} />
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition shrink-0"
              title={user?.name || 'User Profile'}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                {user?.avatar || (user?.name ? user.name[0].toUpperCase() : '👤')}
              </div>
              <div className="hidden lg:block text-left min-w-0 pr-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Kavin'}</p>
                <p className="text-[10px] text-slate-400 truncate leading-none">{user?.role?.split('(')[0] || 'Member'}</p>
              </div>
            </button>

            {/* Dropdown Menu with Family Member Quick Switcher */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] glass-dropdown rounded-2xl p-2.5 border border-slate-800 shadow-2xl z-50 animate-fadeIn">
                {/* User Info Header */}
                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-lg shrink-0">
                      {user?.avatar || '👤'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-white truncate">{user?.name || 'Kavin'}</p>
                      <p className="text-[11px] text-indigo-300 truncate">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Quick Toggles for Theme & Language */}
                <div className="grid grid-cols-2 gap-1.5 mb-2 sm:hidden">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm"
                  >
                    {settings.theme === 'light' ? (
                      <>
                        <Moon size={14} className="text-indigo-400 shrink-0" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun size={14} className="text-amber-400 shrink-0" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={toggleLanguage}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm"
                  >
                    <Globe size={14} className="text-indigo-400 shrink-0" />
                    <span>{settings.language === 'ta' ? 'English' : 'தமிழ்'}</span>
                  </button>
                </div>

                {/* Quick Family Member Switcher Section */}
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    {settings.language === 'ta' ? 'உறுப்பினர் மாற்று (Switch Member):' : 'Switch Family Member:'}
                  </p>
                  <div className="space-y-1">
                    {availableUsers.map(u => {
                      const isCurrent = u.id === user?.id;
                      return (
                        <button
                          key={u.id}
                          disabled={isCurrent}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            loginAsUser(u.id, u.pin);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                            isCurrent
                              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{u.avatar}</span>
                            <span className="truncate">{u.name}</span>
                          </div>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Active</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="my-1.5 border-t border-slate-800/60" />

                {/* Dropdown Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      lockWithPin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                  >
                    <Lock size={15} className="text-amber-400" />
                    <span>{t('authLockApp')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                  >
                    <SettingsIcon size={15} className="text-indigo-400" />
                    <span>{t('navSettings')}</span>
                  </button>

                  <div className="my-1 border-t border-slate-800/60" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                  >
                    <LogOut size={15} />
                    <span>{t('authLogout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
