'use client';

import MedicoLayout from '@/components/layout/MedicoLayout';
import withAuth from '@/lib/withAuth';

// Definindo a tipagem correta das props para o componente
interface MedicoRootLayoutProps { 
  children: React.ReactNode; 
} 
function MedicoRootLayout({ children }: MedicoRootLayoutProps) { // 
  return <MedicoLayout>{children}</MedicoLayout>; // 
} 

export default withAuth(MedicoRootLayout, ['medico']);
