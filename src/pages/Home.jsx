import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import UpcomingEvents from '@/components/landing/UpcomingEvents';
import StatsSection from '@/components/landing/StatsSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Event').select('*').eq('status', 'upcoming').order('created_date', { ascending: false }).limit(6);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const { data: ongoingEvents = [] } = useQuery({
    queryKey: ['events', 'ongoing'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Event').select('*').eq('status', 'ongoing').order('created_date', { ascending: false }).limit(6);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const allActiveEvents = [...ongoingEvents, ...upcomingEvents];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      {allActiveEvents.length > 0 && (
        <UpcomingEvents events={allActiveEvents} title="Upcoming Events" />
      )}
      <StatsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
