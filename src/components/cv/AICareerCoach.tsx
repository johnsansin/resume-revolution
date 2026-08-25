import React, { useMemo, useState } from 'react';
import { ArrowRight, Bot, Briefcase, CheckCircle2, FileSearch, Lightbulb, Sparkles, Target, WandSparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCVContext } from '@/contexts/CVContext';
import { templateById } from '@/lib/templateCatalog';
import type { CVData } from '@/types/cv';

interface Props { data: CVData; onOpenSection: (section: string) => void; }

const roleTemplate = (role: string) => {
  const value = role.toLowerCase();
  const choices: Array<[RegExp,string]> = [
    [/software|developer|programmer|frontend|backend|full.?stack/,'software-engineer'], [/data|machine learning|analyst/,'data-scientist'],
    [/security|cyber/,'cybersecurity'], [/product manager/,'product-manager'], [/ux|user experience/,'ux-designer'],
    [/graphic|visual designer/,'graphic-designer'], [/market|brand|seo/,'marketing-manager'], [/sales|account executive/,'sales-executive'],
    [/finance|financial/,'finance-analyst'], [/account|audit/,'accountant'], [/consult/,'management-consultant'],
    [/project|program manager/,'project-manager'], [/operation/,'operations-manager'], [/human resources|\bhr\b/,'hr-specialist'],
    [/recruit|talent/,'recruiter'], [/lawyer|legal|attorney/,'legal-counsel'], [/nurse/,'registered-nurse'], [/doctor|physician/,'physician'],
    [/pharmac/,'pharmacist'], [/teacher|educator/,'teacher'], [/research|academic/,'academic-researcher'],
    [/civil engineer/,'civil-engineer'], [/mechanical engineer/,'mechanical-engineer'], [/electrical engineer/,'electrical-engineer'],
    [/architect/,'architect'], [/construction/,'construction-manager'], [/supply chain|procurement/,'supply-chain'],
    [/logistics/,'logistics'], [/hospitality|hotel/,'hospitality'], [/chef|culinary/,'executive-chef'],
    [/customer success|customer service/,'customer-success'], [/executive|director|chief|ceo|cto|cfo/,'executive-leadership'],
    [/graduate|intern|entry.level|student/,'graduate-entry'],
  ];
  return choices.find(([pattern]) => pattern.test(value))?.[1] || 'ats';
};

export default function AICareerCoach({ data, onOpenSection }: Props) {
  const { setSelectedTemplate } = useCVContext();
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(data.personal.jobTitle || '');
  const [level, setLevel] = useState('mid');
  const recommendedId = roleTemplate(targetRole);
  const recommended = templateById[recommendedId];

  const insights = useMemo(() => {
    const items: Array<{ title:string; detail:string; section:string; icon:React.ElementType }> = [];
    if (!data.personal.jobTitle) items.push({ title:'Define your target role', detail:'Add the exact job title you want so the CV tells one focused story.', section:'personal', icon:Target });
    if (!data.personal.summary || data.personal.summary.length < 80) items.push({ title:'Strengthen your opening', detail:'Use 3–4 lines covering specialty, experience, strengths and one result.', section:'personal', icon:Sparkles });
    if (!data.experience.length) items.push({ title:'Add relevant experience', detail:'Lead each bullet with an action verb and finish with a measurable outcome.', section:'experience', icon:Briefcase });
    else if (data.experience.some((item) => item.description.trim().length < 60)) items.push({ title:'Quantify your impact', detail:'Add scope, numbers, time saved, revenue, users or quality improvements.', section:'experience', icon:Briefcase });
    if (data.skills.length < 5) items.push({ title:'Improve keyword coverage', detail:'Add 5–10 hard skills used in the target job description.', section:'skills', icon:FileSearch });
    if (!data.education.length) items.push({ title:'Complete your background', detail:'Add relevant education, training or professional credentials.', section:'education', icon:Lightbulb });
    if (!items.length) items.push({ title:'Ready for job matching', detail:'Paste the vacancy into Job Match to compare keywords and requirements.', section:'ats', icon:CheckCircle2 });
    return items.slice(0,3);
  }, [data]);

  const score = useMemo(() => {
    const checks = [data.personal.fullName,data.personal.email,data.personal.jobTitle,data.personal.summary?.length >= 80,data.experience.length,data.education.length,data.skills.length >= 5];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [data]);

  const guidance = useMemo(() => {
    const senior = level === 'senior' || level === 'executive';
    return [
      { section:'personal', title:'Headline and summary', copy:`Use “${targetRole || 'Target role'}” as the headline. ${senior ? 'Lead with leadership scope and business outcomes.' : 'Lead with core skills, relevant experience and one measurable result.'}` },
      { section:'experience', title:'Experience format', copy:'Use reverse chronological order with 3–5 concise achievement bullets per relevant role.' },
      { section:'skills', title:'Job-specific keywords', copy:'Mirror genuine tools, methods and certifications from the vacancy; avoid keyword stuffing.' },
      { section:'ats', title:'Final job match', copy:'Paste the complete job description, review missing keywords, then export the tailored version.' },
    ];
  }, [targetRole, level]);

  const applyTemplate = () => { setSelectedTemplate(recommendedId); setOpen(false); onOpenSection('template'); };

  return (
    <>
      <section className="ai-guide-card">
        <div className="ai-guide-head"><span><Bot /></span><div><h3>AI CV Assistant</h3><p>Job-focused guidance from your resume</p></div><strong>{score}%<small>ready</small></strong></div>
        <button className="ai-guide-launch" onClick={() => setOpen(true)}><WandSparkles />Plan my CV for a job <ArrowRight /></button>
        <div className="ai-guide-insights">{insights.map(({ title,detail,section,icon:Icon }) => <button key={title} onClick={() => onOpenSection(section)}><span><Icon /></span><div><b>{title}</b><small>{detail}</small></div><ArrowRight /></button>)}</div>
        <button className="ai-guide-match" onClick={() => onOpenSection('ats')}>Tailor to a job description <ArrowRight /></button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="ai-guide-dialog sm:max-w-2xl">
          <DialogHeader><DialogTitle>Build the right CV for your next job</DialogTitle><DialogDescription>Tell the assistant what you are applying for. It will recommend a format and a practical editing sequence.</DialogDescription></DialogHeader>
          <div className="ai-guide-fields"><div><Label htmlFor="target-role">What job are you applying for?</Label><Input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Senior Software Engineer" /></div><div><Label>Career level</Label><Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entry">Entry level / Graduate</SelectItem><SelectItem value="mid">Mid level</SelectItem><SelectItem value="senior">Senior / Manager</SelectItem><SelectItem value="executive">Executive</SelectItem></SelectContent></Select></div></div>
          <div className="ai-template-recommendation"><span style={{ background:recommended?.accent }}><FileSearch /></span><div><small>Recommended format</small><h4>{recommended?.name || 'ATS Precision'}</h4><p>{recommended?.description}. Best aligned with {targetRole || 'your target role'}.</p></div><Button onClick={applyTemplate}>Use this template</Button></div>
          <div className="ai-guide-plan"><h4>Your recommended sequence</h4>{guidance.map((item,index) => <button key={item.section} onClick={() => { setOpen(false); onOpenSection(item.section); }}><span>{String(index + 1).padStart(2,'0')}</span><div><b>{item.title}</b><p>{item.copy}</p></div><ArrowRight /></button>)}</div>
          <p className="ai-guide-note">Use recommendations as editing guidance. Keep every claim accurate and only include skills you genuinely have.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
