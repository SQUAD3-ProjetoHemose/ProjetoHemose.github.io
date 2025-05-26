import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Interface para configuração de auditoria
interface AuditConfig {
  enabled: boolean;
  excludeRoutes?: string[];
  includeRequestBody?: boolean;
  includeResponseData?: boolean;
}

// Configuração padrão de auditoria
const defaultAuditConfig: AuditConfig = {
  enabled: true,
  excludeRoutes: ['/api/audit', '/api/auth/refresh', '/api/health'],
  includeRequestBody: false, // Por segurança, não incluir por padrão
  includeResponseData: false, // Para evitar logs muito grandes
};

// Interceptor Axios para auditoria automática
export function createAuditedAxiosInstance(
  baseURL: string = '/api',
  auditConfig: Partial<AuditConfig> = {}
): AxiosInstance {
  const config = { ...defaultAuditConfig, ...auditConfig };
  
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Interceptor de requisição - registra tentativas de acesso
  axiosInstance.interceptors.request.use(
    (requestConfig) => {
      // Adicionar token de autenticação automaticamente
      const token = localStorage.getItem('token');
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Registrar auditoria se habilitada
      if (config.enabled && !isExcludedRoute(requestConfig.url || '', config.excludeRoutes || [])) {
        registerRequestAudit(requestConfig, config);
      }

      return requestConfig;
    },
    (error) => {
      console.error('Erro na requisição:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta - registra resultados das operações
  axiosInstance.interceptors.response.use(
    (response) => {
      // Registrar auditoria de sucesso
      if (config.enabled && !isExcludedRoute(response.config.url || '', config.excludeRoutes || [])) {
        registerResponseAudit(response, 'SUCCESS', config);
      }

      return response;
    },
    (error) => {
      // Registrar auditoria de erro
      if (config.enabled && error.config && !isExcludedRoute(error.config.url || '', config.excludeRoutes || [])) {
        registerResponseAudit(error.response, 'ERROR', config, error.message);
      }

      // Tratamento específico para erros 401 (não autorizado)
      if (error.response?.status === 401) {
        // Remover token inválido e redirecionar para login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

// Função para verificar se a rota deve ser excluída da auditoria
function isExcludedRoute(url: string, excludeRoutes: string[]): boolean {
  return excludeRoutes.some(route => url.includes(route));
}

// Função para registrar auditoria de requisição
async function registerRequestAudit(
  requestConfig: AxiosRequestConfig,
  config: AuditConfig
) {
  try {
    const auditData = {
      action: getActionFromMethod(requestConfig.method?.toUpperCase() || 'GET'),
      resource: getResourceFromUrl(requestConfig.url || ''),
      details: {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        ...(config.includeRequestBody && requestConfig.data ? { requestBody: requestConfig.data } : {}),
      },
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
      status: 'INITIATED',
    };

    // Enviar auditoria de forma assíncrona para não bloquear a requisição
    sendAuditLog(auditData);
  } catch (error) {
    console.warn('Erro ao registrar auditoria de requisição:', error);
  }
}

// Função para registrar auditoria de resposta
async function registerResponseAudit(
  response: AxiosResponse | undefined,
  status: 'SUCCESS' | 'ERROR',
  config: AuditConfig,
  errorMessage?: string
) {
  try {
    const auditData = {
      action: getActionFromMethod(response?.config?.method?.toUpperCase() || 'GET'),
      resource: getResourceFromUrl(response?.config?.url || ''),
      details: {
        method: response?.config?.method?.toUpperCase(),
        url: response?.config?.url,
        statusCode: response?.status,
        ...(config.includeResponseData && response?.data ? { responseData: response.data } : {}),
        ...(errorMessage ? { errorMessage } : {}),
      },
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
      status,
      ...(errorMessage ? { errorMessage } : {}),
    };

    sendAuditLog(auditData);
  } catch (error) {
    console.warn('Erro ao registrar auditoria de resposta:', error);
  }
}

// Mapear método HTTP para ação de auditoria
function getActionFromMethod(method: string): string {
  const methodMapping: { [key: string]: string } = {
    'GET': 'READ',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
  };

  return methodMapping[method] || 'ACTION';
}

// Extrair recurso da URL
function getResourceFromUrl(url: string): string {
  try {
    const pathSegments = url.split('/').filter(segment => segment);
    if (pathSegments.length >= 2) {
      return pathSegments[1]; // Assumindo /api/resource/id
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// Função para obter IP do usuário
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Função para enviar log de auditoria
async function sendAuditLog(auditData: any) {
  try {
    // Usar fetch direto para evitar loop no interceptor
    await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(auditData),
    });
  } catch (error) {
    // Falha silenciosa na auditoria para não impactar a aplicação
    console.warn('Falha ao enviar log de auditoria:', error);
  }
}

// Instância global do Axios com auditoria
export const apiClient = createAuditedAxiosInstance();

// Instância sem auditoria para operações internas
export const internalApiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Adicionar token automaticamente também na instância interna
internalApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

   */
