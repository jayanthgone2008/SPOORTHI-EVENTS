import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(258,65%,55%)', 'hsl(35,95%,55%)', 'hsl(170,60%,45%)', 'hsl(340,70%,55%)', 'hsl(200,70%,50%)', 'hsl(120,50%,45%)', 'hsl(280,60%,50%)', 'hsl(20,80%,55%)'];

export default function Analytics() {
  const { data: registrations = [] } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: () => supabase.from('Registration').select('*').order('created_date', { ascending: false }).limit(500),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => supabase.from('Event').select('*').order('created_date', { ascending: false }).limit(100),
    initialData: [],
  });

  const eventMap = {};
  events.forEach(e => { eventMap[e.id] = e; });

  // Department data
  const deptData = {};
  registrations.forEach(r => { if (r.branch) deptData[r.branch] = (deptData[r.branch] || 0) + 1; });
  const deptChartData = Object.entries(deptData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Year data
  const yearData = {};
  registrations.forEach(r => { if (r.year) yearData[r.year] = (yearData[r.year] || 0) + 1; });
  const yearChartData = Object.entries(yearData).map(([name, value]) => ({ name, value }));

  // Event popularity
  const eventPopularity = {};
  registrations.forEach(r => {
    const title = eventMap[r.event_id]?.title || 'Unknown';
    eventPopularity[title] = (eventPopularity[title] || 0) + 1;
  });
  const eventChartData = Object.entries(eventPopularity).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  // Status breakdown
  const statusData = {};
  registrations.forEach(r => { statusData[r.status || 'registered'] = (statusData[r.status || 'registered'] || 0) + 1; });
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const attended = registrations.filter(r => r.status === 'attended').length;
  const totalRegs = registrations.length;
  const attendanceRate = totalRegs > 0 ? Math.round((attended / totalRegs) * 100) : 0;

  const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: '13px' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Detailed insights and reports</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', value: totalRegs, color: 'from-violet-500 to-purple-600' },
          { label: 'Events', value: events.length, color: 'from-blue-500 to-cyan-600' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'from-green-500 to-emerald-600' },
          { label: 'Winners', value: registrations.filter(r => r.is_winner).length, color: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border p-5">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${s.color} mb-3`} />
            <div className="text-2xl font-display font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-display font-semibold mb-4">Department-wise Participation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {deptChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-display font-semibold mb-4">Year-wise Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={yearChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {yearChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-display font-semibold mb-4">Popular Events</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="hsl(258,65%,55%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-display font-semibold mb-4">Attendance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
