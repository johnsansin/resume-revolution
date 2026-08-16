import React from 'react';
import { Logo } from '@/components/ui/logo';

const AppLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-navy via-[#0e2a52] to-teal overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal/25 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex flex-col items-center">
        {/* Logo with animated rings */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-300 animate-spin" style={{ animationDuration: '1.1s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent animate-spin" style={{ animationDuration: '1.6s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/30 backdrop-blur shadow-2xl shadow-black/20">
            <Logo size={28} className="text-white" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-white">
          CV Maker
        </h1>
        <p className="mt-1.5 text-xs text-white/60 tracking-wide">
          {message || 'Craft a resume that lands interviews'}
        </p>

        {/* Shimmering progress bar */}
        <div className="mt-7 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 animate-[loader-slide_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
