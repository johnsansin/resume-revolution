export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
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
  | 'elegant' 
  | 'bold'
  | 'corporate'
  | 'academic'
  | 'startup'
  | 'designer'
  | 'consultant'
  | 'engineer'
  | 'marketing'
  | 'finance'
  | 'healthcare'
  | 'legal'
  | 'artistic'
  | 'gradient'
  | 'timeline'
  | 'infographic'
  | 'simple'
  | 'clean'
  | 'formal'
  | 'casual'
  | 'contemporary'
  | 'traditional'
  | 'sleek'
  | 'vibrant'
  | 'monochrome'
  | 'pastel'
  | 'dark'
  | 'light'
  | 'accent'
  | 'iconic'
  | 'geometric'
  | 'organic'
  | 'modular'
  | 'structured'
  | 'flowing'
  | 'metro'
  | 'swiss'
  | 'nordic'
  | 'retro'
  | 'futuristic'
  | 'premium'
  | 'luxe';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
}
