import React from 'react';
import { CVProvider } from '@/contexts/CVContext';
import LetterBuilder from '@/components/letters/LetterBuilder';

const Letters: React.FC = () => {
  return (
    <CVProvider>
      <LetterBuilder />
    </CVProvider>
  );
};

export default Letters;
