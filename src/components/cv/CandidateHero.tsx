import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCVContext } from '@/contexts/CVContext';
import { useSavedCVs } from '@/hooks/useSavedCVs';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileSignature,
  Sparkles,
  CalendarDays,
  Loader2,
  LayoutTemplate,
  FolderKanban,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface CandidateHeroProps {
  onDownload: () => void;
  isDownloading: boolean;
}

const CandidateHero: React.FC<CandidateHeroProps> = ({ onDownload, isDownloading }) => {
  const { profile } = useAuth();
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
  const firstName = (profile?.display_name || 'there').split(' ')[0];

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Sections done',
      value: `${sections.filled}/${sections.total}`,
    },
    {
      icon: LayoutTemplate,
      label: 'Template',
      value: selectedTemplate,
    },
    {
      icon: FolderKanban,
      label: 'Saved CVs',
      value: cvsLoading ? '…' : String(savedCVs.length),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-[#0e2a52] to-teal/85 shadow-xl shadow-navy/25 ring-1 ring-white/10 mb-6">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-teal/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          {/* Left: greeting + actions */}
          <div>
            <p className="text-white/65 text-xs sm:text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-300" />
              {today}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
              {greeting}, <span className="bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">{firstName}</span>
            </h2>
            <p className="text-white/75 text-sm mt-2 max-w-md leading-relaxed">
              Craft a resume that stands out. Fill in your details, pick a template, and download a polished PDF in minutes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button
                onClick={onDownload}
                disabled={isDownloading}
                className="bg-white text-navy font-semibold shadow-lg shadow-black/20 hover:bg-white/90 hover:shadow-xl transition-all"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isDownloading ? 'Generating…' : 'Download PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/letters')}
                className="border-white/30 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Cover Letters
              </Button>
              <Button
                variant="ghost"
                onClick={() => document.getElementById('builder-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/85 hover:text-white hover:bg-white/10"
              >
                <Sparkles className="w-4 h-4 mr-2 text-teal-300" />
                Start editing
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right: readiness + stats */}
          <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-medium">Resume readiness</p>
              <p className="text-white font-bold text-sm">{sections.pct}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 to-cyan-400 transition-all duration-500"
                style={{ width: `${sections.pct}%` }}
              />
            </div>
            <p className="text-white/55 text-[11px] mt-2">
              {sections.pct === 100
                ? 'Complete! Ready to download.'
                : `Complete ${sections.total - sections.filled} more section${sections.total - sections.filled === 1 ? '' : 's'} to reach 100%.`}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 ring-1 ring-white/15 p-3 text-center">
                  <stat.icon className="w-4 h-4 text-teal-300 mx-auto mb-1.5" />
                  <p className="text-white font-bold text-sm capitalize leading-tight truncate">{stat.value}</p>
                  <p className="text-white/55 text-[10px] mt-0.5 truncate">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateHero;
