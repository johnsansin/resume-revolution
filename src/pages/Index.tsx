import { CVProvider } from '@/contexts/CVContext';
import CVBuilder from '@/components/cv/CVBuilder';

const Index = () => {
  return (
    <CVProvider>
      <CVBuilder />
    </CVProvider>
  );
};

export default Index;
