import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function WinnerManagement() {
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

  const winnerMutation = useMutation({
    mutationFn: ({ id, position }) => base44.entities.Registration.update(id, {
      is_winner: !!position,
      winner_position: position || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Winner updated');
    },
  });

  const filtered = registrations.filter(r => {
    const matchSearch = r.full_name?.toLowerCase().includes(search.toLowerCase()) || r.roll_number?.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || r.event_id === eventFilter;
    return matchSearch && matchEvent;
  });

  const winners = filtered.filter(r => r.is_winner);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Winner Management</h1>
        <p className="text-muted-foreground mt-1">Declare and manage event winners</p>
      </div>

      {winners.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Declared Winners</h3>
          <div className="grid gap-3">
            {winners.map(w => (
              <div key={w.id} className="bg-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{w.full_name}</span>
                    <Badge className="bg-amber-500/10 text-amber-600 border-0">{w.winner_position}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{eventMap[w.event_id]?.title} • {w.branch}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => winnerMutation.mutate({ id: w.id, position: null })}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {filtered.filter(r => !r.is_winner).map(reg => (
          <div key={reg.id} className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-medium">{reg.full_name}</span>
              <div className="text-sm text-muted-foreground">{reg.roll_number} • {reg.branch} • {eventMap[reg.event_id]?.title}</div>
            </div>
            <div className="flex gap-2">
              {['1st', '2nd', '3rd', 'special'].map(pos => (
                <Button key={pos} size="sm" variant="outline" className="rounded-xl text-xs"
                  onClick={() => winnerMutation.mutate({ id: reg.id, position: pos })}>
                  {pos === 'special' ? '⭐' : pos === '1st' ? '🥇' : pos === '2nd' ? '🥈' : '🥉'} {pos}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {filtered.filter(r => !r.is_winner).length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No participants to show</p>
          </div>
        )}
      </div>
    </div>
  );
}