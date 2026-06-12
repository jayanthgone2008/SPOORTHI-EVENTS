import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    title: 'Technical Symposium',
    subtitle: 'Code, Build, Innovate',
    gradient: 'from-violet-600 to-indigo-600',
    icon: '💻',
  },
  {
    title: 'Cultural Fest',
    subtitle: 'Dance, Music, Drama',
    gradient: 'from-pink-600 to-rose-600',
    icon: '🎭',
  },
  {
    title: 'Sports Meet',
    subtitle: 'Compete, Win, Celebrate',
    gradient: 'from-emerald-600 to-teal-600',
    icon: '🏆',
  },
];

export default function EventBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl h-64 sm:h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${banners[current].gradient} flex items-center justify-center text-white`}
          >
            <div className="text-center">
              <div className="text-5xl sm:text-6xl mb-4">{banners[current].icon}</div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold">{banners[current].title}</h2>
              <p className="text-lg sm:text-xl mt-2 opacity-90">{banners[current].subtitle}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
          <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30 text-white h-10 w-10"
            onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30 text-white h-10 w-10"
            onClick={() => setCurrent(p => (p + 1) % banners.length)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}