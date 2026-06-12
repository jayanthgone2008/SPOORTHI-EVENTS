import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import UpcomingEvents from '@/components/landing/UpcomingEvents';
import StatsSection from '@/components/landing/StatsSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => base44.entities.Event.filter({ status: 'upcoming' }, '-created_date', 6),
    initialData: [],
  });

  const { data: ongoingEvents = [] } = useQuery({
    queryKey: ['events', 'ongoing'],
    queryFn: () => base44.entities.Event.filter({ status: 'ongoing' }, '-created_date', 6),
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