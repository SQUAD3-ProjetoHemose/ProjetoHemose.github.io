// filepath: c:\Users\alisson\OneDrive\Documentos\projetos\projetoHemose\frontend\types\index.ts
// Enums para agendamentos
export enum StatusAgendamento {
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  REALIZADO = 'realizado',
  FALTOU = 'faltou',
}

export enum TipoAgendamento {
  CONSULTA = 'consulta',
  EXAME = 'exame',
  RETORNO = 'retorno',
  PROCEDIMENTO = 'procedimento',
}

// Interface para agendamentos
export interface Agendamento {
  id: number;
  data: string;
  horario: string;
  status: StatusAgendamento;
  tipo: TipoAgendamento;
  observacoes?: string;
  paciente_id: number;
  paciente?: Paciente;
  medico_id: number;
  medico?: User;
  created_at: string;
  updated_at: string;
}

// Interface para o formulário de agendamento
export interface AgendamentoForm {
  data: string;
  horario: string;
  tipo: TipoAgendamento;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
  status?: StatusAgendamento;
}

// Interface para estatísticas gerais
export interface Stats {
  pacientesHoje?: number;
  agendamentosHoje?: number;
  pacientesAguardando?: number;
  proximosAgendamentos?: number;
  pacientesInternados?: number;
  pacientesTriagem?: number;
  medicamentosAdministrar?: number;
  leitosDisponiveis?: number;
  totalMedicos?: number;
  totalEnfermeiras?: number;
  totalRecepcionistas?: number;
  totalPacientes?: number;
  totalLeitos?: number;
  leitosOcupados?: number;
  atendimentosHoje?: number;
  prescricoesAtivas?: number;
  internacoesAtivas?: number;
}

// Interface para pacientes na fila de espera
export interface FilaEspera {
  id: number | string;
  nome: string;
  horario: string;
  tipo: string;
  medico: string;
  status: string;
}

// Interface para atendimentos
export interface Atendimento {
  id: number;
  nome: string;
  horario: string;
  tipo: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  access_token?: string;
}

// Tipos de usuário
export type UserRole = 'admin' | 'medico' | 'enfermeira' | 'recepcionista';

// Interface para usuários do sistema
export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: UserRole;
  ativo: boolean;
}

// Interface para pacientes
export interface Paciente {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
  endereco?: string;
  idade: number;
  leito?: string;
  status?: string;
  sinaisVitais?: string;
}
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/