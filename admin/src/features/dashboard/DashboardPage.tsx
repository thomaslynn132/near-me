import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, MessageSquare, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  reportedUsers: number;
  onlineUsers: number;
  recentSignups: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: Activity, color: 'text-green-400' },
    { title: 'Online Now', value: stats?.onlineUsers || 0, icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Total Matches', value: stats?.totalMatches || 0, icon: Heart, color: 'text-pink-400' },
    { title: 'Messages Sent', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-purple-400' },
    { title: 'Reports', value: stats?.reportedUsers || 0, icon: AlertTriangle, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant="success">System Online</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full bg-slate-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>User Signups (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.recentSignups || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/users" className="block p-4 rounded-lg bg-surface-light hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-slate-400">View and edit user accounts</p>
                </div>
              </div>
            </a>
            <a href="/admin/matches" className="block p-4 rounded-lg bg-surface-light hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="font-medium">View Matches</p>
                  <p className="text-sm text-slate-400">Monitor match statistics</p>
                </div>
              </div>
            </a>
            <a href="/admin/reports" className="block p-4 rounded-lg bg-surface-light hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="font-medium">Review Reports</p>
                  <p className="text-sm text-slate-400">{stats?.reportedUsers || 0} pending reports</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
