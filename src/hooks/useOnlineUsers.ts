import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ONLINE_WINDOW_MS } from '@/lib/presence';

const POLL_MS = 30 * 1000;

export const useOnlineUsers = (): Set<string> => {
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    let channel: { unsubscribe: () => void } | null = null;

    const refresh = async () => {
      const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .gte('last_seen_at', since);
      if (!error && mounted) {
        setOnline(new Set((data || []).map((r) => r.id)));
      }
    };

    refresh();
    const interval = setInterval(refresh, POLL_MS);

    channel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refresh())
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel as any);
    };
  }, []);

  return online;
};
