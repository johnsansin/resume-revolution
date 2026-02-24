import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedCV {
  id: string;
  name: string;
  template_id: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

const ContentModeration: React.FC = () => {
  const [cvs, setCvs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCVs = async () => {
    const { data: cvsData } = await supabase
      .from('saved_cvs')
      .select('id, name, template_id, created_at, user_id')
      .order('created_at', { ascending: false });

    const userIds = [...new Set((cvsData || []).map((c: any) => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const emailMap = new Map<string, string>();
    profiles?.forEach((p: any) => emailMap.set(p.id, p.email || ''));

    setCvs(
      (cvsData || []).map((c: any) => ({
        ...c,
        user_email: emailMap.get(c.user_id) || '—',
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchCVs(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_cvs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCvs((prev) => prev.filter((cv) => cv.id !== id));
      toast({ title: 'CV deleted' });
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">Content Moderation</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Saved CVs</CardTitle>
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
                  <TableHead>Template</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvs.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell className="font-medium">{cv.name}</TableCell>
                    <TableCell>{cv.template_id}</TableCell>
                    <TableCell className="text-muted-foreground">{cv.user_email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(cv.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cv.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {cvs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No CVs found
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

export default ContentModeration;
