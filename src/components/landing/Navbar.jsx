import { useState } from 'react';
// logo: using uploaded Spoorthi image
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/AuthContext';
import { canAccessAdmin, isVolunteer } from '@/lib/roles';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return null;
    if (canAccessAdmin(user)) return { label: 'Admin Panel', path: '/admin' };
    if (isVolunteer(user)) return { label: 'Volunteer Portal', path: '/volunteer' };
    return { label: 'My Dashboard', path: '/student-dashboard' };
  };

  const dashboardLink = getDashboardLink();

  const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' }];


  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
        <div className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shadow-primary/5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="https://media.base44.com/images/public/6a281f2e3f0a5b317e6b8359/b8a2b13a4_logo-displlay.png" alt="Spoorthi" className="w-9 h-9 rounded-xl object-cover shadow-md" />
            <span className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spoorthi
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <Link key={link.path} to={link.path}>
                <Button
                variant={location.pathname === link.path ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-xl font-medium">
                
                  {link.label}
                </Button>
              </Link>
            )}
            {dashboardLink &&
            <Link to={dashboardLink.path}>
                <Button variant="ghost" size="sm" className="rounded-xl font-medium gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {dashboardLink.label}
                </Button>
              </Link>
            }
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ?
            <Button
              size="sm"
              variant="ghost"
              className="hidden md:flex rounded-xl gap-1.5 text-muted-foreground"
              onClick={() => logout()}>
              
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button> :

            <Link to="/login" className="hidden md:block">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20">
                  Sign In
                </Button>
              </Link>
            }
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden mx-4 mt-2">
          
            <div className="glass rounded-2xl p-4 space-y-1 shadow-lg">
              {navLinks.map((link) =>
            <Link key={link.path} to={link.path} onClick={() => setOpen(false)}>
                  <Button
                variant={location.pathname === link.path ? 'secondary' : 'ghost'}
                className="w-full justify-start rounded-xl font-medium">
                
                    {link.label}
                  </Button>
                </Link>
            )}
              {dashboardLink &&
            <Link to={dashboardLink.path} onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-xl font-medium gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> {dashboardLink.label}
                  </Button>
                </Link>
            }
              <div className="pt-1">
                {isAuthenticated ?
              <Button
                variant="outline"
                className="w-full rounded-xl gap-1.5"
                onClick={() => {logout();setOpen(false);}}>
                
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button> :

              <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80">
                      Sign In
                    </Button>
                  </Link>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

}