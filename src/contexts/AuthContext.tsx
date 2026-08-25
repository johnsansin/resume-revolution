import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, ApiUser } from '@/integrations/api/client';
import type { PersonalInfo } from '@/types/cv';

interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string;
  profileData: Partial<PersonalInfo>;
  isActive: boolean;
  roles: string[];
}

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  updateProfile: (updates: { displayName?: string; avatarUrl?: string; phone?: string; profileData?: Partial<PersonalInfo> }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get<ApiUser & { roles: string[] }>('/auth/me');
      if (!data.isActive) {
        api.setToken(null);
        setUser(null);
        return;
      }
      setUser({
        id: data.id,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        phone: data.phone || '',
        profileData: data.profileData || {},
        isActive: data.isActive,
        roles: data.roles || [],
      });
    } catch {
      api.setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = api.getToken();
      if (token) {
        await fetchProfile();
      }
      setLoading(false);
    };
    init();
  }, [fetchProfile]);

  useEffect(() => {
    const expireSession = () => setUser(null);
    window.addEventListener('auth:expired', expireSession);
    return () => window.removeEventListener('auth:expired', expireSession);
  }, []);

  useEffect(() => {
    if (!user) return;
    const ping = () => { if (document.visibilityState === 'visible') api.put('/presence', {}).catch(() => undefined); };
    ping();
    const timer = window.setInterval(ping, 45000);
    window.addEventListener('focus', ping);
    document.addEventListener('visibilitychange', ping);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', ping);
      document.removeEventListener('visibilitychange', ping);
    };
  }, [user?.id]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const data = await api.post<{ user: ApiUser; token: string }>('/auth/register', {
        email,
        password,
        displayName,
      });
      api.setToken(data.token);
      const u = data.user;
      setUser({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        phone: u.phone || '',
        profileData: u.profileData || {},
        isActive: u.isActive,
        roles: u.roles || ['user'],
      });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post<{ user: ApiUser; token: string }>('/auth/login', {
        email,
        password,
      });
      api.setToken(data.token);
      const u = data.user;
      setUser({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        phone: u.phone || '',
        profileData: u.profileData || {},
        isActive: u.isActive,
        roles: u.roles || [],
      });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = () => {
    api.setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: { displayName?: string; avatarUrl?: string; phone?: string; profileData?: Partial<PersonalInfo> }) => {
    try {
      const data = await api.put<ApiUser>('/auth/profile', updates);
      setUser((prev) => prev ? {
        ...prev,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        phone: data.phone || '',
        profileData: data.profileData || {},
      } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
