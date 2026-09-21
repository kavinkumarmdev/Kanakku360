import React from 'react';
import { useFinance } from '../../context/FinanceContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const { settings } = useFinance();
  const isTamil = settings.language === 'ta';

  const sizeConfig = {
    sm: {
      iconSize: 'w-7 h-7',
      titleText: 'text-sm font-bold',
      badgeText: 'text-[10px] px-1.5 py-0.5 font-bold',
      subText: 'text-[9px]',
    },
    md: {
      iconSize: 'w-9 h-9',
      titleText: 'text-base sm:text-lg font-extrabold',
      badgeText: 'text-[11px] px-2 py-0.5 font-extrabold',
      subText: 'text-[10px]',
    },
    lg: {
      iconSize: 'w-11 h-11',
      titleText: 'text-xl font-black',
      badgeText: 'text-xs px-2.5 py-1 font-black',
      subText: 'text-[11px]',
    },
    xl: {
      iconSize: 'w-14 h-14',
      titleText: 'text-2xl sm:text-3xl font-black',
      badgeText: 'text-sm px-3 py-1 font-black',
      subText: 'text-xs tracking-widest',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none transition-all group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Precision Geometric Fintech Monogram */}
      <div
        className={`${sizeConfig.iconSize} shrink-0 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/70 p-1.5 flex items-center justify-center shadow-md group-hover:border-emerald-500/50 group-hover:shadow-emerald-950/30 transition-all duration-200 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Vertical Stem */}
          <path
            d="M7 6V26"
            stroke="url(#logoStemGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Upper Diagonal Arm */}
          <path
            d="M8.5 16L19 6.5"
            stroke="#10B981"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* 360 Continuous Growth Loop */}
          <path
            d="M13.5 13L25.5 25"
            stroke="url(#logoLoopGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Orbit Node */}
          <circle cx="24.5" cy="8" r="2.5" fill="#10B981" />

          <defs>
            <linearGradient id="logoStemGrad" x1="7" y1="6" x2="7" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="logoLoopGrad" x1="13.5" y1="13" x2="25.5" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`${sizeConfig.titleText} tracking-tight ${
              settings.theme === 'light'
                ? 'text-slate-900'
                : 'text-white'
            }`}
          >
            {isTamil ? 'கணக்கு' : 'Kanakku'}
          </span>
          <span
            className={`${sizeConfig.badgeText} rounded-md bg-emerald-500 text-slate-950 tracking-wider shadow-sm`}
          >
            360
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`${sizeConfig.subText} ${
              settings.theme === 'light'
                ? 'text-slate-500 font-medium'
                : 'text-slate-400 font-medium'
            } uppercase tracking-wider hidden xs:block truncate`}
          >
            {isTamil ? 'நிதி & பண்ணை மேலாண்மை' : 'Enterprise Finance & Agri'}
          </span>
        )}
      </div>
    </div>
  );
};
