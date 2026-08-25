import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const links = [
  ['Features', '/#features'],
  ['How it works', '/#how'],
  ['Why us', '/#why-us'],
  ['FAQ', '/#faq'],
] as const;

export function Brand() {
  return <span className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-sm font-black text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,.22)]">CV</span><span className="text-[15px] font-bold tracking-tight text-white">CareerCanvas</span></span>;
}

export function PublicHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 20);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);
  return <header className={`sticky top-0 z-50 border-b transition ${solid ? 'border-white/10 bg-[#07111f]/95 shadow-lg backdrop-blur-xl' : 'border-white/10 bg-[#07111f]/85 backdrop-blur-xl'}`}>
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
      <Link to="/" aria-label="CareerCanvas home"><Brand /></Link>
      <nav className="hidden items-center gap-7 md:flex">
        {links.map(([label,to]) => <Link key={to} to={to} className="text-sm font-medium text-slate-400 transition hover:text-white">{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {!user && <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white">Sign in</Link>}
        <Link to={user ? '/dashboard' : '/auth?mode=signup&next=/dashboard'} className="group inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200">{user ? 'Open CV Builder' : 'Sign up'}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link>
      </div>
      <button onClick={() => setMenu(!menu)} className="rounded-lg p-2 text-slate-300 md:hidden" aria-label="Toggle navigation">{menu ? <X /> : <Menu />}</button>
    </div>
    {menu && <div className="border-t border-white/10 bg-[#091727] p-4 md:hidden"><div className="flex flex-col gap-1">{links.map(([label,to]) => <Link key={to} to={to} onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5">{label}</Link>)}<Link to={user ? '/dashboard' : '/auth?mode=signup&next=/dashboard'} className="mt-2 rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950">{user ? 'Open CV Builder' : 'Sign up'}</Link></div></div>}
  </header>;
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050d18] px-5 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.7fr] lg:gap-16 lg:py-16">
        <div className="max-w-md">
          <p className="font-serif text-2xl font-semibold tracking-tight">CareerCanvas</p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            A focused career workspace for creating clear, compelling and ATS-ready resumes without wrestling with formatting.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Secure and privacy focused
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[.18em] text-slate-200">Explore</h3>
          <nav className="mt-5 flex flex-col items-start gap-3">
            {links.map(([label, to]) => (
              <Link key={to} to={to} className="text-sm text-slate-500 transition hover:translate-x-0.5 hover:text-cyan-200">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[.18em] text-slate-200">Get started</h3>
          <div className="mt-5 flex flex-col items-start gap-3">
            <Link to="/auth?mode=signup&next=/dashboard" className="text-sm text-slate-500 transition hover:translate-x-0.5 hover:text-cyan-200">Create an account</Link>
            <Link to="/auth" className="text-sm text-slate-500 transition hover:translate-x-0.5 hover:text-cyan-200">Sign in</Link>
            <Link to="/reset-password" className="text-sm text-slate-500 transition hover:translate-x-0.5 hover:text-cyan-200">Reset password</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 py-6 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CareerCanvas. All rights reserved.</p>
        <p>Build boldly. Apply confidently.</p>
      </div>
    </footer>
  );
}
