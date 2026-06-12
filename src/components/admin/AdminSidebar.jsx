import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, ClipboardCheck, Trophy,
  Award, BarChart3, Sparkles, ChevronLeft, ChevronRight, LogOut, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/AuthContext';
import { isSuperAdmin } from '@/lib/roles';
import { Badge } from '@/components/ui/badge';

const baseMenuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Calendar, label: 'Events', path: '/admin/events' },
  { icon: Users, label: 'Participants', path: '/admin/participants' },
  { icon: ClipboardCheck, label: 'Attendance', path: '/admin/attendance' },
  { icon: Trophy, label: 'Winners', path: '/admin/winners' },
  { icon: Award, label: 'Certificates', path: '/admin/certificates' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
];

const superAdminItems = [
  { icon: Settings, label: 'User Management', path: '/admin/users' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = isSuperAdmin(user)
    ? [...baseMenuItems, ...superAdminItems]
    : baseMenuItems;

  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Event Admin';

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      <div className="p-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <div className="text-base font-display font-bold text-sidebar-foreground truncate">Spoorthi</div>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-sidebar-primary/20 text-sidebar-primary border-0 font-medium">
              {roleLabel}
            </Badge>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} rounded-xl h-11 font-medium transition-all
                  ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md shadow-sidebar-primary/20'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1 flex-shrink-0">
        {!collapsed && user && (
          <div className="px-2 py-2 mb-1">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user.full_name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center px-2`}>
          {!collapsed && <span className="text-xs text-sidebar-foreground/50">Theme</span>}
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} rounded-xl h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4 mr-3" /><span className="text-sm">Collapse</span></>}
        </Button>
        <Button
          variant="ghost"
          onClick={() => logout()}
          className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} rounded-xl h-10 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10`}
        >
          <LogOut className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  );
}