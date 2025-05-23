// Gerenciador de estado centralizado para agendamentos usando Zustand
import { create } from 'zustand';
import { format } from 'date-fns';
import api from '@/lib/api';
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
      const params = new URLSearchParams();
      if (data) params.append('data', data);
      if (medico_id) params.append('medico_id', medico_id.toString());
      if (paciente_id) params.append('paciente_id', paciente_id.toString());
      if (status) params.append('status', status);
      
      // Fazer a chamada à API
      const response = await api.get(`/agendamentos?${params.toString()}`);
      set({ agendamentos: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar agendamentos';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchAgendamentosHoje: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/agendamentos/today');
      set({ agendamentos: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar agendamentos de hoje';
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
      const response = await api.get(`/agendamentos/by-date/${formattedDate}`);
      set({ agendamentos: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar agendamentos por data';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get(`/agendamentos/${id}`);
      set({ agendamentoSelecionado: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao buscar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createAgendamento: async (formData: AgendamentoForm) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/agendamentos', formData);
      set(state => ({ 
        agendamentos: [...state.agendamentos, response.data] 
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar agendamento';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updateAgendamento: async (id: number, formData: Partial<AgendamentoForm>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/agendamentos/${id}`, formData);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response.data : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response.data : state.agendamentoSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao atualizar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  confirmarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/agendamentos/${id}/confirmar`);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response.data : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response.data : state.agendamentoSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao confirmar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  cancelarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/agendamentos/${id}/cancelar`);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response.data : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response.data : state.agendamentoSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao cancelar agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  realizarAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/agendamentos/${id}/realizar`);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response.data : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response.data : state.agendamentoSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao marcar agendamento #${id} como realizado`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  registrarFalta: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/agendamentos/${id}/falta`);
      set(state => ({ 
        agendamentos: state.agendamentos.map(ag => ag.id === id ? response.data : ag),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? response.data : state.agendamentoSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao registrar falta no agendamento #${id}`;
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deleteAgendamento: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/agendamentos/${id}`);
      set(state => ({ 
        agendamentos: state.agendamentos.filter(ag => ag.id !== id),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === id ? null : state.agendamentoSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erro ao excluir agendamento #${id}`;
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
