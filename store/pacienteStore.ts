// Gerenciador de estado centralizado para pacientes usando Zustand
import { create } from 'zustand';
import { pacientesAPI } from '@/lib/api';
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
      const response = await pacientesAPI.getAll();
      set({ pacientes: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar pacientes';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchPaciente: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await pacientesAPI.getById(Number(id));
      set({ pacienteSelecionado: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createPaciente: async (pacienteData: Partial<Paciente>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await pacientesAPI.create(pacienteData);
      set(state => ({ 
        pacientes: [...state.pacientes, response]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updatePaciente: async (id: number | string, pacienteData: Partial<Paciente>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await pacientesAPI.update(Number(id), pacienteData);
      set(state => ({ 
        pacientes: state.pacientes.map(p => p.id === Number(id) ? response : p),
        pacienteSelecionado: state.pacienteSelecionado?.id === Number(id) ? response : state.pacienteSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deletePaciente: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      await pacientesAPI.delete(Number(id));
      set(state => ({
        pacientes: state.pacientes.filter(p => p.id !== Number(id)),
        pacienteSelecionado: state.pacienteSelecionado?.id === Number(id) ? null : state.pacienteSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao excluir paciente';
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
