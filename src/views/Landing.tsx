import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronDown, FileCheck2, FileText, Gauge, LayoutTemplate,
  LockKeyhole, MousePointer2, ScanSearch, Sparkles, WandSparkles,
  Zap, Download, Quote, Star,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicFooter, PublicHeader } from '@/components/layout/PublicShell';

const features = [
  { icon: LayoutTemplate, title: 'Beautiful by default', copy: 'Choose from polished, recruiter-friendly templates made for every career stage.', className: 'md:col-span-2' },
  { icon: ScanSearch, title: 'Built for ATS', copy: 'Match keywords, catch gaps, and improve your score before you apply.', className: '' },
  { icon: WandSparkles, title: 'Write with confidence', copy: 'Turn rough notes into clear, impact-focused bullet points with smart suggestions.', className: '' },
  { icon: FileCheck2, title: 'Europass ready', copy: 'Create a familiar EU-standard CV without wrestling with formatting.', className: '' },
  { icon: Download, title: 'Perfect PDF, every time', copy: 'Export a clean, print-ready resume that looks exactly like your preview.', className: 'md:col-span-2' },
];

const steps = [
  { n: '01', title: 'Pick your look', copy: 'Start with a professional template that suits your role.' },
  { n: '02', title: 'Tell your story', copy: 'Follow simple prompts and improve each section as you go.' },
  { n: '03', title: 'Check and apply', copy: 'Review your ATS score, export the PDF, and send it.' },
];

const faqs = [
  ['Can I create a resume for free?', 'Yes. You can create, edit, save, and export your resume without entering a credit card.'],
  ['Will my resume work with ATS software?', 'The templates use clear structure, readable typography, and ATS-friendly formatting. The checker also helps you tailor keywords to a role.'],
  ['Can I keep more than one version?', 'Yes. Save multiple resumes and tailor each one for a different job or industry.'],
  ['Is my information private?', 'Your account and saved resumes are protected by secure authentication and remain private to you.'],
];

function ResumePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-cyan-400/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101d2e]/90 p-3 shadow-[0_32px_100px_rgba(0,0,0,.55)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3 pt-1">
          <div className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400/80" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300/80" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" /></div>
          <span className="text-[10px] font-medium tracking-[.18em] text-slate-500">LIVE PREVIEW</span>
          <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[9px] font-bold text-emerald-300">SAVED</span>
        </div>
        <div className="grid min-h-[430px] grid-cols-[132px_1fr] overflow-hidden rounded-2xl bg-[#f7f6f1] sm:grid-cols-[170px_1fr]">
          <aside className="bg-[#17283b] p-4 text-white sm:p-6">
            <div className="mb-7 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-200 to-blue-400" />
            <p className="mb-1 text-[10px] font-bold tracking-widest text-cyan-300">CONTACT</p>
            <div className="space-y-2 text-[8px] text-slate-300"><p>alex@email.com</p><p>London, UK</p><p>alexmorgan.dev</p></div>
            <p className="mb-2 mt-7 text-[10px] font-bold tracking-widest text-cyan-300">SKILLS</p>
            <div className="flex flex-wrap gap-1">
              {['Strategy', 'Research', 'Figma', 'Growth'].map(x => <span key={x} className="rounded bg-white/10 px-1.5 py-1 text-[7px]">{x}</span>)}
            </div>
          </aside>
          <main className="p-5 text-slate-800 sm:p-8">
            <p className="text-2xl font-black tracking-tight sm:text-3xl">Alex Morgan</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-blue-600">Product Designer</p>
            <div className="mt-7">
              <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-blue-700">Profile</p>
              <div className="space-y-1.5"><i className="block h-1.5 w-full rounded bg-slate-200" /><i className="block h-1.5 w-[88%] rounded bg-slate-200" /><i className="block h-1.5 w-[64%] rounded bg-slate-200" /></div>
            </div>
            <div className="mt-7">
              <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-blue-700">Experience</p>
              {[['Senior Product Designer', '2022 — Present'], ['UX Designer', '2019 — 2022']].map(([role, date], i) => (
                <div key={role} className={i ? 'mt-5' : ''}>
                  <div className="flex justify-between gap-2"><strong className="text-[10px]">{role}</strong><span className="text-[7px] text-slate-400">{date}</span></div>
                  <div className="mt-2 space-y-1.5"><i className="block h-1 w-full rounded bg-slate-200" /><i className="block h-1 w-[78%] rounded bg-slate-200" /></div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
      <div className="absolute -left-5 top-24 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#122236]/95 px-3 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur sm:flex">
        <Sparkles className="h-4 w-4 text-cyan-300" /> AI suggestion ready
      </div>
      <div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#122236]/95 p-3 text-white shadow-2xl backdrop-blur sm:-right-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-sm font-black text-emerald-300">92</span>
        <span><b className="block text-xs">Excellent ATS score</b><small className="text-[10px] text-slate-400">Ready to apply</small></span>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const appLink = user ? '/dashboard' : '/auth?mode=signup&next=/dashboard';

  return (
    <div className="min-h-screen overflow-hidden bg-[#07111f] text-white selection:bg-cyan-300 selection:text-slate-950">
      <PublicHeader />

      <main>
        <section className="relative px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-28">
          <div className="pointer-events-none absolute inset-0"><div className="absolute -left-28 top-10 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-[140px]" /><div className="absolute right-[2%] top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-[150px]" /><div className="absolute inset-0 opacity-[.045]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} /></div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.92fr_1.08fr]">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/[.08] px-3 py-1.5 text-xs font-semibold text-amber-200">
                <Zap className="h-3.5 w-3.5 fill-amber-300" /> Your career story, beautifully presented
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">
                Make your next move <span className="bg-gradient-to-r from-amber-200 via-cyan-200 to-sky-400 bg-clip-text text-transparent">impossible to overlook.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Turn your experience into a polished, ATS-ready resume with guided writing, intelligent checks, and editorial-quality templates.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to={appLink} className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_15px_50px_rgba(103,232,249,.18)] transition hover:-translate-y-0.5 hover:bg-cyan-200">
                  Create my resume <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/5"><MousePointer2 className="h-4 w-4" /> See how it works</a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                {['No credit card', 'Save multiple versions', 'Private by design'].map(x => <span key={x} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-300" />{x}</span>)}
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.045] backdrop-blur">
                {[['10+', 'curated templates'], ['92%', 'sample ATS score'], ['1 click', 'PDF export']].map(([value,label]) => <div key={label} className="border-r border-white/10 px-3 py-4 last:border-0 sm:px-5"><b className="block text-lg font-black text-white sm:text-xl">{value}</b><span className="mt-1 block text-[9px] uppercase tracking-[.12em] text-slate-500 sm:text-[10px]">{label}</span></div>)}
              </div>
            </div>
            <ResumePreview />
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.025] px-5 py-7">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
            <p className="text-center text-xs font-bold uppercase tracking-[.22em] text-slate-500 sm:text-left">Everything you need to apply confidently</p>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-300">
              <span className="flex gap-2"><Gauge className="h-4 w-4 text-cyan-300" />ATS feedback</span><span className="flex gap-2"><Sparkles className="h-4 w-4 text-cyan-300" />Smart writing</span><span className="flex gap-2"><LockKeyhole className="h-4 w-4 text-cyan-300" />Secure storage</span><span className="flex gap-2"><FileText className="h-4 w-4 text-cyan-300" />PDF export</span>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">One focused workspace</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Less formatting.<br />More forward motion.</h2><p className="mt-5 text-base leading-7 text-slate-400">Every tool is designed to help you make a stronger application—not give you another complicated editor to learn.</p></div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, copy, className }, i) => (
                <article key={title} className={`group relative min-h-[230px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.025] p-7 transition hover:-translate-y-1 hover:border-cyan-300/30 ${className}`}>
                  {i === 0 && <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />}
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-200"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 bg-[#f3f1e9] px-5 py-24 text-slate-950 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.24em] text-blue-700">How it works</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Three steps. One great resume.</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">A calm, guided flow keeps you moving from first detail to final download.</p></div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {steps.map((s, i) => <article key={s.n} className="relative rounded-[1.75rem] border border-slate-900/10 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,.07)]"><span className="text-xs font-black text-blue-600">{s.n}</span><h3 className="mt-12 text-xl font-black">{s.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{s.copy}</p>{i < 2 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 rounded-full border border-slate-200 bg-white p-2 text-blue-600 md:block" />}</article>)}
            </div>
          </div>
        </section>

        <section id="why-us" className="scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
            <div className="rounded-[2rem] border border-white/10 bg-white/[.045] p-7 sm:p-10"><Quote className="h-9 w-9 text-cyan-300" /><blockquote className="mt-7 text-2xl font-bold leading-9 tracking-tight sm:text-3xl">“The editor made it obvious what to improve. I tailored my resume in one evening instead of losing a weekend to formatting.”</blockquote><div className="mt-8 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-300 to-blue-400 font-black text-slate-950">JM</div><div><b className="block text-sm">Jordan M.</b><span className="text-xs text-slate-400">Product manager</span></div><div className="ml-auto flex text-amber-300">{[1,2,3,4,5].map(x => <Star key={x} className="h-3.5 w-3.5 fill-current" />)}</div></div></div>
            <div className="lg:pl-12"><p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">Make the first impression count</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">A resume that sounds like you—on your best day.</h2><p className="mt-6 text-base leading-7 text-slate-400">Your career is more than a template. CareerCanvas gives your experience structure, clarity, and polish while keeping you in control of every word.</p><Link to={appLink} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200">Start with my experience <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 px-5 py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">Questions, answered</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em]">Good to know.</h2><p className="mt-4 text-sm leading-6 text-slate-400">Still unsure? Create an account and explore the builder at your own pace.</p></div><div className="border-t border-white/10">{faqs.map(([q,a], i) => <div key={q} className="border-b border-white/10"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-5 py-6 text-left text-sm font-bold hover:text-cyan-200" aria-expanded={openFaq === i}>{q}<ChevronDown className={`h-4 w-4 shrink-0 transition ${openFaq === i ? 'rotate-180 text-cyan-300' : 'text-slate-500'}`} /></button>{openFaq === i && <p className="max-w-2xl pb-6 text-sm leading-6 text-slate-400">{a}</p>}</div>)}</div></div>
        </section>

        <section className="px-5 py-12 lg:px-8 lg:py-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-cyan-200 via-sky-300 to-blue-500 px-6 py-16 text-center text-slate-950 sm:px-12"><div className="absolute -left-16 -top-20 h-60 w-60 rounded-full border-[40px] border-white/20" /><div className="relative"><h2 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">Your next opportunity starts here.</h2><p className="mx-auto mt-4 max-w-xl text-sm font-medium text-slate-800/80 sm:text-base">Create a resume you’re proud to send. It only takes a few minutes to get started.</p><Link to={appLink} className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Build my resume <ArrowRight className="h-4 w-4" /></Link></div></div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
