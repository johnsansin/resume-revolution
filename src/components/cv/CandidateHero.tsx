import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCVContext } from '@/contexts/CVContext';
import { useSavedCVs } from '@/hooks/useSavedCVs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Download,
  FileSignature,
  CalendarDays,
  LayoutTemplate,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';

interface CandidateHeroProps {
  onDownload: () => void;
  isDownloading: boolean;
}

const CandidateHero: React.FC<CandidateHeroProps> = ({ onDownload, isDownloading }) => {
  const { user } = useAuth();
  const { cvData, selectedTemplate } = useCVContext();
  const { savedCVs, loading: cvsLoading } = useSavedCVs();
  const navigate = useNavigate();

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
  const displayName = user?.displayName || user?.email || 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (sections.pct / 100) * circumference;

  const statCards = [
    { icon: CheckCircle2, label: 'Sections', value: `${sections.filled}/${sections.total}` },
    { icon: LayoutTemplate, label: 'Template', value: selectedTemplate },
    { icon: FolderKanban, label: 'Saved CVs', value: cvsLoading ? '…' : String(savedCVs.length) },
  ];

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
      <div className="pointer-events-none absolute -top-12 -right-8 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative px-5 py-5 sm:px-7 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: avatar + greeting + actions */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar className="h-12 w-12 ring-2 ring-white/20 shrink-0">
            <AvatarFallback className="bg-white/15 text-white text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-white/55 text-[11px] flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-blue-300" />
              {today}
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-0.5 truncate">
              {greeting}, <span className="bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">{firstName}</span>
            </h2>
            <p className="text-white/60 text-xs mt-0.5 hidden sm:block">Craft a resume that lands interviews</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button
                onClick={onDownload}
                disabled={isDownloading}
                size="sm"
                className="h-8 bg-white/90 text-slate-900 text-xs font-semibold shadow hover:bg-white transition-all px-2.5"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/letters')}
                className="h-8 text-xs border-white/25 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40 px-2.5"
              >
                <FileSignature className="w-3.5 h-3.5 mr-1.5" />
                Letters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('builder-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-8 text-xs text-white/75 hover:text-white hover:bg-white/10 px-2.5"
              >
                Start editing
              </Button>
            </div>
          </div>
        </div>

        {/* Right: progress ring + stat cards */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative h-20 w-20">
            <svg className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" className="text-white/10" fill="none" />
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" className="text-blue-400" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">{sections.pct}%</span>
              <span className="text-white/50 text-[8px] mt-0.5">done</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {statCards.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2">
                <stat.icon className="w-4 h-4 text-blue-300 shrink-0" />
                <div>
                  <p className="text-white font-bold text-xs leading-tight">{stat.value}</p>
                  <p className="text-white/50 text-[9px] leading-tight">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateHero;
