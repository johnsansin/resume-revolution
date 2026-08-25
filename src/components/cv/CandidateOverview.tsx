import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCVContext } from '@/contexts/CVContext';
import { useSavedCVs } from '@/hooks/useSavedCVs';
import { api } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AICareerCoach from './AICareerCoach';
import { formatDistanceToNow } from 'date-fns';
import { CVData, TemplateId } from '@/types/cv';
import {
  Download,
  Loader2,
  FileSignature,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  LayoutTemplate,
  CalendarDays,
  Trash2,
  Clock,
  FileText,
  TrendingUp,
  Briefcase,
  PlayCircle,
  PlusCircle,
  AlertTriangle,
  Share2, Copy, Check,
} from 'lucide-react';

interface SavedCV {
  id: string;
  name: string;
  cvData: CVData;
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
}

interface CandidateOverviewProps {
  onContinue: (section?: string) => void;
  onDownload: () => void;
  onDownloadSaved: (data: CVData, template: TemplateId, name: string) => Promise<void>;
  isDownloading: boolean;
  onWorkspaceNavigate?: (target: 'letters' | 'settings' | 'saved-cvs' | 'ai-career-coach') => void;
}

const CandidateOverview: React.FC<CandidateOverviewProps> = ({ onContinue, onDownload, onDownloadSaved, isDownloading, onWorkspaceNavigate }) => {
  const { user } = useAuth();
  const { cvData, selectedTemplate, loadSampleData, setCVData, setSelectedTemplate } = useCVContext();
  const { savedCVs, loading: cvsLoading, deleteCV } = useSavedCVs();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloadingCV, setDownloadingCV] = useState<string | null>(null);
  const [sharingCV,setSharingCV]=useState<string|null>(null);
  const [shareLink,setShareLink]=useState('');
  const [shareName,setShareName]=useState('');
  const [copied,setCopied]=useState(false);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<SavedCV | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const sections = useMemo(() => {
    const checks = [
      !!cvData.personal.fullName,
      !!cvData.personal.summary,
      cvData.experience.length > 0,
      cvData.education.length > 0,
      cvData.skills.length > 0,
      cvData.languages.length > 0,
      cvData.projects.length > 0,
      (cvData.digitalSkills || []).length > 0,
      (cvData.certifications || []).length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
  }, [cvData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const displayName = user?.displayName || user?.email || 'there';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const ringSize = 80;
  const ringStroke = 6;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;

  const loadCV = (cv: SavedCV) => {
    localStorage.setItem('career_active_saved_cv',JSON.stringify({id:cv.id,name:cv.name}));
    setCVData(cv.cvData);
    setSelectedTemplate(cv.templateId);
    onContinue();
  };

  const downloadSavedCV = async (cv: SavedCV) => {
    setDownloadingCV(cv.id);
    try { await onDownloadSaved(cv.cvData, cv.templateId, cv.name); }
    finally { setDownloadingCV(null); }
  };

  const copyText=async(value:string)=>{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return;}const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const successful=document.execCommand('copy');document.body.removeChild(area);if(!successful)throw new Error('Copy was blocked by the browser');};
  const shareSavedCV=async(cv:SavedCV)=>{setSharingCV(cv.id);try{const result=await api.post<{path:string}>(`/cvs/${cv.id}/share`,{});const link=new URL(result.path,window.location.origin).toString();setShareLink(link);setShareName(cv.name);setCopied(false);try{await copyText(link);setCopied(true);}catch{}}finally{setSharingCV(null);}};
  const copyShareLink=async()=>{try{await copyText(shareLink);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}catch{const input=Array.from(document.querySelectorAll<HTMLInputElement>('input[readonly]')).find((item)=>item.value===shareLink);input?.focus();input?.select();}};

  const openDeleteModal = (cv: SavedCV) => {
    setCvToDelete(cv);
    setConfirmText('');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cvToDelete || confirmText !== cvToDelete.name) return;
    setDeleting(cvToDelete.id);
    setDeleteModalOpen(false);
    await deleteCV(cvToDelete.id);
    setDeleting(null);
    setCvToDelete(null);
    setConfirmText('');
  };

  const startSample = () => {
    localStorage.removeItem('career_active_saved_cv');
    loadSampleData();
    onContinue();
  };
  const startNewCV=()=>{localStorage.removeItem('career_active_saved_cv');onContinue();};

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-5 space-y-5">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
          <div className="pointer-events-none absolute -top-12 -right-8 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative px-5 py-5 sm:px-7 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar className="h-12 w-12 ring-2 ring-white/20 shrink-0">
                <AvatarFallback className="bg-white/15 text-white text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white/55 text-[11px] flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 text-teal-300" />
                  {today}
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-0.5 truncate">
                  {greeting}, <span className="bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">{firstName}</span>
                </h2>
                <p className="text-white/60 text-xs mt-0.5 hidden sm:block">Craft your next great resume</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="relative h-20 w-20">
                <svg className="h-full w-full -rotate-90">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <circle cx="40" cy="40" r={ringR} stroke="rgba(255,255,255,0.12)" strokeWidth={ringStroke} fill="none" />
                  <circle
                    cx="40" cy="40" r={ringR}
                    stroke="url(#ringGrad)" strokeWidth={ringStroke} fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCirc}
                    strokeDashoffset={ringCirc - (sections.pct / 100) * ringCirc}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-extrabold text-white leading-none">{sections.pct}%</span>
                  <span className="text-[8px] text-white/60 uppercase tracking-wider mt-0.5">done</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col gap-1.5">
                <Button onClick={() => onContinue()} size="sm" className="h-8 bg-white text-navy text-xs font-semibold shadow hover:bg-white/90 px-3">
                  <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                  Continue editing
                </Button>
                <Button variant="outline" size="sm" onClick={() => onWorkspaceNavigate ? onWorkspaceNavigate('letters') : navigate('/letters')} className="h-8 border-white/25 bg-white/5 text-white text-xs hover:text-white hover:bg-white/10 px-3">
                  <FileSignature className="w-3.5 h-3.5 mr-1.5" />
                  Cover Letters
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-4">
            {[
              { n: '01', title: 'Build', copy: 'Complete your story', action: () => onContinue('personal'), done: sections.pct >= 70 },
              { n: '02', title: 'Tailor', copy: 'Match the target role', action: () => onContinue('skills'), done: cvData.skills.length >= 5 },
              { n: '03', title: 'Check', copy: 'Run ATS analysis', action: () => onContinue('ats'), done: false },
              { n: '04', title: 'Apply', copy: 'Export CV & letter', action: () => onWorkspaceNavigate ? onWorkspaceNavigate('letters') : navigate('/letters'), done: false },
            ].map((step) => (
              <button key={step.n} onClick={step.action} className="group flex items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/20">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[10px] font-black ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-cyan-300 dark:bg-cyan-300 dark:text-slate-950'}`}>{step.done ? <CheckCircle2 className="h-4 w-4" /> : step.n}</span>
                <span><b className="block text-xs">{step.title}</b><small className="text-[10px] text-muted-foreground">{step.copy}</small></span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </section>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { icon: TrendingUp, label: 'Readiness', value: `${sections.pct}%`, gradient: 'from-blue-500 to-indigo-600' },
            { icon: CheckCircle2, label: 'Sections', value: `${sections.filled}/${sections.total}`, gradient: 'from-emerald-500 to-blue-500' },
            { icon: FolderKanban, label: 'Saved CVs', value: cvsLoading ? '…' : String(savedCVs.length), gradient: 'from-slate-700 to-slate-800' },
            { icon: LayoutTemplate, label: 'Template', value: selectedTemplate, gradient: 'from-blue-500 to-cyan-500' },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-border/50 bg-card p-2.5 shadow-sm ring-1 ring-border/20 transition-all hover:border-accent/20 hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${card.gradient} shadow-sm`}>
                  <card.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-none text-foreground">{card.value}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* CVs */}
          <section id="saved-cvs" className="lg:col-span-2 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden ring-1 ring-border/20 scroll-mt-20">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <FolderKanban className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Your CVs</h3>
                  <p className="text-[11px] text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={startNewCV} className="h-7 text-xs border-border/60 px-2.5">
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-accent" />
                New CV
              </Button>
            </div>

            <div className="p-4">
              {cvsLoading ? (
                <div className="py-8 flex items-center justify-center text-muted-foreground text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading your CVs…
                </div>
              ) : savedCVs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/40">
                    <FolderKanban className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No saved CVs yet</p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
                    Build your resume and hit "Save CV" to see it here.
                  </p>
                  <div className="mt-3.5 flex items-center justify-center gap-2">
                    <Button onClick={startSample} size="sm" className="h-8 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow shadow-blue-500/20 px-3">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Load sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={startNewCV} className="h-8 text-xs px-3">
                      Start from scratch
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {savedCVs.map((cv) => (
                    <div key={cv.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 px-3.5 py-2.5 hover:bg-background/70 hover:border-accent/20 transition-all group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/8 ring-1 ring-accent/15">
                          <FileText className="w-4 h-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{cv.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <LayoutTemplate className="w-3 h-3" />
                            <span className="capitalize">{cv.templateId}</span>
                            <span className="text-border/50">·</span>
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(cv.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => loadCV(cv)} className="h-7 text-xs px-2 text-accent hover:text-accent hover:bg-accent/5">
                          <PlayCircle className="w-3.5 h-3.5 mr-1" />
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" disabled={downloadingCV === cv.id} onClick={() => downloadSavedCV(cv)} className="h-7 text-xs px-2 text-accent hover:text-accent hover:bg-accent/5">
                          {downloadingCV === cv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          <span className="sr-only sm:not-sr-only sm:ml-1">Download</span>
                        </Button>
                        <Button size="sm" variant="ghost" disabled={sharingCV===cv.id} onClick={()=>shareSavedCV(cv)} className="h-7 px-2 text-xs text-accent hover:bg-accent/5 hover:text-accent" title="Share CV as PDF">{sharingCV===cv.id?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Share2 className="h-3.5 w-3.5"/>}<span className="sr-only sm:not-sr-only sm:ml-1">Share</span></Button>
                        <Button size="icon" variant="ghost" disabled={deleting === cv.id} onClick={() => openDeleteModal(cv)} className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/5">
                          {deleting === cv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Side */}
          <div className="space-y-4">
            <section className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden ring-1 ring-border/20">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <Briefcase className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
                  <p className="text-[11px] text-muted-foreground">Jump into work</p>
                </div>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { label: 'Continue editing', icon: PlayCircle, onClick: () => onContinue(), accent: true },
                  { label: 'Cover Letters', icon: FileSignature, onClick: () => onWorkspaceNavigate ? onWorkspaceNavigate('letters') : navigate('/letters') },
                  { label: 'Download PDF', icon: isDownloading ? Loader2 : Download, onClick: onDownload, disabled: isDownloading },
                  { label: 'Load sample CV', icon: Sparkles, onClick: startSample, ghost: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      item.accent
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20 hover:brightness-105'
                        : item.ghost
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        : 'text-foreground hover:bg-muted/60 border border-border/40 hover:border-accent/20'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.accent ? 'text-white' : 'text-accent'} ${item.disabled ? 'animate-spin' : ''}`} />
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </button>
                ))}
              </div>
            </section>

            <div id="ai-career-coach" className="scroll-mt-24"><AICareerCoach data={cvData} onOpenSection={onContinue} /></div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!shareLink} onOpenChange={(open)=>{if(!open){setShareLink('');setCopied(false);}}}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-accent"/>Share {shareName}</DialogTitle><DialogDescription>Anyone with this secure link can open the CV as a PDF without signing in.</DialogDescription></DialogHeader><div className="flex gap-2"><Input value={shareLink} readOnly onFocus={(event)=>event.currentTarget.select()}/><Button onClick={copyShareLink} className="shrink-0">{copied?<Check className="h-4 w-4"/>:<Copy className="h-4 w-4"/>}<span className="ml-2">{copied?'Copied':'Copy'}</span></Button></div><DialogFooter><Button variant="outline" onClick={()=>window.open(shareLink,'_blank','noopener,noreferrer')}>Open PDF link</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={deleteModalOpen} onOpenChange={(open) => { if (!open) { setDeleteModalOpen(false); setCvToDelete(null); setConfirmText(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              Delete CV
            </DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete <span className="font-semibold text-foreground">"{cvToDelete?.name}"</span> and remove all its data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label htmlFor="confirm-delete" className="text-xs font-medium">
              Type <span className="font-bold text-foreground">{cvToDelete?.name}</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              placeholder={cvToDelete?.name || ''}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="h-9 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && confirmText === cvToDelete?.name) {
                  handleConfirmDelete();
                }
              }}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => { setDeleteModalOpen(false); setCvToDelete(null); setConfirmText(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              disabled={confirmText !== cvToDelete?.name || deleting !== null}
              onClick={handleConfirmDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete CV
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateOverview;
