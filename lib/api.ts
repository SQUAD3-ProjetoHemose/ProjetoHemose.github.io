import axios from 'axios';

// Cliente API centralizado para comunicação com o backend
class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  // Método privado para obter token de autenticação
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // Método privado para configurar headers
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Método genérico para fazer requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar se há conteúdo para parsear
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as unknown as T;
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Método para upload de arquivos
  async uploadFile<T>(endpoint: string, file: File, includeAuth: boolean = true): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers,
      },
      false // Não incluir Content-Type para FormData
    );
  }

  // Método para download de arquivos
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Instância única do cliente API
export const apiClient = new ApiClient();

// Tipos para as respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page?: boolean; // Propriedade opcional
    has_prev_page?: boolean; // Propriedade opcional
  };
}

// Funções específicas da API organizadas por módulo

// Autenticação
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ success: boolean; access_token: string; user: any }>('/auth/login', credentials, false),
    
  register: (userData: any) =>
    apiClient.post<{ user: any }>('/auth/register', userData, false),
    
  profile: () =>
    apiClient.get<{ user: any }>('/auth/profile'),
    
  logout: () =>
    apiClient.post('/auth/logout'),
};

// Usuários
export const usersAPI = {
  getAll: (role?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    return apiClient.get<any[]>(`/users?${params.toString()}`);
  },
    
  getById: (id: number) =>
    apiClient.get<any>(`/users/${id}`),
    
  create: (userData: any) =>
    apiClient.post<any>('/users', userData),
    
  update: (id: number, userData: any) =>
    apiClient.patch<any>(`/users/${id}`, userData),
    
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
    
  // Buscar por tipo específico
  getMedicos: () =>
    apiClient.get<any[]>('/users?role=medico'),
    
  getEnfermeiras: () =>
    apiClient.get<any[]>('/users?role=enfermeira'),
    
  getRecepcionistas: () =>
    apiClient.get<any[]>('/users?role=recepcionista'),
};

// Pacientes
export const pacientesAPI = {
  getAll: () =>
    apiClient.get<any[]>('/pacientes'),
    
  getById: (id: number) =>
    apiClient.get<any>(`/pacientes/${id}`),
    
  create: (pacienteData: any) =>
    apiClient.post<any>('/pacientes', pacienteData),
    
  update: (id: number, pacienteData: any) =>
    apiClient.patch<any>(`/pacientes/${id}`, pacienteData),
    
  delete: (id: number) =>
    apiClient.delete(`/pacientes/${id}`),
    
  search: (term: string) =>
    apiClient.get<any[]>(`/pacientes/search?q=${encodeURIComponent(term)}`),
};

// Agendamentos
export const agendamentosAPI = {
  getAll: (params?: { data?: string; medico_id?: number; paciente_id?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) queryParams.append(key, value.toString());
      });
    }
    return apiClient.get<any[]>(`/agendamentos?${queryParams.toString()}`);
  },
  
  getToday: () =>
    apiClient.get<any[]>('/agendamentos/today'),
    
  getByDate: (date: string) =>
    apiClient.get<any[]>(`/agendamentos/by-date/${date}`),
    
  getById: (id: number) =>
    apiClient.get<any>(`/agendamentos/${id}`),
    
  create: (agendamentoData: any) =>
    apiClient.post<any>('/agendamentos', agendamentoData),
    
  update: (id: number, agendamentoData: any) =>
    apiClient.patch<any>(`/agendamentos/${id}`, agendamentoData),
    
  confirmar: (id: number) =>
    apiClient.patch<any>(`/agendamentos/${id}/confirmar`),
    
  cancelar: (id: number) =>
    apiClient.patch<any>(`/agendamentos/${id}/cancelar`),
    
  realizar: (id: number) =>
    apiClient.patch<any>(`/agendamentos/${id}/realizar`),
    
  registrarFalta: (id: number) =>
    apiClient.patch<any>(`/agendamentos/${id}/falta`),
    
  delete: (id: number) =>
    apiClient.delete(`/agendamentos/${id}`),
};

// Relatórios
export const reportsAPI = {
  dashboard: () =>
    apiClient.get<any>('/reports/dashboard'),
    
  agendamentos: (startDate: string, endDate: string) =>
    apiClient.get<any>(`/reports/agendamentos?startDate=${startDate}&endDate=${endDate}`),
    
  pacientes: () =>
    apiClient.get<any>('/reports/pacientes'),
    
  produtividadeMedica: (startDate: string, endDate: string) =>
    apiClient.get<any>(`/reports/produtividade-medica?startDate=${startDate}&endDate=${endDate}`),
    
  financeiro: (startDate: string, endDate: string) =>
    apiClient.get<any>(`/reports/financeiro?startDate=${startDate}&endDate=${endDate}`),
    
  exportCSV: (type: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.downloadFile(`/reports/export/csv?${params.toString()}`, `${type}-export.csv`);
  },
};

