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

// Classic Preview
const ClassicPreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="p-8 bg-white text-gray-800 font-sans text-xs min-h-full">
    <div className="text-center border-b-2 border-navy pb-4 mb-4">
      <h1 className="text-2xl font-bold text-navy mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-sm text-gray-600 mb-2">{data.personal.jobTitle || 'Professional Title'}</p>
      <div className="flex justify-center gap-4 text-xs text-gray-500">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
    </div>
    {data.personal.summary && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-navy border-b border-gray-200 pb-1 mb-2">Professional Summary</h2>
        <p className="text-gray-600 leading-relaxed">{data.personal.summary}</p>
      </div>
    )}
    {data.experience.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-navy border-b border-gray-200 pb-1 mb-2">Work Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold">{exp.position}</span>
              <span className="text-xs text-gray-500">
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </span>
            </div>
            <p className="text-gray-700">{exp.company} • {exp.location}</p>
            <p className="text-gray-600 mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    )}
    {data.education.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-navy border-b border-gray-200 pb-1 mb-2">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-start">
              <span className="font-semibold">{edu.degree} in {edu.field}</span>
              <span className="text-xs text-gray-500">{formatDate(edu.endDate)}</span>
            </div>
            <p className="text-gray-700">{edu.institution}</p>
          </div>
        ))}
      </div>
    )}
    {data.skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-navy border-b border-gray-200 pb-1 mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span key={skill.id} className="bg-gray-100 px-2 py-1 rounded text-xs">{skill.name}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Modern Preview
const ModernPreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="flex bg-white min-h-full font-sans text-xs">
    <div className="w-1/3 bg-navy p-5 text-white">
      <h1 className="text-lg font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-blue-200 text-xs mb-4">{data.personal.jobTitle || 'Professional Title'}</p>
      
      <div className="mb-4">
        <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Contact</h3>
        {data.personal.email && <p className="text-xs text-gray-200 mb-1">{data.personal.email}</p>}
        {data.personal.phone && <p className="text-xs text-gray-200 mb-1">{data.personal.phone}</p>}
        {data.personal.location && <p className="text-xs text-gray-200 mb-1">{data.personal.location}</p>}
      </div>

      {data.skills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Skills</h3>
          {data.skills.map((skill) => (
            <p key={skill.id} className="text-xs bg-white/10 px-2 py-1 rounded mb-1">{skill.name}</p>
          ))}
        </div>
      )}

      {data.languages.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Languages</h3>
          {data.languages.map((lang) => (
            <div key={lang.id} className="text-xs mb-1">
              <span>{lang.name}</span>
              <span className="text-blue-200 text-xs block">{lang.proficiency}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="w-2/3 p-5">
      {data.personal.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-navy border-b-2 border-blue-500 pb-1 mb-2">Profile</h2>
          <p className="text-gray-600 leading-relaxed">{data.personal.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-navy border-b-2 border-blue-500 pb-1 mb-2">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-gray-800">{exp.position}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-blue-600">{exp.company}</p>
              <p className="text-gray-500 text-xs">{exp.location}</p>
              <p className="text-gray-600 mt-1 text-xs">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-navy border-b-2 border-blue-500 pb-1 mb-2">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <span className="font-semibold text-gray-800">{edu.degree} in {edu.field}</span>
              <p className="text-blue-600">{edu.institution}</p>
              <p className="text-gray-500 text-xs">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Creative Preview
const CreativePreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="bg-white min-h-full font-sans text-xs">
    <div className="bg-teal p-6 text-white">
      <h1 className="text-2xl font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-teal-100 mb-3">{data.personal.jobTitle || 'Professional Title'}</p>
      <div className="flex gap-4 text-xs text-teal-100">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
    </div>

    <div className="p-6">
      {data.personal.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-teal border-b-4 border-teal-200 pb-1 mb-2">About Me</h2>
          <p className="text-gray-600 leading-relaxed">{data.personal.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-teal border-b-4 border-teal-200 pb-1 mb-2">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3 pl-3 border-l-4 border-teal">
              <span className="font-semibold text-teal-800">{exp.position}</span>
              <p className="text-teal">{exp.company}</p>
              <p className="text-gray-500 text-xs">{exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
              <p className="text-gray-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-teal border-b-4 border-teal-200 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill.id} className="bg-teal text-white px-3 py-1 rounded-full text-xs">{skill.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Minimal Preview
const MinimalPreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="p-10 bg-white text-gray-900 font-sans text-xs min-h-full">
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-wide mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-gray-500 text-sm">{data.personal.jobTitle || 'Professional Title'}</p>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
    </div>

    {data.personal.summary && (
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About</h2>
        <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-4">
            <span className="font-semibold">{exp.position} at {exp.company}</span>
            <p className="text-gray-500 text-xs">{exp.location} • {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
            <p className="text-gray-600 mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Skills</h2>
        <p className="text-gray-700">
          {data.skills.map((skill, i) => (
            <span key={skill.id}>{skill.name}{i < data.skills.length - 1 ? ' • ' : ''}</span>
          ))}
        </p>
      </div>
    )}
  </div>
);

// Tech Preview
const TechPreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="p-6 bg-[#0d1117] text-[#c9d1d9] font-mono text-xs min-h-full">
    <div className="mb-4">
      <h1 className="text-xl font-bold text-[#58a6ff] mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-[#8b949e] text-xs mb-2">{data.personal.jobTitle || 'Software Developer'}</p>
      <div className="flex gap-3 text-xs text-[#8b949e]">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
    </div>

    {data.skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-xs font-bold text-[#58a6ff] border-b border-[#30363d] pb-1 mb-2">// Tech Stack</h2>
        <div className="flex flex-wrap gap-1">
          {data.skills.map((skill) => (
            <span key={skill.id} className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">{skill.name}</span>
          ))}
        </div>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-4">
        <h2 className="text-xs font-bold text-[#58a6ff] border-b border-[#30363d] pb-1 mb-2">// Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-3 p-2 bg-[#161b22] rounded border border-[#30363d]">
            <span className="font-semibold">{exp.position}</span>
            <p className="text-[#58a6ff]">{exp.company}</p>
            <p className="text-[#8b949e] text-xs">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Bold Preview
const BoldPreview: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="p-6 bg-white text-gray-900 font-sans text-xs min-h-full">
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-red-500 tracking-tight">{data.personal.fullName || 'YOUR NAME'}</h1>
      <p className="text-sm font-bold text-gray-800 mb-2">{data.personal.jobTitle || 'PROFESSIONAL TITLE'}</p>
      <div className="flex gap-3 text-xs text-gray-500">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
      </div>
    </div>

    {data.personal.summary && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-red-500 uppercase mb-2">ABOUT</h2>
        <p className="text-gray-600">{data.personal.summary}</p>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-red-500 uppercase mb-2">EXPERIENCE</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <span className="font-bold text-sm">{exp.position}</span>
            <p className="text-red-500 font-bold">{exp.company}</p>
            <p className="text-gray-500 text-xs">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
          </div>
        ))}
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-red-500 uppercase mb-2">SKILLS</h2>
        <div className="flex flex-wrap gap-1">
          {data.skills.map((skill) => (
            <span key={skill.id} className="bg-red-500 text-white px-2 py-1 text-xs font-bold">{skill.name.toUpperCase()}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const previewComponents: Record<TemplateId, React.FC<{ data: CVData }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  minimal: MinimalPreview,
  creative: CreativePreview,
  professional: ClassicPreview,
  executive: MinimalPreview,
  tech: TechPreview,
  compact: ClassicPreview,
  elegant: MinimalPreview,
  bold: BoldPreview,
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
