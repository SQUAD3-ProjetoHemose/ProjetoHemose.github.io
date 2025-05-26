'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X, FileText } from 'lucide-react';

// Interface para formulário de anotação médica
interface AnotacaoMedicaFormProps {
  onSave: (anotacao: any) => void;
  onCancel: () => void;
  pacienteId: number;
}

// Templates de anotações pré-definidos
const templates = {
  consulta: {
    titulo: 'Consulta Médica',
    anotacao: 'Paciente comparece à consulta referindo...\n\nQueixa principal:\n\nHistória da doença atual:\n\nExame físico:\n- Estado geral:\n- Sinais vitais:\n- Aparelhos:\n\nHipótese diagnóstica:\n\nConduta:'
  },
  evolucao: {
    titulo: 'Evolução Médica',
    anotacao: 'Paciente evolui...\n\nQueixas:\n\nExame físico:\n\nAvaliação:\n\nConduta:'
  },
  procedimento: {
    titulo: 'Procedimento Realizado',
    anotacao: 'Procedimento:\n\nIndicação:\n\nTécnica utilizada:\n\nIntercorrências:\n\nResultado:'
  },
  alta: {
    titulo: 'Alta Hospitalar',
    anotacao: 'Paciente em condições de alta hospitalar.\n\nDiagnóstico final:\n\nCondições da alta:\n\nOrientações:\n\nRetorno:'
  }
};

export default function AnotacaoMedicaForm({ onSave, onCancel, pacienteId }: AnotacaoMedicaFormProps) {
  const [formData, setFormData] = useState({
    tipo: 'consulta',
    titulo: '',
    anotacao: '',
    diagnostico: '',
    prescricao: '',
    observacoes: '',
    prioridade: 'normal',
    visivelOutros: true,
    anotacaoPrivada: false
  });

  const [loading, setLoading] = useState(false);

  // Aplicar template baseado no tipo
  const aplicarTemplate = () => {
    const template = templates[formData.tipo as keyof typeof templates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        titulo: template.titulo,
        anotacao: template.anotacao
      }));
    }
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.anotacao.trim()) {
      alert('O campo de anotação é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/prontuario-eletronico/anotacao-medica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          pacienteId,
          dataAnotacao: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const anotacao = await response.json();
        onSave(anotacao);
      } else {
        console.error('Erro ao salvar anotação');
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
            {/* Tipo da anotação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo da Anotação
              </label>
              <div className="flex gap-2">
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consulta">Consulta</option>
                  <option value="evolucao">Evolução</option>
                  <option value="procedimento">Procedimento</option>
                  <option value="alta">Alta</option>
                  <option value="intercorrencia">Intercorrência</option>
                </select>
                <Button type="button" variant="outline" size="sm" onClick={aplicarTemplate}>
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
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

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título (opcional)
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título da anotação..."
            />
          </div>

          {/* Anotação principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anotação Médica *
            </label>
            <textarea
              name="anotacao"
              value={formData.anotacao}
              onChange={handleInputChange}
              rows={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva a consulta, sintomas apresentados, exame físico..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Caracteres: {formData.anotacao.length}
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico
            </label>
            <textarea
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Diagnóstico clínico, CID-10..."
            />
          </div>

          {/* Prescrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescrição
            </label>
            <textarea
              name="prescricao"
              value={formData.prescricao}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Medicamentos prescritos, posologia, orientações..."
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
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Configurações de visibilidade */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="visivelOutros"
                name="visivelOutros"
                checked={formData.visivelOutros}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="visivelOutros" className="ml-2 block text-sm text-gray-700">
                Visível para outros profissionais
                <span className="text-xs text-gray-500 block">
                  Outros médicos e enfermeiras poderão visualizar esta anotação
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anotacaoPrivada"
                name="anotacaoPrivada"
                checked={formData.anotacaoPrivada}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anotacaoPrivada" className="ml-2 block text-sm text-gray-700">
                Anotação privada (apenas para o médico)
                <span className="text-xs text-gray-500 block">
                  Somente você poderá visualizar esta anotação
                </span>
              </label>
            </div>
          </div>

          {/* Aviso sobre prioridade urgente */}
          {formData.prioridade === 'urgente' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ⚠️ Anotação marcada como URGENTE será destacada no prontuário e pode gerar notificações.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Anotação'}
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
