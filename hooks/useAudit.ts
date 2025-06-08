import React, { useEffect } from 'react';

// Interface para dados de auditoria
interface AuditData {
  action: string;
  resource: string;
  resourceId?: number;
  details?: object;
}

// Hook personalizado para registrar ações de auditoria automaticamente
export function useAudit() {
  // Função para registrar uma ação de auditoria
  const logAudit = async (data: AuditData) => {
    try {
      // Capturar informações do contexto
      const auditLog = {
        ...data,
        ipAddress: await getUserIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Enviar para o backend
      await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(auditLog),
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      // Não bloquear a aplicação em caso de erro na auditoria
    }
  };

  // Função auxiliar para obter IP do usuário
  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  // Funções específicas para diferentes tipos de ação
  const auditActions = {
    // Auditoria para operações CRUD
    create: (resource: string, resourceId?: number, details?: object) => {
      logAudit({
        action: 'CREATE',
        resource,
        resourceId,
        details,
      });
    },

    update: (resource: string, resourceId: number, details?: object) => {
      logAudit({
        action: 'UPDATE',
        resource,
        resourceId,
        details,
      });
    },

    delete: (resource: string, resourceId: number, details?: object) => {
      logAudit({
        action: 'DELETE',
        resource,
        resourceId,
        details,
      });
    },

    view: (resource: string, resourceId: number, details?: object) => {
      logAudit({
        action: 'VIEW',
        resource,
        resourceId,
        details,
      });
    },

    // Auditoria para autenticação
    login: (details?: object) => {
      logAudit({
        action: 'LOGIN',
        resource: 'Auth',
        details,
      });
    },

    logout: (details?: object) => {
      logAudit({
        action: 'LOGOUT',
        resource: 'Auth',
        details,
      });
    },

    // Auditoria para operações médicas específicas
    prescricao: (pacienteId: number, details?: object) => {
      logAudit({
        action: 'PRESCRICAO',
        resource: 'Paciente',
        resourceId: pacienteId,
        details,
      });
    },

    anotacaoMedica: (pacienteId: number, details?: object) => {
      logAudit({
        action: 'ANOTACAO_MEDICA',
        resource: 'Paciente',
        resourceId: pacienteId,
        details,
      });
    },

    sinaisVitais: (pacienteId: number, details?: object) => {
      logAudit({
        action: 'SINAIS_VITAIS',
        resource: 'Paciente',
        resourceId: pacienteId,
        details,
      });
    },

    exame: (pacienteId: number, details?: object) => {
      logAudit({
        action: 'EXAME',
        resource: 'Paciente',
        resourceId: pacienteId,
        details,
      });
    },

    // Auditoria para exportação de dados
    export: (resource: string, format: string, details?: object) => {
      logAudit({
        action: 'EXPORT',
        resource,
        details: {
          format,
          ...details,
        },
      });
    },

    // Auditoria para acesso a relatórios
    report: (reportType: string, details?: object) => {
      logAudit({
        action: 'REPORT_ACCESS',
        resource: 'Reports',
        details: {
          reportType,
          ...details,
        },
      });
    },
  };

  return auditActions;
}

// Hook para rastreamento automático de navegação (opcional)
export function usePageAudit(pageName: string) {
  const audit = useAudit();

  useEffect(() => {
    // Registrar acesso à página
    audit.view('Page', 0, { pageName });

    // Registrar tempo de permanência na página quando sair
    return () => {
      const timeSpent = Date.now();
      audit.view('Page', 0, { 
        pageName, 
        action: 'PAGE_EXIT',
        timeSpent 
      });
    };
  }, [pageName]);
}

// Decorator para componentes que fazem auditoria automática
export function withAudit<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  resourceName: string
): React.ComponentType<T> {
  return function AuditedComponent(props: T) {
    const audit = useAudit();

    // Hook para registrar visualização do componente
    useEffect(() => {
      audit.view(resourceName, 0, { componentName: WrappedComponent.name });
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

   */
