import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/lib/AuthContext';
import { canAccessAdmin } from '@/lib/roles';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!canAccessAdmin(user)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-[72px] md:ml-[260px] transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}