// Gerenciador de estado centralizado para pacientes usando Zustand
import { create } from 'zustand';
import api from '@/lib/api';
import { Paciente } from '@/types';

interface PacienteState {
  // Estado
  pacientes: Paciente[];
  pacienteSelecionado: Paciente | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  fetchPacientes: () => Promise<Paciente[]>;
  fetchPaciente: (id: number | string) => Promise<Paciente>;
  createPaciente: (pacienteData: Partial<Paciente>) => Promise<Paciente>;
  updatePaciente: (id: number | string, pacienteData: Partial<Paciente>) => Promise<Paciente>;
  deletePaciente: (id: number | string) => Promise<boolean>;
  reset: () => void;
}

const usePacienteStore = create<PacienteState>((set, get) => ({
  // Estado inicial
  pacientes: [],
  pacienteSelecionado: null,
  loading: false,
  error: null,
  
  // Ações
  fetchPacientes: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get<Paciente[]>('/paciente');
      set({ pacientes: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar pacientes';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchPaciente: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get<Paciente>(`/paciente/${id}`);
      set({ pacienteSelecionado: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createPaciente: async (pacienteData: Partial<Paciente>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post<Paciente>('/paciente', pacienteData);
      set(state => ({ 
        pacientes: [...state.pacientes, response.data]
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updatePaciente: async (id: number | string, pacienteData: Partial<Paciente>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch<Paciente>(`/paciente/${id}`, pacienteData);
      set(state => ({ 
        pacientes: state.pacientes.map(p => p.id === id ? response.data : p),
        pacienteSelecionado: state.pacienteSelecionado?.id === id ? response.data : state.pacienteSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deletePaciente: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/paciente/${id}`);
      set(state => ({
        pacientes: state.pacientes.filter(p => p.id !== id),
        pacienteSelecionado: state.pacienteSelecionado?.id === id ? null : state.pacienteSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao excluir paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  // Reset do estado para valores iniciais
  reset: () => {
    set({
      pacientes: [],
      pacienteSelecionado: null,
      loading: false,
      error: null
    });
  }
}));

export default usePacienteStore;
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
