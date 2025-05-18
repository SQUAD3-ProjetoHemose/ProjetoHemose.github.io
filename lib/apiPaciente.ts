import { useState } from 'react';
import api from './api';
import { Paciente } from '@/types';

interface PacientesHook {
  pacientes: Paciente[];
  loading: boolean;
  error: string | null;
  fetchPacientes: () => Promise<Paciente[]>;
  fetchPaciente: (id: number | string) => Promise<Paciente>;
  createPaciente: (pacienteData: Partial<Paciente>) => Promise<Paciente>;
  updatePaciente: (id: number | string, pacienteData: Partial<Paciente>) => Promise<Paciente>;
  deletePaciente: (id: number | string) => Promise<boolean>;
}

export const usePacientes = (): PacientesHook => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = async (): Promise<Paciente[]> => {
    try {
      setLoading(true);
      const response = await api.get<Paciente[]>('/paciente');
      setPacientes(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar pacientes';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaciente = async (id: number | string): Promise<Paciente> => {
    try {
      setLoading(true);
      const response = await api.get<Paciente>(`/paciente/${id}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar paciente';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const createPaciente = async (pacienteData: Partial<Paciente>): Promise<Paciente> => {
    try {
      setLoading(true);
      const response = await api.post<Paciente>('/paciente', pacienteData);
      setPacientes([...pacientes, response.data]);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar paciente';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updatePaciente = async (id: number | string, pacienteData: Partial<Paciente>): Promise<Paciente> => {
    try {
      setLoading(true);
      const response = await api.patch<Paciente>(`/paciente/${id}`, pacienteData);
      setPacientes(pacientes.map(p => p.id === id ? response.data : p));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar paciente';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const deletePaciente = async (id: number | string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.delete(`/paciente/${id}`);
      setPacientes(pacientes.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao excluir paciente';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    pacientes,
    loading,
    error,
    fetchPacientes,
    fetchPaciente,
    createPaciente,
    updatePaciente,
    deletePaciente,
  };
};
            
            
/*  
 __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

   */