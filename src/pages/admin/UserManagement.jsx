import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Users, Search, UserCog, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ROLE_LABELS } from '@/lib/roles';

const roleBadgeStyles = {
  super_admin: 'bg-violet-500/10 text-violet-600',
  event_admin: 'bg-blue-500/10 text-blue-600',
  volunteer: 'bg-amber-500/10 text-amber-700',
  student: 'bg-green-500/10 text-green-700',
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => supabase.from('User').select('*').order('created_date', { ascending: false }).limit(200),
    initialData: [],
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => supabase.from('User').update({ role }).eq('id', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated');
    },
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Assign roles to registered users</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-card rounded-2xl border border-border/50 p-4 text-center">
              <div className="text-2xl font-display font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{label}s</div>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl h-11"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Roll No</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium">{u.full_name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {u.roll_number || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={u.role || 'student'}
                      onValueChange={(role) => updateRoleMutation.mutate({ id: u.id, role })}
                    >
                      <SelectTrigger className="h-8 w-36 rounded-lg text-xs border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="event_admin">Event Admin</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
