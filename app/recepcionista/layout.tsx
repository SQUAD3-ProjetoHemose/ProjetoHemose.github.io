"use client";

import RecepcionistaLayout from "@/components/layout/RecepcionistaLayout";
import { withProtectedRoute } from "@/hooks/useAuthentication";
import { UserRole } from "@/types";

// Função de layout principal para recepcionista
function RecepcionistaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecepcionistaLayout>{children}</RecepcionistaLayout>;
}

export default withProtectedRoute([UserRole.ADMIN,UserRole.RECEPCIONISTA])(
  RecepcionistaRootLayout
);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