// Prontuário Eletrônico
export const prontuarioAPI = {
  // Prontuário completo
  getProntuarioCompleto: (pacienteId: number) =>
    apiClient.get<any>(`/prontuario-eletronico/paciente/${pacienteId}`),
    
  // Anotações Médicas
  getAnotacoes: (pacienteId: number) =>
    apiClient.get<any[]>(`/prontuario-eletronico/anotacoes/${pacienteId}`),
    
  createAnotacao: (data: any) =>
    apiClient.post<any>('/prontuario-eletronico/anotacao-medica', data),
    
  updateAnotacao: (id: number, data: any) =>
    apiClient.patch<any>(`/prontuario-eletronico/anotacao/${id}`, data),
    
  deleteAnotacao: (id: number) =>
    apiClient.delete(`/prontuario-eletronico/anotacao/${id}`),
    
  // Histórico Clínico
  getHistoricoClinico: (pacienteId: number) =>
    apiClient.get<any[]>(`/prontuario-eletronico/historico/${pacienteId}`),
    
  createHistoricoClinico: (data: any) =>
    apiClient.post<any>('/prontuario-eletronico/historico-clinico', data),
    
  // Sinais Vitais
  getSinaisVitais: (pacienteId: number, dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    return apiClient.get<any[]>(`/prontuario-eletronico/sinais-vitais/${pacienteId}?${params.toString()}`);
  },
    
  createSinaisVitais: (data: any) =>
    apiClient.post<any>('/prontuario-eletronico/sinais-vitais', data),
    
  // Evolução do Paciente
  getEvolucao: (pacienteId: number) =>
    apiClient.get<any[]>(`/prontuario-eletronico/evolucao/${pacienteId}`),
    
  createEvolucao: (data: any) =>
    apiClient.post<any>('/prontuario-eletronico/evolucao', data),
    
  // Exames
  getExames: (pacienteId: number) =>
    apiClient.get<any[]>(`/prontuario-eletronico/exames/${pacienteId}`),
    
  createExame: (data: any) =>
    apiClient.post<any>('/prontuario-eletronico/exame', data),
    
  updateExameResultado: (id: number, data: any) =>
    apiClient.patch<any>(`/prontuario-eletronico/exame/${id}/resultado`, data),
    
  // Timeline do Paciente
  getTimeline: (pacienteId: number) =>
    apiClient.get<any[]>(`/prontuario-eletronico/timeline/${pacienteId}`),
    
  // Relatório do Prontuário
  getRelatorio: (pacienteId: number) =>
    apiClient.get<any>(`/prontuario-eletronico/relatorio/${pacienteId}`),
    
  // Atendimentos Recentes
  getAtendimentosRecentes: () =>
    apiClient.get<any[]>('/prontuario-eletronico/atendimentos-recentes'),
};

// Auditoria
export const auditAPI = {
  getLogs: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) queryParams.append(key, value.toString());
      });
    }
    // Retornar tipo mais específico com transformação dos dados
    return apiClient.get<any>(`/audit?${queryParams.toString()}`)
      .then((response: any) => {
        // Garantir que a resposta tenha a estrutura correta
        const paginatedResponse: PaginatedResponse<any> = {
          data: response.data || response,
          pagination: {
            current_page: response.pagination?.current_page || 1,
            per_page: response.pagination?.per_page || 50,
            total: response.pagination?.total || 0,
            total_pages: response.pagination?.total_pages || 0,
            has_next_page: response.pagination?.has_next_page || 
              (response.pagination?.current_page < response.pagination?.total_pages),
            has_prev_page: response.pagination?.has_prev_page || 
              (response.pagination?.current_page > 1),
          },
         
          
        };
        return paginatedResponse;
      });
  },
  
  getStats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get<any>(`/audit/stats?${params.toString()}`);
  },
  
  getUserLogs: (userId: number, limit?: number) => {
    const params = new URLSearchParams();
    params.append('userId', userId.toString());
    if (limit) params.append('limit', limit.toString());
    return apiClient.get<any[]>(`/audit/user?${params.toString()}`);
  },
  
  cleanupOldLogs: (daysToKeep?: number) => {
    const params = new URLSearchParams();
    if (daysToKeep) params.append('daysToKeep', daysToKeep.toString());
    return apiClient.delete(`/audit/cleanup?${params.toString()}`);
  },
  
  exportCSV: () =>
    apiClient.downloadFile('/audit/export/csv', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`),
};

// Módulo Médico - Atendimentos
export const medicoAPI = {
  // Fila de espera e triagem
  getFilaEspera: () =>
    apiClient.get<any[]>('/medico/fila-espera'),
    
  iniciarAtendimento: (pacienteId: number) =>
    apiClient.post<any>(`/medico/atendimento/iniciar/${pacienteId}`),
    
  finalizarAtendimento: (atendimentoId: number, dados: any) =>
    apiClient.patch<any>(`/medico/atendimento/finalizar/${atendimentoId}`, dados),
    
  // Atestados e documentos
  criarAtestado: (dados: any) =>
    apiClient.post<any>('/medico/atestados', dados),
    
  getAtestados: (pacienteId?: number) =>
    apiClient.get<any[]>(`/medico/atestados${pacienteId ? `?pacienteId=${pacienteId}` : ''}`),
    
  // Prescrições
  criarPrescricao: (dados: any) =>
    apiClient.post<any>('/medico/prescricoes', dados),
    
  getPrescricoes: (pacienteId?: number) =>
    apiClient.get<any[]>(`/medico/prescricoes${pacienteId ? `?pacienteId=${pacienteId}` : ''}`),
    
  // Templates de documentos
  getTemplates: (tipo: 'atestado' | 'prescricao' | 'liberacao') =>
    apiClient.get<any[]>(`/medico/templates/${tipo}`),
    
  salvarTemplate: (dados: any) =>
    apiClient.post<any>('/medico/templates', dados),
    
  // Histórico de pacientes
  getHistoricoPaciente: (pacienteId: number) =>
    apiClient.get<any>(`/medico/pacientes/${pacienteId}/historico`),
    
  // Dashboard médico
  getDashboardMedico: () =>
    apiClient.get<any>('/medico/dashboard'),
    
  // Estatísticas do médico
  getEstatisticasMedico: (periodo?: string) =>
    apiClient.get<any>(`/medico/estatisticas${periodo ? `?periodo=${periodo}` : ''}`),
};

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/