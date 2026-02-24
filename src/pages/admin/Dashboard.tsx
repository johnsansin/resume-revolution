import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Shield, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, cvs: 0, admins: 0, recentCVs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, cvsRes, rolesRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('saved_cvs').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('saved_cvs').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      ]);

      setStats({
        users: profilesRes.count ?? 0,
        cvs: cvsRes.count ?? 0,
        admins: rolesRes.count ?? 0,
        recentCVs: recentRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-accent' },
    { label: 'Total CVs', value: stats.cvs, icon: FileText, color: 'text-primary' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-destructive' },
    { label: 'CVs (7 days)', value: stats.recentCVs, icon: TrendingUp, color: 'text-accent' },
  ];

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
