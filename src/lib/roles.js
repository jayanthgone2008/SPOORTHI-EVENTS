// Role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  EVENT_ADMIN: 'event_admin',
  VOLUNTEER: 'volunteer',
  STUDENT: 'student',
};

// Role display names
export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  event_admin: 'Event Admin',
  volunteer: 'Volunteer',
  student: 'Student',
};

// Permission helpers
export const isAdmin = (user) =>
  user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.EVENT_ADMIN;

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

export const isVolunteer = (user) => user?.role === ROLES.VOLUNTEER;

export const isStudent = (user) => user?.role === ROLES.STUDENT;

export const canAccessAdmin = (user) => isAdmin(user);

export const canManageUsers = (user) => isSuperAdmin(user);

export const canCreateEvents = (user) => isAdmin(user);

export const canViewAnalytics = (user) => isAdmin(user);

export const canScanAttendance = (user) =>
  user?.role === ROLES.VOLUNTEER || isAdmin(user);