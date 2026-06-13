import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Search, Award, ExternalLink } from 'lucide-react';
import CertificateGenerator from '@/components/admin/CertificateGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CertificateManagement() {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [certUrl, setCertUrl] = useState('');
  const qc = useQueryClient();

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

  const certMutation = useMutation({
    mutationFn: ({ id, url }) => supabase.from('Registration').update({ certificate_url: url }).eq('id', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      setDialogOpen(false);
      toast.success('Certificate assigned');
    },
  });

  const filtered = registrations.filter(r => {
    const matchSearch = r.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || r.event_id === eventFilter;
    return matchSearch && matchEvent && r.status === 'attended';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Certificate Management</h1>
        <p className="text-muted-foreground mt-1">Assign certificates to participants</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border p-5 text-center">
          <div className="text-2xl font-display font-bold">{registrations.filter(r => r.certificate_url).length}</div>
          <div className="text-sm text-muted-foreground">Certificates Issued</div>
        </div>
        <div className="bg-card rounded-2xl border p-5 text-center">
          <div className="text-2xl font-display font-bold">{filtered.filter(r => !r.certificate_url).length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-56 rounded-xl h-11"><SelectValue placeholder="Event" /></SelectTrigger>
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
                {reg.is_winner && <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">🏆 {reg.winner_position}</Badge>}
                {reg.certificate_url && <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">Issued</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{reg.roll_number} • {eventMap[reg.event_id]?.title}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CertificateGenerator registration={reg} eventTitle={eventMap[reg.event_id]?.title} />
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5"
                onClick={() => { setSelected(reg); setCertUrl(reg.certificate_url || ''); setDialogOpen(true); }}
              >
                <Award className="w-3.5 h-3.5" /> {reg.certificate_url ? 'Update URL' : 'Set URL'}
              </Button>
              {reg.certificate_url && (
                <a href={reg.certificate_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-violet-600">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No attended participants found</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">Assign Certificate</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected.full_name} — {eventMap[selected.event_id]?.title}</p>
              <div className="space-y-2">
                <Label>Certificate URL</Label>
                <Input value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
              </div>
              <Button disabled={certMutation.isPending} onClick={() => certMutation.mutate({ id: selected.id, url: certUrl })}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80">
                {certMutation.isPending ? 'Saving...' : 'Save Certificate'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
