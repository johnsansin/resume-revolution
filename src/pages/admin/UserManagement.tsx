import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CvDataViewer from '@/components/admin/CvDataViewer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Eye, Search, FileText, Ban, UserCheck, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { timeAgo } from '@/lib/presence';
import { CVData } from '@/types/cv';

interface UserCv {
  id: string;
  name: string;
  template_id: string;
  updated_at: string;
  cv_data: CVData;
}

interface LastLogin {
  at: string | null;
  ip: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  last_seen_at: string | null;
  roles: string[];
  phone?: string;
  cv_count: number;
  cvs: UserCv[];
  is_active: boolean;
  last_login: LastLogin;
}

const AVATAR_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-teal-400 to-emerald-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-sky-600',
  'from-fuchsia-400 to-violet-600',
  'from-lime-400 to-green-600',
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const avatarGrad = (id: string) => AVATAR_GRADIENTS[hashStr(id) % AVATAR_GRADIENTS.length];

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const flag = (cc?: string | null) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
    : '🌐';

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<UserProfile | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();
  const onlineIds = useOnlineUsers();

  useEffect(() => {
    const fetchUsers = async () => {
      const [profilesRes, rolesRes, cvsRes, loginRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase
          .from('saved_cvs')
          .select('id, name, template_id, updated_at, user_id, cv_data')
          .order('updated_at', { ascending: false }),
        supabase.from('login_history').select('user_id, logged_in_at, ip_address, country, country_code, city').order('logged_in_at', { ascending: false }).limit(2000),
      ]);

      const roleMap = new Map<string, string[]>();
      rolesRes.data?.forEach((r: any) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      const cvMap = new Map<string, UserCv[]>();
      (cvsRes.data || []).forEach((c: any) => {
        const list = cvMap.get(c.user_id) || [];
        list.push({
          id: c.id,
          name: c.name,
          template_id: c.template_id,
          updated_at: c.updated_at,
          cv_data: c.cv_data,
        });
        cvMap.set(c.user_id, list);
      });

      const loginMap = new Map<string, LastLogin>();
      (loginRes.data || []).forEach((l: any) => {
        if (!loginMap.has(l.user_id)) {
          loginMap.set(l.user_id, {
            at: l.logged_in_at,
            ip: l.ip_address,
            country: l.country,
            country_code: l.country_code,
            city: l.city,
          });
        }
      });

      setUsers(
        (profilesRes.data || []).map((p: any) => {
          const userCvs = cvMap.get(p.id) || [];
          const latest = userCvs[0]?.cv_data?.personal;
          return {
            ...p,
            roles: roleMap.get(p.id) || [],
            phone: latest?.phone || '',
            cv_count: userCvs.length,
            cvs: userCvs,
            is_active: p.is_active !== false,
            last_login: loginMap.get(p.id) || { at: null, ip: null, country: null, country_code: null, city: null },
          };
        })
      );
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: UserProfile) => {
    setToggling(user.id);
    const next = !user.is_active;
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: next } as any)
      .eq('id', user.id);
    setToggling(null);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u)));
    setViewing((prev) => (prev && prev.id === user.id ? { ...prev, is_active: next } : prev));
    toast({
      title: next ? 'Account activated' : 'Account deactivated',
      description: `${user.display_name || user.email} is now ${next ? 'active' : 'deactivated'}.`,
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.display_name, u.email, u.phone, u.last_login.ip, u.last_login.country].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    );
  }, [users, search]);

  const onlineCount = users.filter((u) => onlineIds.has(u.id)).length;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Records</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} registered · <span className="text-emerald-600 font-medium">{onlineCount} online now</span> ·{' '}
            {users.length - onlineCount} offline
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap bg-muted/30 border-b border-border px-5">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            All Registered Users
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-5">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-center">CVs</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-44 text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => {
                  const online = onlineIds.has(user.id);
                  return (
                    <TableRow key={user.id} className="group hover:bg-muted/40">
                      <TableCell className="px-5">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <span
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad(user.id)} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                          >
                            {initials(user.display_name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                              {user.display_name || 'Unnamed'}
                              {!user.is_active && (
                                <Badge className="bg-rose-500/15 text-rose-500 border-rose-500/30">banned</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {online ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                              </span>
                              Online
                            </span>
                            <span className="text-[10px] text-muted-foreground">active now</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                              Offline
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              seen {timeAgo(user.last_seen_at)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login.at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground">{formatDateTime(user.last_login.at)}</span>
                            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                              <span>{flag(user.last_login.country_code)}</span>
                              {user.last_login.country || user.last_login.country_code || 'Unknown'}
                              {user.last_login.ip ? ` · ${user.last_login.ip}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                                {role === 'admin' ? 'Superadmin' : role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">candidate</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {user.cv_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex justify-end gap-1 opacity-90 group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => setViewing(user)} title="View records & data">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={toggling === user.id}
                            onClick={() => handleToggleActive(user)}
                            className={user.is_active ? 'text-destructive hover:text-destructive' : 'text-emerald-600 hover:text-emerald-700'}
                            title={user.is_active ? 'Deactivate account' : 'Activate account'}
                          >
                            {toggling === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.is_active ? (
                              <>
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      {users.length === 0 ? 'No users found' : 'No results match your search'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              {viewing?.display_name || viewing?.email || 'User'}
            </DialogTitle>
            <DialogDescription>
              {viewing?.email} · Joined {viewing ? new Date(viewing.created_at).toLocaleDateString() : ''} ·{' '}
              {viewing?.cv_count || 0} saved CV{viewing && viewing.cv_count !== 1 ? 's' : ''}
              {viewing?.phone ? ` · Phone: ${viewing.phone}` : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={viewing.is_active ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}
                >
                  {viewing.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {onlineIds.has(viewing.id) ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">● Online</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    ● Offline · seen {timeAgo(viewing.last_seen_at)}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={toggling === viewing.id}
                onClick={() => handleToggleActive(viewing)}
                className={viewing.is_active ? 'text-destructive hover:text-destructive border-destructive/40' : 'text-emerald-600 border-emerald-500/40'}
              >
                {toggling === viewing.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : viewing.is_active ? (
                  <>
                    <Ban className="w-4 h-4 mr-1.5" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto pr-2">
            {viewing && viewing.cvs.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">This user has not saved any CVs yet.</p>
              </div>
            )}
            {viewing && viewing.cvs.length > 0 && (
              <Accordion type="multiple" className="w-full">
                {viewing.cvs.map((cv) => (
                  <AccordionItem key={cv.id} value={cv.id}>
                    <AccordionTrigger className="text-sm font-medium">
                      <span className="truncate">{cv.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground capitalize">
                        {cv.template_id} · {new Date(cv.updated_at).toLocaleDateString()}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                        <CvDataViewer data={cv.cv_data} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
