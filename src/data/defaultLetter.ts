import { LetterData } from '@/types/letter';
import { CVData } from '@/types/cv';

const today = () => new Date().toISOString().split('T')[0];

export const defaultLetterData: LetterData = {
  style: 'cover',
  date: today(),
  recipientName: 'Hiring Manager',
  recipientTitle: 'Hiring Manager',
  company: '',
  companyAddress: '',
  salutation: 'Dear Hiring Manager,',
  subject: '',
  opening:
    'I am writing to apply for the position and am excited about the opportunity to bring my skills and experience to your team.',
  body: '',
  closing:
    'Thank you for considering my application. I would welcome the opportunity to discuss how my background can add value to your organization and look forward to hearing from you.',
  signOff: 'Sincerely,',
  signerName: '',
};

export const buildLetterFromCV = (cv: CVData, style: 'cover' | 'motivation'): LetterData => {
  const p = cv.personal;
  const jobTitle = p.jobTitle || 'the position';
  const skills = cv.skills.slice(0, 5).map(s => s.name).filter(Boolean).join(', ');

  const experienceBlurb =
    cv.experience.length > 0
      ? `Most recently I worked as a ${cv.experience[0].position} at ${cv.experience[0].company}${cv.experience[0].current ? '' : ` (${cv.experience[0].startDate}–${cv.experience[0].endDate})`}, where ${(cv.experience[0].description || '').toLowerCase() || 'I delivered consistent results.'}`
      : `My professional background in ${skills || 'my field'} has prepared me well for this role.`;

  const body =
    style === 'cover'
      ? [
          `${p.summary || `I am a ${jobTitle} with a strong record of delivering measurable results.`}`,
          `My core strengths include ${skills || 'strong collaboration, attention to detail, and a results-driven mindset'}. ${experienceBlurb}`,
          `I am confident that my combination of experience, technical skills, and enthusiasm would make me a valuable addition to your team.`,
        ].join('\n\n')
      : [
          `I am highly motivated by this opportunity and strongly believe that my profile matches the requirements of the role of ${jobTitle}.`,
          `${experienceBlurb}`,
          `My key qualifications include ${skills || 'strong analytical skills, teamwork, and a commitment to continuous improvement'}, which I would be excited to apply within your organisation.`,
        ].join('\n\n');

  const subject =
    style === 'cover'
      ? `Application for the position of ${jobTitle}`
      : `Application / motivation letter – ${jobTitle}`;

  const opening =
    style === 'cover'
      ? `I am writing to apply for the position of ${jobTitle}. I believe my background makes me an excellent fit for this role.`
      : `With reference to the advertised vacancy for the position of ${jobTitle}, I would like to submit my application and motivation letter.`;

  return {
    ...defaultLetterData,
    style,
    subject,
    opening,
    body,
    signerName: p.fullName,
    company: '',
  };
};
