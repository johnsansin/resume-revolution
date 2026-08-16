import { CVData } from '@/types/cv';

export interface ATSIssue {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
  points: number;
  earned: number;
}

export interface ATSKeyword {
  keyword: string;
  found: boolean;
}

export interface ATSResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs work';
  issues: ATSIssue[];
  keywords: ATSKeyword[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

const STOPWORDS = new Set([
  'the','and','for','with','are','you','our','your','this','that','will','have','has','can','able','job','role','team','work','working','years','experience','company','candidate','position','looking','seeking','opportunity','responsibilities','requirements','qualifications','must','should','etc','e','g','including','include','plus','preferred','strong','good','across','within','using','use','well','also','such','as','per','month','year','day','client','project','field',
]);

const ACTION_VERBS = [
  'achieved','led','built','developed','managed','improved','designed','implemented','increased','reduced','launched','created','delivered','optimized','optimised','spearheaded','drove','grew','transformed','oversaw','coordinated','negotiated','mentored','streamlined','automated','architected','engineered','solved','boosted','cut','doubled','tripled','established','introduced','initiated','directed','executed','published','researched','analyzed','analysed','built','founded','accelerated','enhanced','expanded','generated',
];

const EXTRACT_WORDS = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/[\s,.;:/]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

const keyWords = (text: string): string[] => {
  const words = EXTRACT_WORDS(text);
  const singles = words.filter((w) => !STOPWORDS.has(w));
  const multi: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (!STOPWORDS.has(a) && !STOPWORDS.has(b) && a.length > 2 && b.length > 2) {
      multi.push(`${a} ${b}`);
    }
  }
  const combined = new Set<string>();
  singles.forEach((s) => combined.add(s));
  multi.forEach((m) => combined.add(m));
  return Array.from(combined);
};

const cvText = (cv: CVData): string => {
  const p = cv.personal;
  const parts: string[] = [];
  if (p.summary) parts.push(p.summary);
  cv.experience.forEach((e) => parts.push(`${e.position} ${e.company} ${e.description} ${e.location}`));
  cv.education.forEach((e) => parts.push(`${e.degree} ${e.field} ${e.institution}`));
  cv.skills.forEach((s) => parts.push(s.name));
  cv.projects.forEach((pr) => parts.push(`${pr.name} ${pr.description} ${pr.technologies.join(' ')}`));
  cv.languages.forEach((l) => parts.push(`${l.name} ${l.proficiency}`));
  (cv.digitalSkills || []).forEach((d) => parts.push(d.name));
  (cv.certifications || []).forEach((c) => parts.push(`${c.name} ${c.issuer}`));
  return parts.join(' ').toLowerCase();
};

const hasBullets = (cv: CVData): boolean =>
  cv.experience.some((e) => /[•\-\u2022\u00b7]|(\n)/.test(e.description || ''));

const wordCount = (cv: CVData): number => {
  const p = cv.personal;
  const content = [
    p.summary,
    ...cv.experience.map((e) => `${e.position} ${e.description}`),
    ...cv.education.map((e) => `${e.degree} ${e.field}`),
    ...cv.skills.map((s) => s.name),
    ...cv.projects.map((pr) => `${pr.name} ${pr.description}`),
  ].join(' ');
  return content.split(/\s+/).filter(Boolean).length;
};

const hasQuantified = (cv: CVData): boolean =>
  /(\d+\s*%|%\s*\d+|\$\s*\d+|\d+\s*\$|\d+\s*(k|million|users|clients|customers|people|members|countries|requests|pages|hours|days|projects|tickets|sales)\b)/i.test(
    cv.experience.map((e) => e.description || '').join(' ')
  );

