import React from 'react';

interface TataSteelLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export const TataSteelLogo: React.FC<TataSteelLogoProps> = ({ 
  className = '', 
  size = 'md', 
  theme = 'dark' 
}) => {
  // Sizing definitions
  const dimensions = {
    sm: { width: 180, height: 60, className: 'h-10 w-auto' },
    md: { width: 250, height: 85, className: 'h-14 w-auto' },
    lg: { width: 320, height: 110, className: 'h-20 w-auto' }
  }[size];

  const brandBlue = '#007cc3'; // Vibrant official Tata brand sky blue
  const wordmarkColor = theme === 'dark' ? '#ffffff' : '#007cc3';
  const sloganTextColor = theme === 'dark' ? '#ffffff' : '#111827'; // Black/dark charcoal

  return (
    <div className={`flex items-center inline-block ${className}`} id="tata-steel-official-vector-logo">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 250 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={dimensions.className}
      >
        {/* LINE 1: TATA STEEL (y: 10 to 35) */}
        
        {/* Letter 'T' in TATA */}
        <path d="M10 10 h22 v5 h-8 v20 h-6 v-20 h-8 z" fill={brandBlue} />
        
        {/* Letter 'A' in TATA (stencil - no crossbar) */}
        <path d="M36 35 L42.5 10 H48.5 L42 35 Z M48.5 10 H54.5 L61 35 H55 L48.5 10 Z" fill={brandBlue} />
        
        {/* Letter 'T' in TATA */}
        <path d="M65 10 h22 v5 h-8 v20 h-6 v-20 h-8 z" fill={brandBlue} />
        
        {/* Letter 'A' in TATA (stencil - no crossbar) */}
        <path d="M91 35 L97.5 10 H103.5 L97 35 Z M103.5 10 H109.5 L116 35 H110 L103.5 10 Z" fill={brandBlue} />

        {/* Word 'STEEL' aligned next to TATA */}
        <text 
          x="124" 
          y="35" 
          fill={wordmarkColor} 
          fontFamily="'Inter', 'Outfit', 'Space Grotesk', system-ui, -apple-system, sans-serif" 
          fontWeight="500" 
          fontSize="29.5" 
          letterSpacing="0.5"
        >
          STEEL
        </text>

        {/* LINE 2: Hashtag and #WeAlsoMakeTomorrow (y: 48 to 68) */}
        
        {/* Slanted, colorful official campaign hashtag grid */}
        <g transform="translate(10, 48) skewX(-12)">
          {/* Top Green Horizontal Bar */}
          <rect x="1" y="5.5" width="18" height="2.8" rx="1.4" fill="#3cb54a" />
          {/* Bottom Red Horizontal Bar */}
          <rect x="1" y="11.5" width="18" height="2.8" rx="1.4" fill="#ed1c24" />
          {/* Left Orange Vertical Bar */}
          <rect x="5.5" y="1" width="2.8" height="18" rx="1.4" fill="#f37021" />
          {/* Right Blue/Cyan Vertical Bar */}
          <rect x="11.5" y="1" width="2.8" height="18" rx="1.4" fill="#00aeef" />
        </g>

        {/* PascalCase slogan WeAlsoMakeTomorrow with ZERO spaces */}
        <text 
          x="35" 
          y="66" 
          fill={sloganTextColor} 
          fontFamily="'Inter', 'Outfit', 'Space Grotesk', system-ui, -apple-system, sans-serif" 
          fontWeight="800" 
          fontSize="17.5"
          letterSpacing="-0.3"
        >
          WeAlsoMakeTomorrow
        </text>
      </svg>
    </div>
  );
};
