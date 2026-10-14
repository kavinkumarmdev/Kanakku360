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
      containerSize: 'w-8 h-8',
      titleText: 'text-sm font-bold',
      badgeText: 'text-[9px] px-1.5 py-0.5 font-bold',
      subText: 'text-[9px]',
      dotSize: 'w-1.5 h-1.5',
    },
    md: {
      containerSize: 'w-10 h-10',
      titleText: 'text-base sm:text-lg font-extrabold',
      badgeText: 'text-[10px] px-2 py-0.5 font-extrabold',
      subText: 'text-[10px]',
      dotSize: 'w-1.5 h-1.5',
    },
    lg: {
      containerSize: 'w-12 h-12',
      titleText: 'text-xl font-black tracking-tight',
      badgeText: 'text-xs px-2.5 py-0.5 font-black',
      subText: 'text-[11px]',
      dotSize: 'w-2 h-2',
    },
    xl: {
      containerSize: 'w-16 h-16',
      titleText: 'text-2xl sm:text-3xl font-black tracking-tight',
      badgeText: 'text-sm px-3 py-1 font-black',
      subText: 'text-xs tracking-wider',
      dotSize: 'w-2.5 h-2.5',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none transition-all duration-200 group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Ultra-Modern 360 Fintech & Agri Orbital Emblem */}
      <div
        className={`${sizeConfig.containerSize} shrink-0 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-slate-700/80 p-1.5 flex items-center justify-center shadow-lg group-hover:border-emerald-400/60 group-hover:shadow-emerald-500/20 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
      >
        {/* Soft Ambient Inner Glow */}
        <div className="absolute inset-0 bg-radial-at-c from-emerald-500/15 via-transparent to-transparent pointer-events-none group-hover:opacity-100 transition-opacity" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer 360 Continuous Orbital Ring with Arrow Head */}
          <path
            d="M 18 3 A 15 15 0 1 1 5 24"
            stroke="url(#ringGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Upward Growth Arrowhead on 360 Orbit */}
          <path
            d="M 21 2 L 18 3 L 19 6.5"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Stylized 'K' & Rupee Pillar with Ascending Sprout */}
          <path
            d="M 12 9 V 27"
            stroke="url(#pillarGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Upper Diagonal Arm (Agri Growth & Wealth Ascent) */}
          <path
            d="M 13.5 18 L 24 10"
            stroke="url(#accentGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Lower Diagonal Anchor & Loop */}
          <path
            d="M 17 15.5 L 25 27"
            stroke="url(#ringGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Glowing Prosperity Node */}
          <circle
            cx="24.5"
            cy="9.5"
            r="2.5"
            fill="url(#accentGradient)"
            className="filter drop-shadow(0 0 3px #10B981)"
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="pillarGradient" x1="12" y1="9" x2="12" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="13" y1="18" x2="25" y2="9" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.6" stopColor="#10B981" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="ringGradient" x1="5" y1="3" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="0.4" stopColor="#06B6D4" />
              <stop offset="0.8" stopColor="#6366F1" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`${sizeConfig.titleText} font-bold tracking-tight ${
              settings.theme === 'light'
                ? 'text-slate-900 group-hover:text-emerald-700'
                : 'text-white group-hover:text-emerald-300'
            } transition-colors`}
          >
            {isTamil ? 'கணக்கு' : 'Kanakku'}
          </span>

          {/* High-Impact 360° Shimmer Badge */}
          <span
            className={`${sizeConfig.badgeText} rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black tracking-wider shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all flex items-center gap-0.5`}
          >
            <span>360</span>
            <span className="text-[75%] opacity-80 leading-none">°</span>
          </span>
        </div>

        {/* Subtitle with Active Status Pulse */}
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`${sizeConfig.dotSize} rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse shrink-0`}
            />
            <span
              className={`${sizeConfig.subText} ${
                settings.theme === 'light'
                  ? 'text-slate-600 font-medium'
                  : 'text-slate-400 font-medium'
              } uppercase tracking-wider hidden xs:block truncate`}
            >
              {isTamil ? 'குடும்பம் • பண்ணை • வாடகை' : 'Family • Agri • Rentals'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
