import { medicoAPI } from '../api';

// Interfaces específicas para o módulo médico
export interface PacienteFila {
  id: number;
  nome: string;
  prioridade: 'verde' | 'azul' | 'amarelo' | 'laranja' | 'vermelho';
  descricaoPrioridade: string;
  horarioChegada: string;
  queixaPrincipal: string;
  idade: number;
  tipoAtendimento: 'consulta' | 'retorno' | 'urgencia';
}

export interface DashboardMedico {
  estatisticas: {
    consultasHoje: number;
    consultasRealizadas: number;
    filaEspera: number;
    atestadosEmitidos: number;
    prescricoesEmitidas: number;
    proximosAgendamentos: number;
  };
  proximosAgendamentos: Array<{
    id: number;
    pacienteNome: string;
    horario: string;
    tipo: string;
  }>;
}

export interface CreateAtestadoDto {
  pacienteId: number;
  tipo: string;
  conteudo: string;
  observacoes?: string;
  dataEmissao: Date;
  dataValidade?: Date;
  diasAfastamento?: number;
}

export interface CreatePrescricaoDto {
  pacienteId: number;
  dataEmissao: Date;
  dataValidade: Date;
  orientacoes?: string;
  observacoes?: string;
  retorno?: string;
  medicamentos: Array<{
    nome: string;
    dosagem: string;
    via: string;
    frequencia: string;
    duracao: string;
    observacoes?: string;
  }>;
}

export interface CreateTemplateDto {
  nome: string;
  tipo: string;
  conteudo: string;
  descricao?: string;
  padrao?: boolean;
  ativo?: boolean;
}

export class MedicoService {
  // Dashboard e estatísticas
  static async getDashboard(): Promise<DashboardMedico> {
    return medicoAPI.getDashboardMedico();
  }

  static async getEstatisticas(periodo?: string) {
    return medicoAPI.getEstatisticasMedico(periodo);
  }

  // Fila de espera e atendimentos
  static async getFilaEspera(): Promise<PacienteFila[]> {
    return medicoAPI.getFilaEspera();
  }

  static async iniciarAtendimento(pacienteId: number) {
    return medicoAPI.iniciarAtendimento(pacienteId);
  }

  static async finalizarAtendimento(atendimentoId: number, dados: any) {
    return medicoAPI.finalizarAtendimento(atendimentoId, dados);
  }

  static async getHistoricoPaciente(pacienteId: number) {
    return medicoAPI.getHistoricoPaciente(pacienteId);
  }

  // Atestados médicos
  static async criarAtestado(dados: CreateAtestadoDto) {
    return medicoAPI.criarAtestado(dados);
  }

  static async getAtestados(pacienteId?: number) {
    return medicoAPI.getAtestados(pacienteId);
  }

  // Prescrições médicas
  static async criarPrescricao(dados: CreatePrescricaoDto) {
    return medicoAPI.criarPrescricao(dados);
  }

  static async getPrescricoes(pacienteId?: number) {
    return medicoAPI.getPrescricoes(pacienteId);
  }

  // Templates de documentos
  static async getTemplates(tipo: 'atestado' | 'prescricao' | 'liberacao') {
    return medicoAPI.getTemplates(tipo);
  }

  static async salvarTemplate(dados: CreateTemplateDto) {
    return medicoAPI.salvarTemplate(dados);
  }

  // Utilitários para prioridade da triagem
  static obterCorPrioridade(prioridade: string) {
    const cores = {
      verde: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      azul: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      amarelo: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      laranja: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      vermelho: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    return cores[prioridade as keyof typeof cores] || cores.verde;
  }

  static obterLabelPrioridade(prioridade: string) {
    const labels = {
      verde: 'Não Urgente',
      azul: 'Pouco Urgente', 
      amarelo: 'Urgente',
      laranja: 'Muito Urgente',
      vermelho: 'Emergência'
    };
    return labels[prioridade as keyof typeof labels] || prioridade;
  }

  static ordenarPorPrioridade(pacientes: PacienteFila[]) {
    const ordem = { vermelho: 1, laranja: 2, amarelo: 3, azul: 4, verde: 5 };
    return [...pacientes].sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]);
  }

  // Formatação de templates
  static substituirVariaveisTemplate(template: string, dados: Record<string, any>) {
    let resultado = template;
    Object.entries(dados).forEach(([chave, valor]) => {
      const regex = new RegExp(`{{${chave}}}`, 'g');
      resultado = resultado.replace(regex, valor || '');
    });
    return resultado;
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
