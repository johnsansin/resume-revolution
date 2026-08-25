import React from 'react';

const AppLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-navy via-[#0e2a52] to-teal overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal/25 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex flex-col items-center">
        {/* Three-dimensional CV document mark */}
        <div className="cv-loader-scene relative h-32 w-32" aria-label="CV Builder is loading" role="status">
          <div className="cv-loader-shadow" />
          <div className="cv-loader-page cv-loader-page-back" />
          <div className="cv-loader-page cv-loader-page-mid" />
          <div className="cv-loader-page cv-loader-page-front">
            <span className="cv-loader-fold" />
            <span className="cv-loader-avatar">CV</span>
            <span className="cv-loader-line cv-loader-line-one" />
            <span className="cv-loader-line cv-loader-line-two" />
            <span className="cv-loader-line cv-loader-line-three" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-white">
          CV Builder
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
