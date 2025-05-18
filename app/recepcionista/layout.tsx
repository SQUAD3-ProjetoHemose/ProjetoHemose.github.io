'use client';

import RecepcionistaLayout from '@/components/layout/RecepcionistaLayout';
import withAuth from '@/lib/withAuth';

// Tipando o children corretamente para evitar erro de tipo
function RecepcionistaRootLayout({ children }: React.PropsWithChildren) {
  return <RecepcionistaLayout>{children}</RecepcionistaLayout>;
} 

export default withAuth(RecepcionistaRootLayout, ['recepcionista']);
