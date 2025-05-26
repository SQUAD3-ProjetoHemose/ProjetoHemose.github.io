'use client';

import { withProtectedRoute } from '@/hooks/useAuthentication';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { UserRole } from '@/types';

// Página principal do dashboard administrativo
function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}

export default withProtectedRoute([UserRole.ADMIN])(AdminDashboardPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/