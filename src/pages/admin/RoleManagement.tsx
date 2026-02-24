import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoleEntry {
  id: string;
  user_id: string;
  role: string;
  user_email?: string;
  display_name?: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const fetchRoles = async () => {
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    const userIds = [...new Set((rolesData || []).map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', userIds);

    const profileMap = new Map<string, { email: string; display_name: string }>();
    profiles?.forEach((p: any) => profileMap.set(p.id, { email: p.email || '', display_name: p.display_name || '' }));

    setRoles(
      (rolesData || []).map((r: any) => ({
        ...r,
        user_email: profileMap.get(r.user_id)?.email || '—',
        display_name: profileMap.get(r.user_id)?.display_name || '—',
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAssignRole = async () => {
    if (!searchEmail.trim()) return;
    setAssigning(true);

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', searchEmail.trim())
      .single();

    if (!profile) {
      toast({ title: 'User not found', description: 'No user with that email exists.', variant: 'destructive' });
      setAssigning(false);
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: profile.id, role: selectedRole as any });

    if (error) {
      const msg = error.message.includes('duplicate') ? 'User already has this role.' : error.message;
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } else {
      toast({ title: 'Role assigned', description: `${selectedRole} role assigned to ${searchEmail}` });
      setSearchEmail('');
      fetchRoles();
    }
    setAssigning(false);
  };

  const handleRemoveRole = async (id: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Role removed' });
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">Role Management</h2>

      {/* Assign Role */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assign Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="User email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssignRole}
              disabled={assigning || !searchEmail.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Current Role Assignments</CardTitle>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.display_name}</TableCell>
                    <TableCell>{role.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={role.role === 'admin' ? 'destructive' : 'secondary'}>
                        {role.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveRole(role.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No roles assigned yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default RoleManagement;
