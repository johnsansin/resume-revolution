import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Eye, Search, Ban, UserCheck, Users, Phone, KeyRound, MoreVertical, Trash2, History, MessagesSquare, ArrowUpDown, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  cvCount: number;
  loginCount?: number;
  lastSeenAt?: string | null;
  online?: boolean;
  profileData?: Record<string, unknown>;
  updatedAt?: string;
  cvs?: any[];
  supportMessages?: any[];
  lastLogin: {
    at: string | null;
    ip: string | null;
    country: string | null;
    countryCode: string | null;
    city: string | null;
  } | null;
}

interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [viewingCvs, setViewingCvs] = useState<any[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);
  const [resetPwUser, setResetPwUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const { toast } = useToast();
  const limit = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
        if (search.trim()) params.set('search', search.trim());
        const data: PaginatedUsers = await api.get(`/admin/users?${params.toString()}`);
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load users', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, sort, order]);

  const changeSort=(key:string)=>{ if(sort===key)setOrder((value)=>value==='asc'?'desc':'asc');else{setSort(key);setOrder('asc');} setPage(1); };
  const SortHead=({id,children}:{id:string;children:React.ReactNode})=><button className="inline-flex items-center gap-1 hover:text-foreground" onClick={()=>changeSort(id)}>{children}<ArrowUpDown className={`w-3 h-3 ${sort===id?'text-accent':'opacity-40'}`}/></button>;

  const handleToggleActive = async (user: AdminUser) => {
    setToggling(user.id);
    try {
      await api.put(`/admin/users/${user.id}/toggle-active`, {});
      const next = !user.isActive;
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: next } : u)));
      setViewing((prev) => (prev && prev.id === user.id ? { ...prev, isActive: next } : prev));
      toast({
        title: next ? 'Account activated' : 'Account deactivated',
        description: `${user.displayName || user.email} is now ${next ? 'active' : 'deactivated'}.`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to toggle user', variant: 'destructive' });
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => prev - 1);
      setViewing(null);
      toast({ title: 'User deleted', description: `${user.displayName || user.email} has been deleted.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwUser || !newPassword.trim()) return;
    if (newPassword.trim().length < 6 || newPassword.trim().length > 128) {
      toast({ title: 'Error', description: 'Password must be between 6 and 128 characters', variant: 'destructive' });
      return;
    }
    setResetting(true);
    try {
      await api.put(`/admin/users/${resetPwUser.id}/reset-password`, { newPassword: newPassword.trim() });
      toast({ title: 'Password reset', description: `Password updated for ${resetPwUser.email}` });
      setResetPwUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reset password', variant: 'destructive' });
    } finally {
      setResetting(false);
    }
  };

  const RoleBadges: React.FC<{ roles: string[] }> = ({ roles }) => (
    <div className="flex gap-1 flex-wrap">
      {roles.length > 0 ? (
        roles.map((role) => (
          <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
            {role === 'admin' ? 'Superadmin' : role}
          </Badge>
        ))
      ) : (
        <Badge variant="outline">candidate</Badge>
      )}
    </div>
  );

  const StatusBadge: React.FC<{ online?: boolean }> = ({ online }) => (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${online ? 'text-emerald-600' : 'text-muted-foreground'}`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
      {online ? 'Online' : 'Offline'}
    </span>
  );

  const openDetails = async (user: AdminUser) => {
    setViewing(user); setViewLoading(true);
    try { const detail = await api.get<AdminUser>(`/admin/users/${user.id}`); setViewing(detail); setViewingCvs(detail.cvs || []); }
    catch (err:any) { toast({title:'Error',description:err.message||'Failed to load user details',variant:'destructive'}); }
    finally { setViewLoading(false); }
  };

  const UserAvatar: React.FC<{ user: AdminUser }> = ({ user }) => (
    user.avatarUrl ? (
      <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full shrink-0 object-cover" />
    ) : (
      <span
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad(user.id)} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
      >
        {initials(user.displayName, user.email)}
      </span>
    )
  );

  const ActionsMenu: React.FC<{ user: AdminUser }> = ({ user }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => openDetails(user)}>
          <Eye className="w-4 h-4 mr-2" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { window.location.href=`/admin/login-history?search=${encodeURIComponent(user.email)}`; }}>
          <History className="w-4 h-4 mr-2" /> Login history
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { window.location.href=`/admin/support?user=${encodeURIComponent(user.id)}`; }}>
          <MessagesSquare className="w-4 h-4 mr-2" /> Support chat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setResetPwUser(user); setNewPassword(''); }}>
          <KeyRound className="w-4 h-4 mr-2" />
          Reset password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={toggling === user.id}
          onClick={() => handleToggleActive(user)}
          className={user.isActive ? 'text-destructive focus:text-destructive' : 'text-emerald-600 focus:text-emerald-700'}
        >
          {toggling === user.id ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : user.isActive ? (
            <Ban className="w-4 h-4 mr-2" />
          ) : (
            <UserCheck className="w-4 h-4 mr-2" />
          )}
          {user.isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteUser(user)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Records</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total} registered user{total !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap bg-muted/30 border-b border-border px-4 sm:px-5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-5 h-5 text-accent" />
            All Registered Users
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
            <>
              {/* Desktop Table (md+) */}
              <div className="hidden max-h-[calc(100vh-285px)] overflow-auto md:block">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-muted shadow-[0_1px_0_hsl(var(--border))]">
                    <TableRow>
                      <TableHead className="px-5"><SortHead id="name">User</SortHead></TableHead>
                      <TableHead><SortHead id="email">Email</SortHead></TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead><SortHead id="status">Status</SortHead></TableHead>
                      <TableHead><SortHead id="lastLogin">Last Login</SortHead></TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-center"><SortHead id="cvs">CVs</SortHead></TableHead>
                      <TableHead><SortHead id="createdAt">Joined</SortHead></TableHead>
                      <TableHead className="w-12 text-right pr-5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-5">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <UserAvatar user={user} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                                {user.displayName || 'Unnamed'}
                                {!user.isActive && (
                                  <Badge className="bg-rose-500/15 text-rose-500 border-rose-500/30 text-[10px] px-1.5 py-0">banned</Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[220px]"><span className="block truncate text-sm text-foreground" title={user.email}>{user.email}</span></TableCell>
                        <TableCell>
                          {user.phone ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge online={user.online} />
                        </TableCell>
                        <TableCell>
                          {user.lastLogin?.at ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-foreground">{formatDateTime(user.lastLogin.at)}</span>
                              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                                <span>{flag(user.lastLogin.countryCode)}</span>
                                {user.lastLogin.country || user.lastLogin.countryCode || 'Unknown'}
                                {user.lastLogin.ip ? ` · ${user.lastLogin.ip}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RoleBadges roles={user.roles} />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {user.cvCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatDateTime(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <ActionsMenu user={user} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                          {search.trim() ? 'No results match your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards (below md) */}
              <div className="md:hidden divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                            {user.displayName || 'Unnamed'}
                            {!user.isActive && (
                              <Badge className="bg-rose-500/15 text-rose-500 border-rose-500/30 text-[10px] px-1.5 py-0">banned</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <ActionsMenu user={user} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-[52px]">
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Status</p>
                        <StatusBadge online={user.online} />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Phone</p>
                        {user.phone ? (
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">CVs</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {user.cvCount}
                        </span>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Joined</p>
                        <span className="text-foreground">{formatDateTime(user.createdAt)}</span>
                      </div>
                    </div>

                    <div className="pl-[52px]">
                      <RoleBadges roles={user.roles} />
                    </div>

                    {user.lastLogin?.at && (
                      <div className="pl-[52px]">
                        <p className="text-muted-foreground text-xs mb-0.5">Last login</p>
                        <span className="text-sm text-foreground">{formatDateTime(user.lastLogin.at)}</span>
                        <span className="text-[11px] text-muted-foreground ml-1.5">
                          {flag(user.lastLogin.countryCode)} {user.lastLogin.country || user.lastLogin.countryCode || ''}
                          {user.lastLogin.ip ? ` · ${user.lastLogin.ip}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    {search.trim() ? 'No results match your search' : 'No users found'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-border bg-card/95 px-4 py-3 shadow-[0_-8px_20px_hsl(var(--background)/.8)] backdrop-blur sm:px-5">
              <span className="text-sm text-muted-foreground">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) { setViewing(null); setViewingCvs([]); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewing?.displayName || viewing?.email || 'User'}
            </DialogTitle>
            <DialogDescription>
              {viewing?.email} · Joined {viewing ? formatDateTime(viewing.createdAt) : ''} ·{' '}
              {viewing?.cvCount || 0} saved CV{viewing && viewing.cvCount !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={viewing.isActive ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}
                >
                  {viewing.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {viewing.phone && (
                  <Badge variant="outline">
                    <Phone className="w-3 h-3 mr-1" />
                    {viewing.phone}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={toggling === viewing.id}
                  onClick={() => handleToggleActive(viewing)}
                  className={viewing.isActive ? 'text-destructive hover:text-destructive border-destructive/40' : 'text-emerald-600 border-emerald-500/40'}
                >
                  {toggling === viewing.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : viewing.isActive ? (
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setViewing(null); setResetPwUser(viewing); setNewPassword(''); }}
                >
                  <KeyRound className="w-4 h-4 mr-1.5" />
                  Reset PW
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteUser(viewing)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          {viewLoading ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div> : viewing && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border p-4 bg-muted/20">
                <div><p className="text-xs text-muted-foreground">Presence</p><StatusBadge online={viewing.online}/></div>
                <div><p className="text-xs text-muted-foreground">Last seen</p><b>{formatDateTime(viewing.lastSeenAt)}</b></div>
                <div><p className="text-xs text-muted-foreground">Last login</p><b>{formatDateTime(viewing.lastLogin?.at)}</b></div>
                <div><p className="text-xs text-muted-foreground">Login count</p><b>{viewing.loginCount || 0}</b></div>
                <div><p className="text-xs text-muted-foreground">Saved CVs</p><b>{viewing.cvCount || 0}</b></div>
                <div><p className="text-xs text-muted-foreground">Last IP</p><b>{viewing.lastLogin?.ip || '—'}</b></div>
              </div>
              <div><h3 className="font-semibold mb-2">Profile details</h3><div className="grid sm:grid-cols-2 gap-2 rounded-xl border p-4"><div><span className="text-muted-foreground">Name: </span>{viewing.displayName||'—'}</div><div><span className="text-muted-foreground">Phone: </span>{viewing.phone||'—'}</div><div><span className="text-muted-foreground">Email: </span>{viewing.email}</div><div><span className="text-muted-foreground">Location: </span>{[viewing.lastLogin?.city,viewing.lastLogin?.country].filter(Boolean).join(', ')||'—'}</div>{Object.entries(viewing.profileData||{}).filter(([,v])=>typeof v==='string'&&v).slice(0,12).map(([k,v])=><div key={k}><span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g,' $1')}: </span>{String(v)}</div>)}</div></div>
              <div><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-semibold">Saved CVs</h3><Button size="sm" variant="outline" onClick={()=>window.location.href=`/admin/cvs?search=${encodeURIComponent(viewing.email)}`}><FolderOpen className="mr-2 h-4 w-4"/>View Saved CVs</Button></div>{viewingCvs.length?<div className="space-y-2">{viewingCvs.map((cv)=><button key={cv.id} onClick={()=>window.location.href=`/admin/cvs?search=${encodeURIComponent(cv.name||viewing.email)}`} className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition hover:border-accent hover:bg-muted/40"><span>{cv.name||'Untitled CV'}</span><span className="flex items-center gap-2"><Badge variant="outline">{cv.template||'Template'}</Badge><Eye className="h-4 w-4 text-muted-foreground"/></span></button>)}</div>:<p className="text-muted-foreground">No saved CVs.</p>}</div>
              <div className="flex gap-2"><Button variant="outline" onClick={()=>window.location.href=`/admin/login-history?search=${encodeURIComponent(viewing.email)}`}><History className="w-4 h-4 mr-2"/>Login history</Button><Button onClick={()=>window.location.href=`/admin/support?user=${encodeURIComponent(viewing.id)}`}><MessagesSquare className="w-4 h-4 mr-2"/>Open support chat ({viewing.supportMessages?.length||0})</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPwUser} onOpenChange={(open) => { if (!open) { setResetPwUser(null); setNewPassword(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-medium text-foreground">{resetPwUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword(); }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setResetPwUser(null); setNewPassword(''); }}>
                Cancel
              </Button>
              <Button size="sm" disabled={resetting || !newPassword.trim()} onClick={handleResetPassword}>
                {resetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
