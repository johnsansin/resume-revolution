import React from 'react';
import { CVData, TemplateId } from '@/types/cv';

interface CVPreviewProps {
  data: CVData;
  template: TemplateId;
}

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Generic Preview Generator
const createPreview = (config: {
  bgColor: string;
  textColor: string;
  accentColor: string;
  headerBg?: string;
  sidebarBg?: string;
}): React.FC<{ data: CVData }> => {
  return ({ data }) => {
    if (config.sidebarBg) {
      return (
        <div className="flex min-h-full font-sans text-xs" style={{ backgroundColor: config.bgColor }}>
          <div className="w-1/3 p-5 text-white" style={{ backgroundColor: config.sidebarBg }}>
            <h1 className="text-lg font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
            <p className="text-xs mb-4 opacity-80">{data.personal.jobTitle || 'Professional Title'}</p>
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Contact</h3>
              {data.personal.email && <p className="text-xs opacity-70 mb-1">{data.personal.email}</p>}
              {data.personal.phone && <p className="text-xs opacity-70 mb-1">{data.personal.phone}</p>}
              {data.personal.location && <p className="text-xs opacity-70 mb-1">{data.personal.location}</p>}
            </div>
            {data.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Skills</h3>
                {data.skills.map((skill) => (
                  <p key={skill.id} className="text-xs bg-white/10 px-2 py-1 rounded mb-1">{skill.name}</p>
                ))}
              </div>
            )}
            {data.languages.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Languages</h3>
                {data.languages.map((lang) => (
                  <p key={lang.id} className="text-xs mb-1 opacity-70">{lang.name} - {lang.proficiency}</p>
                ))}
              </div>
            )}
          </div>
          <div className="w-2/3 p-5" style={{ color: config.textColor }}>
            {data.personal.summary && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `2px solid ${config.accentColor}` }}>Profile</h2>
                <p className="leading-relaxed opacity-80">{data.personal.summary}</p>
              </div>
            )}
            {data.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `2px solid ${config.accentColor}` }}>Experience</h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{exp.position}</span>
                      <span className="text-xs opacity-60">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                    </div>
                    <p style={{ color: config.accentColor }}>{exp.company}</p>
                    <p className="text-xs opacity-60">{exp.location}</p>
                    <p className="mt-1 text-xs opacity-70">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            {data.education.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `2px solid ${config.accentColor}` }}>Education</h2>
                {data.education.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <span className="font-semibold">{edu.degree} in {edu.field}</span>
                    <p style={{ color: config.accentColor }}>{edu.institution}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (config.headerBg) {
      return (
        <div className="min-h-full font-sans text-xs" style={{ backgroundColor: config.bgColor, color: config.textColor }}>
          <div className="p-6 text-white" style={{ backgroundColor: config.headerBg }}>
            <h1 className="text-2xl font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
            <p className="opacity-80 mb-3">{data.personal.jobTitle || 'Professional Title'}</p>
            <div className="flex gap-4 text-xs opacity-70">
              {data.personal.email && <span>{data.personal.email}</span>}
              {data.personal.phone && <span>{data.personal.phone}</span>}
              {data.personal.location && <span>{data.personal.location}</span>}
            </div>
          </div>
          <div className="p-6">
            {data.personal.summary && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `3px solid ${config.accentColor}40` }}>About Me</h2>
                <p className="leading-relaxed opacity-80">{data.personal.summary}</p>
              </div>
            )}
            {data.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `3px solid ${config.accentColor}40` }}>Experience</h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="mb-3 pl-3" style={{ borderLeft: `3px solid ${config.accentColor}` }}>
                    <span className="font-semibold">{exp.position}</span>
                    <p style={{ color: config.accentColor }}>{exp.company}</p>
                    <p className="text-xs opacity-60">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
                    <p className="mt-1 opacity-70">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            {data.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold pb-1 mb-2" style={{ color: config.accentColor, borderBottom: `3px solid ${config.accentColor}40` }}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span key={skill.id} className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: config.accentColor }}>{skill.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 min-h-full font-sans text-xs" style={{ backgroundColor: config.bgColor, color: config.textColor }}>
        <div className="mb-4 pb-4" style={{ borderBottom: `2px solid ${config.accentColor}` }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: config.accentColor }}>{data.personal.fullName || 'Your Name'}</h1>
          <p className="text-sm opacity-70 mb-2">{data.personal.jobTitle || 'Professional Title'}</p>
          <div className="flex flex-wrap gap-4 text-xs opacity-60">
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.location && <span>{data.personal.location}</span>}
          </div>
        </div>
        {data.personal.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2" style={{ color: config.accentColor }}>Summary</h2>
            <p className="leading-relaxed opacity-80">{data.personal.summary}</p>
          </div>
        )}
        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2" style={{ color: config.accentColor }}>Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{exp.position}</span>
                  <span className="text-xs opacity-50">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <p style={{ color: config.accentColor }}>{exp.company}</p>
                <p className="mt-1 opacity-70">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2" style={{ color: config.accentColor }}>Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <span className="font-semibold">{edu.degree} in {edu.field}</span>
                <p style={{ color: config.accentColor }}>{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2" style={{ color: config.accentColor }}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span key={skill.id} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}>{skill.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
};

