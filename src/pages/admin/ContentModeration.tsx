import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CvDataViewer from '@/components/admin/CvDataViewer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Eye, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CVData } from '@/types/cv';

interface SavedCV {
  id: string;
  name: string;
  template_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email?: string;
  cv_data: CVData;
  full_name?: string;
  phone?: string;
  email?: string;
}

const ContentModeration: React.FC = () => {
  const [cvs, setCvs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<SavedCV | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCVs = async () => {
    setLoading(true);
    const { data: cvsData } = await supabase
      .from('saved_cvs')
      .select('id, name, template_id, created_at, updated_at, user_id, cv_data')
      .order('updated_at', { ascending: false });

    const userIds = [...new Set((cvsData || []).map((c: any) => c.user_id))];
    const { data: profiles } = userIds.length
      ? await supabase.from('profiles').select('id, email').in('id', userIds)
      : { data: [] };

    const emailMap = new Map<string, string>();
    profiles?.forEach((p: any) => emailMap.set(p.id, p.email || ''));

    setCvs(
      (cvsData || []).map((c: any) => {
        const personal = c.cv_data?.personal || {};
        return {
          ...c,
          user_email: emailMap.get(c.user_id) || '—',
          full_name: personal.fullName || '',
          phone: personal.phone || '',
          email: personal.email || '',
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => { fetchCVs(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cvs;
    return cvs.filter((cv) =>
      [cv.name, cv.template_id, cv.user_email, cv.full_name, cv.phone, cv.email]
        .some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [cvs, search]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_cvs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCvs((prev) => prev.filter((cv) => cv.id !== id));
      if (viewing?.id === id) setViewing(null);
      toast({ title: 'CV deleted' });
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">CV Records</h2>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
          <CardTitle>All Saved CVs & Input Data</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, template..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell className="font-medium">{cv.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cv.user_email}
                      {cv.email && cv.email !== cv.user_email && (
                        <span className="block text-xs text-muted-foreground/70">{cv.email}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cv.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-normal">{cv.template_id}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(cv.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewing(cv)} title="View input data">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {confirming === cv.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { handleDelete(cv.id); setConfirming(null); }}
                          >
                            Confirm?
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setConfirming(cv.id); setTimeout(() => setConfirming((c) => (c === cv.id ? null : c)), 3000); }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {cvs.length === 0 ? 'No CVs found' : 'No results match your search'}
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
              {viewing?.name}
            </DialogTitle>
            <DialogDescription>
              Saved by {viewing?.user_email} · Template: {viewing?.template_id} · Updated{' '}
              {viewing ? new Date(viewing.updated_at).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {viewing && <CvDataViewer data={viewing.cv_data} />}
          </div>
          {viewing && (
            <div className="flex justify-end pt-3 border-t border-border/60">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { handleDelete(viewing.id); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete This CV
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ContentModeration;
