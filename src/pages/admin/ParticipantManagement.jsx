import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, Download, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParticipantManagement() {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const { data: registrations = [] } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 500),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  const eventMap = {};
  events.forEach(e => { eventMap[e.id] = e; });

  const filtered = registrations.filter(r => {
    const matchSearch = r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
                       r.registration_id?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || r.branch === branchFilter;
    const matchYear = yearFilter === 'all' || r.year === yearFilter;
    return matchSearch && matchBranch && matchYear;
  });

  const exportCSV = () => {
    const headers = ['Reg ID', 'Name', 'Roll No', 'Branch', 'Year', 'Mobile', 'Email', 'Event', 'Status'];
    const rows = filtered.map(r => [
      r.registration_id, r.full_name, r.roll_number, r.branch, r.year, r.mobile, r.email,
      eventMap[r.event_id]?.title || '', r.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
  };

  const branches = [...new Set(registrations.map(r => r.branch).filter(Boolean))];
  const yearsList = [...new Set(registrations.map(r => r.year).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Participants</h1>
          <p className="text-muted-foreground mt-1">{registrations.length} total registrations</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="rounded-xl gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, roll no, reg ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl h-11"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl h-11"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearsList.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reg ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Year</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Event</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg, i) => (
                <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-primary">{reg.registration_id}</td>
                  <td className="py-3 px-4 font-medium">{reg.full_name}</td>
                  <td className="py-3 px-4 font-mono text-xs">{reg.roll_number}</td>
                  <td className="py-3 px-4">{reg.branch}</td>
                  <td className="py-3 px-4">{reg.year}</td>
                  <td className="py-3 px-4 text-xs">{eventMap[reg.event_id]?.title || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={`rounded-full text-xs ${
                      reg.status === 'attended' ? 'bg-green-500/10 text-green-600' :
                      reg.status === 'absent' ? 'bg-red-500/10 text-red-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>{reg.status}</Badge>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No participants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}