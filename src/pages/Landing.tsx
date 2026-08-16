import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogoFull } from '@/components/ui/logo';
import {
  FileText,
  Download,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Clock,
  ChevronRight,
  ArrowRight,
  ScanSearch,
  FileSignature,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: <LayoutDashboard className="w-6 h-6 text-accent" />,
    title: 'Professional Templates',
    desc: '52 templates for every industry — including official Europass CV and ATS-friendly formats.',
  },
  {
    icon: <ScanSearch className="w-6 h-6 text-accent" />,
    title: 'ATS Score Checker',
    desc: 'Paste any job description and get an ATS score with keyword matching and instant fixes.',
  },
  {
    icon: <FileCheck2 className="w-6 h-6 text-accent" />,
    title: 'Europass CV',
    desc: 'Generate an official Europass-format CV that is recognized across the European Union.',
  },
  {
    icon: <FileSignature className="w-6 h-6 text-accent" />,
    title: 'Cover & Motivation Letters',
    desc: 'Generate a polished cover letter (US) or motivation letter (EU) in two clicks, from your CV.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: 'Smart Suggestions',
    desc: 'Get AI-powered wording help as you build, so your words get noticed.',
  },
  {
    icon: <Download className="w-6 h-6 text-accent" />,
    title: 'Export to PDF',
    desc: 'One-click download to a polished PDF that prints perfectly, every time.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-accent" />,
    title: 'Secure & Private',
    desc: 'Your data stays yours. End-to-end auth with Supabase — nothing is shared.',
  },
  {
    icon: <Clock className="w-6 h-6 text-accent" />,
    title: 'Save & Iterate',
    desc: 'Store multiple resumes in the cloud and refine them anytime you like.',
  },
  {
    icon: <FileText className="w-6 h-6 text-accent" />,
    title: 'Instant Preview',
    desc: 'See exactly how your resume looks in real time as you edit.',
  },
];

const testimonials = [
  {
    quote: 'I landed two interviews in a week. The templates actually impress hiring managers.',
    name: 'Priya M.',
    role: 'Product Designer',
  },
  {
    quote: 'Finally a resume builder that doesn\'t fight me. Clean, fast, and the PDF looks great.',
    name: 'Drew R.',
    role: 'Software Engineer',
  },
];

const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?next=/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <LogoFull />
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard" className="gap-1">
                Open Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?next=/dashboard" className="gap-1">
                  Register <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="container mx-auto grid items-center gap-12 px-4 py-12 md:gap-16 md:py-20 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Crafted for professionals
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Build a resume that <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-teal">lands interviews</span>
            </h1>
            <p className="max-w-[580px] text-muted-foreground">
              CV Maker helps you create, polish, and export a professional resume in minutes — with
              templates that pass applicant tracking systems and a live preview that keeps up with every word.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/auth?next=/dashboard">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="link" size="lg" className="gap-2" asChild>
                <Link to="/auth">Sign in to your account</Link>
              </Button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-6 -right-6 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-navy/20 via-teal/15 to-purple-400/10 blur-3xl" />
            <div className="rounded-xl border bg-card/70 p-2 shadow-card ring-1 ring-border/50 backdrop-blur">
              <div className="rounded-lg border-dashed border-2 border-dashed-fg/30">
                <img
                  src="/placeholder.svg"
                  alt="Resume preview"
                  className="block w-full rounded-md"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">Preview</Button>
                <Button size="sm" className="ml-auto gap-1">
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:py-16">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground flex-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Social proof */}
      <section className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-2 lg:py-16">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-xl border bg-card/60 p-6 shadow-sm">
            <p className="italic">“{t.quote}”</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA footer */}
      <footer className="container mx-auto flex flex-col items-center gap-4 px-4 py-12 md:py-16">
        <h2 className="font-display text-center text-2xl font-bold sm:text-3xl">
          Ready to build yours?
        </h2>
        <p className="max-w-md text-center text-muted-foreground">
          Join thousands of professionals who’ve upgraded their resume with CV Maker. It’s free to start.
        </p>
        <Button size="lg" asChild>
          <Link to="/auth?next=/dashboard">Create your resume</Link>
        </Button>
        <p className="text-xs text-muted-foreground">No credit card. No spam. Just your resume.</p>
      </footer>
    </div>
  );
};

export default Landing;
