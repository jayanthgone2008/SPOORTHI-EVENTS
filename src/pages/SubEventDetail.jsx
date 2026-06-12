import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, ArrowRight, BookOpen, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function SubEventDetail() {
  const subEventId = window.location.pathname.split('/sub-event/')[1];

  const { data: subEvent, isLoading } = useQuery({
    queryKey: ['subevent', subEventId],
    queryFn: () => base44.entities.SubEvent.filter({ id: subEventId }),
    select: (data) => data?.[0],
    enabled: !!subEventId,
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

  if (!subEvent) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-28 text-center">
          <p className="text-xl text-muted-foreground">Sub-event not found</p>
          <Link to="/events"><Button className="mt-4 rounded-xl">Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link to={`/events/${subEvent.event_id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Event
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {subEvent.category && <Badge className="rounded-full px-3 py-1 mb-4">{subEvent.category}</Badge>}
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">{subEvent.title}</h1>

          <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
            {subEvent.date && <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{format(new Date(subEvent.date), 'MMMM d, yyyy')}</span>}
            {subEvent.time && <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{subEvent.time}</span>}
            {subEvent.venue && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{subEvent.venue}</span>}
            {subEvent.max_participants && <span className="flex items-center gap-2"><Users className="w-4 h-4" />Max {subEvent.max_participants}</span>}
          </div>

          <div className="space-y-6">
            {subEvent.description && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-semibold">Description</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{subEvent.description}</p>
              </div>
            )}

            {subEvent.rules && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-semibold">Rules</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{subEvent.rules}</p>
              </div>
            )}

            {subEvent.eligibility && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-semibold">Eligibility</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{subEvent.eligibility}</p>
              </div>
            )}
          </div>

          <Link to={`/event-register?event=${subEvent.event_id}&sub=${subEventId}`}>
            <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-xl shadow-primary/25 mt-8 group">
              Register Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}