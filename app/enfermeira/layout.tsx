'use client';

import EnfermeiraLayout from '@/components/layout/EnfermeiraLayout';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';

// Função de layout principal para enfermeira
function EnfermeiraRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Renderiza o layout da enfermeira com os filhos
  return <EnfermeiraLayout>{children}</EnfermeiraLayout>; 
}

export default withProtectedRoute([UserRole.ENFERMEIRA])(EnfermeiraRootLayout);

/*
            
            
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

 */