export const analyzeATS = (cv: CVData, jobDescription: string): ATSResult => {
  const p = cv.personal;
  const text = cvText(cv);
  const issues: ATSIssue[] = [];

  const check = (id: string, label: string, passed: boolean, tip: string, points: number): ATSIssue => ({
    id, label, passed, tip, points, earned: passed ? points : 0,
  });

  const emailOk = /\S+@\S+\.\S+/.test(p.email);
  issues.push(check('email', 'Valid e-mail address', emailOk, 'Add a professional e-mail (e.g. name@example.com). ATS systems and recruiters need it to contact you.', 10));

  const phoneOk = (p.phone || '').replace(/[^\d+]/g, '').length >= 7;
  issues.push(check('phone', 'Phone number present', phoneOk, 'Add a phone number with country code.', 10));

  const locationOk = !!p.location;
  issues.push(check('location', 'Location present', locationOk, 'Add your city and country — many ATS filters screen by location.', 5));

  const linkedinOk = !!p.linkedin;
  issues.push(check('linkedin', 'LinkedIn profile', linkedinOk, 'Add your LinkedIn URL; recruiters check it in 80%+ of applications.', 5));

  const summaryOk = (p.summary || '').trim().length >= 40;
  issues.push(check('summary', 'Professional summary', summaryOk, 'Write a 2–3 sentence summary with your title, years of experience and top skills.', 10));

  const experienceOk = cv.experience.some((e) => (e.description || '').trim().length > 0);
  issues.push(check('experience', 'Experience with descriptions', experienceOk, 'Describe what you did in each role — bullet points help ATS parse them.', 10));

  const educationOk = cv.education.length > 0;
  issues.push(check('education', 'Education listed', educationOk, 'Add your degrees and institutions.', 5));

  const skillsOk = cv.skills.length >= 3;
  issues.push(check('skills', 'At least 3 skills', skillsOk, 'List hard skills (tools, languages, methods) — not just soft skills.', 10));

  const bulletsOk = hasBullets(cv);
  issues.push(check('bullets', 'Bullet-point achievements', bulletsOk, 'Use bullet points (•) in experience descriptions — single paragraphs are harder to parse.', 5));

  const actionOk = ACTION_VERBS.some((v) => text.includes(v));
  issues.push(check('action', 'Action verbs used', actionOk, `Use strong action verbs (e.g. ${ACTION_VERBS.slice(0, 5).join(', ')}) at the start of bullet points.`, 10));

  const quantifiedOk = hasQuantified(cv);
  issues.push(check('quantified', 'Quantified achievements', quantifiedOk, 'Add numbers, percentages or scale (e.g. “increased sales by 30%”, “managed 5 people”).', 5));

  const lengthOk = wordCount(cv) > 150 && wordCount(cv) < 1100;
  issues.push(check('length', 'Reasonable length (1–2 pages)', lengthOk, 'Aim for one page per ~10 years of experience; keep it under two pages.', 5));

  const sectionsOk = summaryOk && experienceOk && educationOk;
  issues.push(check('sections', 'Standard section headings', sectionsOk, 'Use plain headings like SUMMARY, EXPERIENCE, EDUCATION, SKILLS so ATS software recognizes them.', 10));

  const keywordsOk = jobDescription.trim().length > 0;
  const kw = keywordsOk ? keyWords(jobDescription) : [];
  const keywords: ATSKeyword[] = kw.slice(0, 30).map((word) => ({ keyword: word, found: text.includes(word.toLowerCase()) }));
  const matchedKeywords = keywords.filter((k) => k.found).map((k) => k.keyword);
  const missingKeywords = keywords.filter((k) => !k.found).map((k) => k.keyword);
  const keywordScore = keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 20) : 0;
  issues.push(check(
    'keywords',
    `Keyword match ${keywordsOk ? `(${matchedKeywords.length}/${keywords.length})` : '— paste a job description'}`,
    keywordsOk ? keywordScore >= 10 : false,
    keywordsOk
      ? `Matched ${matchedKeywords.length} of ${keywords.length} keywords. Add missing terms from the job description to your summary, skills and experience.`
      : 'Paste the job description to check how many keywords your CV matches.',
    20
  ));

  issues.push(check('single', 'Clean single-column layout', true, 'ATS templates avoid tables, columns and graphics. Download using the ATS template for best parsing.', 10));

  const earned = issues.reduce((sum, i) => sum + i.earned, 0);
  const score = Math.max(0, Math.min(100, earned));
  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs work';

  return {
    score,
    grade,
    issues,
    keywords,
    matchedKeywords,
    missingKeywords,
  };
};
