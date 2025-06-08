// Exportação centralizada de todos os hooks personalizados
export { useAuthentication, withProtectedRoute } from './useAuthentication';
export { useAgendamentos } from './useAgendamentos';
export { usePacientes } from './usePacientes';
export { useReports } from './useReports';
export { useAudit, usePageAudit, withAudit } from './useAudit';

// Re-exportar tipos importantes
export type { CreateAgendamentoData, AgendamentoFilters } from './useAgendamentos';
export type { Paciente, CreatePacienteData } from './usePacientes';
export type { 
  DashboardStats, 
  AgendamentosReport, 
  PacientesReport, 
  ProdutividadeReport, 
  FinanceiroReport 
} from './useReports';

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
