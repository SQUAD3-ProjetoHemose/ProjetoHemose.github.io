'use client';

import { useParams } from 'next/navigation';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import ProntuarioEletronico from '@/components/medico/ProntuarioEletronico';
import { UserRole } from '@/types';

// Página individual do prontuário eletrônico
function ProntuarioPage() {
  const params = useParams();
  const pacienteId = parseInt(params.id as string);

  if (!pacienteId || isNaN(pacienteId)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">ID do paciente inválido.</p>
      </div>
    );
  }

  return (
    <div>
      <ProntuarioEletronico pacienteId={pacienteId} />
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas médicos
export default withProtectedRoute([UserRole.MEDICO])(ProntuarioPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
