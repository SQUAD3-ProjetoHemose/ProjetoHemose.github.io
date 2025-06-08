'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit3, 
  Eye, 
  Calendar,
  User,
  AlertCircle,
  Lock,
  Users
} from 'lucide-react';

// Interface para anotação médica
interface AnotacaoMedica {
  id?: number;
  tipo: string;
  titulo?: string;
  conteudo: string;
  anotacao?: string;
  diagnostico?: string;
  prescricao?: string;
  observacoes?: string;
  prioridade: string;
  visivelOutros: boolean;
  anotacaoPrivada: boolean;
  profissional?: {
    nome: string;
  };
  medico?: {
    nome: string;
  };
  createdAt: string;
  dataAnotacao?: string;
}

// Props do componente
interface AnotacoesListProps {
  anotacoes: AnotacaoMedica[];
}

// Componente para exibir lista de anotações médicas
export default function AnotacoesList({ anotacoes }: AnotacoesListProps) {
  if (!anotacoes || anotacoes.length === 0) {
    return (
      <div className="text-center py-8">
        <Edit3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma anotação médica encontrada.</p>
        <p className="text-sm text-gray-400 mt-2">
          Use o botão "Nova Anotação" para adicionar o primeiro registro.
        </p>
      </div>
    );
  }

  // Obter cor do badge baseado no tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'consulta': return 'bg-blue-100 text-blue-800';
      case 'evolucao': return 'bg-green-100 text-green-800';
      case 'procedimento': return 'bg-purple-100 text-purple-800';
      case 'alta': return 'bg-gray-100 text-gray-800';
      case 'intercorrencia': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor do badge baseado na prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear texto para exibição resumida
  const formatarTextoResumo = (texto: string, limite: number = 150): string => {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  };

  return (
    <div className="space-y-4">
      {anotacoes.map((anotacao, index) => {
        const dataAnotacao = anotacao.dataAnotacao || anotacao.createdAt;
        const conteudo = anotacao.conteudo || anotacao.anotacao || '';
        const profissional = anotacao.profissional || anotacao.medico;
        
        return (
          <Card key={anotacao.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Header com badges e data */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getTipoColor(anotacao.tipo)}>
                    {anotacao.tipo.charAt(0).toUpperCase() + anotacao.tipo.slice(1)}
                  </Badge>
                  
                  <Badge className={getPrioridadeColor(anotacao.prioridade)}>
                    {anotacao.prioridade === 'urgente' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {anotacao.prioridade.charAt(0).toUpperCase() + anotacao.prioridade.slice(1)}
                  </Badge>

                  {anotacao.anotacaoPrivada && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Privada
                    </Badge>
                  )}

                  {anotacao.visivelOutros && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Compartilhada
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 text-right">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dataAnotacao ? new Date(dataAnotacao).toLocaleString('pt-BR') : 'Data não informada'}
                  </div>
                  {profissional && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {profissional.nome}
                    </div>
                  )}
                </div>
              </div>

              {/* Título (se houver) */}
              {anotacao.titulo && (
                <h4 className="font-semibold text-gray-900 mb-2">
                  {anotacao.titulo}
                </h4>
              )}

              {/* Conteúdo principal */}
              <div className="space-y-3">
                {/* Anotação/Conteúdo */}
                {conteudo && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Anotação:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {formatarTextoResumo(conteudo)}
                    </p>
                  </div>
                )}

                {/* Diagnóstico */}
                {anotacao.diagnostico && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
                    <p className="text-sm text-gray-600">
                      {formatarTextoResumo(anotacao.diagnostico, 100)}
                    </p>
                  </div>
                )}

                {/* Prescrição */}
                {anotacao.prescricao && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Prescrição:</p>
                    <div className="bg-blue-50 p-2 rounded text-sm text-gray-700">
                      {formatarTextoResumo(anotacao.prescricao, 120)}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {anotacao.observacoes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                    <p className="text-sm text-gray-500 italic">
                      {formatarTextoResumo(anotacao.observacoes, 100)}
                    </p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Ver Completo
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
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
