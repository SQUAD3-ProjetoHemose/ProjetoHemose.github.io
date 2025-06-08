import {
  Agendamento,
  CreateAgendamentoDto,
  PaginationParams,
  StatusAgendamento,
  UpdateAgendamentoDto,
} from '../../types';
import { agendamentosAPI } from '../api';

export class AgendamentosService {
  // Listar agendamentos com filtros
  static async getAgendamentos(
    params?: {
      data?: string;
      medico_id?: number;
      paciente_id?: number;
      status?: StatusAgendamento;
    } & PaginationParams
  ): Promise<Agendamento[]> {
    return agendamentosAPI.getAll(params);
  }

  // Obter agendamento por ID
  static async getAgendamentoById(id: number): Promise<Agendamento> {
    return agendamentosAPI.getById(id);
  }

  // Obter agendamentos de hoje
  static async getAgendamentosToday(): Promise<Agendamento[]> {
    return agendamentosAPI.getToday();
  }

  // Obter agendamentos por data
  static async getAgendamentosByDate(date: string): Promise<Agendamento[]> {
    return agendamentosAPI.getByDate(date);
  }

  // Criar novo agendamento
  static async createAgendamento(agendamentoData: CreateAgendamentoDto): Promise<Agendamento> {
    return agendamentosAPI.create(agendamentoData);
  }

  // Atualizar agendamento
  static async updateAgendamento(
    id: number,
    agendamentoData: UpdateAgendamentoDto
  ): Promise<Agendamento> {
    return agendamentosAPI.update(id, agendamentoData);
  }

  // Excluir agendamento
  static async deleteAgendamento(id: number): Promise<void> {
    await agendamentosAPI.delete(id);
  }

  // Confirmar agendamento
  static async confirmarAgendamento(id: number): Promise<Agendamento> {
    return agendamentosAPI.confirmar(id);
  }

  // Cancelar agendamento
  static async cancelarAgendamento(id: number): Promise<Agendamento> {
    return agendamentosAPI.cancelar(id);
  }

  // Marcar como realizado
  static async realizarAtendimento(id: number): Promise<Agendamento> {
    return agendamentosAPI.realizar(id);
  }

  // Registrar falta
  static async registrarFalta(id: number): Promise<Agendamento> {
    return agendamentosAPI.registrarFalta(id);
  }

  // Verificar disponibilidade de horário
  static async checkAvailability(
    data: string,
    horario: string,
    medico_id: number
  ): Promise<boolean> {
    try {
      const agendamentos = await agendamentosAPI.getAll({ data, medico_id });
      return !agendamentos.some(
        (ag) => ag.horario === horario && ag.status !== StatusAgendamento.CANCELADO
      );
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  }

  // Obter horários disponíveis para uma data e médico
  static async getAvailableSlots(data: string, medico_id: number): Promise<string[]> {
    try {
      const agendamentos = await agendamentosAPI.getAll({ data, medico_id });
      const horariosOcupados = agendamentos
        .filter((ag) => ag.status !== StatusAgendamento.CANCELADO)
        .map((ag) => ag.hora || ag.horario); // Suportar ambos os campos

      // Gerar horários disponíveis (8h às 17h, de hora em hora)
      const todosHorarios = [];
      for (let hora = 8; hora <= 17; hora++) {
        todosHorarios.push(`${hora.toString().padStart(2, '0')}:00`);
      }

      return todosHorarios.filter((horario) => !horariosOcupados.includes(horario));
    } catch (error) {
      console.error('Erro ao obter horários disponíveis:', error);
      return [];
    }
  }

  // Obter agenda do médico
  static async getAgendaMedico(
    medico_id: number,
    startDate: string,
    endDate: string
  ): Promise<Agendamento[]> {
    return agendamentosAPI.getAll({ medico_id });
  }

  // Estatísticas de agendamentos
  static async getAgendamentosStats(
    startDate?: string,
    endDate?: string
  ): Promise<{
    total: number;
    realizados: number;
    cancelados: number;
    porStatus: any[];
    porMedico: any[];
  }> {
    try {
      const agendamentos = await agendamentosAPI.getAll();

      const stats = {
        total: agendamentos.length,
        realizados: agendamentos.filter((ag) => ag.status === StatusAgendamento.REALIZADO).length,
        cancelados: agendamentos.filter((ag) => ag.status === StatusAgendamento.CANCELADO).length,
        porStatus: Object.values(StatusAgendamento).map((status) => ({
          status,
          count: agendamentos.filter((ag) => ag.status === status).length,
        })),
        porMedico: [], // Implementar se necessário
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Reagendar consulta
  static async reagendarConsulta(
    id: number,
    novaData: string,
    novoHorario: string
  ): Promise<Agendamento> {
    return agendamentosAPI.update(id, {
      data: novaData,
      horario: novoHorario,
    });
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
