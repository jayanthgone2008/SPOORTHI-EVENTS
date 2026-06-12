import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Trophy, Award, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import StudentQRCode from '@/components/StudentQRCode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

const statusStyles = {
  registered: 'bg-blue-500/10 text-blue-600',
  attended: 'bg-green-500/10 text-green-600',
  absent: 'bg-red-500/10 text-red-600',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const { data: myRegistrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations', user.id],
    queryFn: () => base44.entities.Registration.filter({ created_by_id: user.id }, '-created_date', 50),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['student-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  if (!user) return <Navigate to="/login" replace />;

  const eventMap = Object.fromEntries(events.map(e => [e.id, e]));
  const attended = myRegistrations.filter(r => r.status === 'attended').length;
  const winners = myRegistrations.filter(r => r.is_winner).length;
  const certs = myRegistrations.filter(r => r.certificate_url).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm">Spoorthi</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/events">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1.5">
              Browse Events <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome back, {user.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your event registrations and achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Registered', value: myRegistrations.length, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
            { label: 'Attended', value: attended, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'Awards', value: winners, icon: Trophy, color: 'from-amber-500 to-orange-500' },
            { label: 'Certificates', value: certs, icon: Award, color: 'from-violet-500 to-purple-500' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl border border-border/50 p-4"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Registrations */}
        <div className="bg-card rounded-2xl border border-border/50">
          <div className="p-5 border-b border-border/30 flex items-center justify-between">
            <h2 className="font-display font-semibold">My Registrations</h2>
            <Link to="/event-register">
              <Button size="sm" className="rounded-xl h-8 text-xs bg-gradient-to-r from-primary to-primary/80">
                Register for Event
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : myRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm mb-4">No registrations yet</p>
              <Link to="/events">
                <Button size="sm" variant="outline" className="rounded-xl gap-1.5">
                  Explore Events <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {myRegistrations.map((reg, i) => {
                const event = eventMap[reg.event_id];
                return (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{event?.title || 'Unknown Event'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event?.date} · {event?.venue}
                        </p>
                        <p className="font-mono text-xs text-primary mt-1">{reg.registration_id}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className={`border-0 text-xs ${statusStyles[reg.status] || statusStyles.registered}`}>
                          {reg.status}
                        </Badge>
                        <StudentQRCode registration={reg} eventTitle={event?.title} />
                        {reg.is_winner && (
                          <Badge className="border-0 text-xs bg-amber-500/10 text-amber-600">
                            <Trophy className="w-2.5 h-2.5 mr-1" />
                            {reg.winner_position}
                          </Badge>
                        )}
                        {reg.certificate_url && (
                          <a href={reg.certificate_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="h-7 text-xs rounded-lg gap-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                              <Award className="w-3 h-3" /> View Certificate
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}