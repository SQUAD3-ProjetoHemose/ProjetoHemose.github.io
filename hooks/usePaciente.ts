// Hook para lógica de pacientes
import { useState, useCallback, useMemo } from 'react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import usePacienteStore from '@/store/pacienteStore';
import { Paciente } from '@/types';

// Hook para formulário de paciente
export const usePacienteForm = (pacienteInicial?: Partial<Paciente>) => {
  // Estado local do formulário
  const [formData, setFormData] = useState<Partial<Paciente>>({
    nome: pacienteInicial?.nome || '',
    cpf: pacienteInicial?.cpf || '',
    dataNascimento: pacienteInicial?.dataNascimento || '',
    telefone: pacienteInicial?.telefone || '',
    endereco: pacienteInicial?.endereco || '',
    idade: pacienteInicial?.idade || 0,
    leito: pacienteInicial?.leito || '',
    status: pacienteInicial?.status || 'ativo',
    sinaisVitais: pacienteInicial?.sinaisVitais || ''
  });

  // Acesso às ações do store
  const { createPaciente, updatePaciente } = usePacienteStore();

  // Tratamento de mudanças no formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Cálculo automático da idade quando a data de nascimento é alterada
    if (name === 'dataNascimento' && value) {
      try {
        const dataNascimento = parseISO(value);
        const idade = differenceInYears(new Date(), dataNascimento);
        setFormData(prev => ({ ...prev, [name]: value, idade }));
      } catch (error) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Função para lidar com mudanças em datas usando componentes de data específicos
  const handleDateChange = useCallback((date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const idade = differenceInYears(new Date(), date);
    setFormData(prev => ({ ...prev, dataNascimento: formattedDate, idade }));
  }, []);

  // Tratamento de submissão do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (pacienteInicial?.id) {
        // Atualização de paciente existente
        return await updatePaciente(pacienteInicial.id, formData);
      } else {
        // Criação de novo paciente
        return await createPaciente(formData);
      }
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      throw error;
    }
  }, [formData, pacienteInicial, createPaciente, updatePaciente]);

  // Reset do formulário
  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      endereco: '',
      idade: 0,
      leito: '',
      status: 'ativo',
      sinaisVitais: ''
    });
  }, []);

  // Validações
  const validarCPF = useCallback((cpf: string) => {
    // Implementação da validação de CPF
    if (!cpf) return false;
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    
    // Verificação de CPFs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm,
    validarCPF
  };
};

// Hook para gerenciamento de pacientes
export const usePacienteManager = () => {
  // Estado do componente
  const [filtroNome, setFiltroNome] = useState<string>('');
  const [filtroCPF, setFiltroCPF] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  // Acesso ao estado e ações da store
  const { 
    pacientes, 
    pacienteSelecionado,
    loading, 
    error,
    fetchPacientes,
    fetchPaciente,
    deletePaciente
  } = usePacienteStore();

  // Buscar pacientes
  const buscarPacientes = useCallback(async () => {
    try {
      return await fetchPacientes();
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }, [fetchPacientes]);

  // Formatar data para exibição
  const formatarData = useCallback((dataString?: string) => {
    if (!dataString) return '';
    
    try {
      const data = parseISO(dataString);
      return format(data, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dataString;
    }
  }, []);

  // Formatar CPF para exibição
  const formatarCPF = useCallback((cpf?: string) => {
    if (!cpf) return '';
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    if (cpfLimpo.length === 11) {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
    }
    
    return cpfLimpo;
  }, []);

  // Formatar telefone para exibição
  const formatarTelefone = useCallback((telefone?: string) => {
    if (!telefone) return '';
    
    const telefoneLimpo = telefone.replace(/[^\d]/g, '');
    
    if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  }, []);

  // Pacientes filtrados
  const pacientesFiltrados = useMemo(() => {
    let resultado = [...pacientes];
    
    if (filtroNome) {
      resultado = resultado.filter(p => 
        p.nome.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }
    
    if (filtroCPF) {
      resultado = resultado.filter(p => 
        p.cpf?.includes(filtroCPF)
      );
    }
    
    if (filtroStatus) {
      resultado = resultado.filter(p => 
        p.status === filtroStatus
      );
    }
    
    return resultado;
  }, [pacientes, filtroNome, filtroCPF, filtroStatus]);

  return {
    // Estado
    pacientes,
    pacienteSelecionado,
    loading,
    error,
    
    // Filtros
    filtroNome,
    setFiltroNome,
    filtroCPF,
    setFiltroCPF,
    filtroStatus,
    setFiltroStatus,
    
    // Ações
    buscarPacientes,
    fetchPaciente,
    deletePaciente,
    
    // Utilitários
    formatarData,
    formatarCPF
  };
};
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
