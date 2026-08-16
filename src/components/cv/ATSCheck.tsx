import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { analyzeATS, ATSResult } from '@/lib/ats';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScanSearch, CheckCircle2, XCircle, AlertCircle, Sparkles, FileSearch } from 'lucide-react';

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
    setResult(analyzeATS(cvData, jobDescription));
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
          Job description (paste to check keyword match)
        </Label>
        <Textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job posting here to compare keywords against your CV..."
          rows={6}
          className="bg-card border-border focus:border-accent transition-colors resize-none"
        />
      </div>

      <Button onClick={runCheck} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
        <Sparkles className="w-4 h-4 mr-2" />
        Run ATS Check
      </Button>

      {result && (
        <div className="space-y-6">
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
        </div>
      )}
    </div>
  );
};

export default ATSCheck;
