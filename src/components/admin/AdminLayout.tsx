import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/integrations/api/client';
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
  History,
  Trash2,
  MessagesSquare,
  Bell,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminNotice {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/login-history', label: 'Login History', icon: History },
  { path: '/admin/cvs', label: 'CVs', icon: FileText },
  { path: '/admin/roles', label: 'Roles', icon: Shield },
  { path: '/admin/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
  { path: '/admin/support', label: 'Support Inbox', icon: MessagesSquare },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/login-history': 'Login History',
  '/admin/cvs': 'Saved CVs',
  '/admin/roles': 'Role Management',
  '/admin/recycle-bin': 'Recycle Bin',
  '/admin/support': 'Support Inbox',
  '/admin/settings': 'Settings',
};

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalQuery,setGlobalQuery]=useState('');
  const [searchResults,setSearchResults]=useState<any[]>([]);
  const [unread,setUnread]=useState(0);
  const [notices,setNotices]=useState<AdminNotice[]>([]);
  const [noticesOpen,setNoticesOpen]=useState(false);

  const loadNotices=()=>api.get<{notifications:AdminNotice[];unread:number}>('/notifications').then(r=>{setNotices(r.notifications);setUnread(r.unread)}).catch(()=>undefined);
  const markAllNotices=async()=>{const now=new Date().toISOString();setUnread(0);setNotices((items)=>items.map((item)=>({...item,readAt:item.readAt||now})));try{await api.put('/notifications/read-all');}catch{await loadNotices();}};
  useEffect(()=>{let active=true;const load=()=>api.get<{notifications:AdminNotice[];unread:number}>('/notifications').then(r=>{if(active){setNotices(r.notifications);setUnread(r.unread)}}).catch(()=>undefined);load();const timer=window.setInterval(load,15000);return()=>{active=false;window.clearInterval(timer)};},[]);
  useEffect(()=>{const timer=window.setTimeout(()=>{if(globalQuery.trim().length<2){setSearchResults([]);return;}api.get<{results:any[]}>(`/admin/search?q=${encodeURIComponent(globalQuery.trim())}`).then(r=>setSearchResults(r.results)).catch(()=>setSearchResults([]));},250);return()=>window.clearTimeout(timer);},[globalQuery]);

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
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Superadmin';

  return (
    <div className="admin-shell min-h-screen bg-background dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b" style={{ borderColor: 'hsl(var(--sidebar-hover))' }}>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="relative w-9 h-9 overflow-hidden rounded-lg bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              <span className="relative text-white font-bold text-xs">CV</span>
            </div>
            <div>
              <p className="font-bold leading-tight">CareerCanvas</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'hsl(var(--sidebar-active))' }}>Admin Console</p>
            </div>
          </Link>
          <button className="lg:hidden opacity-60 hover:opacity-100 transition-opacity" onClick={() => setSidebarOpen(false)}>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-inner'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'hsl(var(--sidebar-active) / 0.15)' : undefined,
                color: isActive ? 'white' : 'hsl(var(--sidebar-fg))',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('shadow-inner')) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-hover))';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('shadow-inner')) {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3 pt-3 border-t" style={{ borderColor: 'hsl(var(--sidebar-hover))' }}>
          <Link to="/admin/users">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors" style={{ color: 'hsl(var(--sidebar-fg))' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/25">
                {initials(displayName, user?.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-fg) / 0.6)' }}>{user?.email}</p>
              </div>
            </div>
          </Link>
          <Badge className="mt-2 ml-2 border-0 text-xs" style={{ backgroundColor: 'hsl(var(--sidebar-active) / 0.2)', color: 'hsl(var(--sidebar-active))' }}>
            <Shield className="w-3 h-3 mr-1" />
            Superadmin
          </Badge>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/admin/settings">
              <Button variant="ghost" size="sm" className="w-full hover:bg-white/10" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                <Settings className="w-4 h-4 mr-1.5" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full hover:bg-rose-500/10 hover:text-rose-300"
              style={{ color: 'hsl(var(--sidebar-fg))' }}
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
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:gap-3 sm:px-4 lg:gap-4 lg:px-8">
          <button className="lg:hidden text-slate-700 dark:text-slate-300" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="hidden min-w-0 font-bold text-lg text-slate-900 dark:text-white items-center gap-2 sm:flex">
            {currentTitle}
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-0.5">
              <Search className="w-3 h-3 mr-1" />
              Superadmin view
            </span>
          </h1>
          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
            <div className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder="Global search…" className="w-36 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900 sm:w-64 lg:w-72" />
              {globalQuery.trim().length>=2&&<div className="fixed left-3 right-3 top-16 max-h-80 overflow-auto rounded-xl border bg-white p-2 shadow-xl z-50 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-96">{searchResults.length?searchResults.map((result,index)=><button key={`${result.type}-${index}`} onClick={()=>{navigate(result.link);setGlobalQuery('');setSearchResults([]);}} className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"><span className="text-[10px] uppercase tracking-wide text-blue-600">{result.type}</span><b className="block text-sm truncate">{result.title}</b><span className="block text-xs text-slate-500 truncate">{result.subtitle}</span></button>):<p className="p-4 text-sm text-slate-500">No matching records</p>}</div>}
            </div>
            <div className="relative">
              <button onClick={()=>setNoticesOpen((open)=>!open)} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300" aria-label={`${unread} unread notifications`}>
                <Bell className="w-4 h-4" />{unread>0&&<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread>99?'99+':unread}</span>}
              </button>
              {noticesOpen&&<div className="fixed left-3 right-3 top-16 z-50 max-h-[420px] overflow-hidden rounded-2xl border bg-card shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-96">
                <div className="flex items-center justify-between border-b px-4 py-3"><div><b className="text-sm">Notifications</b><p className="text-[10px] text-muted-foreground">{unread} unread</p></div>{unread>0&&<button className="text-[11px] font-bold text-blue-600" onClick={()=>void markAllNotices()}>Mark all read</button>}</div>
                <div className="max-h-80 overflow-y-auto p-2">{notices.length===0?<p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>:notices.map((notice)=><button key={notice.id} onClick={async()=>{if(!notice.readAt){const now=new Date().toISOString();setNotices((items)=>items.map((item)=>item.id===notice.id?{...item,readAt:now}:item));setUnread((count)=>Math.max(0,count-1));await api.put(`/notifications/${notice.id}`);}setNoticesOpen(false);if(notice.link)navigate(notice.link);}} className={`mb-1 flex w-full gap-3 rounded-xl p-3 text-left hover:bg-muted ${!notice.readAt?'bg-blue-50/70 dark:bg-blue-950/20':''}`}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.readAt?'bg-slate-300':'bg-blue-500'}`}/><span className="min-w-0"><b className="block text-xs">{notice.title}</b>{notice.body&&<span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{notice.body}</span>}<small className="mt-1 block text-[9px] text-muted-foreground">{new Date(notice.createdAt).toLocaleString()}</small></span></button>)}</div>
              </div>}
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <ThemeToggle variant="light" />
            <Link to="/admin">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/25">
                {initials(displayName, user?.email)}
              </span>
            </Link>
          </div>
        </header>
        <main className="px-4 lg:px-8 py-6 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
