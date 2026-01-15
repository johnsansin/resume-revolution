import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CVData, TemplateId } from '@/types/cv';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface SavedCV {
  id: string;
  name: string;
  cv_data: CVData;
  template_id: TemplateId;
  created_at: string;
  updated_at: string;
}

export const useSavedCVs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSavedCVs = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_cvs')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'Error loading CVs',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSavedCVs((data || []).map(cv => ({
        ...cv,
        cv_data: cv.cv_data as unknown as CVData,
        template_id: cv.template_id as TemplateId,
      })));
    }
    setLoading(false);
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
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to save CVs',
        variant: 'destructive',
      });
      return null;
    }

    setSaving(true);
    
    const { data, error } = await supabase
      .from('saved_cvs')
      .insert([{
        user_id: user.id,
        name,
        cv_data: JSON.parse(JSON.stringify(cvData)) as Json,
        template_id: templateId,
      }])
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast({
        title: 'Error saving CV',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'CV saved!',
      description: `"${name}" has been saved to your account`,
    });

    await fetchSavedCVs();
    return data;
  };

  const updateCV = async (id: string, updates: { name?: string; cv_data?: CVData; template_id?: TemplateId }) => {
    if (!user) return null;

    setSaving(true);
    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.cv_data) updateData.cv_data = updates.cv_data;
    if (updates.template_id) updateData.template_id = updates.template_id;

    const { error } = await supabase
      .from('saved_cvs')
      .update(updateData)
      .eq('id', id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Error updating CV',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'CV updated!',
      description: 'Your changes have been saved',
    });

    await fetchSavedCVs();
    return true;
  };

  const deleteCV = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('saved_cvs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting CV',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'CV deleted',
      description: 'The CV has been removed from your account',
    });

    await fetchSavedCVs();
    return true;
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
