'use client';

import { withProtectedRoute } from '@/hooks/useAuthentication';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { UserRole } from '@/types';

// Página de dashboard administrativo específica
function AdminDashboardSpecificPage() {
  return (
    <div className="space-y-6">
      <AdminDashboard />
    </div>
  );
}

export default withProtectedRoute([UserRole.ADMIN])(AdminDashboardSpecificPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
