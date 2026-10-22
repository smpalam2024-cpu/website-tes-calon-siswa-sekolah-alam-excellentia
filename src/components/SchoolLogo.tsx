import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Nature & School Emblem SVG */}
      <div
        className={`${sizeMap[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 p-1.5 shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400/40 shrink-0`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle halo glow */}
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Sunrise / Sun of knowledge */}
          <circle cx="50" cy="38" r="14" fill="#FDE047" opacity="0.9" />
          <path d="M50 18 L50 24 M64 24 L60 29 M36 24 L40 29" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />

          {/* Majestic Mountain / Nature background */}
          <path
            d="M20 72 L42 46 L54 58 L68 42 L80 72 Z"
            fill="#15803D"
            opacity="0.85"
          />

          {/* Elegant Sprouting Leaf (Symbol of Growth & Alam) */}
          <path
            d="M50 78 C50 78 40 64 42 48 C44 32 50 26 50 26 C50 26 56 32 58 48 C60 64 50 78 50 78 Z"
            fill="#86EFAC"
          />
          {/* Leaf vein */}
          <path d="M50 30 L50 72" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M50 44 L45 39 M50 54 L44 50 M50 44 L55 39 M50 54 L56 50" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />

          {/* Open Book of Knowledge at the base */}
          <path
            d="M26 76 C34 72 44 72 50 75 C56 72 66 72 74 76 L74 85 C66 81 56 81 50 84 C44 81 34 81 26 85 Z"
            fill="#FFFFFF"
          />
          <path
            d="M50 75 L50 84"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />

          {/* Gold Star of Excellence */}
          <polygon
            points="50,14 52,19 57,19 53,22 55,27 50,24 45,27 47,22 43,19 48,19"
            fill="#F59E0B"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-base md:text-lg">
              EXCELLENTIA
            </span>
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 tracking-wider">
              SMP ALAM
            </span>
          </div>
          <span className="text-[11px] md:text-xs font-semibold text-emerald-700 tracking-wide">
            SEKOLAH ALAM EXCELLENTIA PAMEKASAN
          </span>
          <span className="hidden sm:inline text-[9px] text-slate-500 font-medium italic">
            Admission Assessment System
          </span>
        </div>
      )}
    </div>
  );
};
