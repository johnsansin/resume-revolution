import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Download, FileText, Briefcase, GraduationCap, Wrench, Languages, FolderKanban, Layout, Cpu, Award, ScanSearch, ChevronRight, Image as ImageIcon, ImageOff, CheckCircle2, Bot, Sparkles, RotateCcw, FileSignature } from 'lucide-react';

import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import ProjectsForm from './ProjectsForm';
import DigitalSkillsForm from './DigitalSkillsForm';
import CertificationsForm from './CertificationsForm';
import ATSCheck from './ATSCheck';
import TemplateSelector from './TemplateSelector';
import CVPreview from './CVPreview';
import AICareerCoach from './AICareerCoach';
import SaveCVDialog from './SaveCVDialog';
import MyCVsDialog from './MyCVsDialog';
import { downloadBlob } from '@/lib/download';

const tabs = [
  { id: 'personal', label: 'Personal', title: 'Personal Information', desc: 'Your name, contact details & Europass info', icon: FileText },
  { id: 'experience', label: 'Experience', title: 'Work Experience', desc: 'Roles, achievements and bullet points', icon: Briefcase },
  { id: 'education', label: 'Education', title: 'Education', desc: 'Degrees, institutions and dates', icon: GraduationCap },
  { id: 'skills', label: 'Skills', title: 'Skills', desc: 'Core skills that recruiters scan for', icon: Wrench },
  { id: 'languages', label: 'Languages', title: 'Languages', desc: 'Fluency with Europass CEFR levels', icon: Languages },
  { id: 'projects', label: 'Projects', title: 'Projects', desc: 'Key projects with links & outcomes', icon: FolderKanban },
  { id: 'digital', label: 'Digital', title: 'Digital Skills', desc: 'Europass digital competence levels', icon: Cpu },
  { id: 'extras', label: 'Extras', title: 'Certifications & Interests', desc: 'Certificates, awards and personal interests', icon: Award },
  { id: 'template', label: 'Template', title: 'Choose Template', desc: '20 curated professional templates', icon: Layout },
  { id: 'ats', label: 'ATS Check', title: 'ATS Check', desc: 'Score your resume against any job', icon: ScanSearch },
];

