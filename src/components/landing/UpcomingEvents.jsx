import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const categoryColors = {
  technical: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  cultural: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  sports: 'bg-green-500/10 text-green-600 dark:text-green-400',
  workshop: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  seminar: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default function UpcomingEvents({ events = [], title = "Upcoming Events" }) {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold">{title}</h2>
          <p className="text-muted-foreground mt-2">Don't miss out on these exciting events</p>
        </div>
        <Link to="/events">
          <Button variant="ghost" className="rounded-xl group hidden sm:flex">
            View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No events to show yet. Check back soon!</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.slice(0, 6).map(event => (
            <motion.div key={event.id} variants={item}>
              <Link to={`/events/${event.id}`}>
                <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                    {event.banner_url ? (
                      <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-12 h-12 text-primary/40" />
                    )}
                    {event.category && (
                      <Badge className={`absolute top-4 left-4 ${categoryColors[event.category]} border-0 font-medium`}>
                        {event.category}
                      </Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description || 'Exciting event coming soon!'}</p>
                    <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
                      {event.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {event.time && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {event.time}
                        </span>
                      )}
                      {event.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}