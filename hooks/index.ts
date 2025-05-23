// Arquivo de exportação central para todos os hooks
import { useAgendamentoForm, useAgendamentoManager } from './useAgendamento';
import { usePacienteForm, usePacienteManager } from './usePaciente';
import { useUserForm, useUserManager } from './useUser';
import { useAuthentication, withProtectedRoute } from './useAuthentication';

export {
  // Hooks de agendamentos
  useAgendamentoForm,
  useAgendamentoManager,
  
  // Hooks de pacientes
  usePacienteForm,
  usePacienteManager,
  
  // Hooks de usuários
  useUserForm,
  useUserManager,
  
  // Hooks de autenticação
  useAuthentication,
  withProtectedRoute
};
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
