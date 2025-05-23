'use client';

import MedicoLayout from '@/components/layout/MedicoLayout';
import { withProtectedRoute } from '@/hooks/useAuthentication';

// Definindo a tipagem correta das props para o componente
interface MedicoRootLayoutProps { 
  children: React.ReactNode; 
} 
function MedicoRootLayout({ children }: MedicoRootLayoutProps) { // 
  return <MedicoLayout>{children}</MedicoLayout>; // 
} 

export default withProtectedRoute(['medico'])(MedicoRootLayout);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
