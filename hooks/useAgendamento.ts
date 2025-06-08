// Hook para lógica de agendamentos
import { useState, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAgendamentoStore from '@/store/agendamentoStore';
import { Agendamento, AgendamentoForm, StatusAgendamento, TipoAgendamento } from '@/types';

// Hook para formulário de agendamento
export const useAgendamentoForm = (agendamentoInicial?: Partial<Agendamento>) => {
  // Estado local do formulário
  const [formData, setFormData] = useState<AgendamentoForm>({
    data: agendamentoInicial?.data || format(new Date(), 'yyyy-MM-dd'),
    horario: agendamentoInicial?.hora || '08:00',
    tipo: agendamentoInicial?.tipo || TipoAgendamento.CONSULTA,
    observacoes: agendamentoInicial?.observacoes || '',
    paciente_id: agendamentoInicial?.paciente_id || 0,
    medico_id: agendamentoInicial?.medico_id || 0,
    status: agendamentoInicial?.status || StatusAgendamento.AGENDADO
  });

  // Acesso às ações do store
  const { createAgendamento, updateAgendamento } = useAgendamentoStore();

  // Tratamento de mudanças no formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Função para lidar com mudanças em datas usando componentes de data específicos
  const handleDateChange = useCallback((date: Date) => {
    setFormData(prev => ({ ...prev, data: format(date, 'yyyy-MM-dd') }));
  }, []);

  // Função para submeter o formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (agendamentoInicial?.id) {
        await updateAgendamento(agendamentoInicial.id, formData);
      } else {
        await createAgendamento(formData);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      throw error;
    }
  }, [formData, agendamentoInicial, createAgendamento, updateAgendamento]);

  // Função para resetar o formulário
  const resetForm = useCallback(() => {
    setFormData({
      data: format(new Date(), 'yyyy-MM-dd'),
      horario: '08:00',
      tipo: TipoAgendamento.CONSULTA,
      observacoes: '',
      paciente_id: 0,
      medico_id: 0,
      status: StatusAgendamento.AGENDADO
    });
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleDateChange,
    handleSubmit,
    resetForm
  };
};

// Hook para gerenciamento de agendamentos
export const useAgendamentoManager = () => {
  // Estado do componente
  const [filtroData, setFiltroData] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filtroMedico, setFiltroMedico] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | null>(null);

  // Acesso ao estado e ações da store
  const { 
    agendamentos, 
    agendamentoSelecionado,
    loading, 
    error,
    fetchAgendamentos,
    fetchAgendamento,
    deleteAgendamento,
    confirmarAgendamento,
    cancelarAgendamento,
    realizarAgendamento,
    registrarFalta
  } = useAgendamentoStore();

  // Buscar agendamentos com filtros
  const buscarAgendamentos = useCallback(async () => {
    try {
      return await fetchAgendamentos(
        filtroData || undefined,
        filtroMedico || undefined,
        undefined,
        filtroStatus || undefined
      );
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  }, [fetchAgendamentos, filtroData, filtroMedico, filtroStatus]);

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

  // Formatar horário para exibição
  const formatarHorario = useCallback((horario?: string) => {
    if (!horario) return '';
    return horario;
  }, []);

  return {
    // Estado
    agendamentos,
    agendamentoSelecionado,
    loading,
    error,
    
    // Filtros
    filtroData,
    setFiltroData,
    filtroMedico,
    setFiltroMedico,
    filtroStatus,
    setFiltroStatus,
    
    // Ações
    buscarAgendamentos,
    fetchAgendamento,
    deleteAgendamento,
    confirmarAgendamento,
    cancelarAgendamento,
    realizarAgendamento,
    registrarFalta,
    
    // Utilitários
    formatarData,
    formatarHorario
  };
};
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
