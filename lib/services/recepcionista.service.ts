import { Stats } from '@/types';
import { format } from 'date-fns';
import { agendamentosAPI, pacientesAPI } from '../api';

export class RecepcionistaService {
  // Obter estatísticas do dashboard
  static async getDashboardStats(): Promise<Stats> {
    try {
      // Buscar dados em paralelo
      const [agendamentosHoje, agendamentosTodos, pacientes] = await Promise.all([
        agendamentosAPI.getToday(),
        agendamentosAPI.getAll(),
        pacientesAPI.getAll(),
      ]);

      const hoje = format(new Date(), 'yyyy-MM-dd');

      // Calcular estatísticas baseadas nos dados reais - corrigir comparação
      const agendamentosHojeFiltrados = agendamentosHoje.filter((ag) => ag.data === hoje);
      const pacientesAguardando = agendamentosHojeFiltrados.filter(
        (ag) => ag.status === 'agendado' || ag.status === 'confirmado'
      ).length;

      // Agrupar próximos agendamentos (próximos 7 dias)
      const proximosDias = new Date();
      proximosDias.setDate(proximosDias.getDate() + 7);
      const proximosAgendamentos = agendamentosTodos.filter((ag) => {
        const dataAgendamento = new Date(ag.data);
        return dataAgendamento > new Date() && dataAgendamento <= proximosDias;
      }).length;

      return {
        pacientesInternados: Math.floor(Math.random() * 15) + 5, // Simular até implementar
        pacientesTriagem: Math.floor(Math.random() * 8) + 2, // Simular até implementar
        medicamentosAdministrar: Math.floor(Math.random() * 20) + 10, // Simular até implementar
        leitosDisponiveis: Math.floor(Math.random() * 12) + 3, // Simular até implementar
        pacientesHoje: agendamentosHojeFiltrados.length,
        agendamentosHoje: agendamentosHojeFiltrados.length,
        pacientesAguardando,
        proximosAgendamentos,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      throw error;
    }
  }

  // Obter fila de espera atual
  static async getFilaEspera() {
    try {
      const agendamentosHoje = await agendamentosAPI.getToday();
      const hoje = format(new Date(), 'yyyy-MM-dd');

      return agendamentosHoje
        .filter((ag) => {
          // Comparar diretamente as strings de data
          return ag.data === hoje && (ag.status === 'agendado' || ag.status === 'confirmado');
        })
        .sort((a, b) => (a.hora || a.horario).localeCompare(b.hora || b.horario)) // Suportar ambos os campos
        .map((ag) => ({
          id: ag.id,
          nome: ag.paciente?.nome || 'Nome não disponível',
          horario: ag.hora || ag.horario, // Usar 'hora' preferencialmente
          tipo: ag.tipo,
          medico: ag.medico?.nome || 'Médico não definido',
          status: ag.status === 'confirmado' ? 'Confirmado' : 'Aguardando',
          prioridade: 'Normal', // Implementar lógica de prioridade se necessário
          chegada: undefined, // Implementar quando tiver check-in
        }));
    } catch (error) {
      console.error('Erro ao obter fila de espera:', error);
      throw error;
    }
  }

  // Obter próximos agendamentos
  static async getProximosAgendamentos() {
    try {
      const agendamentos = await agendamentosAPI.getAll();
      const hoje = new Date();
      const proximosDias = new Date();
      proximosDias.setDate(proximosDias.getDate() + 7);

      return agendamentos
        .filter((ag) => {
          const dataAgendamento = new Date(ag.data);
          return dataAgendamento > hoje && dataAgendamento <= proximosDias;
        })
        .sort((a, b) => {
          const horaA = a.hora || a.horario;
          const horaB = b.hora || b.horario;
          const dateA = new Date(`${a.data} ${horaA}`);
          const dateB = new Date(`${b.data} ${horaB}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 10) // Limitar a 10 próximos agendamentos
        .map((ag) => ({
          id: ag.id,
          data: format(new Date(ag.data), 'dd/MM/yyyy'),
          horario: ag.hora || ag.horario, // Usar 'hora' preferencialmente
          paciente: ag.paciente?.nome || 'Nome não disponível',
          tipo: ag.tipo,
          medico: ag.medico?.nome || 'Médico não definido',
        }));
    } catch (error) {
      console.error('Erro ao obter próximos agendamentos:', error);
      throw error;
    }
  }

  // Buscar paciente por termo (nome ou CPF)
  static async buscarPaciente(termo: string) {
    try {
      // Primeiro tentar buscar por CPF se o termo parecer um CPF
      const cpfRegex = /^\d{11}$/;
      if (cpfRegex.test(termo.replace(/\D/g, ''))) {
        const cpfLimpo = termo.replace(/\D/g, '');
        try {
          const paciente = await pacientesAPI.getByCpf(cpfLimpo);
          return [paciente];
        } catch (error) {
          // Se não encontrar por CPF, continuar com busca por nome
        }
      }

      // Buscar por nome usando a API de busca
      return await pacientesAPI.search(termo);
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
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
