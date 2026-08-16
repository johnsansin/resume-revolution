import React, { useState } from 'react';
import { CVProvider, useCVContext } from '@/contexts/CVContext';
import CVBuilder from '@/components/cv/CVBuilder';
import CandidateOverview from '@/components/cv/CandidateOverview';
import { templates } from '@/components/cv/templates/PDFTemplates';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const DashboardInner: React.FC = () => {
  const { cvData, selectedTemplate, showPhoto } = useCVContext();
  const [view, setView] = useState<'overview' | 'builder'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);

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

  if (view === 'overview') {
    return (
      <CandidateOverview
        onContinue={() => setView('builder')}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    );
  }

  return <CVBuilder />;
};

const Dashboard: React.FC = () => {
  return (
    <CVProvider>
      <DashboardInner />
    </CVProvider>
  );
};

export default Dashboard;
