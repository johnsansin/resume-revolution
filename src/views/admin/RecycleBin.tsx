import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';
import { downloadBlob } from '@/lib/download';
import { CVData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trash2,
  Search,
  Loader2,
  RotateCcw,
  Download,
  AlertTriangle,
  FileText,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DeletedCV {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  deletedBy: string;
  userEmail: string;
  userDisplayName: string;
  fullName: string;
  cvData: CVData;
}

const RecycleBin: React.FC = () => {
  const { toast } = useToast();
  const [cvs, setCvs] = useState<DeletedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Action states
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState<DeletedCV | null>(null);
  const [permanentLoading, setPermanentLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      const data = await api.get<{ cvs: DeletedCV[]; total: number; totalPages: number }>(`/admin/recycle-bin?${params}`);
      setCvs(data.cvs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to load recycle bin', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, [page, search]);

  const handleRestore = async (id: string) => {
    setRestoreId(id);
    try {
      await api.put(`/admin/recycle-bin/${id}/restore`);
      toast({ title: 'Restored', description: 'CV has been restored successfully' });
      fetchCVs();
    } catch {
      toast({ title: 'Error', description: 'Failed to restore CV', variant: 'destructive' });
    } finally {
      setRestoreId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDelete) return;
    setPermanentLoading(true);
    try {
      await api.delete(`/admin/recycle-bin/${permanentDelete.id}/permanent`);
      toast({ title: 'Deleted', description: `"${permanentDelete.name}" has been permanently deleted` });
      setPermanentDelete(null);
      fetchCVs();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete CV', variant: 'destructive' });
    } finally {
      setPermanentLoading(false);
    }
  };

  const handleDownload = async (cv: DeletedCV) => {
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

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return d; }
  };

  return (
    <AdminLayout>
    <div className="mx-auto max-w-[1500px] space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Recycle Bin
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total} deleted CV{total !== 1 ? 's' : ''} — restore or permanently delete
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search deleted CVs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading recycle bin...
            </div>
          ) : cvs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
                <Trash2 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Recycle bin is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Deleted CVs will appear here</p>
            </div>
          ) : (
            <>
              {/* Table — desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-2.5 text-left">CV Name</th>
                      <th className="px-4 py-2.5 text-left">Owner</th>
                      <th className="px-4 py-2.5 text-left">Deleted By</th>
                      <th className="px-4 py-2.5 text-left">Deleted At</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cvs.map((cv) => (
                      <tr key={cv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/8 ring-1 ring-destructive/15">
                              <FileText className="w-4 h-4 text-destructive/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate text-xs">{cv.name}</p>
                              <p className="text-[11px] text-muted-foreground capitalize">{cv.templateId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[140px]">{cv.userDisplayName || cv.userEmail}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{cv.deletedBy}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(cv.deletedAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] px-2 text-accent hover:text-accent hover:bg-accent/5"
                              onClick={() => handleRestore(cv.id)}
                              disabled={restoreId === cv.id}
                            >
                              {restoreId === cv.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              )}
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => void handleDownload(cv)}
                              disabled={downloading === cv.id}
                            >
                              {downloading === cv.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] px-2 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                              onClick={() => setPermanentDelete(cv)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards — mobile */}
              <div className="md:hidden divide-y">
                {cvs.map((cv) => (
                  <div key={cv.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/8 ring-1 ring-destructive/15">
                        <FileText className="w-4 h-4 text-destructive/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{cv.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Owner: {cv.userDisplayName || cv.userEmail}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Deleted by: {cv.deletedBy} · {formatDate(cv.deletedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => handleRestore(cv.id)} disabled={restoreId === cv.id}>
                        {restoreId === cv.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                        Restore
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => void handleDownload(cv)} disabled={downloading === cv.id}>
                        {downloading === cv.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setPermanentDelete(cv)}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation */}
      <Dialog open={!!permanentDelete} onOpenChange={(o) => { if (!o) setPermanentDelete(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              Permanent Delete
            </DialogTitle>
            <DialogDescription className="text-sm">
              This will <span className="font-bold text-foreground">permanently delete</span> <span className="font-semibold text-foreground">"{permanentDelete?.name}"</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPermanentDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handlePermanentDelete} disabled={permanentLoading}>
              {permanentLoading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Permanently</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
};

export default RecycleBin;
