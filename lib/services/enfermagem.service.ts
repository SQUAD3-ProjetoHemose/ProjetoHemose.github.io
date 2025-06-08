import { FilaEspera } from '@/types';
import { enfermagemAPI } from '../api';

// Interfaces específicas para enfermagem
export interface SinaisVitais {
  pressaoArterialSistolica?: number;
  pressaoArterialDiastolica?: number;
  temperatura?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  saturacaoOxigenio?: number;
  glicemiaCapilar?: number; // Corrigido erro de digitação
  nivelDor?: number;
}

export interface Triagem {
  id: string;
  pacienteId: string;
  pacienteNome?: string;
  pressaoArterial: string;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
  temperatura: number;
  saturacaoOxigenio: number;
  peso?: number;
  altura?: string;
  queixaPrincipal?: string;
  observacoes?: string;
  prioridade?: string;
  profissionalId: number;
  dataTriagem: string;
  observacoesMedicas?: string;
}

export interface EvolucaoEnfermagem {
  id: string;
  pacienteId: string;
  pacienteNome?: string;
  observacoesEnfermagem: string;
  sinaisVitais: SinaisVitais;
  procedimentosRealizados?: string;
  medicamentosAdministrados?: string;
  intercorrencias?: string;
  planoAssistencial?: string;
  profissionalId: number;
  dataEvolucao: string;
  triagemId?: string;
}

export interface Medicamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  leito: string;
  medicamento: string;
  dosagem: string;
  horario: string;
  administrado: boolean;
  profissionalId?: number;
  observacoes?: string;
}

export interface Leito {
  id: string;
  numero: string;
  ala: string;
  status: 'ocupado' | 'livre' | 'manutencao' | 'limpeza';
  pacienteId?: string;
  pacienteNome?: string;
  dataInternacao?: string;
}

export interface PacienteUrgente {
  id: number | string;
  nome: string;
  leito: string;
  status: 'Crítico' | 'Instável' | 'Em observação' | 'Estável';
  sinaisVitais: string;
  prioridade: 'alta' | 'media' | 'baixa';
  ultimaVerificacao?: string;
}

export interface DashboardEnfermagem {
  estatisticas: {
    pacientesInternados: number;
    pacientesTriagem: number;
    medicamentosAdministrar: number;
    leitosDisponiveis: number;
    triagensHoje: number;
    evolucoeHoje: number;
  };
  pacientesUrgentes: PacienteUrgente[];
  medicamentosHorario: Medicamento[];
  leitosStatus: Leito[];
}

export class EnfermagemService {
  // Dashboard e estatísticas
  static async getDashboard(): Promise<DashboardEnfermagem> {
    try {
      return await enfermagemAPI.getDashboard(); // Usar método correto da API
    } catch (error) {
      console.error('Erro ao buscar dashboard da enfermagem:', error);
      // Retornar dados fictícios enquanto não temos a API completamente integrada
      return {
        estatisticas: {
          pacientesInternados: 32,
          pacientesTriagem: 8,
          medicamentosAdministrar: 15,
          leitosDisponiveis: 18,
          triagensHoje: 12,
          evolucoeHoje: 8,
        },
        pacientesUrgentes: [
          {
            id: 1,
            nome: 'Roberto Almeida',
            leito: '12A',
            status: 'Crítico',
            sinaisVitais: 'PA: 160/100, FC: 110',
            prioridade: 'alta',
            ultimaVerificacao: '10:30',
          },
          {
            id: 2,
            nome: 'Mariana Costa',
            leito: '08B',
            status: 'Instável',
            sinaisVitais: 'PA: 90/60, FC: 120',
            prioridade: 'alta',
            ultimaVerificacao: '11:15',
          },
          {
            id: 3,
            nome: 'Paulo Ferreira',
            leito: '15C',
            status: 'Em observação',
            sinaisVitais: 'PA: 140/90, FC: 95',
            prioridade: 'media',
            ultimaVerificacao: '12:00',
          },
        ],
        medicamentosHorario: [
          {
            id: '1',
            pacienteId: '1',
            pacienteNome: 'Roberto Almeida',
            leito: '12A',
            medicamento: 'Dipirona',
            dosagem: '500mg',
            horario: '14:00',
            administrado: false,
          },
          {
            id: '2',
            pacienteId: '2',
            pacienteNome: 'Mariana Costa',
            leito: '08B',
            medicamento: 'Amoxicilina',
            dosagem: '500mg',
            horario: '14:30',
            administrado: false,
          },
          {
            id: '3',
            pacienteId: '3',
            pacienteNome: 'Paulo Ferreira',
            leito: '15C',
            medicamento: 'Paracetamol',
            dosagem: '750mg',
            horario: '15:00',
            administrado: false,
          },
        ],
        leitosStatus: [
          {
            id: '1',
            numero: '12A',
            ala: 'UTI',
            status: 'ocupado',
            pacienteNome: 'Roberto Almeida',
            dataInternacao: '2024-12-01',
          },
          {
            id: '2',
            numero: '08B',
            ala: 'Clínica Médica',
            status: 'ocupado',
            pacienteNome: 'Mariana Costa',
            dataInternacao: '2024-12-02',
          },
          {
            id: '3',
            numero: '15C',
            ala: 'Observação',
            status: 'ocupado',
            pacienteNome: 'Paulo Ferreira',
            dataInternacao: '2024-12-03',
          },
          { id: '4', numero: '10A', ala: 'UTI', status: 'livre' },
          { id: '5', numero: '05B', ala: 'Clínica Médica', status: 'limpeza' },
        ],
      };
    }
  }

