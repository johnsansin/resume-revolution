import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/integrations/api/client';
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
  userId: string;
  role: string;
  createdAt: string;
  email: string;
  displayName: string;
}

interface UserEntry {
  id: string;
  email: string;
  displayName: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [tableRole, setTableRole] = useState('all');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();
  const filteredRoles = roles.filter((entry) => {
    const needle = tableSearch.trim().toLowerCase();
    const matchesText = !needle || `${entry.displayName || ''} ${entry.email}`.toLowerCase().includes(needle);
    return matchesText && (tableRole === 'all' || entry.role === tableRole);
  });

  const fetchRoles = async () => {
    const data = await api.get<RoleEntry[]>('/admin/roles');
    setRoles(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const data = await api.get<{ users: UserEntry[] }>('/admin/users');
    setUsers(data.users);
  };

  useEffect(() => {
    Promise.all([fetchRoles(), fetchUsers()]);
  }, []);

  const handleAssignRole = async () => {
    if (!searchEmail.trim()) return;
    setAssigning(true);

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === searchEmail.trim().toLowerCase()
    );

    if (!matchedUser) {
      toast({ title: 'User not found', description: 'No user with that email exists.', variant: 'destructive' });
      setAssigning(false);
      return;
    }

    try {
      await api.post('/admin/roles', { userId: matchedUser.id, role: selectedRole });
      toast({ title: 'Role assigned', description: `${selectedRole} role assigned to ${searchEmail}` });
      setSearchEmail('');
      fetchRoles();
    } catch (error: any) {
      const msg = error?.message?.includes('duplicate') ? 'User already has this role.' : error?.message || 'Failed to assign role.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
    setAssigning(false);
  };

  const handleRemoveRole = async (id: string) => {
    try {
      await api.delete(`/admin/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Role removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to remove role.', variant: 'destructive' });
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
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle>Current Role Assignments</CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={tableSearch} onChange={(event)=>setTableSearch(event.target.value)} placeholder="Filter name or email…" className="pl-9"/></div>
            <Select value={tableRole} onValueChange={setTableRole}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.displayName}</TableCell>
                    <TableCell>{role.email}</TableCell>
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
                {filteredRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {roles.length ? 'No role assignments match these filters' : 'No roles assigned yet'}
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
