import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Search, Filter, LayoutGrid, CalendarDays } from 'lucide-react';
import EventCalendarView from '@/components/events/EventCalendarView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const categoryColors = {
  technical: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  cultural: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  sports: 'bg-green-500/10 text-green-600 dark:text-green-400',
  workshop: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  seminar: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('grid');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Event').select('*').order('created_date', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const filtered = events.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || e.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-display font-bold">All Events</h1>
          <p className="text-muted-foreground mt-2">Discover and participate in exciting events</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl h-12"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-xl overflow-hidden h-12 flex-shrink-0">
            <button onClick={() => setView('grid')} className={`px-4 flex items-center gap-1.5 text-sm transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button onClick={() => setView('calendar')} className={`px-4 flex items-center gap-1.5 text-sm transition-colors ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <EventCalendarView events={filtered} />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-card rounded-2xl border animate-pulse h-72" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/events/${event.id}`}>
                  <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                      {event.banner_url ? (
                        <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <Calendar className="w-12 h-12 text-primary/40" />
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {event.category && (
                          <Badge className={`${categoryColors[event.category]} border-0 font-medium`}>
                            {event.category}
                          </Badge>
                        )}
                        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="border-0">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
                        {event.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />{event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) }
      </div>
      <Footer />
    </div>
  );
}