const SectionHeading: React.FC<{ icon: React.ElementType; title: string; subtitle?: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 pb-3 border-b border-border/50">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-200 dark:ring-blue-800/50">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const CVBuilder: React.FC<{ initialSection?: string; onBack?: () => void; onWorkspaceNavigate?: (target: 'letters' | 'settings' | 'overview') => void }> = ({ initialSection = 'personal', onBack, onWorkspaceNavigate }) => {
  const { cvData, selectedTemplate, showPhoto, setShowPhoto, loadSampleData, clearAllData, draftStatus, lastSavedAt } = useCVContext();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTabId, setActiveTabId] = useState(initialSection);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  const sectionDone = {
    personal: !!cvData.personal.fullName && !!cvData.personal.summary,
    experience: cvData.experience.length > 0,
    education: cvData.education.length > 0,
    skills: cvData.skills.length > 0,
    languages: cvData.languages.length > 0,
    projects: cvData.projects.length > 0,
    digital: (cvData.digitalSkills || []).length > 0,
    extras: (cvData.certifications || []).length > 0,
  };
  const completedSections = Object.values(sectionDone).filter(Boolean).length;
  const progress = Math.round((completedSections / Object.keys(sectionDone).length) * 100);
  const goTo = (index: number) => {
    const next = tabs[Math.max(0, Math.min(tabs.length - 1, index))];
    setActiveTabId(next.id);
    document.getElementById('builder-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const [{ pdf }, { templates }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./templates/PDFTemplates'),
      ]);
      const tmpl = (templates as Record<string, React.ComponentType<{ data: typeof cvData; showPhoto: boolean }>>);
      const TemplateComponent = tmpl[selectedTemplate] || tmpl.ats;
      const blob = await pdf(<TemplateComponent data={cvData} showPhoto={showPhoto} />).toBlob();
      downloadBlob(blob, `${cvData.personal.fullName || 'resume'}-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      window.alert('PDF export could not be completed. Please remove an unsupported image and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="career-builder min-h-screen">
      {/* Main Content */}
      <main className="career-builder-main mx-auto max-w-[1360px] space-y-4">
        <section className="career-builder-hero overflow-hidden text-white">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="career-builder-step-icon grid h-11 w-11 place-items-center"><activeTab.icon className="h-[18px] w-[18px]" /></span>
              <div><p className="career-builder-eyebrow">Step {activeIndex + 1} of {tabs.length}</p><h2>{activeTab.title}</h2><p>{activeTab.desc}</p></div>
            </div>
            <div className="flex items-center gap-4 md:min-w-64">
              <div className="career-builder-progress min-w-0 flex-1 md:w-56"><div className="mb-1.5 flex justify-between"><span>Resume completion</span><b>{progress}%</b></div><div className="career-builder-track"><div className="career-builder-fill transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              <button onClick={() => setActiveTabId('ats')} className="career-builder-match"><Bot className="h-3 w-3" /> Match this CV to a job</button></div>
            </div>
          </div>
        </section>

        <div className="career-builder-tools">
          <SaveCVDialog />
          <MyCVsDialog />
          <button onClick={loadSampleData}><Sparkles />Load sample</button>
          <button onClick={clearAllData}><RotateCcw />Clear form</button>
          <button onClick={() => onWorkspaceNavigate ? onWorkspaceNavigate('letters') : navigate('/letters')}><FileSignature />Cover letters</button>
          <button className="primary" onClick={handleDownload} disabled={isDownloading}><Download />{isDownloading ? 'Generating…' : 'Download PDF'}</button>
        </div>

        <div className="career-builder-assistant">
          <AICareerCoach data={cvData} onOpenSection={setActiveTabId} />
          <div className="career-save-guide">
            <span><CheckCircle2 /></span>
            <div><b>How to save your new CV</b><p>Complete the sections in order, choose a template, then select <strong>Save New CV</strong>. Your unfinished work is {draftStatus === 'offline' ? 'saved locally while offline' : draftStatus === 'saving' ? 'saving locally…' : 'saved locally'} and survives refresh, logout and internet loss{lastSavedAt ? ` • ${new Date(lastSavedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}` : ''}.</p></div>
          </div>
        </div>

        <div id="builder-grid" className="career-builder-grid grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,1fr)] gap-5 items-start scroll-mt-20">
          {/* Form Section */}
          <div className="order-1">
            <div className="career-form-panel overflow-hidden">
              {/* Form header banner — compact */}
              <div className="career-form-header relative px-5 py-4 overflow-hidden">
                <div className="absolute -right-8 -top-12 w-40 h-40 rounded-full bg-blue-500/15 blur-2xl" />
                <div className="absolute right-20 -bottom-10 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="career-builder-step-icon flex h-[38px] w-[38px] shrink-0 items-center justify-center">
                    <activeTab.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-white tracking-tight">{activeTab.title}</h2>
                    <p className="text-[11px] text-white/70 mt-0.5 truncate">{activeTab.desc}</p>
                  </div>
                </div>
              </div>

              <div className="career-form-body p-3 sm:p-5 lg:p-6">
                <Tabs defaultValue="personal" value={activeTabId} onValueChange={setActiveTabId} className="w-full">
                  <div>
                  <aside className="career-section-nav sticky top-[72px] z-20 -mx-3 mb-6 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6">
                  <div className="mb-2 flex items-center justify-between px-1"><p className="text-[9px] font-black uppercase tracking-[.18em] text-muted-foreground">Resume sections</p><p className="text-[9px] font-bold text-cyan-600 dark:text-cyan-300">{completedSections}/{Object.keys(sectionDone).length} complete</p></div>
                  <TabsList className="flex h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-1.5 md:grid md:grid-cols-5 2xl:grid-cols-10">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="group flex min-w-[118px] shrink-0 items-center justify-start gap-2 rounded-lg border border-transparent px-2.5 py-2 text-[10px] data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-background transition-all md:min-w-0 md:w-full 2xl:justify-center"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-background/70 ring-1 ring-border/50 group-data-[state=active]:bg-white/10 group-data-[state=active]:ring-white/10"><tab.icon className="w-3.5 h-3.5" /></span>
                        <span className="flex-1 truncate text-left 2xl:flex-none">{tab.id === 'ats' ? 'Job Match' : tab.label}</span>
                        {tab.id !== 'template' && tab.id !== 'ats' && activeTabId !== tab.id && (
                          sectionDone[tab.id as keyof typeof sectionDone] ? (
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground/25" />
                          )
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  </aside>
                  <div className="min-w-0">

                  <TabsContent value="personal" className="mt-0">
                    <SectionHeading icon={FileText} title="Personal Information" subtitle="Contact details and Europass fields" />
                    <PersonalInfoForm />
                  </TabsContent>

                  <TabsContent value="experience" className="mt-0">
                    <SectionHeading icon={Briefcase} title="Work Experience" subtitle="Roles, achievements and bullet points" />
                    <ExperienceForm />
                  </TabsContent>

                  <TabsContent value="education" className="mt-0">
                    <SectionHeading icon={GraduationCap} title="Education" subtitle="Degrees, institutions and dates" />
                    <EducationForm />
                  </TabsContent>

                  <TabsContent value="skills" className="mt-0">
                    <SectionHeading icon={Wrench} title="Skills" subtitle="Core skills recruiters scan for" />
                    <SkillsForm />
                  </TabsContent>

                  <TabsContent value="languages" className="mt-0">
                    <SectionHeading icon={Languages} title="Languages" subtitle="Fluency with Europass CEFR levels" />
                    <LanguagesForm />
                  </TabsContent>

                  <TabsContent value="projects" className="mt-0">
                    <SectionHeading icon={FolderKanban} title="Projects" subtitle="Key projects with links & outcomes" />
                    <ProjectsForm />
                  </TabsContent>

                  <TabsContent value="digital" className="mt-0">
                    <SectionHeading icon={Cpu} title="Digital Skills" subtitle="Europass digital competence levels" />
                    <DigitalSkillsForm />
                  </TabsContent>

                  <TabsContent value="extras" className="mt-0">
                    <SectionHeading icon={Award} title="Certifications & Interests" subtitle="Certificates, awards and personal interests" />
                    <CertificationsForm />
                  </TabsContent>

                  <TabsContent value="ats" className="mt-0">
                    <SectionHeading icon={ScanSearch} title="ATS Check" subtitle="Score your resume against any job description" />
                    <ATSCheck />
                  </TabsContent>

                  <TabsContent value="template" className="mt-0">
                    <SectionHeading icon={Layout} title="Choose Template" subtitle="20 curated professional templates" />
                    <TemplateSelector />
                  </TabsContent>

                  <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
                    <Button variant="outline" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)} className="rounded-xl">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <div className="hidden text-center sm:block"><p className="text-[10px] font-bold text-muted-foreground">{completedSections} of {Object.keys(sectionDone).length} core sections completed</p></div>
                    {activeIndex < tabs.length - 1 ? (
                      <Button onClick={() => goTo(activeIndex + 1)} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                        Next step <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleDownload} disabled={isDownloading} className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                      </Button>
                    )}
                  </div>
                  </div>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="order-2 xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]">
            <div className="career-preview-panel p-3 h-full max-h-[760px] xl:max-h-none flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3 px-1 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><h2 className="text-xs font-bold text-foreground tracking-tight">Live Preview</h2>
                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 capitalize truncate">{selectedTemplate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={showPhoto ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowPhoto(!showPhoto)}
                    className={`h-7 text-[11px] px-2 ${showPhoto ? 'bg-blue-600 hover:bg-blue-500 text-white' : ''}`}
                  >
                    {showPhoto ? <ImageIcon className="w-3 h-3 mr-1" /> : <ImageOff className="w-3 h-3 mr-1" />}
                    <span className="hidden sm:inline">{showPhoto ? 'Photo On' : 'Off'}</span>
                  </Button>
                  <Badge variant="secondary" className="h-5 text-[10px] border-border/60 px-1.5">
                    A4
                  </Badge>
                </div>
              </div>
              <div className="career-resume-stage min-h-[420px] flex-1 overflow-auto rounded-xl p-2 sm:p-3 flex items-start justify-center">
                <div className="w-full max-w-md origin-top scale-[0.72] sm:scale-[0.82]">
                  <CVPreview data={cvData} template={selectedTemplate} showPhoto={showPhoto} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CVBuilder;
