import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

const AdminRedirect: React.FC<{ children: React.ReactNode; to?: string }> = ({ children, to = '/admin' }) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
};

export default AdminRedirect;
