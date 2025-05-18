'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import withAuth from '@/lib/withAuth';

// Função de layout principal para admin
function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
} 

export default withAuth(AdminRootLayout, ['admin']);
