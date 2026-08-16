export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  driverLicense?: string;
  website?: string;
  linkedin?: string;
  summary: string;
  jobTitle: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  cefr?: string;
}

export interface DigitalSkill {
  id: string;
  name: string;
  level: 'basic' | 'independent' | 'proficient';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface CVData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  digitalSkills?: DigitalSkill[];
  certifications?: Certification[];
  interests?: string[];
}

export type TemplateId = 
  | 'classic' 
  | 'modern' 
  | 'minimal' 
  | 'creative' 
  | 'professional' 
  | 'executive' 
  | 'tech' 
  | 'compact' 
  | 'corporate'
  | 'academic'
  | 'startup'
  | 'consultant'
  | 'finance'
  | 'legal'
  | 'healthcare'
  | 'europass'
  | 'ats'
  | 'photo-modern'
  | 'photo-classic'
  | 'photo-creative';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
}
