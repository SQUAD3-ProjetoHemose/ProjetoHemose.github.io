// filepath: c:\Users\alisson\OneDrive\Documentos\projetos\projetoHemose\frontend\types\index.ts
export type UserRole = 'admin' | 'medico' | 'enfermeira' | 'recepcionista';

export interface User {
  id: number | string;
  nome: string;
  email: string;
  tipo: UserRole;
  ativo: boolean;
}

export interface Paciente {
  id: number | string;
  nome: string;
  idade: number;
  leito: string;
  status: string;
  sinaisVitais: string;
}

export interface FilaEspera {
  id: number | string;
  nome: string;
  horario: string;
  tipo: string;
  medico: string;
  status: string;
}

export interface Atendimento {
  id: number | string;
  nome: string;
  horario: string;
  tipo: string;
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  user?: User;
  message?: string;
}

export interface Stats {
  // Admin stats
  totalMedicos?: number;
  totalEnfermeiras?: number;
  totalRecepcionistas?: number;
  totalPacientes?: number;
  totalLeitos?: number;
  leitosOcupados?: number;
  atendimentosHoje?: number;
  
  // Medico stats
  pacientesHoje?: number;
  prescricoesAtivas?: number;
  internacoesAtivas?: number;
  
  // Enfermeira stats
  pacientesInternados?: number;
  pacientesTriagem?: number;
  medicamentosAdministrar?: number;
  leitosDisponiveis?: number;
  
  // Recepcionista stats
  agendamentosHoje?: number;
  pacientesAguardando?: number;
  proximosAgendamentos?: number;
}