// All 50 preview components
const previewComponents: Record<TemplateId, React.FC<{ data: CVData }>> = {
  classic: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#1a365d' }),
  modern: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#3182ce', sidebarBg: '#1a365d' }),
  minimal: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#1a1a1a' }),
  creative: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#319795', headerBg: '#319795' }),
  professional: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2b6cb0' }),
  executive: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#c9a227' }),
  tech: createPreview({ bgColor: '#0d1117', textColor: '#c9d1d9', accentColor: '#58a6ff' }),
  compact: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#2563eb' }),
  elegant: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#744210' }),
  bold: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#e53e3e' }),
  corporate: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#1e3a5f', sidebarBg: '#1e3a5f' }),
  academic: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2c5282' }),
  startup: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#6b46c1', sidebarBg: '#6b46c1' }),
  designer: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#d53f8c' }),
  consultant: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2f855a', sidebarBg: '#2f855a' }),
  engineer: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#3182ce' }),
  marketing: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#dd6b20', sidebarBg: '#dd6b20' }),
  finance: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#1a365d' }),
  healthcare: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#38a169', sidebarBg: '#38a169' }),
  legal: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#742a2a' }),
  artistic: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#9f7aea' }),
  gradient: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#805ad5', sidebarBg: '#667eea' }),
  timeline: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#4299e1' }),
  infographic: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#ed8936', sidebarBg: '#dd6b20' }),
  simple: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#4a5568' }),
  clean: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#38b2ac' }),
  formal: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2d3748' }),
  casual: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#ed64a6' }),
  contemporary: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#00b5d8', sidebarBg: '#0987a0' }),
  traditional: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#744210' }),
  sleek: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#1a202c', sidebarBg: '#1a202c' }),
  vibrant: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#f56565' }),
  monochrome: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#1a1a1a' }),
  pastel: createPreview({ bgColor: '#faf5ff', textColor: '#553c9a', accentColor: '#b794f4' }),
  dark: createPreview({ bgColor: '#1a202c', textColor: '#e2e8f0', accentColor: '#63b3ed' }),
  light: createPreview({ bgColor: '#f7fafc', textColor: '#2d3748', accentColor: '#667eea' }),
  accent: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#48bb78' }),
  iconic: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#e53e3e', sidebarBg: '#c53030' }),
  geometric: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#3182ce' }),
  organic: createPreview({ bgColor: '#f0fff4', textColor: '#22543d', accentColor: '#68d391' }),
  modular: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#9f7aea', sidebarBg: '#805ad5' }),
  structured: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2b6cb0' }),
  flowing: createPreview({ bgColor: '#fff', textColor: '#234e52', accentColor: '#4fd1c5' }),
  metro: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#00a4ef', sidebarBg: '#0078d4' }),
  swiss: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#e53e3e' }),
  nordic: createPreview({ bgColor: '#f7fafc', textColor: '#2d3748', accentColor: '#4a5568' }),
  retro: createPreview({ bgColor: '#fffff0', textColor: '#744210', accentColor: '#d69e2e' }),
  futuristic: createPreview({ bgColor: '#0a0a0a', textColor: '#ffffff', accentColor: '#00d9ff' }),
  premium: createPreview({ bgColor: '#1a1a1a', textColor: '#f7fafc', accentColor: '#c9a227' }),
  luxe: createPreview({ bgColor: '#0d0d0d', textColor: '#fff', accentColor: '#d4af37', sidebarBg: '#1a1a1a' }),
};

const CVPreview: React.FC<CVPreviewProps> = ({ data, template }) => {
  const PreviewComponent = previewComponents[template];
  
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
      <div className="w-full h-full overflow-auto">
        <PreviewComponent data={data} />
      </div>
    </div>
  );
};

export default CVPreview;
