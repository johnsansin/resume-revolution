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
import { Loader2, Eye, Search, FileText, Ban, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CVData } from '@/types/cv';

interface UserCv {
  id: string;
  name: string;
  template_id: string;
  updated_at: string;
  cv_data: CVData;
}

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  roles: string[];
  phone?: string;
  cv_count: number;
  cvs: UserCv[];
  is_active: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<UserProfile | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const { data: cvs } = await supabase
        .from('saved_cvs')
        .select('id, name, template_id, updated_at, user_id, cv_data')
        .order('updated_at', { ascending: false });

      const roleMap = new Map<string, string[]>();
      roles?.forEach((r: any) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      const cvMap = new Map<string, UserCv[]>();
      (cvs || []).forEach((c: any) => {
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

      setUsers(
        (profiles || []).map((p: any) => {
          const userCvs = cvMap.get(p.id) || [];
          const latest = userCvs[0]?.cv_data?.personal;
          return {
            ...p,
            roles: roleMap.get(p.id) || [],
            phone: latest?.phone || '',
            cv_count: userCvs.length,
            cvs: userCvs,
            is_active: p.is_active !== false,
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
      [u.display_name, u.email, u.phone].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [users, search]);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">User Records</h2>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
          <CardTitle>All Registered Users</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-center">CVs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.display_name || '—'}</TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || '—'}</TableCell>
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
                    <TableCell className="text-center text-muted-foreground">{user.cv_count}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/30">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
              <Badge
                variant="secondary"
                className={viewing.is_active ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}
              >
                {viewing.is_active ? 'Active' : 'Inactive'}
              </Badge>
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
