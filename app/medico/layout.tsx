'use client';

import MedicoLayout from '@/components/layout/MedicoLayout';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';

// Definindo a tipagem correta das props para o componente
interface MedicoRootLayoutProps { 
  children: React.ReactNode; 
} 
function MedicoRootLayout({ children }: MedicoRootLayoutProps) { // 
  return <MedicoLayout>{children}</MedicoLayout>; // 
} 

export default withProtectedRoute([UserRole.MEDICO])(MedicoRootLayout);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
