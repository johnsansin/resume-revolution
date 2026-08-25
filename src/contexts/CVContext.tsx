import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CVData, TemplateId } from '@/types/cv';
import { templateById } from '@/lib/templateCatalog';
import { sampleCVData } from '@/data/defaultCV';

const CV_DRAFT_KEY = 'cv_maker_draft';
const AUTO_SAVE_DELAY = 500;

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  loadCVData: (data: CVData, template?: TemplateId) => void;
  clearAllData: () => void;
  draftStatus: 'saving' | 'saved' | 'offline';
  lastSavedAt: number | null;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const useCVContext = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCVContext must be used within a CVProvider');
  }
  return context;
};

function loadDraft(): { cvData: CVData; template: TemplateId; updatedAt?: number } | null {
  try {
    const raw = localStorage.getItem(CV_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.cvData && parsed.template) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveDraft(cvData: CVData, template: TemplateId): number | null {
  try {
    const updatedAt = Date.now();
    localStorage.setItem(CV_DRAFT_KEY, JSON.stringify({ version: 2, cvData, template, updatedAt }));
    return updatedAt;
  } catch {
    return null;
  }
}

const initialDraft = loadDraft();

export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cvData, setCVData] = useState<CVData>(initialDraft?.cvData || sampleCVData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(initialDraft?.template && templateById[initialDraft.template] ? initialDraft.template : 'software-engineer');
  const [showPhoto, setShowPhoto] = useState(true);
  const [draftStatus, setDraftStatus] = useState<'saving' | 'saved' | 'offline'>(() => typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialDraft?.updatedAt || null);

  const flushDraft = useCallback(() => {
    const savedAt = saveDraft(cvData, selectedTemplate);
    if (savedAt) setLastSavedAt(savedAt);
    setDraftStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'saved');
  }, [cvData, selectedTemplate]);

  // Persist locally during normal edits and every lifecycle exit, including logout/unmount.
  useEffect(() => {
    setDraftStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'saving');
    const timer = setTimeout(() => {
      flushDraft();
    }, AUTO_SAVE_DELAY);
    const pageHide = () => saveDraft(cvData, selectedTemplate);
    const visibility = () => { if (document.visibilityState === 'hidden') pageHide(); };
    const offline = () => { saveDraft(cvData, selectedTemplate); setDraftStatus('offline'); };
    const online = () => { saveDraft(cvData, selectedTemplate); setDraftStatus('saved'); };
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('beforeunload', pageHide);
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(timer);
      saveDraft(cvData, selectedTemplate);
      window.removeEventListener('pagehide', pageHide);
      window.removeEventListener('beforeunload', pageHide);
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [cvData, selectedTemplate, flushDraft]);

  const updatePersonal = useCallback((field: keyof CVData['personal'], value: string) => {
    setCVData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }, []);

  const addExperience = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: generateId(), company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '' },
      ],
    }));
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: string | boolean) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' },
      ],
    }));
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  }, []);

  const addSkill = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: generateId(), name: '', level: 'intermediate' as const }],
    }));
  }, []);

  const updateSkill = useCallback((id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  }, []);

  const addLanguage = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      languages: [...prev.languages, { id: generateId(), name: '', proficiency: 'conversational' as const }],
    }));
  }, []);

  const updateLanguage = useCallback((id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  }, []);

  const addProject = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), name: '', description: '', url: '', technologies: [] }],
    }));
  }, []);

  const updateProject = useCallback((id: string, field: string, value: string | string[]) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  }, []);

  const addDigitalSkill = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      digitalSkills: [...(prev.digitalSkills || []), { id: generateId(), name: '', level: 'independent' as const }],
    }));
  }, []);

  const updateDigitalSkill = useCallback((id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      digitalSkills: (prev.digitalSkills || []).map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }));
  }, []);

  const removeDigitalSkill = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      digitalSkills: (prev.digitalSkills || []).filter((skill) => skill.id !== id),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setCVData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { id: generateId(), name: '', issuer: '', year: '' }],
    }));
  }, []);

  const updateCertification = useCallback((id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setCVData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((cert) => cert.id !== id),
    }));
  }, []);

  const updateInterests = useCallback((value: string[]) => {
    setCVData((prev) => ({ ...prev, interests: value }));
  }, []);

  const loadSampleData = useCallback(() => {
    setCVData(sampleCVData);
    setSelectedTemplate('software-engineer');
  }, []);

  const loadCVData = useCallback((data: CVData, template?: TemplateId) => {
    setCVData(data);
    if (template) setSelectedTemplate(templateById[template] ? template : 'software-engineer');
  }, []);

  const clearAllData = useCallback(() => {
    const empty: CVData = {
      personal: {
        fullName: '', email: '', phone: '', location: '', address: '', dateOfBirth: '',
        nationality: '', gender: '', driverLicense: '', website: '', linkedin: '', summary: '',
        jobTitle: '', photo: '',
      },
      experience: [], education: [], skills: [], languages: [], projects: [],
      digitalSkills: [], certifications: [], interests: [],
    };
    setCVData(empty);
    setSelectedTemplate('software-engineer');
    localStorage.removeItem(CV_DRAFT_KEY);
  }, []);

  return (
    <CVContext.Provider
      value={{
        cvData, setCVData, selectedTemplate, setSelectedTemplate,
        showPhoto, setShowPhoto,
        updatePersonal, addExperience, updateExperience, removeExperience,
        addEducation, updateEducation, removeEducation,
        addSkill, updateSkill, removeSkill,
        addLanguage, updateLanguage, removeLanguage,
        addProject, updateProject, removeProject,
        addDigitalSkill, updateDigitalSkill, removeDigitalSkill,
        addCertification, updateCertification, removeCertification,
        updateInterests, loadSampleData, loadCVData, clearAllData,
        draftStatus, lastSavedAt,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};
