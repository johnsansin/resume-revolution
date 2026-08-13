import React from 'react';
import { CVProvider } from '@/contexts/CVContext';
import CVBuilder from '@/components/cv/CVBuilder';

const Dashboard: React.FC = () => {
  return (
    <CVProvider>
      <CVBuilder />
    </CVProvider>
  );
};

export default Dashboard;
