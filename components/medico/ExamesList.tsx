'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, 
  Eye, 
  Calendar,
  User,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Interface para exame
interface Exame {
  id?: number;
  tipoExame: string;
  nomeExame: string;
  descricao?: string;
  status: string;
  dataSolicitacao: string;
  dataAgendada?: string;
  dataRealizacao?: string;
  resultado?: string;
  interpretacaoMedica?: string;
  prioridade: string;
  medicoSolicitante?: {
    nome: string;
  };
}

// Props do componente
interface ExamesListProps {
  exames: Exame[];
}

// Componente para exibir lista de exames
export default function ExamesList({ exames }: ExamesListProps) {
  if (!exames || exames.length === 0) {
    return (
      <div className="text-center py-8">
        <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum exame encontrado.</p>
        <p className="text-sm text-gray-400 mt-2">
          Use o botão "Solicitar Exame" para adicionar o primeiro exame.
        </p>
      </div>
    );
  }

  // Obter cor e ícone do status
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'solicitado':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: 'Solicitado'
        };
      case 'agendado':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Calendar,
          label: 'Agendado'
        };
      case 'em_andamento':
      case 'em andamento':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: AlertCircle,
          label: 'Em Andamento'
        };
      case 'concluido':
      case 'concluído':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Concluído'
        };
      case 'cancelado':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: 'Cancelado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: status
        };
    }
  };

  // Obter cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor do tipo de exame
  const getTipoExameColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'laboratorial': return 'bg-purple-100 text-purple-800';
      case 'imagem': return 'bg-blue-100 text-blue-800';
      case 'cardiologico': return 'bg-red-100 text-red-800';
      case 'neurológico': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {exames.map((exame, index) => {
        const statusInfo = getStatusInfo(exame.status);
        const StatusIcon = statusInfo.icon;
        
        return (
          <Card key={exame.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Header com nome do exame e status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {exame.nomeExame}
                  </h4>
                  {exame.descricao && (
                    <p className="text-sm text-gray-600 mt-1">
                      {exame.descricao}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Badges de tipo e prioridade */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getTipoExameColor(exame.tipoExame)}>
                  {exame.tipoExame}
                </Badge>
                
                <Badge className={getPrioridadeColor(exame.prioridade)}>
                  Prioridade: {exame.prioridade}
                </Badge>
              </div>

              {/* Informações de datas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Solicitado em:</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(exame.dataSolicitacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {exame.dataAgendada && (
                  <div>
                    <p className="text-gray-500 font-medium">Agendado para:</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span>{new Date(exame.dataAgendada).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )}

                {exame.dataRealizacao && (
                  <div>
                    <p className="text-gray-500 font-medium">Realizado em:</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>{new Date(exame.dataRealizacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Médico solicitante */}
              {exame.medicoSolicitante && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Solicitado por: Dr(a). {exame.medicoSolicitante.nome}</span>
                  </div>
                </div>
              )}

              {/* Resultado */}
              {exame.resultado && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Resultado:</p>
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {exame.resultado}
                    </p>
                  </div>
                </div>
              )}

              {/* Interpretação médica */}
              {exame.interpretacaoMedica && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Interpretação Médica:</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {exame.interpretacaoMedica}
                    </p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </Button>
                
                {exame.resultado && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Laudo
                  </Button>
                )}

                {exame.status.toLowerCase() === 'solicitado' && (
                  <Button size="sm" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    Agendar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
