import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle2, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(258,65%,55%)', 'hsl(35,95%,55%)', 'hsl(170,60%,45%)', 'hsl(340,70%,55%)', 'hsl(200,70%,50%)', 'hsl(120,50%,45%)'];

export default function Overview() {
  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 500),
    initialData: [],
  });

  const attended = registrations.filter(r => r.status === 'attended').length;
  const winners = registrations.filter(r => r.is_winner).length;
  const attendanceRate = registrations.length > 0 ? Math.round((attended / registrations.length) * 100) : 0;

  // Department-wise data
  const deptData = {};
  registrations.forEach(r => {
    if (r.branch) deptData[r.branch] = (deptData[r.branch] || 0) + 1;
  });
  const deptChartData = Object.entries(deptData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Year-wise data
  const yearData = {};
  registrations.forEach(r => {
    if (r.year) yearData[r.year] = (yearData[r.year] || 0) + 1;
  });
  const yearChartData = Object.entries(yearData).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Registrations', value: registrations.length, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Total Events', value: events.length, icon: Calendar, color: 'from-blue-500 to-cyan-600' },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Winners', value: winners, icon: Trophy, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to Spoorthi Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>

            </div>
            <div className="mt-4">
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Department-wise Participation</h3>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="value" fill="hsl(258,65%,55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Year-wise Distribution</h3>
          {yearChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={yearChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {yearChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Recent Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 5).map(reg => (
                <tr key={reg.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{reg.full_name}</td>
                  <td className="py-3 px-4 font-mono text-xs">{reg.roll_number}</td>
                  <td className="py-3 px-4">{reg.branch}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'attended' ? 'bg-green-500/10 text-green-600' :
                      reg.status === 'absent' ? 'bg-red-500/10 text-red-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>{reg.status}</span>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No registrations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}