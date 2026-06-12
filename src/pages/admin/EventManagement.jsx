import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Calendar, Search, Upload, X } from 'lucide-react';
import SubEventManager from '@/components/admin/SubEventManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const emptyEvent = { title: '', description: '', date: '', time: '', venue: '', category: 'technical', status: 'upcoming', max_participants: '', registration_open: true, is_featured: false, banner_url: '', eligible_years: [], eligible_branches: [] };

const ALL_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ALL_BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSM', 'CSD', 'Other'];

function MultiCheckbox({ label, options, selected, onChange }) {
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  return (
    <div className="space-y-2">
      <Label>{label} <span className="text-xs text-muted-foreground">(leave empty = all allowed)</span></Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${selected.includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

async function uploadBanner(file) {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export default function EventManagement() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadBanner(file);
    setForm(f => ({ ...f, banner_url: url }));
    setUploading(false);
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, max_participants: data.max_participants ? Number(data.max_participants) : undefined };
      if (editing) return base44.entities.Event.update(editing.id, payload);
      return base44.entities.Event.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyEvent);
      toast.success(editing ? 'Event updated' : 'Event created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Event deleted');
    },
  });

  const openEdit = (event) => {
    setEditing(event);
    setForm({ ...emptyEvent, ...event });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyEvent);
    setDialogOpen(true);
  };

  const filtered = events.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage events</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" /> Create Event
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
      </div>

      <div className="grid gap-4">
        {filtered.map((event, i) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold">{event.title}</h3>
                  {event.category && <Badge variant="secondary" className="rounded-full text-xs">{event.category}</Badge>}
                  <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="rounded-full text-xs">{event.status}</Badge>
                  {event.registration_open && <Badge className="bg-green-500/10 text-green-600 border-0 rounded-full text-xs">Open</Badge>}
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  {event.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event.date}</span>}
                  {event.venue && <span>{event.venue}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openEdit(event)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(event.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-card rounded-2xl border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Time</Label><Input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Venue</Label><Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Max Participants</Label><Input type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['technical','cultural','sports','workshop','seminar','other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['upcoming','ongoing','completed','cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Event Poster</Label>
              {form.banner_url ? (
                <div className="relative rounded-xl overflow-hidden border border-border/50 h-32">
                  <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setForm(f => ({ ...f, banner_url: '' }))}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Upload JPG or PNG'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleBannerUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <MultiCheckbox
              label="Eligible Years"
              options={ALL_YEARS}
              selected={form.eligible_years || []}
              onChange={v => setForm({ ...form, eligible_years: v })}
            />
            <MultiCheckbox
              label="Eligible Branches"
              options={ALL_BRANCHES}
              selected={form.eligible_branches || []}
              onChange={v => setForm({ ...form, eligible_branches: v })}
            />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.registration_open} onCheckedChange={v => setForm({ ...form, registration_open: v })} /><Label>Registration Open</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
            </div>
            <Button type="submit" disabled={saveMutation.isPending || uploading} className="w-full rounded-xl h-11 bg-gradient-to-r from-primary to-primary/80">
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
            </Button>
            {editing && <SubEventManager eventId={editing.id} />}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}