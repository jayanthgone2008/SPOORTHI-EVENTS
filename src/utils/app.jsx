import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Public pages
import Home from '@/pages/Home';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import SubEventDetail from '@/pages/SubEventDetail';
import EventRegistration from '@/pages/EventRegistration';

// Role-based dashboards
import StudentDashboard from '@/pages/StudentDashboard';
import VolunteerDashboard from '@/pages/VolunteerDashboard';

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import Overview from '@/pages/admin/Overview';
import EventManagement from '@/pages/admin/EventManagement';
import ParticipantManagement from '@/pages/admin/ParticipantManagement';
import AttendanceManagement from '@/pages/admin/AttendanceManagement';
import WinnerManagement from '@/pages/admin/WinnerManagement';
import CertificateManagement from '@/pages/admin/CertificateManagement';
import Analytics from '@/pages/admin/Analytics';
import UserManagement from '@/pages/admin/UserManagement';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground font-medium">Loading Spoorthi...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // For auth_required, only hard-redirect if we have no token at all.
    // Public pages (/, /events, /event-register, etc.) should still render.
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/sub-event/:id" element={<SubEventDetail />} />
      <Route path="/event-register" element={<EventRegistration />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />

        {/* Admin routes — layout enforces canAccessAdmin check */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Overview />} />
          <Route path="/admin/events" element={<EventManagement />} />
          <Route path="/admin/participants" element={<ParticipantManagement />} />
          <Route path="/admin/attendance" element={<AttendanceManagement />} />
          <Route path="/admin/winners" element={<WinnerManagement />} />
          <Route path="/admin/certificates" element={<CertificateManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App