'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Plus, Trash2, Copy, Eye } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

// Interface para medicamento na prescrição
interface Medicamento {
  id?: string;
  nome: string;
  dosagem: string;
  via: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

// Interface para formulário de prescrição
interface PrescricaoFormProps {
  onSave: (prescricao: any) => void;
  onCancel: () => void;
  pacienteId: number;
  pacienteNome: string;
}

// Templates de prescrição predefinidos
const templatesPrescricao = {
  antibiotico: {
    nome: 'Tratamento com Antibiótico',
    medicamentos: [
      {
        nome: 'Amoxicilina + Ácido Clavulânico',
        dosagem: '875mg + 125mg',
        via: 'VO (via oral)',
        frequencia: 'De 12/12 horas',
        duracao: '7 dias',
        observacoes: 'Tomar com alimentos'
      }
    ],
    orientacoes: 'Completar todo o tratamento mesmo que os sintomas melhorem. Evitar bebidas alcoólicas durante o tratamento.'
  },
  analgesico: {
    nome: 'Controle da Dor',
    medicamentos: [
      {
        nome: 'Dipirona Sódica',
        dosagem: '500mg',
        via: 'VO (via oral)',
        frequencia: 'De 6/6 horas',
        duracao: '5 dias',
        observacoes: 'Se dor'
      },
      {
        nome: 'Ibuprofeno',
        dosagem: '400mg',
        via: 'VO (via oral)',
        frequencia: 'De 8/8 horas',
        duracao: '3 dias',
        observacoes: 'Após as refeições'
      }
    ],
    orientacoes: 'Usar conforme necessidade para controle da dor. Respeitar intervalos mínimos entre doses.'
  }
};

export default function PrescricaoForm({ onSave, onCancel, pacienteId, pacienteNome }: PrescricaoFormProps) {
  const [formData, setFormData] = useState({
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
    observacoesGerais: '',
    orientacoes: '',
    retorno: ''
  });

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    {
      id: '1',
      nome: '',
      dosagem: '',
      via: 'VO (via oral)',
      frequencia: '',
      duracao: '',
      observacoes: ''
    }
  ]);

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Adicionar novo medicamento
  const adicionarMedicamento = () => {
    const novoId = Date.now().toString();
    setMedicamentos([...medicamentos, {
      id: novoId,
      nome: '',
      dosagem: '',
      via: 'VO (via oral)',
      frequencia: '',
      duracao: '',
      observacoes: ''
    }]);
  };

  // Remover medicamento
  const removerMedicamento = (id: string) => {
    if (medicamentos.length > 1) {
      setMedicamentos(medicamentos.filter(med => med.id !== id));
    }
  };

  // Atualizar medicamento
  const atualizarMedicamento = (id: string, field: keyof Medicamento, value: string) => {
    setMedicamentos(medicamentos.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  // Aplicar template
  const aplicarTemplate = (templateKey: keyof typeof templatesPrescricao) => {
    const template = templatesPrescricao[templateKey];
    const medicamentosComId = template.medicamentos.map((med, index) => ({
      ...med,
      id: (Date.now() + index).toString()
    }));
    
    setMedicamentos(medicamentosComId);
    setFormData(prev => ({ ...prev, orientacoes: template.orientacoes }));
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se há pelo menos um medicamento preenchido
    const medicamentosValidos = medicamentos.filter(med => med.nome.trim() && med.dosagem.trim());
    if (medicamentosValidos.length === 0) {
      alert('Adicione pelo menos um medicamento à prescrição');
      return;
    }

    setLoading(true);

    try {
      const prescricaoData = {
        ...formData,
        pacienteId,
        medicamentos: medicamentosValidos,
        dataEmissao: new Date().toISOString()
      };

      // Simular salvamento
      console.log('Salvando prescrição:', prescricaoData);
      onSave(prescricaoData);
    } catch (error) {
      console.error('Erro ao salvar prescrição:', error);
    } finally {
      setLoading(false);
    }
  };

  // Opções de via de administração
  const viasAdministracao = [
    'VO (via oral)',
    'SC (subcutânea)',
    'IM (intramuscular)',
    'IV (intravenosa)',
    'Tópica',
    'Sublingual',
    'Nasal',
    'Ocular',
    'Auricular',
    'Retal',
    'Vaginal'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {previewMode ? 'Pré-visualização da Prescrição' : 'Nova Prescrição Médica'}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Editar' : 'Pré-visualizar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {previewMode ? (
          // Modo de pré-visualização
          <div className="bg-white p-8 border rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">HEMOSE</h2>
              <p className="text-gray-600">Hemocentro de Sergipe</p>
              <h3 className="text-xl font-semibold mt-4">PRESCRIÇÃO MÉDICA</h3>
            </div>
            
            <div className="mb-6">
              <p><strong>Paciente:</strong> {pacienteNome}</p>
              <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Válida até:</strong> {new Date(formData.dataValidade).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4">MEDICAMENTOS:</h4>
              {medicamentos.filter(med => med.nome.trim()).map((med, index) => (
                <div key={med.id} className="mb-4 p-3 border-l-4 border-blue-500 bg-gray-50">
                  <p className="font-medium">{index + 1}. {med.nome} {med.dosagem}</p>
                  <p>Via: {med.via}</p>
                  <p>Frequência: {med.frequencia}</p>
                  <p>Duração: {med.duracao}</p>
                  {med.observacoes && <p>Obs: {med.observacoes}</p>}
                </div>
              ))}
            </div>

            {formData.orientacoes && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">ORIENTAÇÕES:</h4>
                <div dangerouslySetInnerHTML={{ __html: formData.orientacoes }} />
              </div>
            )}

            {formData.retorno && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">RETORNO:</h4>
                <p>{formData.retorno}</p>
              </div>
            )}
          </div>
        ) : (
          // Modo de edição
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Templates rápidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Templates Rápidos
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => aplicarTemplate('antibiotico')}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Antibiótico
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => aplicarTemplate('analgesico')}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Analgésico
                </Button>
              </div>
            </div>

            {/* Informações gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <input
                  type="text"
                  value={pacienteNome}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válida até
                </label>
                <input
                  type="date"
                  name="dataValidade"
                  value={formData.dataValidade}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Lista de medicamentos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medicamentos
                </label>
                <Button type="button" variant="outline" size="sm" onClick={adicionarMedicamento}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {medicamentos.map((medicamento, index) => (
                  <div key={medicamento.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Medicamento {index + 1}</h4>
                      {medicamentos.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removerMedicamento(medicamento.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome do Medicamento *
                        </label>
                        <input
                          type="text"
                          value={medicamento.nome}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'nome', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Dipirona Sódica"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Dosagem *
                        </label>
                        <input
                          type="text"
                          value={medicamento.dosagem}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'dosagem', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Via de Administração
                        </label>
                        <select
                          value={medicamento.via}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'via', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {viasAdministracao.map(via => (
                            <option key={via} value={via}>{via}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Frequência
                        </label>
                        <input
                          type="text"
                          value={medicamento.frequencia}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'frequencia', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: De 8/8 horas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Duração
                        </label>
                        <input
                          type="text"
                          value={medicamento.duracao}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'duracao', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 7 dias"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <input
                          type="text"
                          value={medicamento.observacoes}
                          onChange={(e) => atualizarMedicamento(medicamento.id!, 'observacoes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Tomar com alimentos"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orientações gerais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientações Gerais
              </label>
              <RichTextEditor
                value={formData.orientacoes}
                onChange={(value) => setFormData(prev => ({ ...prev, orientacoes: value }))}
                placeholder="Orientações sobre o uso dos medicamentos, cuidados especiais..."
                height="150px"
              />
            </div>

            {/* Retorno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retorno
              </label>
              <input
                type="text"
                name="retorno"
                value={formData.retorno}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Retorno em 7 dias ou se necessário"
              />
            </div>

            {/* Observações gerais da prescrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Gerais
              </label>
              <textarea
                name="observacoesGerais"
                value={formData.observacoesGerais}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações gerais sobre a prescrição..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Prescrição'}
              </Button>
            </div>
          </form>
        )}
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
