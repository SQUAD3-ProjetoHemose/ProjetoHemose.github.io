// Gerenciador de estado centralizado para prontuário eletrônico usando Zustand
import { create } from 'zustand';
import { prontuarioAPI } from '@/lib/api';

interface ProntuarioState {
  // Estado
  prontuarioCompleto: any | null;
  anotacoesMedicas: any[];
  sinaisVitais: any[];
  evolucoes: any[];
  exames: any[];
  timeline: any[];
  atendimentosRecentes: any[];
  historicoClinico: any[];
  loading: boolean;
  error: string | null;
  
  // Ações - Prontuário
  fetchProntuarioCompleto: (pacienteId: number) => Promise<any>;
  
  // Ações - Anotações Médicas
  fetchAnotacoesMedicas: (pacienteId: number) => Promise<any[]>;
  createAnotacaoMedica: (data: any) => Promise<any>;
  updateAnotacaoMedica: (id: number, data: any) => Promise<any>;
  deleteAnotacaoMedica: (id: number) => Promise<boolean>;
  
  // Ações - Sinais Vitais
  fetchSinaisVitais: (pacienteId: number, dataInicio?: string, dataFim?: string) => Promise<any[]>;
  createSinaisVitais: (data: any) => Promise<any>;
  
  // Ações - Evolução
  fetchEvolucao: (pacienteId: number) => Promise<any[]>;
  createEvolucao: (data: any) => Promise<any>;
  
  // Ações - Exames
  fetchExames: (pacienteId: number) => Promise<any[]>;
  createExame: (data: any) => Promise<any>;
  updateExameResultado: (id: number, data: any) => Promise<any>;
  
  // Ações - Histórico Clínico
  fetchHistoricoClinico: (pacienteId: number) => Promise<any[]>;
  createHistoricoClinico: (data: any) => Promise<any>;
  
  // Ações - Timeline
  fetchTimeline: (pacienteId: number) => Promise<any[]>;
  
  // Ações - Atendimentos Recentes
  fetchAtendimentosRecentes: () => Promise<any[]>;
  
  // Ações - Relatório
  gerarRelatorio: (pacienteId: number) => Promise<any>;
  
  // Reset
  reset: () => void;
}

const useProntuarioStore = create<ProntuarioState>((set, get) => ({
  // Estado inicial
  prontuarioCompleto: null,
  anotacoesMedicas: [],
  sinaisVitais: [],
  evolucoes: [],
  exames: [],
  timeline: [],
  atendimentosRecentes: [],
  historicoClinico: [],
  loading: false,
  error: null,
  
  // Ações - Prontuário
  fetchProntuarioCompleto: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getProntuarioCompleto(pacienteId);
      set({ prontuarioCompleto: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar prontuário completo';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Anotações Médicas
  fetchAnotacoesMedicas: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getAnotacoes(pacienteId);
      set({ anotacoesMedicas: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar anotações médicas';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  createAnotacaoMedica: async (data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.createAnotacao(data);
      set(state => ({ 
        anotacoesMedicas: [response, ...state.anotacoesMedicas]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar anotação médica';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  updateAnotacaoMedica: async (id: number, data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.updateAnotacao(id, data);
      set(state => ({ 
        anotacoesMedicas: state.anotacoesMedicas.map(anotacao => 
          anotacao.id === id ? response : anotacao
        )
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar anotação médica';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  deleteAnotacaoMedica: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      await prontuarioAPI.deleteAnotacao(id);
      set(state => ({ 
        anotacoesMedicas: state.anotacoesMedicas.filter(anotacao => anotacao.id !== id)
      }));
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao excluir anotação médica';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Sinais Vitais
  fetchSinaisVitais: async (pacienteId: number, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getSinaisVitais(pacienteId, dataInicio, dataFim);
      set({ sinaisVitais: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar sinais vitais';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  createSinaisVitais: async (data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.createSinaisVitais(data);
      set(state => ({ 
        sinaisVitais: [response, ...state.sinaisVitais]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao registrar sinais vitais';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Evolução
  fetchEvolucao: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getEvolucao(pacienteId);
      set({ evolucoes: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar evolução do paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  createEvolucao: async (data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.createEvolucao(data);
      set(state => ({ 
        evolucoes: [response, ...state.evolucoes]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao registrar evolução';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Exames
  fetchExames: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getExames(pacienteId);
      set({ exames: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar exames';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  createExame: async (data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.createExame(data);
      set(state => ({ 
        exames: [response, ...state.exames]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao solicitar exame';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  updateExameResultado: async (id: number, data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.updateExameResultado(id, data);
      set(state => ({ 
        exames: state.exames.map(exame => 
          exame.id === id ? response : exame
        )
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar resultado do exame';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Histórico Clínico
  fetchHistoricoClinico: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getHistoricoClinico(pacienteId);
      set({ historicoClinico: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar histórico clínico';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  createHistoricoClinico: async (data: any) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.createHistoricoClinico(data);
      set(state => ({ 
        historicoClinico: [response, ...state.historicoClinico]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao registrar histórico clínico';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Timeline
  fetchTimeline: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getTimeline(pacienteId);
      set({ timeline: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar timeline do paciente';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Atendimentos Recentes
  fetchAtendimentosRecentes: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getAtendimentosRecentes();
      set({ atendimentosRecentes: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar atendimentos recentes';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Ações - Relatório
  gerarRelatorio: async (pacienteId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await prontuarioAPI.getRelatorio(pacienteId);
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao gerar relatório do prontuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
  
  // Reset do estado para valores iniciais
  reset: () => {
    set({
      prontuarioCompleto: null,
      anotacoesMedicas: [],
      sinaisVitais: [],
      evolucoes: [],
      exames: [],
      timeline: [],
      atendimentosRecentes: [],
      historicoClinico: [],
      loading: false,
      error: null
    });
  }
}));

export default useProntuarioStore;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
