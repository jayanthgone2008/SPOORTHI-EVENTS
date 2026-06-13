import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

export default function HeroSection() {
  const { data: events = [] } = useQuery({ queryKey: ['hero-events'], queryFn: () => supabase.from('Event').select('*').order('created_date', { ascending: false }).limit(200), initialData: [] });
  const { data: registrations = [] } = useQuery({ queryKey: ['hero-regs'], queryFn: () => supabase.from('Registration').select('*').order('created_date', { ascending: false }).limit(1000), initialData: [] });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Concert background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=900&fit=crop')" }} />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-transparent to-pink-900/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          
          


          

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.05]">
            <span className="text-white drop-shadow-lg">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-lg">
              Spoorthi
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-orange-200/90 max-w-2xl mx-auto leading-relaxed">INVOKE YOUR STRENGTH-LITERARY CLUB


          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/events">
              <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 shadow-xl shadow-orange-500/30 group text-white border-0">
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/event-register">
              <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm">
                Register Now
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
          
          {[
          { icon: Calendar, label: 'Events', value: events.length },
          { icon: Users, label: 'Registrations', value: registrations.length },
          { icon: Trophy, label: 'Winners', value: registrations.filter((r) => r.is_winner).length }].
          map((stat, i) =>
          <div key={i} className="rounded-2xl p-4 sm:p-5 text-center bg-white/10 backdrop-blur-md border border-white/20">
              <stat.icon className="w-6 h-6 text-orange-300 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-orange-200/70 mt-1">{stat.label}</div>
            </div>
          )}
        </motion.div>
      </div>
    </section>);

}
