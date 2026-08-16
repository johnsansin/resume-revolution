import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCVContext } from '@/contexts/CVContext';
import { useSavedCVs } from '@/hooks/useSavedCVs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import UserMenu from './UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { formatDistanceToNow } from 'date-fns';
import { CVData, TemplateId } from '@/types/cv';
import {
  Download,
  Loader2,
  FileSignature,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  LayoutTemplate,
  CalendarDays,
  Trash2,
  Clock,
  FileText,
  TrendingUp,
  GraduationCap,
  Briefcase,
  PlayCircle,
  PlusCircle,
} from 'lucide-react';

interface SavedCV {
  id: string;
  name: string;
  cv_data: CVData;
  template_id: TemplateId;
  created_at: string;
  updated_at: string;
}

interface CandidateOverviewProps {
  onContinue: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; gradient: string }> = ({ icon: Icon, label, value, gradient }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card ring-1 ring-border/30">
    <div className="flex items-center gap-3.5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-foreground leading-none truncate">{value}</p>
        <p className="text-xs text-muted-foreground mt-1.5 truncate">{label}</p>
      </div>
    </div>
  </div>
);

const CandidateOverview: React.FC<CandidateOverviewProps> = ({ onContinue, onDownload, isDownloading }) => {
  const { profile } = useAuth();
  const { cvData, selectedTemplate, loadSampleData, setCVData, setSelectedTemplate } = useCVContext();
  const { savedCVs, loading: cvsLoading, deleteCV } = useSavedCVs();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<string | null>(null);

  const sections = useMemo(() => {
    const checks = [
      !!cvData.personal.fullName,
      !!cvData.personal.summary,
      cvData.experience.length > 0,
      cvData.education.length > 0,
      cvData.skills.length > 0,
      cvData.languages.length > 0,
      cvData.projects.length > 0,
      (cvData.digitalSkills || []).length > 0,
      (cvData.certifications || []).length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
  }, [cvData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const displayName = profile?.display_name || 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const ringSize = 128;
  const ringStroke = 10;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;

  const loadCV = (cv: SavedCV) => {
    setCVData(cv.cv_data);
    setSelectedTemplate(cv.template_id);
    onContinue();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteCV(id);
    setDeleting(null);
  };

  const startSample = () => {
    loadSampleData();
    onContinue();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-navy via-[#16335a] to-teal shadow-lg shadow-navy/25">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-white/30 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur shadow-lg">
                <Logo size={22} className="text-white" />
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">
                My Dashboard
              </h1>
              <p className="hidden sm:block text-xs text-white/70 truncate">Your resumes at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              size="sm"
              className="bg-white text-navy font-semibold shadow-lg shadow-black/10 hover:bg-white/90 hover:shadow-xl transition-all shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
              <span className="sm:hidden">{isDownloading ? '...' : 'PDF'}</span>
            </Button>
            <ThemeToggle variant="dark" />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-[#0e2a52] to-teal/85 shadow-xl shadow-navy/25 ring-1 ring-white/10">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-teal/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-white/20 shrink-0">
                <AvatarFallback className="bg-white/15 text-white text-xl sm:text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white/65 text-xs sm:text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-300" />
                  {today}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 truncate">
                  {greeting}, <span className="bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">{firstName}</span>
                </h2>
                <p className="text-white/75 text-sm mt-1.5">Everything you need to craft your next great resume.</p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5eead4" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <circle cx="64" cy="64" r={ringR} stroke="rgba(255,255,255,0.15)" strokeWidth={ringStroke} fill="none" />
                  <circle
                    cx="64" cy="64" r={ringR}
                    stroke="url(#ringGrad)" strokeWidth={ringStroke} fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCirc}
                    strokeDashoffset={ringCirc - (sections.pct / 100) * ringCirc}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">{sections.pct}%</span>
                  <span className="text-[10px] text-white/70 uppercase tracking-widest mt-0.5">readiness</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col gap-2">
                <Button onClick={onContinue} className="bg-white text-navy font-semibold shadow-lg shadow-black/20 hover:bg-white/90">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Continue editing
                </Button>
                <Button variant="outline" onClick={() => navigate('/letters')} className="border-white/30 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40">
                  <FileSignature className="w-4 h-4 mr-2" />
                  Cover Letters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Resume readiness" value={`${sections.pct}%`} gradient="from-accent to-teal" />
          <StatCard icon={CheckCircle2} label="Sections complete" value={`${sections.filled}/${sections.total}`} gradient="from-emerald-500 to-teal" />
          <StatCard icon={FolderKanban} label="Saved CVs" value={cvsLoading ? '…' : String(savedCVs.length)} gradient="from-navy to-[#16335a]" />
          <StatCard icon={LayoutTemplate} label="Active template" value={selectedTemplate} gradient="from-cyan-500 to-teal" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent CVs */}
          <section className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden ring-1 ring-border/30">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 ring-1 ring-accent/30">
                  <FolderKanban className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Your CVs</h3>
                  <p className="text-xs text-muted-foreground">Saved resumes you can pick up anytime</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onContinue} className="border-border/60">
                <PlusCircle className="w-4 h-4 mr-1.5 text-accent" />
                New CV
              </Button>
            </div>

            <div className="p-5 space-y-2.5">
              {cvsLoading ? (
                <div className="py-10 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your CVs…
                </div>
              ) : savedCVs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 ring-1 ring-border/40">
                    <FolderKanban className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">No saved CVs yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Build your resume and hit “Save CV” — it will show up here so you can jump back in anytime.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                    <Button onClick={startSample} className="bg-gradient-to-r from-accent to-teal text-white shadow-lg shadow-accent/25">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start with sample data
                    </Button>
                    <Button variant="outline" onClick={onContinue}>Start from scratch</Button>
                  </div>
                </div>
              ) : (
                savedCVs.map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3 hover:bg-background/80 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy/10 to-teal/10 ring-1 ring-border/60">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{cv.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <LayoutTemplate className="w-3 h-3" />
                          <span className="capitalize">{cv.template_id}</span>
                          <span className="text-border/70">•</span>
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(cv.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => loadCV(cv)} className="border-border/60">
                        <PlayCircle className="w-3.5 h-3.5 mr-1 text-accent" />
                        Load
                      </Button>
                      <Button size="icon" variant="ghost" disabled={deleting === cv.id} onClick={() => handleDelete(cv.id)} className="text-destructive hover:bg-destructive/10">
                        {deleting === cv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Side column */}
          <div className="space-y-6">
            {/* Quick actions */}
            <section className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden ring-1 ring-border/30">
              <div className="px-5 py-4 border-b border-border/60 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 ring-1 ring-accent/30">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Quick actions</h3>
                  <p className="text-xs text-muted-foreground">Jump straight into work</p>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <Button onClick={onContinue} className="w-full justify-between bg-gradient-to-r from-accent to-teal text-white shadow-lg shadow-accent/25 hover:brightness-105">
                  Continue editing
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/letters')} className="w-full justify-between border-border/60">
                  Cover Letters
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={onDownload} disabled={isDownloading} className="w-full border-border/60">
                  <span className="flex items-center gap-2">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-accent" />}
                    Download PDF
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={startSample} className="w-full text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Load sample CV
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </section>

            {/* ATS tip */}
            <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-teal/5 p-5 shadow-card ring-1 ring-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">Pro tip</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most recruiters use ATS software to filter resumes. Fill in the{' '}
                <span className="text-accent font-medium">ATS Check</span> tab with the job description to score
                your resume, and match keywords from the posting.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateOverview;
