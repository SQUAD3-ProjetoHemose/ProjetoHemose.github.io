// Gerenciador de estado centralizado para agendamentos usando Zustand
import { create } from 'zustand';
import { format } from 'date-fns';
import { agendamentosAPI } from '@/lib/api'; // Corrigido: usar importação nomeada
import { Agendamento, AgendamentoForm, StatusAgendamento } from '@/types';

interface AgendamentoState {
  // Estado
  agendamentos: Agendamento[];
  agendamentoSelecionado: Agendamento | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  fetchAgendamentos: (data?: string, medico_id?: number, paciente_id?: number, status?: StatusAgendamento) => Promise<Agendamento[]>;
  fetchAgendamentosHoje: () => Promise<Agendamento[]>;
  fetchAgendamentosPorData: (data: Date) => Promise<Agendamento[]>;
  fetchAgendamento: (id: number) => Promise<Agendamento>;
  createAgendamento: (formData: AgendamentoForm) => Promise<Agendamento>;
  updateAgendamento: (id: number, formData: Partial<AgendamentoForm>) => Promise<Agendamento>;
  confirmarAgendamento: (id: number) => Promise<Agendamento>;
  cancelarAgendamento: (id: number) => Promise<Agendamento>;
  realizarAgendamento: (id: number) => Promise<Agendamento>;
  registrarFalta: (id: number) => Promise<Agendamento>;
  deleteAgendamento: (id: number) => Promise<boolean>;
  reset: () => void;
}

const useAgendamentoStore = create<AgendamentoState>((set, get) => ({
  // Estado inicial
  agendamentos: [],
  agendamentoSelecionado: null,
  loading: false,
  error: null,
  
  // Ações
  fetchAgendamentos: async (data?: string, medico_id?: number, paciente_id?: number, status?: StatusAgendamento) => {
    set({ loading: true, error: null });
    
    try {
      // Construir os parâmetros da consulta
      const params: any = {};
      if (data) params.data = data;
      if (medico_id) params.medico_id = medico_id;
      if (paciente_id) params.paciente_id = paciente_id;
      if (status) params.status = status;
      
      // Fazer a chamada à API usando agendamentosAPI
      const response = await agendamentosAPI.getAll(params);
      set({ agendamentos: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar agendamentos';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchAgendamentosHoje: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.getToday();
      set({ agendamentos: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar agendamentos de hoje';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchAgendamentosPorData: async (data: Date) => {
    set({ loading: true, error: null });
    
    try {
      const formattedDate = format(data, 'yyyy-MM-dd');
      const response = await agendamentosAPI.getByDate(formattedDate);
      set({ agendamentos: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar agendamentos por data';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.getById(id);
      set({ agendamentoSelecionado: response });
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao buscar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createAgendamento: async (formData: AgendamentoForm) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.create(formData);
      set(state => ({ 
        agendamentos: [...state.agendamentos, response] 
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar agendamento';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updateAgendamento: async (id: number, formData: Partial<AgendamentoForm>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.update(id, formData);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response : state.agendamentoSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao atualizar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  confirmarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.confirmar(id);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response : state.agendamentoSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao confirmar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  cancelarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.cancelar(id);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response : state.agendamentoSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao cancelar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  realizarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.realizar(id);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response : state.agendamentoSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao marcar agendamento #${id} como realizado`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  registrarFalta: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await agendamentosAPI.registrarFalta(id);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response : state.agendamentoSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || `Erro ao registrar falta no agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deleteAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      await agendamentosAPI.delete(id);
      set(state => ({ 
        agendamentos: state.agendamentos.filter(ag => ag.id !== id),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? null : state.agendamentoSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.message || `Erro ao excluir agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  // Reset do estado para valores iniciais
  reset: () => {
    set({
      agendamentos: [],
      agendamentoSelecionado: null,
      loading: false,
      error: null
    });
  }
}));

export default useAgendamentoStore;
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
