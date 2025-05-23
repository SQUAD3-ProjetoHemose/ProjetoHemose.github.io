"use client";

import RecepcionistaLayout from "@/components/layout/RecepcionistaLayout";
import { withProtectedRoute } from "@/hooks/useAuthentication";

// Função de layout principal para recepcionista
function RecepcionistaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecepcionistaLayout>{children}</RecepcionistaLayout>;
}

export default withProtectedRoute(["recepcionista", "admin"])(
  RecepcionistaRootLayout
);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
