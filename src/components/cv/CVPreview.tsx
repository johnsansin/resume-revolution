import React from 'react';
import { CVData, TemplateId } from '@/types/cv';

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const cefrFromProficiency = (proficiency: string, cefr?: string): string => {
  if (cefr) return cefr.toUpperCase();
  switch (proficiency) {
    case 'basic': return 'A1';
    case 'conversational': return 'B1';
    case 'fluent': return 'B2';
    case 'native': return 'C2';
    default: return 'B1';
  }
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const GRID_COLUMNS = ['Listening', 'Reading', 'Spoken interaction', 'Spoken production', 'Writing'];

const digitalLevelLabel = (level: string) => {
  switch (level) {
    case 'basic': return 'Basic user';
    case 'proficient': return 'Proficient user';
    default: return 'Independent user';
  }
};

const EuropassPreview: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data, showPhoto = true }) => {
  const p = data.personal;
  const langs = data.languages || [];
  const digitalSkills = data.digitalSkills || [];
  const certifications = data.certifications || [];
  const interests = data.interests || [];
  const cefrIdx = (lang: { proficiency: string; cefr?: string }) =>
    CEFR_LEVELS.indexOf(cefrFromProficiency(lang.proficiency, lang.cefr));

  return (
    <div className="p-6 font-sans text-[9px] text-gray-900 bg-white">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-[18px] font-bold text-[#1e4e79]">{p.fullName || 'Your Name'}</div>
          <div className="text-[10px] text-gray-600">{p.jobTitle || 'Professional title'}</div>
        </div>
        {showPhoto && p.photo && <img src={p.photo} alt="" className="w-16 h-20 object-cover border border-[#1e4e79]" />}
      </div>

      {(p.address || p.phone || p.email || p.nationality || p.dateOfBirth || p.gender) && (
        <div className="mt-2">
          <div className="bg-[#1e4e79] text-white font-bold px-2 py-0.5 uppercase tracking-wide">Personal information</div>
          <div className="mt-1 space-y-0.5">
            {p.address && <div><span className="font-bold text-[#1e4e79]">Address: </span>{p.address}, {p.location}</div>}
            {p.phone && <div><span className="font-bold text-[#1e4e79]">Telephone: </span>{p.phone}</div>}
            {p.email && <div><span className="font-bold text-[#1e4e79]">E-mail: </span>{p.email}</div>}
            {p.website && <div><span className="font-bold text-[#1e4e79]">Website: </span>{p.website}</div>}
            {p.nationality && <div><span className="font-bold text-[#1e4e79]">Nationality: </span>{p.nationality}</div>}
            {p.dateOfBirth && <div><span className="font-bold text-[#1e4e79]">Date of birth: </span>{p.dateOfBirth}</div>}
            {p.gender && <div><span className="font-bold text-[#1e4e79]">Gender: </span>{p.gender}</div>}
          </div>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mt-2">
          <div className="bg-[#1e4e79] text-white font-bold px-2 py-0.5 uppercase tracking-wide">Work experience</div>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mt-1.5">
              <div className="flex justify-between">
                <span className="font-bold">{exp.position || 'Position'}</span>
                <span className="text-gray-500">{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.description && (
                <ul className="list-disc pl-4 mt-0.5 leading-snug">
                  {exp.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mt-2">
          <div className="bg-[#1e4e79] text-white font-bold px-2 py-0.5 uppercase tracking-wide">Education and training</div>
          {data.education.map((edu) => (
            <div key={edu.id} className="mt-1.5">
              <div className="flex justify-between">
                <span className="font-bold">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="text-gray-500">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
              </div>
              <div>{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {(langs.length > 0 || digitalSkills.length > 0 || p.driverLicense || p.summary) && (
        <div className="mt-2">
          <div className="bg-[#1e4e79] text-white font-bold px-2 py-0.5 uppercase tracking-wide">Personal skills</div>
          {p.summary && <div className="mt-1">{p.summary}</div>}
          {langs.length > 0 && (
            <div className="mt-1.5">
              <div className="font-bold text-[#1e4e79] mb-1">Languages</div>
              <table className="w-full border border-gray-400 text-[7.5px]">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 px-1 py-0.5 text-left">Language</th>
                    {GRID_COLUMNS.map((c) => (
                      <th key={c} className="border border-gray-300 bg-gray-100 px-1 py-0.5">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {langs.map((lang) => (
                    <tr key={lang.id}>
                      <td className="border border-gray-300 px-1 py-0.5 font-bold">{lang.name}</td>
                      {GRID_COLUMNS.map((_, ci) => (
                        <td key={ci} className="border border-gray-300 px-0.5 py-0.5 text-center">
                          <div className="flex justify-center">
                            {CEFR_LEVELS.map((lvl, li) => (
                              <span key={lvl} className="w-3 text-center">{li === cefrIdx(lang) ? 'X' : ''}</span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-[6.5px] text-gray-500 mt-0.5">Common European Framework of Reference for Languages (A1–C2)</div>
            </div>
          )}
          {digitalSkills.length > 0 && (
            <div className="mt-1.5">
              <div className="font-bold text-[#1e4e79] mb-0.5">Digital skills</div>
              {digitalSkills.map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-gray-600">{digitalLevelLabel(s.level)}</span>
                </div>
              ))}
            </div>
          )}
          {p.driverLicense && (
            <div className="mt-1"><span className="font-bold text-[#1e4e79]">Driving licence: </span>{p.driverLicense}</div>
          )}
        </div>
      )}

      {(certifications.length > 0 || interests.length > 0) && (
        <div className="mt-2">
          <div className="bg-[#1e4e79] text-white font-bold px-2 py-0.5 uppercase tracking-wide">Additional information</div>
          {certifications.map((cert) => (
            <div key={cert.id} className="mt-1">{cert.year && <span className="font-bold text-[#1e4e79]">{cert.year}: </span>}{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}</div>
          ))}
          {interests.length > 0 && (
            <div className="mt-1"><span className="font-bold text-[#1e4e79]">Interests: </span>{interests.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
};

const ATSPreview: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data }) => {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.website, p.linkedin, p.address].filter(Boolean);
  return (
    <div className="p-6 font-sans text-[9.5px] text-black bg-white leading-snug">
      <div className="text-[17px] font-bold">{p.fullName || 'Your Name'}</div>
      <div className="text-[10.5px]">{p.jobTitle || 'Professional Title'}</div>
      {contactParts.length > 0 && <div className="text-[8.5px] mt-1">{contactParts.join('  |  ')}</div>}

      {p.summary && (
        <div className="mt-3">
          <div className="font-bold uppercase border-b border-gray-400 pb-0.5 mb-1 text-[10px]">Professional Summary</div>
          <p>{p.summary}</p>
        </div>
      )}
      {data.experience.length > 0 && (
        <div className="mt-3">
          <div className="font-bold uppercase border-b border-gray-400 pb-0.5 mb-1 text-[10px]">Work Experience</div>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold">{exp.position}</span>
                <span>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div className="italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.description && <p>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div className="mt-3">
          <div className="font-bold uppercase border-b border-gray-400 pb-0.5 mb-1 text-[10px]">Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-1.5">
              <div className="flex justify-between">
                <span className="font-bold">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              <div className="italic">{edu.institution}</div>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div className="mt-3">
          <div className="font-bold uppercase border-b border-gray-400 pb-0.5 mb-1 text-[10px]">Skills</div>
          <p>{data.skills.map(s => s.name).filter(Boolean).join(', ')}</p>
        </div>
      )}
      {data.languages.length > 0 && (
        <div className="mt-3">
          <div className="font-bold uppercase border-b border-gray-400 pb-0.5 mb-1 text-[10px]">Languages</div>
          {data.languages.map((lang) => (
            <div key={lang.id}>{lang.name}: {lang.proficiency}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Generic Preview Generator
const createPreview = (config: {
  bgColor: string;
  textColor: string;
  accentColor: string;
  headerBg?: string;
  sidebarBg?: string;
  photoSize?: 'normal' | 'large';
}): React.FC<{ data: CVData; showPhoto?: boolean }> => {
  const large = config.photoSize === 'large';
  return ({ data, showPhoto = true }) => {
    if (config.sidebarBg) {
      return (
        <div className="flex min-h-full font-sans text-xs" style={{ backgroundColor: config.bgColor }}>
          <div className="w-1/3 p-5 text-white" style={{ backgroundColor: config.sidebarBg }}>
            {showPhoto && data.personal.photo && (
              <img 
                src={data.personal.photo} 
                alt="Profile" 
                className={`${large ? 'w-28 h-28' : 'w-20 h-20'} rounded-full object-cover mx-auto mb-3 border-2 border-white/30`}
              />
            )}
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
          <div className="p-6 text-white flex gap-4" style={{ backgroundColor: config.headerBg }}>
            {showPhoto && data.personal.photo && (
              <img 
                src={data.personal.photo} 
                alt="Profile" 
                className={`${large ? 'w-24 h-24' : 'w-16 h-16'} rounded-full object-cover border-2 border-white/30 shrink-0`}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
              <p className="opacity-80 mb-3">{data.personal.jobTitle || 'Professional Title'}</p>
              <div className="flex gap-4 text-xs opacity-70">
                {data.personal.email && <span>{data.personal.email}</span>}
                {data.personal.phone && <span>{data.personal.phone}</span>}
                {data.personal.location && <span>{data.personal.location}</span>}
              </div>
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
        <div className="flex gap-4 mb-4 pb-4" style={{ borderBottom: `2px solid ${config.accentColor}` }}>
          {showPhoto && data.personal.photo && (
            <img 
              src={data.personal.photo} 
              alt="Profile" 
              className={`${large ? 'w-24 h-24' : 'w-16 h-16'} rounded-full object-cover border-2 shrink-0`}
              style={{ borderColor: config.accentColor }}
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1" style={{ color: config.accentColor }}>{data.personal.fullName || 'Your Name'}</h1>
            <p className="text-sm opacity-70 mb-2">{data.personal.jobTitle || 'Professional Title'}</p>
            <div className="flex flex-wrap gap-4 text-xs opacity-60">
              {data.personal.email && <span>{data.personal.email}</span>}
              {data.personal.phone && <span>{data.personal.phone}</span>}
              {data.personal.location && <span>{data.personal.location}</span>}
            </div>
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

// Curated preview components
const previewComponents: Record<TemplateId, React.FC<{ data: CVData; showPhoto?: boolean }>> = {
  europass: EuropassPreview,
  ats: ATSPreview,
  classic: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#1a365d' }),
  modern: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#3182ce', sidebarBg: '#1a365d' }),
  minimal: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#1a1a1a' }),
  creative: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#319795', headerBg: '#319795' }),
  professional: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2b6cb0' }),
  executive: createPreview({ bgColor: '#fff', textColor: '#1a1a1a', accentColor: '#c9a227' }),
  tech: createPreview({ bgColor: '#0d1117', textColor: '#c9d1d9', accentColor: '#58a6ff' }),
  compact: createPreview({ bgColor: '#fff', textColor: '#333', accentColor: '#2563eb' }),
  corporate: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#1e3a5f', sidebarBg: '#1e3a5f' }),
  academic: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2c5282' }),
  startup: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#6b46c1', sidebarBg: '#6b46c1' }),
  consultant: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#2f855a', sidebarBg: '#2f855a' }),
  finance: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#1a365d' }),
  healthcare: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#38a169', sidebarBg: '#38a169' }),
  legal: createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#742a2a' }),
  'photo-modern': createPreview({ bgColor: '#fff', textColor: '#334155', accentColor: '#0f172a', sidebarBg: '#0f172a', photoSize: 'large' }),
  'photo-classic': createPreview({ bgColor: '#fff', textColor: '#334155', accentColor: '#1a365d', photoSize: 'large' }),
  'photo-creative': createPreview({ bgColor: '#fff', textColor: '#2d3748', accentColor: '#7c3aed', headerBg: '#7c3aed', photoSize: 'large' }),
};

interface CVPreviewProps {
  data: CVData;
  template: TemplateId;
  showPhoto?: boolean;
}

const CVPreview: React.FC<CVPreviewProps> = ({ data, template, showPhoto = true }) => {
  const PreviewComponent = previewComponents[template] || previewComponents.classic;
  
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
      <div className="w-full h-full overflow-auto">
        <PreviewComponent data={data} showPhoto={showPhoto} />
      </div>
    </div>
  );
};

export default CVPreview;
