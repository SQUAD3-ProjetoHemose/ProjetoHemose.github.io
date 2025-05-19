import { useState } from 'react';
import { Agendamento, AgendamentoForm, StatusAgendamento } from '@/types';
import { format } from 'date-fns';

import api from './api';

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os agendamentos com opções de filtros
  const fetchAgendamentos = async (
    data?: string,
    medico_id?: number,
    paciente_id?: number,
    status?: StatusAgendamento
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir os parâmetros da consulta
      const params = new URLSearchParams();
      if (data) params.append('data', data);
      if (medico_id) params.append('medico_id', medico_id.toString());
      if (paciente_id) params.append('paciente_id', paciente_id.toString());
      if (status) params.append('status', status);
      
      // Fazer a chamada à API
      const response = await api.get(`/agendamentos?${params.toString()}`);
      setAgendamentos(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar agendamentos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar agendamentos de hoje
  const fetchAgendamentosHoje = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/agendamentos/today');
      setAgendamentos(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar agendamentos de hoje');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar agendamentos por data
  const fetchAgendamentosPorData = async (data: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = format(data, 'yyyy-MM-dd');
      const response = await api.get(`/agendamentos/by-date/${formattedDate}`);
      setAgendamentos(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar agendamentos por data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar um agendamento por ID
  const fetchAgendamento = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/agendamentos/${id}`);
      setAgendamento(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao buscar agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Criar um novo agendamento
  const createAgendamento = async (formData: AgendamentoForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/agendamentos', formData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar agendamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar um agendamento
  const updateAgendamento = async (id: number, formData: Partial<AgendamentoForm>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agendamentos/${id}`, formData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao atualizar agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Confirmar um agendamento
  const confirmarAgendamento = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agendamentos/${id}/confirmar`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao confirmar agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar um agendamento
  const cancelarAgendamento = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agendamentos/${id}/cancelar`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao cancelar agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar agendamento como realizado
  const realizarAgendamento = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agendamentos/${id}/realizar`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao marcar agendamento #${id} como realizado`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar falta no agendamento
  const registrarFalta = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agendamentos/${id}/falta`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao registrar falta no agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir um agendamento
  const deleteAgendamento = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/agendamentos/${id}`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Erro ao excluir agendamento #${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    agendamentos,
    agendamento,
    loading,
    error,
    fetchAgendamentos,
    fetchAgendamentosHoje,
    fetchAgendamentosPorData,
    fetchAgendamento,
    createAgendamento,
    updateAgendamento,
    confirmarAgendamento,
    cancelarAgendamento,
    realizarAgendamento,
    registrarFalta,
    deleteAgendamento,
  };
};
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
