import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold">Spoorthi</span>
            </div>
            

            
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/event-register" className="hover:text-primary transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/student-dashboard" className="hover:text-primary transition-colors">Student Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/volunteer" className="hover:text-primary transition-colors">Volunteer Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>spoorthi@college.edu</li>
              <li>+91 98765 43210</li>
              <li>College Campus</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Spoorthi. All rights reserved.
        </div>
      </div>
    </footer>);

}