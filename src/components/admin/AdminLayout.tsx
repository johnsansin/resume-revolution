import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Loader2,
  LogOut,
  Settings,
  Menu,
  X,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/cvs', label: 'CVs', icon: FileText },
  { path: '/admin/roles', label: 'Roles', icon: Shield },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/cvs': 'Saved CVs',
  '/admin/roles': 'Role Management',
};

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Superadmin';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1F3A] text-white flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <div>
              <p className="font-bold leading-tight">CV Maker</p>
              <p className="text-[10px] uppercase tracking-widest text-teal-300/80">Admin Console</p>
            </div>
          </Link>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3 pt-3 border-t border-white/10">
          <Link to="/admin/users">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-xs font-bold">
                {initials(displayName, user?.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </Link>
          <Badge className="mt-2 ml-2 bg-teal-500/20 text-teal-300 border-teal-400/30">
            <Shield className="w-3 h-3 mr-1" />
            Superadmin
          </Badge>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="w-full text-slate-200 hover:text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-1.5" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-200 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur border-b border-border flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
            {currentTitle}
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              <Search className="w-3 h-3 mr-1" />
              Superadmin view
            </span>
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <ThemeToggle variant="light" />
            <Link to="/admin">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                {initials(displayName, user?.email)}
              </span>
            </Link>
          </div>
        </header>
        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
