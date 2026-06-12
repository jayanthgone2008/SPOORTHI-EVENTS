import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AttendanceManagement() {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const qc = useQueryClient();

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

  const markMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Registration.update(id, { status, attendance_marked: status === 'attended' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Attendance updated');
    },
  });

  const filtered = registrations.filter(r => {
    const matchSearch = r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
                       r.registration_id?.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || r.event_id === eventFilter;
    return matchSearch && matchEvent;
  });

  const attended = filtered.filter(r => r.status === 'attended').length;
  const rate = filtered.length > 0 ? Math.round((attended / filtered.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Mark and track attendance for events</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border p-5 text-center">
          <div className="text-2xl font-display font-bold">{filtered.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-card rounded-2xl border p-5 text-center">
          <div className="text-2xl font-display font-bold text-green-600">{attended}</div>
          <div className="text-sm text-muted-foreground">Present</div>
        </div>
        <div className="bg-card rounded-2xl border p-5 text-center">
          <div className="text-2xl font-display font-bold text-primary">{rate}%</div>
          <div className="text-sm text-muted-foreground">Rate</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search participant..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-56 rounded-xl h-11"><SelectValue placeholder="Filter by event" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(reg => (
          <div key={reg.id} className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{reg.full_name}</span>
                <span className="font-mono text-xs text-muted-foreground">{reg.registration_id}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {reg.roll_number} • {reg.branch} • {eventMap[reg.event_id]?.title}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={reg.status === 'attended' ? 'default' : 'outline'}
                className="rounded-xl gap-1.5"
                onClick={() => markMutation.mutate({ id: reg.id, status: 'attended' })}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Present
              </Button>
              <Button
                size="sm"
                variant={reg.status === 'absent' ? 'destructive' : 'outline'}
                className="rounded-xl gap-1.5"
                onClick={() => markMutation.mutate({ id: reg.id, status: 'absent' })}
              >
                <XCircle className="w-3.5 h-3.5" /> Absent
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No participants to show</p>
          </div>
        )}
      </div>
    </div>
  );
}