import React, { useEffect, useState } from 'react';
import { CVProvider, useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import CVBuilder from '@/components/cv/CVBuilder';
import CandidateOverview from '@/components/cv/CandidateOverview';
import LetterBuilder from '@/components/letters/LetterBuilder';
import Settings from '@/views/Settings';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/cv/UserMenu';
import WorkspaceHeaderActions from '@/components/WorkspaceHeaderActions';
import { Button } from '@/components/ui/button';
import type { CVData } from '@/types/cv';
import { downloadBlob } from '@/lib/download';
import {
  Bot, Download, FileSignature, FileText, FolderKanban,
  LayoutDashboard, LayoutTemplate, Loader2, Menu, PanelLeftClose,
  ScanSearch, Settings as SettingsIcon, Sparkles,
} from 'lucide-react';

type WorkspaceView = 'overview' | 'builder' | 'letters' | 'settings';

const generatePDF = async (cvData: CVData, selectedTemplate: string, showPhoto: boolean) => {
  const [{ pdf }, { templates }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/cv/templates/PDFTemplates'),
  ]);
  const TemplateComponent = templates[selectedTemplate as keyof typeof templates] || templates.ats;
  return pdf(<TemplateComponent data={cvData} showPhoto={showPhoto} />).toBlob();
};

const DashboardInner: React.FC = () => {
  const { cvData, selectedTemplate, showPhoto, loadSampleData } = useCVContext();
  const { user } = useAuth();
  const [view, setView] = useState<WorkspaceView>('overview');
  const [builderSection, setBuilderSection] = useState('personal');
  const [isDownloading, setIsDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSidebarOpen(window.innerWidth >= 1024);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const openBuilder = (section = 'personal') => {
    setBuilderSection(section);
    setView('builder');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOverviewAnchor = (anchor?: string) => {
    setView('overview');
    if (window.innerWidth < 1024) setSidebarOpen(false);
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePDF(cvData, selectedTemplate, showPhoto);
      downloadBlob(blob, `${cvData.personal.fullName || 'resume'}-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('CV PDF export failed:', error);
      window.alert('PDF export could not be completed. Please remove an unsupported image and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSavedDownload = async (data: CVData, template: string, name: string) => {
    const blob = await generatePDF(data, template, showPhoto);
    const safeName = name.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'resume';
    downloadBlob(blob, `${safeName}-${template}.pdf`);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Candidate';
  const title = view === 'overview' ? 'Career Dashboard' : view === 'builder' ? (builderSection === 'ats' ? 'Job Match Report' : builderSection === 'template' ? 'CV Templates' : 'CV Builder') : view === 'letters' ? 'Cover Letters' : 'Account Settings';
  const subtitle = view === 'overview' ? 'Your complete career workspace' : view === 'builder' ? 'Build, tailor and optimize without leaving your dashboard' : view === 'letters' ? 'Create application-ready letters from your CV' : 'Manage your profile, security and appearance';

  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard, active: view === 'overview', action: () => openOverviewAnchor() },
    { label: 'CV Builder', icon: FileText, active: view === 'builder' && builderSection !== 'ats' && builderSection !== 'template', action: () => openBuilder('personal') },
    { label: 'My Saved CVs', icon: FolderKanban, action: () => openOverviewAnchor('saved-cvs') },
    { label: 'Job Match Report', icon: ScanSearch, active: view === 'builder' && builderSection === 'ats', action: () => openBuilder('ats') },
    { label: 'CV Templates', icon: LayoutTemplate, active: view === 'builder' && builderSection === 'template', action: () => openBuilder('template') },
    { label: 'Cover Letters', icon: FileSignature, active: view === 'letters', action: () => { setView('letters'); if (window.innerWidth < 1024) setSidebarOpen(false); } },
    { label: 'AI Career Coach', icon: Bot, action: () => openOverviewAnchor('ai-career-coach') },
    { label: isDownloading ? 'Generating PDF…' : 'Download CV', icon: isDownloading ? Loader2 : Download, action: handleDownload },
    { label: 'Load Sample CV', icon: Sparkles, action: () => { loadSampleData(); openBuilder('personal'); } },
    { label: 'Account Settings', icon: SettingsIcon, active: view === 'settings', action: () => { setView('settings'); if (window.innerWidth < 1024) setSidebarOpen(false); } },
  ];

  return (
    <div className={`career-shell min-h-screen transition-[padding] duration-300 ${sidebarOpen ? 'lg:pl-[248px]' : ''}`}>
      {sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`career-sidebar fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col overflow-hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="career-brand flex items-center gap-3">
          <span className="career-brand-stamp">CV</span>
          <div className="min-w-0"><p className="truncate text-sm font-bold">CareerCanvas</p><p className="career-brand-sub">Candidate workspace</p></div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Hide sidebar"><PanelLeftClose className="h-4 w-4" /></button>
        </div>
        <div className="career-nav-label">Workspace</div>
        <nav className="career-nav flex-1 overflow-y-auto">
          {nav.map(({ label, icon: Icon, action, active }) => (
            <button key={label} onClick={action} disabled={isDownloading && label.includes('Generating')} className={`career-nav-item group ${active ? 'active' : ''}`}>
              <Icon className={`h-[17px] w-[17px] shrink-0 ${isDownloading && label.includes('Generating') ? 'animate-spin' : ''}`} /><span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
        <div className="career-sidebar-foot">
          <div className="flex items-center gap-2"><span className="career-avatar">{displayName.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-white">{displayName}</p><p className="truncate text-[11px] text-[#7B84A8]">Candidate account</p></div><ThemeToggle variant="dark" /><UserMenu onAccount={() => setView('settings')} /></div>
        </div>
      </aside>

      <header className="career-topbar sticky top-0 z-30">
        <div className="flex h-[76px] items-center gap-3 px-4 sm:px-[30px]">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((open) => !open)} className="h-9 w-9 shrink-0"><Menu className="h-5 w-5" /></Button>
          <div className="min-w-0"><h1 className="truncate text-[22px] font-semibold tracking-[-.01em]">{title}</h1><p className="hidden truncate text-[13px] text-[#6B7280] sm:block">{subtitle}</p></div>
          <div className="ml-auto flex items-center gap-2"><WorkspaceHeaderActions /><div className="hidden items-center gap-2 sm:flex"><span className="career-template-pill capitalize">{selectedTemplate} template</span><Button onClick={() => openBuilder('personal')} size="sm" className="career-edit-button"><FileText className="mr-1.5 h-3.5 w-3.5" />Edit CV</Button></div></div>
        </div>
      </header>

      <div className="workspace-embedded min-h-[calc(100vh-72px)]">
        {view === 'overview' && <CandidateOverview onContinue={openBuilder} onDownload={handleDownload} onDownloadSaved={handleSavedDownload} isDownloading={isDownloading} onWorkspaceNavigate={(target) => target === 'letters' ? setView('letters') : target === 'settings' ? setView('settings') : openOverviewAnchor(target)} />}
        {view === 'builder' && <CVBuilder key={builderSection} initialSection={builderSection} onBack={() => setView('overview')} onWorkspaceNavigate={(target) => target === 'letters' ? setView('letters') : target === 'settings' ? setView('settings') : setView('overview')} />}
        {view === 'letters' && <LetterBuilder />}
        {view === 'settings' && <Settings />}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => <CVProvider><DashboardInner /></CVProvider>;
export default Dashboard;