  // Triagem
  static async realizarTriagem(dados: Partial<Triagem>): Promise<Triagem> {
    try {
      return await enfermagemAPI.realizarTriagem(dados);
    } catch (error) {
      console.error('Erro ao realizar triagem:', error);
      throw error;
    }
  }

  static async buscarTriagensPaciente(pacienteId: string): Promise<Triagem[]> {
    try {
      return await enfermagemAPI.buscarTriagensPaciente(pacienteId);
    } catch (error) {
      console.error('Erro ao buscar triagens do paciente:', error);
      throw error;
    }
  }

  static async atualizarTriagem(triagemId: string, dados: Partial<Triagem>): Promise<Triagem> {
    try {
      return await enfermagemAPI.atualizarTriagem(triagemId, dados);
    } catch (error) {
      console.error('Erro ao atualizar triagem:', error);
      throw error;
    }
  }

  // Evolução de Enfermagem
  static async registrarEvolucao(dados: Partial<EvolucaoEnfermagem>): Promise<EvolucaoEnfermagem> {
    try {
      return await enfermagemAPI.registrarEvolucao(dados);
    } catch (error) {
      console.error('Erro ao registrar evolução:', error);
      throw error;
    }
  }

  static async buscarEvolucoesPaciente(pacienteId: string): Promise<EvolucaoEnfermagem[]> {
    try {
      return await enfermagemAPI.buscarEvolucoesPaciente(pacienteId);
    } catch (error) {
      console.error('Erro ao buscar evoluções do paciente:', error);
      throw error;
    }
  }

  // Medicamentos
  static async getMedicamentosAdministrar(): Promise<Medicamento[]> {
    try {
      return await enfermagemAPI.getMedicamentosAdministrar();
    } catch (error) {
      console.error('Erro ao buscar medicamentos para administrar:', error);
      return [];
    }
  }

  static async administrarMedicamento(medicamentoId: string, observacoes?: string): Promise<void> {
    try {
      await enfermagemAPI.administrarMedicamento(medicamentoId, observacoes);
    } catch (error) {
      console.error('Erro ao administrar medicamento:', error);
      throw error;
    }
  }

  // Leitos
  static async getLeitos(): Promise<Leito[]> {
    try {
      return await enfermagemAPI.getLeitos();
    } catch (error) {
      console.error('Erro ao buscar leitos:', error);
      return [];
    }
  }

  static async atualizarStatusLeito(leitoId: string, status: string): Promise<void> {
    try {
      await enfermagemAPI.atualizarStatusLeito(leitoId, status);
    } catch (error) {
      console.error('Erro ao atualizar status do leito:', error);
      throw error;
    }
  }

  // Fila de espera
  static async getFilaEspera(): Promise<FilaEspera[]> {
    try {
      return await enfermagemAPI.getFilaEspera();
    } catch (error) {
      console.error('Erro ao buscar fila de espera:', error);
      return [];
    }
  }

  // Sinais Vitais
  static async registrarSinaisVitais(pacienteId: string, sinais: SinaisVitais): Promise<void> {
    try {
      await enfermagemAPI.registrarSinaisVitais(pacienteId, sinais);
    } catch (error) {
      console.error('Erro ao registrar sinais vitais:', error);
      throw error;
    }
  }

  static async buscarSinaisVitaisPaciente(
    pacienteId: string,
    limite?: number
  ): Promise<SinaisVitais[]> {
    try {
      return await enfermagemAPI.buscarSinaisVitaisPaciente(pacienteId, limite);
    } catch (error) {
      console.error('Erro ao buscar sinais vitais:', error);
      return [];
    }
  }

  // Verificar se triagem foi realizada (obrigatória)
  static async verificarTriagemObrigatoria(pacienteId: string): Promise<boolean> {
    try {
      const response = await enfermagemAPI.verificarTriagemObrigatoria(pacienteId);
      return response.triagemRealizada;
    } catch (error) {
      console.error('Erro ao verificar triagem obrigatória:', error);
      return false;
    }
  }

  // Métodos adicionais para integração completa com enfermagemAPI
  static async getPacientesUrgentes(): Promise<PacienteUrgente[]> {
    try {
      return await enfermagemAPI.getPacientesUrgentes();
    } catch (error) {
      console.error('Erro ao buscar pacientes urgentes:', error);
      return [];
    }
  }

  static async registrarProcedimento(dados: any): Promise<any> {
    try {
      return await enfermagemAPI.registrarProcedimento(dados);
    } catch (error) {
      console.error('Erro ao registrar procedimento:', error);
      throw error;
    }
  }

  static async registrarObservacao(pacienteId: string, observacao: string): Promise<any> {
    try {
      return await enfermagemAPI.registrarObservacao(pacienteId, observacao);
    } catch (error) {
      console.error('Erro ao registrar observação:', error);
      throw error;
    }
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
