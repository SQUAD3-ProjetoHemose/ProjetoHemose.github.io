"use client";

import { withProtectedRoute } from "@/hooks/useAuthentication";
import AuditManagement from "@/components/admin/AuditManagement";
import { UserRole } from "@/types";

// Página de gestão de auditoria do sistema
function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <AuditManagement />
    </div>
  );
}

export default withProtectedRoute([UserRole.ADMIN])(AdminAuditPage);

/*
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
