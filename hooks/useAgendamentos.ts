import { useState, useEffect, useCallback } from 'react';
import { agendamentosAPI } from '@/lib/api';
import { 
  Agendamento, 
  CreateAgendamentoDto, 
  StatusAgendamento, 
  TipoAgendamento 
} from '@/types';

// Interface para filtros de agendamento
export interface AgendamentoFilters {
  data?: string;
  medico_id?: number;
  paciente_id?: number;
  status?: StatusAgendamento;
}

// Renomear para evitar conflito com CreateAgendamentoDto
export interface CreateAgendamentoData extends CreateAgendamentoDto {}

// Hook personalizado para gerenciar agendamentos
export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os agendamentos
  const fetchAgendamentos = useCallback(async (filters?: AgendamentoFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendamentosAPI.getAll(filters);
      setAgendamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos');
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar agendamentos de hoje
  const fetchAgendamentosToday = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendamentosAPI.getToday();
      setAgendamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos de hoje');
      console.error('Erro ao buscar agendamentos de hoje:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar agendamentos por data
  const fetchAgendamentosByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendamentosAPI.getByDate(date);
      setAgendamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos da data');
      console.error('Erro ao buscar agendamentos da data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo agendamento
  const createAgendamento = useCallback(async (agendamentoData: CreateAgendamentoData) => {
    try {
      setError(null);
      const newAgendamento = await agendamentosAPI.create(agendamentoData);
      setAgendamentos(prev => [newAgendamento, ...prev]);
      return newAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      console.error('Erro ao criar agendamento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Atualizar agendamento
  const updateAgendamento = useCallback(async (id: number, agendamentoData: Partial<CreateAgendamentoData>) => {
    try {
      setError(null);
      const updatedAgendamento = await agendamentosAPI.update(id, agendamentoData);
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? updatedAgendamento : agendamento
        )
      );
      return updatedAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      console.error('Erro ao atualizar agendamento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Confirmar agendamento
  const confirmarAgendamento = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedAgendamento = await agendamentosAPI.confirmar(id);
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? updatedAgendamento : agendamento
        )
      );
      return updatedAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao confirmar agendamento';
      setError(errorMessage);
      console.error('Erro ao confirmar agendamento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Cancelar agendamento
  const cancelarAgendamento = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedAgendamento = await agendamentosAPI.cancelar(id);
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? updatedAgendamento : agendamento
        )
      );
      return updatedAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      setError(errorMessage);
      console.error('Erro ao cancelar agendamento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Realizar atendimento
  const realizarAtendimento = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedAgendamento = await agendamentosAPI.realizar(id);
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? updatedAgendamento : agendamento
        )
      );
      return updatedAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao realizar atendimento';
      setError(errorMessage);
      console.error('Erro ao realizar atendimento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Registrar falta
  const registrarFalta = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedAgendamento = await agendamentosAPI.registrarFalta(id);
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? updatedAgendamento : agendamento
        )
      );
      return updatedAgendamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar falta';
      setError(errorMessage);
      console.error('Erro ao registrar falta:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Excluir agendamento
  const deleteAgendamento = useCallback(async (id: number) => {
    try {
      setError(null);
      await agendamentosAPI.delete(id);
      setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir agendamento';
      setError(errorMessage);
      console.error('Erro ao excluir agendamento:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Carregar agendamentos na inicialização
  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  return {
    agendamentos,
    loading,
    error,
    fetchAgendamentos,
    fetchAgendamentosToday,
    fetchAgendamentosByDate,
    createAgendamento,
    updateAgendamento,
    confirmarAgendamento,
    cancelarAgendamento,
    realizarAtendimento,
    registrarFalta,
    deleteAgendamento,
    setError, // Para limpar erros manualmente
  };
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
