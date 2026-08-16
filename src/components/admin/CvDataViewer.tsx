import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail, Phone, MapPin, Globe, Link as LinkIcon, Calendar, Flag, User as UserIcon,
  Car, FileText, Briefcase, GraduationCap, Wrench, Languages as LanguagesIcon,
  FolderKanban, Cpu, Award, Heart,
} from 'lucide-react';
import { CVData } from '@/types/cv';

const formatDate = (date?: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  if (!month) return year;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const dateRange = (start?: string, end?: string, current?: boolean) => {
  if (!start && !end) return '';
  return `${formatDate(start)} – ${current ? 'Present' : formatDate(end) || '—'}`;
};

const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
        <Icon className="w-3.5 h-3.5 text-accent" />
      </div>
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{label}: </span>
      {value}
    </p>
  );
};

const CvDataViewer: React.FC<{ data: CVData }> = ({ data }) => {
  const p = data.personal || ({} as CVData['personal']);
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const langs = data.languages || [];
  const projects = data.projects || [];
  const digital = data.digitalSkills || [];
  const certs = data.certifications || [];
  const interests = data.interests || [];

  const contactItems = [
    { icon: Mail, value: p.email },
    { icon: Phone, value: p.phone },
    { icon: MapPin, value: [p.location, p.address].filter(Boolean).join(', ') },
    { icon: Globe, value: p.website },
    { icon: LinkIcon, value: p.linkedin },
    { icon: Flag, value: p.nationality },
    { icon: Calendar, value: p.dateOfBirth },
    { icon: UserIcon, value: p.gender },
    { icon: Car, value: p.driverLicense ? `Driver's licence: ${p.driverLicense}` : '' },
  ].filter((i) => i.value);

  const hasContact = contactItems.length > 0;
  const hasExperience = exp.some((e) => e.position || e.company || e.description);
  const hasEducation = edu.some((e) => e.degree || e.institution);
  const hasSkills = skills.length > 0;
  const hasLangs = langs.length > 0;
  const hasProjects = projects.length > 0;
  const hasDigital = digital.length > 0;
  const hasCerts = certs.length > 0;
  const hasInterests = interests.length > 0;

  if (!p.fullName && !hasExperience && !hasEducation && !hasSkills && !hasLangs && !p.summary) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">This CV has no content entered yet.</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-sm">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        {p.photo && (
          <img src={p.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-accent/50 shrink-0" />
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">{p.fullName || '—'}</h2>
          {p.jobTitle && <p className="text-sm text-accent font-medium mt-0.5">{p.jobTitle}</p>}
          {p.summary && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.summary}</p>}
        </div>
      </div>

      <Separator className="mb-5" />

      {hasContact && (
        <Section icon={UserIcon} title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {contactItems.map((item, i) => (
              <p key={i} className="flex items-center gap-2 text-sm text-muted-foreground py-0.5">
                <item.icon className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{item.value}</span>
              </p>
            ))}
          </div>
        </Section>
      )}

      {hasExperience && (
        <Section icon={Briefcase} title="Work Experience">
          <div className="space-y-3">
            {exp.filter((e) => e.position || e.company || e.description).map((e) => (
              <div key={e.id} className="pl-3 border-l-2 border-accent/40">
                <p className="font-semibold text-foreground">{e.position || 'Position'}</p>
                <p className="text-xs text-accent">{e.company}{e.location ? `, ${e.location}` : ''}</p>
                <p className="text-xs text-muted-foreground">{dateRange(e.startDate, e.endDate, e.current)}</p>
                {e.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasEducation && (
        <Section icon={GraduationCap} title="Education">
          <div className="space-y-3">
            {edu.filter((e) => e.degree || e.institution).map((e) => (
              <div key={e.id}>
                <p className="font-semibold text-foreground">{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                <p className="text-xs text-accent">{e.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {dateRange(e.startDate, e.endDate)}{e.gpa ? `  ·  GPA: ${e.gpa}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasSkills && (
        <Section icon={Wrench} title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Badge key={s.id} variant="secondary" className="font-normal">{s.name}</Badge>
            ))}
          </div>
        </Section>
      )}

      {hasLangs && (
        <Section icon={LanguagesIcon} title="Languages">
          <div className="space-y-1">
            {langs.map((l) => (
              <p key={l.id} className="text-sm text-muted-foreground flex justify-between max-w-xs">
                <span className="font-medium text-foreground">{l.name}</span>
                <span className="capitalize">{l.proficiency}{l.cefr ? ` · ${l.cefr.toUpperCase()}` : ''}</span>
              </p>
            ))}
          </div>
        </Section>
      )}

      {hasProjects && (
        <Section icon={FolderKanban} title="Projects">
          <div className="space-y-3">
            {projects.map((pr) => (
              <div key={pr.id}>
                <p className="font-semibold text-foreground">{pr.name}</p>
                {pr.url && <p className="text-xs text-accent break-all">{pr.url}</p>}
                {pr.description && <p className="text-xs text-muted-foreground mt-1">{pr.description}</p>}
                {pr.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {pr.technologies.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-normal">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasDigital && (
        <Section icon={Cpu} title="Digital Skills">
          <div className="space-y-1">
            {digital.map((d) => (
              <p key={d.id} className="text-sm text-muted-foreground flex justify-between max-w-xs">
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="capitalize">{d.level}</span>
              </p>
            ))}
          </div>
        </Section>
      )}

      {hasCerts && (
        <Section icon={Award} title="Certifications">
          <div className="space-y-1">
            {certs.map((c) => (
              <p key={c.id} className="text-sm text-muted-foreground">
                {c.year && <span className="font-semibold text-foreground">{c.year}: </span>}
                {c.name}{c.issuer ? ` — ${c.issuer}` : ''}
              </p>
            ))}
          </div>
        </Section>
      )}

      {hasInterests && (
        <Section icon={Heart} title="Interests">
          <p className="text-sm text-muted-foreground">{interests.join(', ')}</p>
        </Section>
      )}
    </div>
  );
};

export default CvDataViewer;
