import { useState, useEffect, useCallback } from 'react';
import { api, SavedCV } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { CVData, TemplateId } from '@/types/cv';
import { useToast } from '@/hooks/use-toast';

export const useSavedCVs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSavedCVs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<SavedCV[]>('/cvs');
      setSavedCVs(data);
    } catch (err) {
      toast({
        title: 'Error loading CVs',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchSavedCVs();
    } else {
      setSavedCVs([]);
    }
  }, [user, fetchSavedCVs]);

  const saveCV = async (name: string, cvData: CVData, templateId: TemplateId) => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to save CVs', variant: 'destructive' });
      return null;
    }
    setSaving(true);
    try {
      const data = await api.post<SavedCV>('/cvs', {
        name,
        cvData: JSON.parse(JSON.stringify(cvData)),
        templateId,
      });
      toast({ title: 'CV saved!', description: `"${name}" has been saved to your account` });
      await fetchSavedCVs();
      return data;
    } catch (err) {
      toast({ title: 'Error saving CV', description: (err as Error).message, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateCV = async (id: string, updates: { name?: string; cvData?: CVData; templateId?: TemplateId }) => {
    if (!user) return null;
    setSaving(true);
    try {
      await api.put(`/cvs/${id}`, updates);
      toast({ title: 'CV updated!', description: 'Your changes have been saved' });
      await fetchSavedCVs();
      return true;
    } catch (err) {
      toast({ title: 'Error updating CV', description: (err as Error).message, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const deleteCV = async (id: string) => {
    if (!user) return false;
    try {
      await api.delete(`/cvs/${id}`);
      toast({ title: 'CV deleted', description: 'The CV has been removed from your account' });
      await fetchSavedCVs();
      return true;
    } catch (err) {
      toast({ title: 'Error deleting CV', description: (err as Error).message, variant: 'destructive' });
      return false;
    }
  };

  return {
    savedCVs,
    loading,
    saving,
    saveCV,
    updateCV,
    deleteCV,
    refreshCVs: fetchSavedCVs,
  };
};
