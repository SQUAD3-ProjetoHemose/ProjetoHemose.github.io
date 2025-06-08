'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
// Função de layout principal para admin
function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
} 

export default withProtectedRoute([UserRole.ADMIN])(AdminRootLayout);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
