// Hook para lógica de pacientes
import { useState, useCallback, useMemo } from 'react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import usePacienteStore from '@/store/pacienteStore';
import { Paciente, CreatePacienteDto } from '@/types';

// Hook para formulário de paciente
export const usePacienteForm = (pacienteInicial?: Partial<Paciente>) => {
  // Estado local do formulário usando a estrutura correta
  const [formData, setFormData] = useState<Partial<CreatePacienteDto & { status?: string; leito?: string; sinaisVitais?: string }>>({
    nome: pacienteInicial?.nome || '',
    cpf: pacienteInicial?.cpf || '',
    data_nascimento: pacienteInicial?.data_nascimento || '',
    sexo: pacienteInicial?.sexo || 'M',
    telefone: pacienteInicial?.telefone || '',
    email: pacienteInicial?.email || '',
    endereco: pacienteInicial?.endereco || '',
    cidade: pacienteInicial?.cidade || '',
    estado: pacienteInicial?.estado || '',
    cep: pacienteInicial?.cep || '',
    contato_emergencia_nome: pacienteInicial?.contato_emergencia_nome || '',
    contato_emergencia_telefone: pacienteInicial?.contato_emergencia_telefone || '',
    observacoes: pacienteInicial?.observacoes || '',
    ativo: pacienteInicial?.ativo ?? true,
    // Campos adicionais do frontend
    leito: pacienteInicial?.leito || '',
    status: pacienteInicial?.status || 'ativo',
    sinaisVitais: pacienteInicial?.sinaisVitais || ''
  });

  // Acesso às ações do store
  const { createPaciente, updatePaciente } = usePacienteStore();

  // Calcular idade baseado na data de nascimento
  const calcularIdade = useCallback((dataNascimento: string) => {
    if (!dataNascimento) return 0;
    try {
      const data = parseISO(dataNascimento);
      return differenceInYears(new Date(), data);
    } catch (error) {
      return 0;
    }
  }, []);

  // Tratamento de mudanças no formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Função para lidar com mudanças em datas usando componentes de data específicos
  const handleDateChange = useCallback((date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setFormData(prev => ({ ...prev, data_nascimento: formattedDate }));
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
      data_nascimento: '',
      sexo: 'M',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      contato_emergencia_nome: '',
      contato_emergencia_telefone: '',
      observacoes: '',
      ativo: true,
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

  // Validar email
  const validarEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm,
    validarCPF,
    validarEmail,
    calcularIdade
  };
};

// Hook para gerenciamento de pacientes
export const usePacienteManager = () => {
  // Estado do componente
  const [filtroNome, setFiltroNome] = useState<string>('');
  const [filtroCPF, setFiltroCPF] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroSexo, setFiltroSexo] = useState<'M' | 'F' | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);

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

  // Calcular idade do paciente
  const calcularIdade = useCallback((dataNascimento?: string) => {
    if (!dataNascimento) return 0;
    try {
      const data = parseISO(dataNascimento);
      return differenceInYears(new Date(), data);
    } catch (error) {
      return 0;
    }
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

    if (filtroSexo) {
      resultado = resultado.filter(p => 
        p.sexo === filtroSexo
      );
    }

    if (filtroAtivo !== null) {
      resultado = resultado.filter(p => 
        p.ativo === filtroAtivo
      );
    }
    
    return resultado;
  }, [pacientes, filtroNome, filtroCPF, filtroStatus, filtroSexo, filtroAtivo]);

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
    filtroSexo,
    setFiltroSexo,
    filtroAtivo,
    setFiltroAtivo,
    
    // Dados filtrados
    pacientesFiltrados,
    
    // Ações
    buscarPacientes,
    fetchPaciente,
    deletePaciente,
    
    // Utilitários
    formatarData,
    formatarCPF,
    formatarTelefone,
    calcularIdade
  };
};

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
