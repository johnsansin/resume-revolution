import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#222252" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.25" fill="url(#logo-gradient)" strokeWidth="0" />
      <path d="M8 7.5h8v1.5H8zM8 11h8v1.5H8zM8 14.5h5v1.5H8z" fill="white" opacity="0.9" />
      <path d="M18.5 6.25v2.5l2 2-2 2v2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
};

export const LogoFull: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <Logo size={22} />
      <span className="font-display text-xl font-extrabold text-foreground">CV Maker</span>
    </div>
  );
};

export default Logo;
