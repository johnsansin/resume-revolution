import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      return;
    }
    setIsAdmin(user.roles?.includes('admin') || false);
    setIsModerator(user.roles?.includes('moderator') || false);
  }, [user]);

  return { isAdmin, isModerator, loading: false };
};
