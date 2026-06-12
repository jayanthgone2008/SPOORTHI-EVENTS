import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Calendar, Trophy, CheckCircle2 } from 'lucide-react';

export default function StatsSection() {
  const { data: events = [] } = useQuery({
    queryKey: ['stats-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 200),
    initialData: []
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['stats-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 1000),
    initialData: []
  });

  const stats = [
  { icon: Calendar, label: 'Total Events', value: events.length, color: 'from-blue-500 to-cyan-600' },
  { icon: Users, label: 'Registrations', value: registrations.length, color: 'from-violet-500 to-purple-600' },
  { icon: CheckCircle2, label: 'Attended', value: registrations.filter((r) => r.status === 'attended').length, color: 'from-emerald-500 to-teal-600' },
  { icon: Trophy, label: 'Winners', value: registrations.filter((r) => r.is_winner).length, color: 'from-amber-500 to-orange-600' }];


  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14">
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold hidden">Live Statistics</h2>
          <p className="text-muted-foreground mt-2 hidden">Real-time numbers from Spoorthi</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl font-display font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}