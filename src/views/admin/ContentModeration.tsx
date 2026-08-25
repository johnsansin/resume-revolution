import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CvDataViewer from '@/components/admin/CvDataViewer';
import { api } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Eye, Search, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CVData } from '@/types/cv';
import { downloadBlob } from '@/lib/download';

interface AdminCV {
  id: string;
  name: string;
  cvData: CVData;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userDisplayName: string;
  fullName: string;
  phone: string;
  email: string;
}

interface PaginatedCVs {
  cvs: AdminCV[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_LIMIT = 25;

const ContentModeration: React.FC = () => {
  const [cvs, setCvs] = useState<AdminCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewing, setViewing] = useState<AdminCV | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
      if (search.trim()) params.set('search', search.trim());
      const data = await api.get<PaginatedCVs>(`/admin/cvs?${params.toString()}`);
      setCvs(data.cvs);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, [page, search]);

  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/cvs/${id}`);
      setCvs((prev) => prev.filter((cv) => cv.id !== id));
      if (viewing?.id === id) setViewing(null);
      toast({ title: 'CV deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDownload = async (cv: AdminCV) => {
    setDownloading(cv.id);
    try {
      const [{ pdf }, { templates }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/cv/templates/PDFTemplates'),
      ]);
      const Template = templates[cv.templateId as keyof typeof templates] || templates.ats;
      const blob = await pdf(<Template data={cv.cvData} showPhoto />).toBlob();
      downloadBlob(blob, `${cv.name || cv.fullName || 'resume'}-${cv.templateId}.pdf`);
    } catch (err) {
      toast({ title: 'Download failed', description: err instanceof Error ? err.message : 'PDF could not be generated', variant: 'destructive' });
    } finally {
      setDownloading(null);
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-28">PDF</TableHead>
                      <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cvs.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">{cv.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cv.userEmail}
                        {cv.email && cv.email !== cv.userEmail && (
                          <span className="block text-xs text-muted-foreground/70">{cv.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cv.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize font-normal">{cv.templateId}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(cv.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => void handleDownload(cv)} disabled={downloading === cv.id} title="Download full CV as PDF">
                          {downloading === cv.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                          PDF
                        </Button>
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
                  {cvs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No CVs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
              Saved by {viewing?.userEmail} · Template: {viewing?.templateId} · Updated{' '}
              {viewing ? new Date(viewing.updatedAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {viewing && <CvDataViewer data={viewing.cvData} />}
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
