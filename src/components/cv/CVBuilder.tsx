import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { Download, FileText, Briefcase, GraduationCap, Wrench, Languages, FolderKanban, Layout, RotateCcw, Sparkles, Cpu, Award, ScanSearch, FileSignature, ChevronRight, Image as ImageIcon, ImageOff, CheckCircle2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

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
import UserMenu from './UserMenu';
import SaveCVDialog from './SaveCVDialog';
import MyCVsDialog from './MyCVsDialog';
import CandidateHero from './CandidateHero';
import ThemeToggle from '@/components/ThemeToggle';
import { templates } from './templates/PDFTemplates';

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
  <div className="mb-6 pb-4 border-b border-border/60">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 ring-1 ring-accent/30">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const CVBuilder: React.FC = () => {
  const { cvData, selectedTemplate, showPhoto, setShowPhoto, loadSampleData, clearAllData } = useCVContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTabId, setActiveTabId] = useState('personal');
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const TemplateComponent = templates[selectedTemplate] || templates.classic;
      const blob = await pdf(<TemplateComponent data={cvData} showPhoto={showPhoto} />).toBlob();
      saveAs(blob, `${cvData.personal.fullName || 'resume'}-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
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
                CV Builder
              </h1>
              <p className="hidden sm:block text-xs text-white/70 truncate">Craft a resume that lands interviews</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user && (
              <>
                <Badge className="hidden xl:inline-flex border-white/20 bg-white/10 text-white">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {selectedTemplate} Template
                </Badge>
                <Button variant="ghost" size="sm" onClick={loadSampleData} className="hidden lg:inline-flex text-white/85 hover:text-white hover:bg-white/10">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Load Sample
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAllData} className="hidden lg:inline-flex text-white/85 hover:text-white hover:bg-white/10">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/letters')} className="hidden md:inline-flex border-white/25 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40">
                  <FileSignature className="w-4 h-4 mr-2" />
                  Letters
                </Button>
                <SaveCVDialog />
                <MyCVsDialog />
              </>
            )}
            <Button
              onClick={handleDownload}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {user && (
          <CandidateHero onDownload={handleDownload} isDownloading={isDownloading} />
        )}

        <div id="builder-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start scroll-mt-24">
          {/* Form Section */}
          <div className="order-2 lg:order-1">
            <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden ring-1 ring-border/30">
              {/* Form header banner */}
              <div className="relative bg-gradient-to-r from-navy via-navy/95 to-teal/90 px-6 py-5 overflow-hidden">
                <div className="absolute -right-8 -top-12 w-52 h-52 rounded-full bg-accent/25 blur-2xl" />
                <div className="absolute right-24 -bottom-14 w-44 h-44 rounded-full bg-teal/25 blur-2xl" />
                <div className="relative flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25 backdrop-blur">
                    <activeTab.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white tracking-tight">{activeTab.title}</h2>
                    <p className="text-xs text-white/75 mt-0.5 truncate">{activeTab.desc}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Tabs defaultValue="personal" value={activeTabId} onValueChange={setActiveTabId} className="w-full">
                  <TabsList className="flex flex-wrap gap-1.5 mb-6 h-auto p-1.5 bg-muted/50 rounded-2xl border border-border/40">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-transparent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-accent/50 hover:bg-muted transition-all"
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.id !== 'template' && tab.id !== 'ats' && activeTabId !== tab.id && (
                          sectionDone[tab.id as keyof typeof sectionDone] ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground/25" />
                          )
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

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
                </Tabs>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-card rounded-2xl border border-border/60 shadow-card p-4 h-full flex flex-col ring-1 ring-border/30">
              <div className="flex items-center justify-between gap-2 mb-4 px-1 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-base font-bold text-foreground tracking-tight">Live Preview</h2>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-accent capitalize truncate">{selectedTemplate} Template</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showPhoto ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowPhoto(!showPhoto)}
                    className={showPhoto ? 'bg-accent hover:bg-accent/90' : ''}
                  >
                    {showPhoto ? <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> : <ImageOff className="w-3.5 h-3.5 mr-1.5" />}
                    <span className="hidden sm:inline">{showPhoto ? 'Photo On' : 'Photo Off'}</span>
                  </Button>
                  <Badge variant="secondary" className="border-border/60">
                    A4 · PDF
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-gradient-to-b from-muted/80 to-muted rounded-xl p-4 flex items-start justify-center ring-1 ring-border/20">
                <div className="w-full max-w-md transform scale-[0.85] origin-top">
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
