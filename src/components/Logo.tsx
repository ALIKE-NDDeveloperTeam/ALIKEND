import React from 'react';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isLightMode?: boolean;
  layout?: 'horizontal' | 'stacked';
  onClick?: () => void;
}

// Masterpiece Vector Speed-Bag Icon - Matching exact magenta/hot-pink (#FF007F) brand identity with AD
export const AlikeBagIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-300 drop-shadow-sm`}
    >
      <defs>
        {/* Vibrant Magenta / Hot-Pink Bag Body Gradient (#FF007F signature) */}
        <linearGradient id="alikeBagPinkGrad" x1="20%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FF1990" />
          <stop offset="50%" stopColor="#FF007F" />
          <stop offset="100%" stopColor="#D80068" />
        </linearGradient>

        {/* Speed Wings Gradient */}
        <linearGradient id="alikePinkSpeedGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF2696" />
          <stop offset="100%" stopColor="#FF007F" />
        </linearGradient>
      </defs>

      {/* Subtle soft ground shadow */}
      <ellipse cx="68" cy="94" rx="34" ry="4" fill="#000000" fillOpacity="0.14" />

      {/* 3 Speed Wings extending to the left */}
      {/* Top speed line */}
      <path
        d="M 12 36 C 8.5 36 6.5 38.5 6.5 41 C 6.5 43.5 8.5 46 12 46 L 46 44 C 48 43.8 48 36.2 46 36 Z"
        fill="url(#alikePinkSpeedGrad)"
      />
      {/* Middle speed line (longest) */}
      <path
        d="M 4 50 C 0.5 50 -1.5 52.5 -1.5 55 C -1.5 57.5 0.5 60 4 60 L 42 58 C 44 57.8 44 50.2 42 50 Z"
        fill="url(#alikePinkSpeedGrad)"
      />
      {/* Bottom speed line */}
      <path
        d="M 10 64 C 6.5 64 4.5 66.5 4.5 69 C 4.5 71.5 6.5 74 10 74 L 38 72 C 40 71.8 40 64.2 38 64 Z"
        fill="url(#alikePinkSpeedGrad)"
      />

      {/* Shopping Bag Arched Handle */}
      <path
        d="M 58 24 C 56 12, 78 12, 76 24"
        stroke="#E6006E"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Main Shopping Bag Body */}
      <path
        d="M 46 24 C 45 24 44 24.8 43.8 26 L 37.5 82 C 37.2 85.5 40 88.5 43.5 88.5 L 87.5 88.5 C 91 88.5 93.8 85.5 93.5 82 L 87.2 26 C 87 24.8 86 24 85 24 Z"
        fill="url(#alikeBagPinkGrad)"
      />

      {/* Handle attachment dots/eyelets */}
      <circle cx="58" cy="24" r="3" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="76" cy="24" r="3" fill="#FFFFFF" fillOpacity="0.8" />

      {/* Large, Bold White "AD" Monogram inside the Bag (Prominent & Eye-catching) */}
      <g fill="#FFFFFF" className="drop-shadow-xs">
        {/* Enlarged Letter A */}
        <path d="M 43.2 78.4 L 55.0 42.6 C 55.9 39.8 59.5 39.8 60.5 42.6 L 72.2 78.4 L 65.0 78.4 L 62.5 69.5 L 52.9 69.5 L 50.4 78.4 Z M 54.5 63.3 L 60.9 63.3 L 57.7 49.5 Z" />
        {/* Enlarged Letter D */}
        <path d="M 64.6 42.6 L 75.7 42.6 C 83.9 42.6 90.2 48.1 89.5 59.1 C 88.8 70.2 81.9 78.4 72.9 78.4 L 64.6 78.4 Z M 70.8 48.8 L 70.8 72.2 L 74.3 72.2 C 79.1 72.2 83.0 67.4 83.3 59.8 C 83.5 52.9 80.5 48.8 75.7 48.8 Z" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isLightMode = false,
  layout = 'horizontal',
  onClick,
}) => {
  const sizeMap = {
    xs: {
      iconSize: 'w-6 h-6',
      textSize: 'text-sm font-black tracking-wider',
      gap: 'gap-1.5',
    },
    sm: {
      iconSize: 'w-7 h-7 sm:w-8 sm:h-8',
      textSize: 'text-base sm:text-lg font-black tracking-wider',
      gap: 'gap-2',
    },
    md: {
      iconSize: 'w-8 h-8 sm:w-9 sm:h-9',
      textSize: 'text-lg sm:text-xl font-black tracking-wider',
      gap: 'gap-2 sm:gap-2.5',
    },
    lg: {
      iconSize: 'w-10 h-10 sm:w-12 sm:h-12',
      textSize: 'text-2xl sm:text-3xl font-black tracking-wider',
      gap: 'gap-2.5 sm:gap-3',
    },
    xl: {
      iconSize: 'w-16 h-16 sm:w-20 sm:h-20',
      textSize: 'text-3xl sm:text-4xl md:text-5xl font-black tracking-widest',
      gap: 'gap-3 sm:gap-4',
    },
  };

  const current = sizeMap[size] || sizeMap.md;
  const isStacked = layout === 'stacked';

  return (
    <div
      onClick={onClick}
      className={`inline-flex ${
        isStacked ? 'flex-col items-center text-center' : 'items-center'
      } select-none group ${
        onClick ? 'cursor-pointer active:scale-98' : ''
      } ${current.gap} ${className}`}
    >
      {/* AD Speed-Bag Icon in Hot-Pink (#FF007F) */}
      <AlikeBagIcon
        className={`${current.iconSize} transition-transform duration-300 group-hover:scale-105 shrink-0`}
      />

      {/* Official ALIKE ND Brand Typography in Hot-Pink (#FF007F) */}
      {showText && (
        <span
          className={`font-sans font-black uppercase text-[#FF007F] select-none leading-none tracking-wider transition-all duration-200 group-hover:brightness-110 whitespace-nowrap ${current.textSize}`}
          style={{ letterSpacing: '0.05em' }}
        >
          ALIKE ND
        </span>
      )}
    </div>
  );
};

export default Logo;
