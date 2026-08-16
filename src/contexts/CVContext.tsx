import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CVData, TemplateId } from '@/types/cv';
import { sampleCVData } from '@/data/defaultCV';

interface CVContextType {
  cvData: CVData;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  selectedTemplate: TemplateId;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<TemplateId>>;
  showPhoto: boolean;
  setShowPhoto: React.Dispatch<React.SetStateAction<boolean>>;
  updatePersonal: (field: keyof CVData['personal'], value: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: string, value: string | boolean) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, field: string, value: string) => void;
  removeSkill: (id: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: string, value: string) => void;
  removeLanguage: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, field: string, value: string | string[]) => void;
  removeProject: (id: string) => void;
  addDigitalSkill: () => void;
  updateDigitalSkill: (id: string, field: string, value: string) => void;
  removeDigitalSkill: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, field: string, value: string) => void;
  removeCertification: (id: string) => void;
  updateInterests: (value: string[]) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const useCVContext = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCVContext must be used within a CVProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cvData, setCVData] = useState<CVData>(sampleCVData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [showPhoto, setShowPhoto] = useState(true);

  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    setCVData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const addExperience = () => {
    setCVData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: generateId(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          location: '',
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setCVData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: generateId(),
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: '',
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const addSkill = () => {
    setCVData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        { id: generateId(), name: '', level: 'intermediate' as const },
      ],
    }));
  };

  const updateSkill = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const removeSkill = (id: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  };

  const addLanguage = () => {
    setCVData(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        { id: generateId(), name: '', proficiency: 'conversational' as const },
      ],
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  };

  const addProject = () => {
    setCVData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: generateId(),
          name: '',
          description: '',
          url: '',
          technologies: [],
        },
      ],
    }));
  };

  const updateProject = (id: string, field: string, value: string | string[]) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const removeProject = (id: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const addDigitalSkill = () => {
    setCVData(prev => ({
      ...prev,
      digitalSkills: [
        ...(prev.digitalSkills || []),
        { id: generateId(), name: '', level: 'independent' as const },
      ],
    }));
  };

  const updateDigitalSkill = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      digitalSkills: (prev.digitalSkills || []).map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const removeDigitalSkill = (id: string) => {
    setCVData(prev => ({
      ...prev,
      digitalSkills: (prev.digitalSkills || []).filter(skill => skill.id !== id),
    }));
  };

  const addCertification = () => {
    setCVData(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { id: generateId(), name: '', issuer: '', year: '' },
      ],
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const removeCertification = (id: string) => {
    setCVData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter(cert => cert.id !== id),
    }));
  };

  const updateInterests = (value: string[]) => {
    setCVData(prev => ({ ...prev, interests: value }));
  };

  const loadSampleData = () => {
    setCVData(sampleCVData);
  };

  const clearAllData = () => {
    setCVData({
      personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        address: '',
        dateOfBirth: '',
        nationality: '',
        gender: '',
        driverLicense: '',
        website: '',
        linkedin: '',
        summary: '',
        jobTitle: '',
        photo: '',
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      digitalSkills: [],
      certifications: [],
      interests: [],
    });
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCVData,
        selectedTemplate,
        setSelectedTemplate,
        showPhoto,
        setShowPhoto,
        updatePersonal,
        addExperience,
        updateExperience,
        removeExperience,
        addEducation,
        updateEducation,
        removeEducation,
        addSkill,
        updateSkill,
        removeSkill,
        addLanguage,
        updateLanguage,
        removeLanguage,
        addProject,
        updateProject,
        removeProject,
        addDigitalSkill,
        updateDigitalSkill,
        removeDigitalSkill,
        addCertification,
        updateCertification,
        removeCertification,
        updateInterests,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};
