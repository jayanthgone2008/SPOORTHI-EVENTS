import { motion } from 'framer-motion';
import { Mail, Phone, User } from 'lucide-react';

export default function CoordinatorsSection({ coordinators = [] }) {
  const faculty = coordinators.filter(c => c.role === 'faculty');
  const students = coordinators.filter(c => c.role === 'student');

  const PersonCard = ({ person }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border/50 p-6 text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-primary/50" />
        )}
      </div>
      <h3 className="font-display font-semibold text-lg">{person.name}</h3>
      {person.designation && <p className="text-sm text-muted-foreground mt-1">{person.designation}</p>}
      {person.department && <p className="text-xs text-muted-foreground">{person.department}</p>}
      <div className="flex items-center justify-center gap-3 mt-4">
        {person.email && (
          <a href={`mailto:${person.email}`} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Mail className="w-4 h-4 text-primary" />
          </a>
        )}
        {person.phone && (
          <a href={`tel:${person.phone}`} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Phone className="w-4 h-4 text-primary" />
          </a>
        )}
      </div>
    </motion.div>
  );

  if (coordinators.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-4">Our Team</h2>
        <p className="text-muted-foreground text-center mb-10">The people behind Spoorthi</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Dr. Faculty Name', role: 'faculty', designation: 'HOD, CSE', department: 'Computer Science' },
            { name: 'Prof. Faculty Name', role: 'faculty', designation: 'Faculty Advisor', department: 'ECE' },
            { name: 'Student Lead', role: 'student', designation: 'President', department: 'CSE' },
            { name: 'Student Coordinator', role: 'student', designation: 'Vice President', department: 'IT' },
          ].map((p, i) => <PersonCard key={i} person={p} />)}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-4">Our Team</h2>
      <p className="text-muted-foreground text-center mb-10">The people behind Spoorthi</p>

      {faculty.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-display font-semibold mb-6 text-center text-primary">Faculty Coordinators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map((p, i) => <PersonCard key={i} person={p} />)}
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div>
          <h3 className="text-xl font-display font-semibold mb-6 text-center text-primary">Student Coordinators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {students.map((p, i) => <PersonCard key={i} person={p} />)}
          </div>
        </div>
      )}
    </section>
  );
}