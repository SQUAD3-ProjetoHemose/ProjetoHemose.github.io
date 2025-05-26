import { useState, useEffect, useCallback } from 'react';
import { pacientesAPI } from '@/lib/api';

// Interface para paciente
export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  estado_civil?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  rg?: string;
  nome_mae?: string;
  nome_pai?: string;
  profissao?: string;
  convenio?: string;
  numero_convenio?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePacienteData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  estado_civil?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  rg?: string;
  nome_mae?: string;
  nome_pai?: string;
  profissao?: string;
  convenio?: string;
  numero_convenio?: string;
  observacoes?: string;
}

// Hook personalizado para gerenciar pacientes
export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os pacientes
  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pacientesAPI.getAll();
      setPacientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pacientes');
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar paciente por ID
  const fetchPacienteById = useCallback(async (id: number): Promise<Paciente | null> => {
    try {
      setError(null);
      const paciente = await pacientesAPI.getById(id);
      return paciente;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar paciente');
      console.error('Erro ao buscar paciente:', err);
      return null;
    }
  }, []);

  // Buscar pacientes com termo de pesquisa
  const searchPacientes = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchPacientes();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await pacientesAPI.search(searchTerm);
      setPacientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pacientes');
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchPacientes]);

  // Criar novo paciente
  const createPaciente = useCallback(async (pacienteData: CreatePacienteData) => {
    try {
      setError(null);
      const newPaciente = await pacientesAPI.create(pacienteData);
      setPacientes(prev => [newPaciente, ...prev]);
      return newPaciente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar paciente';
      setError(errorMessage);
      console.error('Erro ao criar paciente:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Atualizar paciente
  const updatePaciente = useCallback(async (id: number, pacienteData: Partial<CreatePacienteData>) => {
    try {
      setError(null);
      const updatedPaciente = await pacientesAPI.update(id, pacienteData);
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === id ? updatedPaciente : paciente
        )
      );
      return updatedPaciente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paciente';
      setError(errorMessage);
      console.error('Erro ao atualizar paciente:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Excluir paciente
  const deletePaciente = useCallback(async (id: number) => {
    try {
      setError(null);
      await pacientesAPI.delete(id);
      setPacientes(prev => prev.filter(paciente => paciente.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir paciente';
      setError(errorMessage);
      console.error('Erro ao excluir paciente:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Carregar pacientes na inicialização
  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  return {
    pacientes,
    loading,
    error,
    fetchPacientes,
    fetchPacienteById,
    searchPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
    setError, // Para limpar erros manualmente
  };
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
