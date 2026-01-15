import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Briefcase, GraduationCap, Wrench, Languages, FolderKanban, Layout, RotateCcw, Sparkles } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import ProjectsForm from './ProjectsForm';
import TemplateSelector from './TemplateSelector';
import CVPreview from './CVPreview';
import UserMenu from './UserMenu';
import SaveCVDialog from './SaveCVDialog';
import MyCVsDialog from './MyCVsDialog';
import { templates } from './templates/PDFTemplates';

const CVBuilder: React.FC = () => {
  const { cvData, selectedTemplate, loadSampleData, clearAllData } = useCVContext();
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const TemplateComponent = templates[selectedTemplate];
      const blob = await pdf(<TemplateComponent data={cvData} />).toBlob();
      saveAs(blob, `${cvData.personal.fullName || 'resume'}-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'template', label: 'Template', icon: Layout },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy to-teal flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">CV Maker</h1>
              <p className="text-xs text-muted-foreground">Create your professional resume</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <>
                <SaveCVDialog />
                <MyCVsDialog />
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="hidden sm:flex"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              className="hidden sm:flex"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="order-2 lg:order-1">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-4 sm:grid-cols-7 gap-1 mb-6 h-auto p-1">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col sm:flex-row items-center gap-1 px-2 py-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="personal" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Personal Information
                  </h2>
                  <PersonalInfoForm />
                </TabsContent>

                <TabsContent value="experience" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Work Experience
                  </h2>
                  <ExperienceForm />
                </TabsContent>

                <TabsContent value="education" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    Education
                  </h2>
                  <EducationForm />
                </TabsContent>

                <TabsContent value="skills" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-accent" />
                    Skills
                  </h2>
                  <SkillsForm />
                </TabsContent>

                <TabsContent value="languages" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-accent" />
                    Languages
                  </h2>
                  <LanguagesForm />
                </TabsContent>

                <TabsContent value="projects" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-accent" />
                    Projects
                  </h2>
                  <ProjectsForm />
                </TabsContent>

                <TabsContent value="template" className="mt-0">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-accent" />
                    Choose Template
                  </h2>
                  <TemplateSelector />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Preview Section */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-card rounded-xl shadow-card border border-border p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
                <span className="text-sm text-muted-foreground capitalize">{selectedTemplate} Template</span>
              </div>
              <div className="flex-1 overflow-auto bg-muted rounded-lg p-4 flex items-start justify-center">
                <div className="w-full max-w-md transform scale-[0.85] origin-top">
                  <CVPreview data={cvData} template={selectedTemplate} />
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
