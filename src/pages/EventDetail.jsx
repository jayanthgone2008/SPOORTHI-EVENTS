import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function EventDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = window.location.pathname.split('/events/')[1];

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }),
    select: (data) => data?.[0],
    enabled: !!eventId,
  });

  const { data: subEvents = [] } = useQuery({
    queryKey: ['subevents', eventId],
    queryFn: () => base44.entities.SubEvent.filter({ event_id: eventId }),
    enabled: !!eventId,
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-28 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-28 text-center">
          <p className="text-xl text-muted-foreground">Event not found</p>
          <Link to="/events"><Button className="mt-4 rounded-xl">Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="rounded-3xl overflow-hidden h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8">
            {event.banner_url ? (
              <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <Calendar className="w-16 h-16 text-primary/30" />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {event.category && (
              <Badge className="rounded-full px-3 py-1">{event.category}</Badge>
            )}
            <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="rounded-full px-3 py-1">
              {event.status}
            </Badge>
            {event.registration_open && (
              <Badge className="rounded-full px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                Registrations Open
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
            {event.date && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />{format(new Date(event.date), 'MMMM d, yyyy')}
              </span>
            )}
            {event.time && (
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{event.time}</span>
            )}
            {event.venue && (
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</span>
            )}
            {event.max_participants && (
              <span className="flex items-center gap-2"><Users className="w-4 h-4" />Max {event.max_participants} participants</span>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description || 'More details coming soon...'}
            </p>
          </div>

          {event.registration_open && (
            <Link to={`/event-register?event=${eventId}`}>
              <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-xl shadow-primary/25 mb-10 group">
                Register Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}

          {subEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">Sub Events</h2>
              <div className="grid gap-4">
                {subEvents.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/sub-event/${sub.id}`}>
                      <div className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{sub.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sub.description}</p>
                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                              {sub.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(sub.date), 'MMM d')}</span>}
                              {sub.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{sub.time}</span>}
                              {sub.venue && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{sub.venue}</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}