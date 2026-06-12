import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const emptySubEvent = { title: '', description: '', rules: '', eligibility: '', date: '', time: '', venue: '', max_participants: '', category: 'technical' };

export default function SubEventManager({ eventId }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptySubEvent);
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const { data: subEvents = [] } = useQuery({
    queryKey: ['sub-events', eventId],
    queryFn: () => base44.entities.SubEvent.filter({ event_id: eventId }),
    enabled: !!eventId,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SubEvent.create({
      ...data,
      event_id: eventId,
      max_participants: data.max_participants ? Number(data.max_participants) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sub-events', eventId] });
      setOpen(false);
      setForm(emptySubEvent);
      toast.success('Sub-event created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubEvent.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sub-events', eventId] });
      toast.success('Sub-event deleted');
    },
  });

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden mt-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
      >
        <span>Sub-Events ({subEvents.length})</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-2">
          {subEvents.map(se => (
            <div key={se.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl text-sm">
              <div>
                <p className="font-medium">{se.title}</p>
                {se.date && <p className="text-xs text-muted-foreground">{se.date} · {se.venue}</p>}
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate(se.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full rounded-xl gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Add Sub-Event
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add Sub-Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Rules</Label>
              <Textarea value={form.rules} onChange={e => setForm({ ...form, rules: e.target.value })} className="rounded-xl" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Eligibility</Label>
              <Input value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Time</Label><Input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5"><Label>Venue</Label><Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Max Participants</Label><Input type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} className="rounded-xl" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['technical','cultural','sports','workshop','seminar','other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl h-10 bg-gradient-to-r from-primary to-primary/80">
              {createMutation.isPending ? 'Creating...' : 'Create Sub-Event'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}