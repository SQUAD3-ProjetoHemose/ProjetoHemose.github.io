'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Activity, 
  Thermometer,
  Eye,
  Calendar,
  User
} from 'lucide-react';

// Interface para sinais vitais
interface SinaisVitais {
  id?: number;
  dataMedicao?: string;
  dataRegistro?: string;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  temperatura?: number;
  saturacaoOxigenio?: number;
  peso?: number;
  altura?: number;
  escalaDor?: number;
  observacoes?: string;
  profissional?: {
    nome: string;
  };
}

// Props do componente
interface SinaisVitaisListProps {
  sinais: SinaisVitais[];
}

// Componente para exibir lista de sinais vitais
export default function SinaisVitaisList({ sinais }: SinaisVitaisListProps) {
  if (!sinais || sinais.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum registro de sinais vitais encontrado.</p>
        <p className="text-sm text-gray-400 mt-2">
          Use o botão "Registrar Sinais" para adicionar o primeiro registro.
        </p>
      </div>
    );
  }

  // Calcular IMC quando peso e altura estão disponíveis
  const calcularIMC = (peso?: number, altura?: number): string => {
    if (!peso || !altura) return 'N/A';
    const imc = peso / Math.pow(altura / 100, 2);
    return imc.toFixed(1);
  };

  // Classificar IMC
  const classificarIMC = (imc: string): string => {
    const valor = parseFloat(imc);
    if (isNaN(valor)) return '';
    
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    if (valor < 35) return 'Obesidade grau I';
    if (valor < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  return (
    <div className="space-y-4">
      {sinais.map((sinal, index) => {
        const dataRegistro = sinal.dataRegistro || sinal.dataMedicao;
        const imc = calcularIMC(sinal.peso, sinal.altura);
        
        return (
          <Card key={sinal.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Header com data e profissional */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {dataRegistro ? new Date(dataRegistro).toLocaleString('pt-BR') : 'Data não informada'}
                </div>
                
                {sinal.profissional && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {sinal.profissional.nome}
                  </div>
                )}
              </div>

              {/* Grid com sinais vitais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Pressão Arterial */}
                {(sinal.pressaoSistolica && sinal.pressaoDiastolica) && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Pressão Arterial</p>
                      <p className="font-medium">{sinal.pressaoSistolica}/{sinal.pressaoDiastolica} mmHg</p>
                    </div>
                  </div>
                )}

                {/* Frequência Cardíaca */}
                {sinal.frequenciaCardiaca && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Freq. Cardíaca</p>
                      <p className="font-medium">{sinal.frequenciaCardiaca} bpm</p>
                    </div>
                  </div>
                )}

                {/* Temperatura */}
                {sinal.temperatura && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Temperatura</p>
                      <p className="font-medium">{sinal.temperatura}°C</p>
                    </div>
                  </div>
                )}

                {/* Saturação */}
                {sinal.saturacaoOxigenio && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">SpO₂</p>
                      <p className="font-medium">{sinal.saturacaoOxigenio}%</p>
                    </div>
                  </div>
                )}

                {/* Frequência Respiratória */}
                {sinal.frequenciaRespiratoria && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-gray-500">Freq. Respiratória</p>
                      <p className="font-medium">{sinal.frequenciaRespiratoria} irpm</p>
                    </div>
                  </div>
                )}

                {/* Peso */}
                {sinal.peso && (
                  <div>
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="font-medium">{sinal.peso} kg</p>
                  </div>
                )}

                {/* Altura */}
                {sinal.altura && (
                  <div>
                    <p className="text-xs text-gray-500">Altura</p>
                    <p className="font-medium">{sinal.altura} cm</p>
                  </div>
                )}

                {/* IMC */}
                {imc !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-500">IMC</p>
                    <p className="font-medium">{imc}</p>
                    <p className="text-xs text-gray-400">{classificarIMC(imc)}</p>
                  </div>
                )}
              </div>

              {/* Escala de dor */}
              {sinal.escalaDor !== undefined && sinal.escalaDor !== null && (
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Escala de Dor</span>
                    <Badge 
                      className={
                        sinal.escalaDor <= 3 
                          ? 'bg-green-100 text-green-800'
                          : sinal.escalaDor <= 6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {sinal.escalaDor}/10
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        sinal.escalaDor <= 3 
                          ? 'bg-green-500'
                          : sinal.escalaDor <= 6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(sinal.escalaDor / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Observações */}
              {sinal.observacoes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                  <p className="text-sm text-gray-600">{sinal.observacoes}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
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
