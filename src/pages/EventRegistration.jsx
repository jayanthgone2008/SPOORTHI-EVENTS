import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSM', 'CSD', 'Other'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function EventRegistration() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedEvent = urlParams.get('event') || '';
  const preselectedSub = urlParams.get('sub') || '';

  const [form, setForm] = useState({
    full_name: '', roll_number: '', branch: '', year: '',
    mobile: '', email: '', event_id: preselectedEvent,
    sub_event_ids: preselectedSub ? [preselectedSub] : [],
  });
  const [result, setResult] = useState(null);

  // Pre-fill email from logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setForm(prev => ({ ...prev, email: user.email }));
    }).catch(() => {});
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['events-reg'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Event').select('*').eq('registration_open', true);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const { data: subEvents = [] } = useQuery({
    queryKey: ['subevents-reg', form.event_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('SubEvent').select('*').eq('event_id', form.event_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!form.event_id,
    initialData: [],
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const regId = 'SPR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      const regData = {
        ...data,
        registration_id: regId,
        qr_code_data: JSON.stringify({ reg_id: regId, name: data.full_name, roll: data.roll_number, event: data.event_id }),
        status: 'registered',
      };
      const { data: result, error } = await supabase.from('Registration').insert([regData]).select();
      if (error) throw error;
      return result?.[0];
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => console.error('Registration error:', err),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(form);
  };

  const toggleSubEvent = (subId) => {
    setForm(prev => ({
      ...prev,
      sub_event_ids: prev.sub_event_ids.includes(subId)
        ? prev.sub_event_ids.filter(id => id !== subId)
        : [...prev.sub_event_ids, subId],
    }));
  };

  // Eligibility check
  const selectedEvent = events.find(e => e.id === form.event_id);
  const isIneligible = selectedEvent && form.branch && form.year && (
    (selectedEvent.eligible_branches?.length > 0 && !selectedEvent.eligible_branches.includes(form.branch)) ||
    (selectedEvent.eligible_years?.length > 0 && !selectedEvent.eligible_years.includes(form.year))
  );

  if (result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-3xl border border-border/50 p-8 sm:p-10">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground mb-6">You're all set for the event</p>

            <div className="bg-muted rounded-2xl p-5 mb-6 text-left space-y-2">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Registration ID</span><span className="font-mono font-semibold text-primary">{result.registration_id}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="font-medium">{result.full_name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Roll No</span><span className="font-medium">{result.roll_number}</span></div>
            </div>

            <div className="bg-white dark:bg-muted rounded-2xl p-6 mb-6">
              <p className="text-xs text-muted-foreground mb-3">Your QR Pass</p>
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/30">
                <div className="text-center">
                  <div className="font-mono text-xs text-primary font-bold">{result.registration_id}</div>
                  <p className="text-xs text-muted-foreground mt-1">QR Code</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/student-dashboard" className="flex-1">
                <Button className="w-full rounded-xl">Go to Dashboard</Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">Home</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Event Registration</h1>
          <p className="text-muted-foreground mb-8">Fill in your details to register</p>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <Label>Select Event *</Label>
              <Select value={form.event_id} onValueChange={v => setForm({ ...form, event_id: v, sub_event_ids: [] })}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Choose an event" /></SelectTrigger>
                <SelectContent>
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {subEvents.length > 0 && (
              <div className="space-y-3">
                <Label>Select Sub Events</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subEvents.map(sub => (
                    <label key={sub.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={form.sub_event_ids.includes(sub.id)} onCheckedChange={() => toggleSubEvent(sub.id)} />
                      <span className="text-sm font-medium">{sub.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input required placeholder="John Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Roll Number *</Label>
                <Input required placeholder="21CS001" value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} className="rounded-xl h-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select value={form.branch} onValueChange={v => setForm({ ...form, branch: v })}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>{branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Select value={form.year} onValueChange={v => setForm({ ...form, year: v })}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input required type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input required type="email" placeholder="john@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-xl h-12" />
              </div>
            </div>

            {isIneligible && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                <ShieldX className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Not Eligible</p>
                  <p className="text-xs mt-0.5">
                    This event is restricted to:
                    {selectedEvent.eligible_years?.length > 0 && <> Years: <strong>{selectedEvent.eligible_years.join(', ')}</strong></>}
                    {selectedEvent.eligible_branches?.length > 0 && <> | Branches: <strong>{selectedEvent.eligible_branches.join(', ')}</strong></>}
                  </p>
                </div>
              </div>
            )}

            {registerMutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {registerMutation.error?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={registerMutation.isPending || !form.event_id || !form.branch || !form.year || isIneligible}
              className="w-full rounded-xl h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
            >
              {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
