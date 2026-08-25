import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { analyzeATS, ATSResult } from '@/lib/ats';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScanSearch, CheckCircle2, XCircle, AlertCircle, Sparkles, FileSearch, ClipboardCheck, Copy, Target } from 'lucide-react';

const gradeColor = (grade: string) => {
  switch (grade) {
    case 'Excellent': return 'text-emerald-600';
    case 'Good': return 'text-lime-600';
    case 'Fair': return 'text-amber-600';
    default: return 'text-red-600';
  }
};

const scoreRingColor = (score: number) =>
  score >= 85 ? '#059669' : score >= 70 ? '#65a30d' : score >= 50 ? '#d97706' : '#dc2626';

const ATSCheck: React.FC = () => {
  const { cvData } = useCVContext();
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ATSResult | null>(null);

  const runCheck = () => {
    if (jobDescription.trim().length < 40) return;
    setResult(analyzeATS(cvData, jobDescription));
  };

  const copyReport = async () => {
    if (!result) return;
    const report = [
      `CV Eligibility Report — ${result.eligibility}`,
      `Job match: ${result.matchScore}%`,
      `Resume readiness: ${result.score}/100 (${result.grade})`,
      `Matched keywords: ${result.matchedKeywords.join(', ') || 'None'}`,
      `Missing keywords: ${result.missingKeywords.join(', ') || 'None'}`,
      'Recommendations:',
      ...result.recommendations.map((item, index) => `${index + 1}. ${item}`),
    ].join('\n');
    await navigator.clipboard.writeText(report);
  };

  const R = 42;
  const circumference = 2 * Math.PI * R;
  const offset = result ? circumference - (result.score / 100) * circumference : circumference;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-1">
          <ScanSearch className="w-5 h-5 text-accent" />
          ATS Score Checker
        </h3>
        <p className="text-sm text-muted-foreground">
          See how likely an Applicant Tracking System is to parse your CV, and match it against a job description.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jd" className="flex items-center gap-2 text-foreground font-medium">
          <FileSearch className="w-4 h-4 text-accent" />
          Job requirements
        </Label>
        <Textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job requirements or job posting here. Include responsibilities, required skills, qualifications, and preferred experience..."
          rows={9}
          className="bg-card border-border focus:border-accent transition-colors resize-none"
        />
      </div>

      <Button disabled={jobDescription.trim().length < 40} onClick={runCheck} className="bg-slate-900 hover:bg-slate-800 text-white shadow-md">
        <ClipboardCheck className="w-4 h-4 mr-2" />
        Generate eligibility report
      </Button>
      {jobDescription.trim().length > 0 && jobDescription.trim().length < 40 && <p className="text-xs text-amber-600">Paste at least 40 characters of job requirements for a useful comparison.</p>}

      {result && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-slate-950"><Target className="h-6 w-6" /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Eligibility report</p><h4 className="mt-1 text-2xl font-black">{result.eligibility}</h4><p className="mt-1 text-xs text-slate-400">Based on CV content and pasted requirements</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center"><b className="text-2xl text-cyan-300">{result.matchScore}%</b><span className="block text-[9px] uppercase tracking-wider text-slate-400">job match</span></div>
                <button onClick={copyReport} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" title="Copy report"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="border-t border-white/10 px-5 py-3 text-[10px] leading-4 text-slate-400">This report is decision support based on text matching and resume quality; the employer makes the final eligibility decision.</p>
          </div>
          <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-card p-5">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={R} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={scoreRingColor(result.score)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{result.score}</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div>
              <p className={`text-lg font-bold ${gradeColor(result.grade)}`}>{result.grade}</p>
              <p className="text-sm text-muted-foreground">
                {result.score >= 85
                  ? 'Your CV is ATS-friendly. Great job!'
                  : result.score >= 70
                  ? 'Solid — a few tweaks will get you to the top.'
                  : result.score >= 50
                  ? 'Room for improvement. Fix the items below.'
                  : 'This CV needs work to pass automated screening.'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                    issue.passed
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-amber-200 bg-amber-50/60'
                  }`}
                  title={issue.tip}
                >
                  {issue.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground flex items-center gap-2 flex-wrap">
                      {issue.label}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {issue.earned}/{issue.points}
                      </Badge>
                    </p>
                    {!issue.passed && <p className="text-xs text-muted-foreground mt-0.5">{issue.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {jobDescription.trim() && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Keyword match ({result.matchedKeywords.length}/{result.keywords.length})
              </h4>
              <div className="space-y-3">
                {result.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((kw) => (
                      <Badge key={kw} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        ✓ {kw}
                      </Badge>
                    ))}
                  </div>
                )}
                {result.missingKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="bg-muted text-muted-foreground">
                        ✕ {kw}
                      </Badge>
                    ))}
                  </div>
                )}
                {result.missingKeywords.length > 0 && (
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    Add missing keywords naturally to your summary, skills and experience bullets, then re-run the check.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Your strengths</h4>
              <ul className="mt-3 space-y-2">{result.strengths.map((item) => <li key={item} className="flex gap-2 text-xs text-emerald-900"><span>✓</span>{item}</li>)}</ul>
            </section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800"><Sparkles className="h-4 w-4" />Priority improvements</h4>
              <ol className="mt-3 space-y-2">{result.recommendations.map((item, index) => <li key={item} className="flex gap-2 text-xs leading-5 text-amber-900"><b>{index + 1}.</b>{item}</li>)}</ol>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSCheck;
