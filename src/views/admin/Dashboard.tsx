import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { api, AdminStats, LoginHistoryEntry } from '@/integrations/api/client';
import {
  Activity, ArrowRight, CheckCircle2, Clock3, FileText, Globe2, History,
  Loader2, ShieldCheck, Sparkles, Trash2, UserCheck, Users,
  MessagesSquare, Headphones,
} from 'lucide-react';

const timeAgo = (value: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
};

const initials = (entry: LoginHistoryEntry) =>
  (entry.displayName || entry.email || '?').split(/[\s@.]+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try { setStats(await api.get<AdminStats>('/admin/stats')); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const activeToday = useMemo(() => stats?.recentLogins.filter((x) =>
    Date.now() - new Date(x.loggedInAt).getTime() < 86400000
  ).length || 0, [stats]);

  const cards = [
    { label: 'Total users', value: stats?.totalUsers || 0, detail: `${activeToday} recent in activity feed`, icon: Users, color: 'from-cyan-400 to-blue-500', to: '/admin/users' },
    { label: 'Online users', value: stats?.onlineUsers || 0, detail: 'Active in the last 2 minutes', icon: Activity, color: 'from-emerald-300 to-teal-500', to: '/admin/users' },
    { label: 'Active resumes', value: stats?.totalCVs || 0, detail: 'Stored in PostgreSQL', icon: FileText, color: 'from-violet-400 to-fuchsia-500', to: '/admin/cvs' },
    { label: 'Administrators', value: stats?.roles.admin || 0, detail: 'Privileged accounts', icon: ShieldCheck, color: 'from-amber-300 to-orange-500', to: '/admin/roles' },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-career mx-auto max-w-[1180px] space-y-[22px]">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#161b2e] via-[#202947] to-[#2b3358] p-6 text-white shadow-2xl shadow-slate-950/10 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[.08] px-3 py-1.5 text-[11px] font-bold text-amber-300"><Sparkles className="h-3.5 w-3.5" /> CAREERCANVAS ADMIN</div><h2 className="font-serif text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Platform overview</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Manage candidates, resumes, access, support, and platform activity from one operational workspace.</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10"><Activity className="h-4 w-4" /> Refresh</button><Link to="/admin/support" className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-200"><Headphones className="h-4 w-4"/>Support inbox</Link><Link to="/admin/users" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-slate-100">Manage users <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </section>

        {loading ? <div className="grid min-h-64 place-items-center rounded-3xl border bg-card"><Loader2 className="h-7 w-7 animate-spin text-cyan-500" /></div> :
        error ? <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, detail, icon: Icon, color, to }) => <Link key={label} to={to} className="group rounded-lg border border-border/60 bg-card p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${color} text-slate-950 shadow-sm`}><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><p className="text-lg font-black leading-none tracking-tight">{value}</p><p className="mt-0.5 text-[10px] font-bold">{label}</p></div><ArrowRight className="h-3 w-3 text-muted-foreground transition group-hover:translate-x-0.5" /></div><p className="mt-1.5 truncate text-[8px] text-muted-foreground">{detail}</p></Link>)}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4"><div><h3 className="text-sm font-black">Recent account activity</h3><p className="mt-1 text-[10px] text-muted-foreground">Latest successful sign-ins</p></div><Link to="/admin/login-history" className="text-[11px] font-bold text-blue-600 hover:underline">View all</Link></div>
              <div className="divide-y divide-border/50">
                {!stats?.recentLogins.length && <div className="p-10 text-center text-xs text-muted-foreground">No login activity yet.</div>}
                {stats?.recentLogins.map((entry) => <div key={entry.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-blue-700 text-[10px] font-black text-white">{initials(entry)}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{entry.displayName || 'Unnamed user'}</p><p className="truncate text-[10px] text-muted-foreground">{entry.email}</p></div><div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex"><Globe2 className="h-3.5 w-3.5" />{entry.city || entry.country || entry.ipAddress || 'Unknown'}</div><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" />{timeAgo(entry.loggedInAt)}</span></div>)}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"><h3 className="text-sm font-black">Access distribution</h3><p className="mt-1 text-[10px] text-muted-foreground">Roles assigned across the platform</p><div className="mt-5 space-y-4">{Object.entries(stats?.roles || {}).map(([role,count]) => { const total = Math.max(1,Object.values(stats?.roles || {}).reduce((a,b)=>a+b,0)); const pct = Math.round(count/total*100); return <div key={role}><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-bold capitalize">{role}</span><span className="text-muted-foreground">{count} · {pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{width:`${pct}%`}} /></div></div>})}</div><Link to="/admin/roles" className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[11px] font-bold hover:bg-muted">Review permissions <ArrowRight className="h-3.5 w-3.5" /></Link></section>
              <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-5 text-slate-900 ring-1 ring-emerald-200"><div className="flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Systems operational</div><div className="mt-4 grid grid-cols-2 gap-2 text-[10px]"><span className="rounded-lg bg-white/70 p-2"><b className="block">Frontend + API</b>Next.js 16</span><span className="rounded-lg bg-white/70 p-2"><b className="block">Database</b>PostgreSQL</span></div></section>
            </div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[['User directory','Search, activate, reset','/admin/users',UserCheck],['Resume moderation','Review saved content','/admin/cvs',FileText],['Support inbox','Reply to candidate questions','/admin/support',MessagesSquare],['Audit trail','Inspect sign-in activity','/admin/login-history',History],['Recycle bin','Restore deleted resumes','/admin/recycle-bin',Trash2]].map(([title,copy,to,I]) => { const Icon=I as React.ElementType; return <Link key={to as string} to={to as string} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-blue-600"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><b className="block text-xs">{title as string}</b><small className="text-[10px] text-muted-foreground">{copy as string}</small></span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></Link>})}
          </section>
        </>}
      </div>
    </AdminLayout>
  );
}
