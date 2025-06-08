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

// Tipos baseados nas entidades do backend

// Enums
export enum UserRole {
  ADMIN = 'admin',
  MEDICO = 'medico',
  ENFERMEIRA = 'enfermeira',
  RECEPCIONISTA = 'recepcionista',
  TECNICA_ENFERMAGEM = 'tecnica_enfermagem', // Nova role
}

// Interfaces de Usuário
export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: UserRole;
  ativo: boolean;
  especialidade?: string;
  registroProfissional?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  tipo: UserRole;
  ativo?: boolean;
  especialidade?: string;
  registroProfissional?: string;
}

export interface UpdateUserDto {
  nome?: string;
  email?: string;
  senha?: string;
  tipo?: UserRole;
  ativo?: boolean;
  especialidade?: string;
  registroProfissional?: string;
}

// Interfaces de Paciente
export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo?: 'M' | 'F';
  telefone: string;
  email: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Campos computados para o frontend
  idade?: number;
  leito?: string;
  status?: string;
  sinaisVitais?: string;
}

export interface CreatePacienteDto {
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdatePacienteDto extends Partial<CreatePacienteDto> {}

// Interfaces de Agendamento
export interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: StatusAgendamento;
  tipo: TipoAgendamento;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
  paciente: Paciente;
  medico: User;
  created_at: string;
  updated_at: string;
}

// Interface para formulário de agendamento
export interface AgendamentoForm {
  data: string;
  horario: string;
  tipo: TipoAgendamento;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
  status: StatusAgendamento;
}

export interface CreateAgendamentoDto {
  data: string;
  horario: string;
  tipo: TipoAgendamento;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
}

export interface UpdateAgendamentoDto extends Partial<CreateAgendamentoDto> {
  status?: StatusAgendamento;
}

// Interfaces de Prontuário
export interface Prontuario {
  id: number;
  data: string;
  diagnostico: string;
  tratamento: string;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
  paciente: Paciente;
  medico: User;
  created_at: string;
  updated_at: string;
}

export interface CreateProntuarioDto {
  data: string;
  diagnostico: string;
  tratamento: string;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
}

export interface UpdateProntuarioDto extends Partial<CreateProntuarioDto> {}

// Interfaces de Prescrição
export interface Prescricao {
  id: number;
  data_prescricao: string;
  medicamentos: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
  paciente: Paciente;
  medico: User;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescricaoDto {
  data_prescricao: string;
  medicamentos: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  paciente_id: number;
  medico_id: number;
}

// Interfaces de Internação
export interface Internacao {
  id: number;
  data_entrada: string;
  data_saida?: string;
  motivo: string;
  observacoes?: string;
  leito?: string;
  paciente_id: number;
  medico_id: number;
  paciente: Paciente;
  medico: User;
  created_at: string;
  updated_at: string;
}

export interface CreateInternacaoDto {
  data_entrada: string;
  motivo: string;
  observacoes?: string;
  leito?: string;
  paciente_id: number;
  medico_id: number;
}

// Interfaces para Prontuário Eletrônico
export interface SinaisVitais {
  id: number;
  pressao_sistolica?: number;
  pressao_diastolica?: number;
  frequencia_cardiaca?: number;
  frequencia_respiratoria?: number;
  temperatura?: number;
  saturacao_oxigenio?: number;
  peso?: number;
  altura?: number;
  escala_dor?: number;
  observacoes?: string;
  data_medicao: string;
  paciente_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSinaisVitaisDto {
  pressao_sistolica?: number;
  pressao_diastolica?: number;
  frequencia_cardiaca?: number;
  frequencia_respiratoria?: number;
  temperatura?: number;
  saturacao_oxigenio?: number;
  peso?: number;
  altura?: number;
  escala_dor?: number;
  observacoes?: string;
  data_medicao: string;
  paciente_id: number;
}

export interface AnotacaoMedica {
  id: number;
  tipo: string;
  titulo?: string;
  conteudo: string;
  prioridade: string;
  visivel_outros: boolean;
  anotacao_privada: boolean;
  data_anotacao: string;
  paciente_id: number;
  medico_id: number;
  profissional: User;
  created_at: string;
  updated_at: string;
}

export interface CreateAnotacaoMedicaDto {
  tipo: string;
  titulo?: string;
  conteudo: string;
  prioridade: string;
  visivel_outros: boolean;
  anotacao_privada: boolean;
  data_anotacao: string;
  paciente_id: number;
}

// Interfaces de Relatórios
export interface DashboardStats {
  totalPacientes: number;
  totalUsuarios: number;
  totalProntuarios: number;
  agendamentosHoje: number;
  agendamentosSemana: number;
  pacientesInternados: number;
  novosPacientesMes: number;
}

// Interface para estatísticas gerais do sistema
export interface Stats {
  pacientesInternados: number;
  pacientesTriagem: number;
  medicamentosAdministrar: number;
  leitosDisponiveis: number;
  totalConsultas?: number;
  consultasRealizadas?: number;
  consultasCanceladas?: number;
  totalAtendimentos?: number;
  // Campos específicos para recepcionista
  pacientesHoje?: number;
  agendamentosHoje?: number;
  pacientesAguardando?: number;
  proximosAgendamentos?: number;
}

// Interface para fila de espera
export interface FilaEspera {
  id: number;
  nome: string;
  horario: string;
  tipo: string;
  medico: string;
  status: 'Aguardando' | 'Triagem' | 'Em Atendimento' | 'Finalizado';
  prioridade?: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  chegada?: string;
  observacoes?: string;
}

export interface AgendamentosReport {
  agendamentos: Agendamento[];
  estatisticas: {
    total: number;
    porStatus: Array<{ status: string; count: number }>;
    porMedico: Array<{ medicoNome: string; count: number }>;
  };
}

// Interfaces de Autenticação
export interface LoginDto {
  email: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Interfaces de Auditoria
export interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resource_id?: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  details?: any;
  created_at: string;
  user: User;
}

export interface CreateAuditLogDto {
  action: string;
  resource: string;
  resource_id?: number;
  ip_address: string;
  user_agent: string;
  details?: any;
}

// Exportações adicionais para compatibilidade com hooks de autenticação
export type { UserRole as Role };

// Tipos utilitários
export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type FilterParams = Record<string, any>;

// Interface para resposta paginada da API
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  message?: string;
  success?: boolean;
}

// Interface para resposta simples da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
