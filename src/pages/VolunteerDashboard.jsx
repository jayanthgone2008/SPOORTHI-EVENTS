import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, QrCode, CheckCircle2, XCircle, Users, Sparkles, LogOut, Filter } from 'lucide-react';
import QRCameraScanner from '@/components/volunteer/QRCameraScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { canScanAttendance } from '@/lib/roles';

export default function VolunteerDashboard() {
  const [scanInput, setScanInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [scannedResult, setScannedResult] = useState(null);
  const qc = useQueryClient();
  const { user, logout } = useAuth();


  const { data: registrations = [] } = useQuery({
    queryKey: ['vol-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 1000),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['vol-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  const markMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.Registration.update(id, { status, attendance_marked: status === 'attended' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vol-registrations'] });
      toast.success('Attendance updated');
    },
  });

  const eventMap = Object.fromEntries(events.map(e => [e.id, e]));

  if (!canScanAttendance(user)) return <Navigate to="/" replace />;

  const handleScan = () => {
    if (!scanInput.trim()) return;
    let regId = scanInput.trim();
    try {
      const parsed = JSON.parse(regId);
      regId = parsed.reg_id || regId;
    } catch {}
    const found = registrations.find(
      r => r.registration_id === regId || r.roll_number === regId
    );
    if (found) {
      setScannedResult(found);
      setScanInput('');
    } else {
      toast.error('No registration found for: ' + regId);
      setScannedResult(null);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesEvent = filterEvent === 'all' || r.event_id === filterEvent;
    const matchesSearch = !search ||
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_id?.toLowerCase().includes(search.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const attended = filteredRegistrations.filter(r => r.status === 'attended').length;
  const total = filteredRegistrations.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Spoorthi</span>
            <span className="ml-2 text-xs text-muted-foreground">Volunteer Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.full_name}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <div className="text-2xl font-display font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Registered</div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <div className="text-2xl font-display font-bold text-green-600">{attended}</div>
            <div className="text-xs text-muted-foreground">Present</div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <div className="text-2xl font-display font-bold text-primary">
              {total > 0 ? Math.round((attended / total) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </div>

        {/* Event filter */}
        {events.length > 0 && (
          <Select value={filterEvent} onValueChange={setFilterEvent}>
            <SelectTrigger className="rounded-xl h-11">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* QR Scanner */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h2 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> QR Scanner / Manual Lookup
          </h2>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter Registration ID or roll number..."
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              className="rounded-xl h-12"
            />
            <Button
              onClick={handleScan}
              className="rounded-xl h-12 px-5 bg-gradient-to-r from-primary to-primary/80 flex-shrink-0"
            >
              Verify
            </Button>
          </div>
          <QRCameraScanner onScan={(text) => {
            let regId = text.trim();
            try { const p = JSON.parse(regId); regId = p.reg_id || regId; } catch {}
            const found = registrations.find(r => r.registration_id === regId || r.roll_number === regId);
            if (found) { setScannedResult(found); }
            else { toast.error('No registration found for: ' + regId); setScannedResult(null); }
          }} />

          {scannedResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-border/50 p-4 bg-muted/40"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-base">{scannedResult.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {scannedResult.roll_number} · {scannedResult.branch} · {scannedResult.year}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {eventMap[scannedResult.event_id]?.title || 'Unknown event'}
                  </p>
                  <p className="text-xs font-mono text-primary mt-1">{scannedResult.registration_id}</p>
                </div>
                <Badge
                  className={`border-0 ${
                    scannedResult.status === 'attended'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {scannedResult.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 rounded-xl gap-1.5 h-10 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    markMutation.mutate({ id: scannedResult.id, status: 'attended' });
                    setScannedResult(null);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Present
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-1.5 h-10"
                  onClick={() => {
                    markMutation.mutate({ id: scannedResult.id, status: 'absent' });
                    setScannedResult(null);
                  }}
                >
                  <XCircle className="w-4 h-4" /> Mark Absent
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Participant Search List */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h2 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Participant Search
          </h2>
          <Input
            placeholder="Search by name, roll no, or registration ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl h-11 mb-3"
          />
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {registrations.length === 0 ? 'No registrations yet' : 'No results found'}
                </p>
              </div>
            ) : (
              filteredRegistrations.slice(0, 20).map(r => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.roll_number} · {r.branch} · {eventMap[r.event_id]?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <Badge
                      className={`border-0 text-xs ${
                        r.status === 'attended'
                          ? 'bg-green-500/10 text-green-600'
                          : r.status === 'absent'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {r.status}
                    </Badge>
                    <Button
                      size="sm"
                      className="rounded-lg h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                      onClick={() => markMutation.mutate({ id: r.id, status: 'attended' })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-7 w-7 p-0"
                      onClick={() => markMutation.mutate({ id: r.id, status: 'absent' })}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}