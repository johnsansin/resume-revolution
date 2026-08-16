import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, History, MonitorSmartphone, Globe, Download } from 'lucide-react';
import { timeAgo } from '@/lib/presence';

interface LoginRecord {
  id: string;
  user_id: string;
  email: string | null;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  user_agent: string | null;
  logged_in_at: string;
  display_name?: string | null;
}

const AVATAR_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-teal-400 to-emerald-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-sky-600',
  'from-fuchsia-400 to-violet-600',
  'from-lime-400 to-green-600',
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const flag = (cc?: string | null) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
    : '🌐';

const parseDevice = (ua?: string | null) => {
  if (!ua) return 'Unknown device';
  let browser = 'Browser';
  let os = 'OS';
  const b = [
    [/Edg(A|e)?\//, 'Edge'],
    [/OPR\//, 'Opera'],
    [/Chrome\//, 'Chrome'],
    [/Firefox\//, 'Firefox'],
    [/Safari\//, 'Safari'],
  ];
  const o = [
    [/Windows NT/, 'Windows'],
    [/Mac OS X/, 'macOS'],
    [/Android/, 'Android'],
    [/iPhone/, 'iPhone'],
    [/iPad/, 'iPad'],
    [/CrOS/, 'ChromeOS'],
    [/Linux/, 'Linux'],
  ];
  for (const [re, name] of b) if (re.test(ua)) { browser = name; break; }
  for (const [re, name] of o) if (re.test(ua)) { os = name; break; }
  return `${browser} · ${os}`;
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
};

const LoginHistory: React.FC = () => {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(200);

  useEffect(() => {
    const fetchLogins = async () => {
      const [loginRes, profilesRes] = await Promise.all([
        supabase.from('login_history').select('*').order('logged_in_at', { ascending: false }).limit(500),
        supabase.from('profiles').select('id, display_name'),
      ]);
      const nameMap = new Map<string, string | null>();
      (profilesRes.data || []).forEach((p: any) => nameMap.set(p.id, p.display_name));
      setRecords(
        (loginRes.data || []).map((l: any) => ({ ...l, display_name: nameMap.get(l.user_id) || null }))
      );
      setLoading(false);
    };
    fetchLogins();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records.slice(0, limit);
    return records
      .filter((r) =>
        [r.display_name, r.email, r.ip_address, r.country, r.country_code, r.city, r.user_agent].some((v) =>
          (v || '').toLowerCase().includes(q)
        )
      )
      .slice(0, limit);
  }, [records, search, limit]);

  const uniqueUsers = new Set(records.map((r) => r.user_id)).size;
  const uniqueIps = new Set(records.map((r) => r.ip_address).filter(Boolean)).size;

  const exportCsv = () => {
    const header = 'Name,Email,IP Address,Country,City,Device,Logged In At';
    const rows = filtered.map((r) =>
      [
        `"${(r.display_name || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.ip_address || '').replace(/"/g, '""')}"`,
        `"${(r.country || '').replace(/"/g, '""')}"`,
        `"${(r.city || '').replace(/"/g, '""')}"`,
        `"${(r.user_agent || '').replace(/"/g, '""')}"`,
        `"${r.logged_in_at}"`,
      ].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'login-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Login History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {records.length} recorded logins · {uniqueUsers} unique users · {uniqueIps} unique IPs
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap bg-muted/30 border-b border-border px-5">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            Sign-in Activity
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search user, email, IP, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="px-5">User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right pr-5">Login Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((rec) => (
                    <TableRow key={rec.id} className="hover:bg-muted/40">
                      <TableCell className="px-5">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <span
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                              AVATAR_GRADIENTS[hashStr(rec.user_id) % AVATAR_GRADIENTS.length]
                            } flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0`}
                          >
                            {initials(rec.display_name, rec.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {rec.display_name || 'Unnamed'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{rec.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rec.ip_address ? (
                          <span className="font-mono text-xs text-foreground bg-muted rounded-md px-2 py-1">
                            {rec.ip_address}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-base leading-none">{flag(rec.country_code)}</span>
                          <span className="text-foreground">{rec.country || rec.country_code || 'Unknown'}</span>
                          {rec.city && <span className="text-muted-foreground">· {rec.city}</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MonitorSmartphone className="w-4 h-4" />
                          {parseDevice(rec.user_agent)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-sm text-foreground">{formatDateTime(rec.logged_in_at)}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {timeAgo(rec.logged_in_at)}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        {records.length === 0 ? 'No login activity recorded yet' : 'No results match your search'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filtered.length === limit && (
                <div className="flex justify-center py-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 200)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LoginHistory;
