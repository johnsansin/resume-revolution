import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_MS = 60 * 1000;

const beat = (userId: string) => {
  supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() } as any)
    .eq('id', userId)
    .then(() => {})
    .catch(() => {});
};

export const usePresence = (userId?: string | null) => {
  useEffect(() => {
    if (!userId) return;

    beat(userId);

    const interval = setInterval(() => beat(userId), HEARTBEAT_MS);

    const onVisibility = () => {
      if (!document.hidden) beat(userId);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [userId]);
};
