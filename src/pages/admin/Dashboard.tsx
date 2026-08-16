import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
  ArrowRight,
  CalendarDays,
  Crown,
} from 'lucide-react';

interface RecentUser {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
}

interface RecentCv {
  id: string;
  name: string;
  template_id: string;
  created_at: string;
  user_email: string;
  full_name: string;
}

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, cvs: 0, admins: 0, recentCVs: 0, active: 0, inactive: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCvs, setRecentCvs] = useState<RecentCv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [profilesRes, cvsRes, rolesRes, recentRes, activeRes, inactiveRes, recentProfiles, recentCvsRes, adminsRes] =
        await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('saved_cvs').select('id', { count: 'exact', head: true }),
          supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
          supabase.from('saved_cvs').select('id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', false),
          supabase.from('profiles').select('id, email, display_name, created_at, is_active').order('created_at', { ascending: false }).limit(6),
          supabase.from('saved_cvs').select('id, name, template_id, created_at, user_id, cv_data').order('updated_at', { ascending: false }).limit(6),
          supabase.from('user_roles').select('user_id').eq('role', 'admin'),
        ]);

      setStats({
        users: profilesRes.count ?? 0,
        cvs: cvsRes.count ?? 0,
        admins: rolesRes.count ?? 0,
        recentCVs: recentRes.count ?? 0,
        active: activeRes.count ?? 0,
        inactive: inactiveRes.count ?? 0,
      });

      const adminIds = new Set((adminsRes.data || []).map((r: any) => r.user_id));
      setRecentUsers(
        (recentProfiles.data || []).map((p: any) => ({
          ...p,
          is_active: p.is_active !== false,
          is_admin: adminIds.has(p.id),
        }))
      );

      const userIds = [...new Set((recentCvsRes.data || []).map((c: any) => c.user_id))];
      const { data: cvProfiles } = userIds.length
        ? await supabase.from('profiles').select('id, email, display_name').in('id', userIds)
        : { data: [] };
      const emailMap = new Map<string, string>();
      (cvProfiles || []).forEach((p: any) => emailMap.set(p.id, p.email || ''));

      setRecentCvs(
        (recentCvsRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.name || 'Untitled CV',
          template_id: c.template_id,
          created_at: c.created_at,
          user_email: emailMap.get(c.user_id) || 'Unknown',
          full_name: c.cv_data?.personal?.fullName || '',
        }))
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const adminName = profile?.display_name || 'Superadmin';

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, grad: 'from-sky-500 to-blue-600' },
    { label: 'Active Candidates', value: stats.active, icon: UserCheck, grad: 'from-emerald-400 to-emerald-600' },
    { label: 'Deactivated', value: stats.inactive, icon: UserX, grad: 'from-rose-400 to-rose-600' },
    { label: 'Total CVs', value: stats.cvs, icon: FileText, grad: 'from-violet-500 to-purple-600' },
    { label: 'Superadmins', value: stats.admins, icon: Shield, grad: 'from-amber-400 to-orange-500' },
    { label: 'CVs (7 days)', value: stats.recentCVs, icon: TrendingUp, grad: 'from-teal-400 to-cyan-500' },
  ];

  return (
    <AdminLayout>
      {/* Greeting */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Crown className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-foreground">{greeting}, {adminName}</h2>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" />
          {today}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
              <Card
                key={card.label}
                className="group p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                  </div>
                  <span
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <card.icon className="w-6 h-6 text-white" />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent signups */}
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Users className="w-[18px] h-[18px] text-teal-600" />
                  Recent Signups
                </h3>
                <Link to="/admin/users" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No users yet</p>
                )}
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {initials(u.display_name, u.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                        {u.display_name || 'Unnamed'}
                        {u.is_admin && (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                            <Shield className="w-3 h-3 mr-1" /> Admin
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {u.is_active ? (
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-rose-500/15 text-rose-600 border-rose-500/30">
                          Inactive
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent CVs */}
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-[18px] h-[18px] text-violet-600" />
                  Recently Saved CVs
                </h3>
                <Link to="/admin/cvs" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentCvs.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No CVs yet</p>
                )}
                {recentCvs.map((cv) => (
                  <div key={cv.id} className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-violet-500/15 text-violet-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{cv.full_name || cv.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{cv.user_email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-muted-foreground capitalize">{cv.template_id}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(cv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick actions */}
          <Card className="p-5 border-border bg-gradient-to-br from-[#0B1F3A] to-[#16335a] text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg">Quick Actions</h3>
                <p className="text-sm text-slate-300">Manage candidates, review saved CVs, and control access roles.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/admin/users">
                  <Button className="bg-teal-500 hover:bg-teal-400 text-white">
                    <Users className="w-4 h-4 mr-2" /> Manage Users
                  </Button>
                </Link>
                <Link to="/admin/cvs">
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                    <FileText className="w-4 h-4 mr-2" /> Review CVs
                  </Button>
                </Link>
                <Link to="/admin/roles">
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                    <Shield className="w-4 h-4 mr-2" /> Roles
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
