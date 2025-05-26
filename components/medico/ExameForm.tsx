'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

// Interface para formulário de exame
interface ExameFormProps {
  onSave: (exame: any) => void;
  onCancel: () => void;
  pacienteId: number;
}

export default function ExameForm({ onSave, onCancel, pacienteId }: ExameFormProps) {
  const [formData, setFormData] = useState({
    tipoExame: 'laboratorial',
    nomeExame: '',
    descricao: '',
    prioridade: 'normal',
    dataAgendada: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/prontuario-eletronico/exame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          pacienteId,
          status: 'solicitado',
          dataSolicitacao: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const exame = await response.json();
        onSave(exame);
      } else {
        console.error('Erro ao solicitar exame');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo do exame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Exame *
              </label>
              <select
                name="tipoExame"
                value={formData.tipoExame}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="laboratorial">Laboratorial</option>
                <option value="imagem">Imagem</option>
                <option value="cardiologico">Cardiológico</option>
                <option value="neurológico">Neurológico</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Nome do exame */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Exame *
            </label>
            <input
              type="text"
              name="nomeExame"
              value={formData.nomeExame}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Hemograma Completo, Radiografia de Tórax..."
            />
          </div>

          {/* Data agendada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Preferencial (opcional)
            </label>
            <input
              type="date"
              name="dataAgendada"
              value={formData.dataAgendada}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descrição/Justificativa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição/Justificativa
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Justificativa clínica para o exame..."
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações adicionais, preparo especial, etc..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Solicitando...' : 'Solicitar Exame'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
