import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl font-display font-bold">Get in Touch</h2>
        <p className="text-muted-foreground mt-2">Have questions? We'd love to hear from you.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {[
            { icon: Mail, label: 'Email', value: 'spoorthi@college.edu', href: 'mailto:spoorthi@college.edu' },
            { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
            { icon: MapPin, label: 'Address', value: 'College Campus, Main Auditorium' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-medium hover:text-primary transition-colors">{item.value}</a>
                ) : (
                  <p className="font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 space-y-4"
        >
          <Input
            placeholder="Your Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="rounded-xl h-12"
            required
          />
          <Input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="rounded-xl h-12"
            required
          />
          <Textarea
            placeholder="Your Message"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="rounded-xl min-h-[120px]"
            required
          />
          <Button type="submit" size="lg" className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-primary/80">
            <Send className="w-4 h-4 mr-2" /> Send Message
          </Button>
        </motion.form>
      </div>
    </section>
  );
}