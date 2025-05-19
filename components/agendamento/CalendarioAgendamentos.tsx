import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento, StatusAgendamento } from '@/types';
import { useAgendamentos } from '@/lib/apiAgendamento';
import { useRouter } from 'next/navigation';

// Interface para as propriedades do componente
interface CalendarioAgendamentosProps {
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  initialDate?: Date;
}

const CalendarioAgendamentos: React.FC<CalendarioAgendamentosProps> = ({
  onDateSelect,
  onMonthChange,
  initialDate = new Date()
}) => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [agendamentosPorDia, setAgendamentosPorDia] = useState<Map<string, Agendamento[]>>(new Map());
  
  const { fetchAgendamentos } = useAgendamentos();

  // Carregar dias do mês atual
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Adiciona dias do mês anterior para começar a semana corretamente
    const startDay = getDay(monthStart);
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (i + 1));
      prevMonthDays.push(date);
    }
    
    // Adiciona dias do próximo mês para completar a grade
    const endDay = getDay(monthEnd);
    const nextMonthDays = [];
    for (let i = 1; i < 7 - endDay; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      nextMonthDays.push(date);
    }
    
    setCalendarDays([...prevMonthDays, ...daysInMonth, ...nextMonthDays]);
    
    // Notificar componente pai sobre a mudança de mês, se necessário
    if (onMonthChange) {
      onMonthChange(currentMonth);
    }
  }, [currentMonth, onMonthChange]);

  // Carregar agendamentos do mês
  useEffect(() => {
    const loadAgendamentos = async () => {
      try {
        // Formatar as datas de início e fim do mês
        const firstDay = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const lastDay = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        // Buscar agendamentos do mês inteiro
        const agendamentosMes = await fetchAgendamentos();
        
        // Agrupar agendamentos por dia
        const agrupados = new Map<string, Agendamento[]>();
        
        agendamentosMes.forEach((agendamento: Agendamento) => {
          const dataKey = agendamento.data.substring(0, 10); // Formato yyyy-MM-dd
          if (!agrupados.has(dataKey)) {
            agrupados.set(dataKey, []);
          }
          agrupados.get(dataKey)?.push(agendamento);
        });
        
        setAgendamentosPorDia(agrupados);
      } catch (error) {
        console.error('Erro ao carregar agendamentos do mês:', error);
      }
    };
    
    loadAgendamentos();
  }, [currentMonth]);

  // Função para ir para o próximo mês
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Função para ir para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Função para selecionar uma data
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    
    if (onDateSelect) {
      onDateSelect(day);
    }
    
    // Redirecionar para a página de agendamentos do dia
    router.push(`/recepcionista/agendamentos?data=${format(day, 'yyyy-MM-dd')}`);
  };

  // Função para verificar se há agendamentos em uma data
  const hasAppointments = (date: Date): boolean => {
    const dataKey = format(date, 'yyyy-MM-dd');
    return agendamentosPorDia.has(dataKey) && (agendamentosPorDia.get(dataKey)?.length || 0) > 0;
  };

  // Função para contar agendamentos em uma data
  const countAppointments = (date: Date): number => {
    const dataKey = format(date, 'yyyy-MM-dd');
    return agendamentosPorDia.get(dataKey)?.length || 0;
  };

  // Função para contar agendamentos por status em uma data
  const countAppointmentsByStatus = (date: Date, status: StatusAgendamento): number => {
    const dataKey = format(date, 'yyyy-MM-dd');
    return agendamentosPorDia.get(dataKey)?.filter(a => a.status === status).length || 0;
  };

  // Função para gerar classes CSS para cada dia
  const dayClasses = (day: Date) => {
    let classes = "p-2 relative rounded-md h-14 w-14 flex flex-col items-center justify-start";
    
    // Verificar se o dia está no mês atual
    if (!isSameMonth(day, currentMonth)) {
      classes += " text-gray-400 bg-gray-50";
    } else {
      classes += " text-black";
    }
    
    // Verificar se é o dia selecionado
    if (isSameDay(day, selectedDate)) {
      classes += " bg-purple-100 border-2 border-purple-600";
    }
    
    // Verificar se é o dia de hoje
    if (isSameDay(day, new Date())) {
      classes += " bg-blue-50 font-semibold";
    }
    
    // Verificar se tem agendamentos
    if (hasAppointments(day)) {
      classes += " cursor-pointer hover:bg-purple-50";
    } else {
      classes += " cursor-default";
    }
    
    return classes;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ◀
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            Hoje
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
      </div>
      
      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-black"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={dayClasses(day)}
            onClick={() => hasAppointments(day) && handleDateClick(day)}
          >
            <span className="text-sm">{format(day, 'd')}</span>
            
            {/* Indicadores de agendamentos */}
            {hasAppointments(day) && (
              <div className="flex flex-wrap gap-0.5 mt-1 justify-center items-center">
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  {countAppointments(day)}
                </span>
                
                {countAppointmentsByStatus(day, StatusAgendamento.CONFIRMADO) > 0 && (
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                )}
                
                {countAppointmentsByStatus(day, StatusAgendamento.CANCELADO) > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legenda */}
      <div className="mt-4 text-xs text-gray-600 flex flex-wrap gap-3">
        <div className="flex items-center">
          <span className="h-3 w-3 inline-block mr-1 rounded-full bg-blue-500"></span>
          Total
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 inline-block mr-1 rounded-full bg-green-500"></span>
          Confirmados
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 inline-block mr-1 rounded-full bg-red-500"></span>
          Cancelados
        </div>
      </div>
    </div>
  );
};

export default CalendarioAgendamentos;
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
