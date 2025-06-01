'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Printer, FileText, Eye } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

// Interface para formulário de atestado
interface AtestadoFormProps {
  onSave: (atestado: any) => void;
  onCancel: () => void;
  pacienteId: number;
  pacienteNome: string;
}

// Templates predefinidos de atestados
const templatesAtestado = {
  afastamento: {
    titulo: 'Atestado de Afastamento',
    texto: `Atesto que o(a) paciente {{nome}}, portador(a) do CPF {{cpf}}, deverá afastar-se de suas atividades laborais por {{dias}} dias, no período de {{dataInicio}} a {{dataFim}}, devido a {{motivo}}.

CID: {{cid}}

Recomendações: {{recomendacoes}}

Local e data: {{local}}, {{dataEmissao}}`
  },
  comparecimento: {
    titulo: 'Declaração de Comparecimento',
    texto: `Declaro que o(a) Sr(a). {{nome}}, portador(a) do CPF {{cpf}}, esteve presente em consulta médica no dia {{data}} das {{horarioInicio}} às {{horarioFim}} horas.

A presente declaração é emitida para os devidos fins.

Local e data: {{local}}, {{dataEmissao}}`
  },
  acompanhamento: {
    titulo: 'Atestado de Acompanhamento',
    texto: `Atesto que o(a) Sr(a). {{nome}}, portador(a) do CPF {{cpf}}, necessita de acompanhamento médico em {{local}} no dia {{data}} às {{horario}} horas.

O acompanhante deverá afastar-se de suas atividades laborais durante o período necessário.

Local e data: {{local}}, {{dataEmissao}}`
  }
};

export default function AtestadoForm({ onSave, onCancel, pacienteId, pacienteNome }: AtestadoFormProps) {
  const [formData, setFormData] = useState({
    tipo: 'afastamento',
    titulo: '',
    conteudo: '',
    dias: '1',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    motivo: '',
    cid: '',
    recomendacoes: '',
    horarioInicio: '08:00',
    horarioFim: '09:00'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Aplicar template selecionado
  const aplicarTemplate = () => {
    const template = templatesAtestado[formData.tipo as keyof typeof templatesAtestado];
    if (template) {
      setFormData(prev => ({
        ...prev,
        titulo: template.titulo,
        conteudo: template.texto
      }));
    }
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calcular data fim baseada nos dias
    if (name === 'dias' || name === 'dataInicio') {
      const inicio = name === 'dataInicio' ? new Date(value) : new Date(formData.dataInicio);
      const diasNum = name === 'dias' ? parseInt(value) : parseInt(formData.dias);
      
      if (!isNaN(diasNum) && diasNum > 0) {
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + diasNum - 1);
        setFormData(prev => ({
          ...prev,
          dataFim: fim.toISOString().split('T')[0]
        }));
      }
    }
  };

  // Processar template com dados do formulário
  const processarTemplate = (texto: string): string => {
    const hoje = new Date();
    const dataFimObj = new Date(formData.dataFim);
    
    return texto
      .replace(/{{nome}}/g, pacienteNome)
      .replace(/{{cpf}}/g, '___.___.___-__') // Placeholder para CPF
      .replace(/{{dias}}/g, formData.dias)
      .replace(/{{dataInicio}}/g, new Date(formData.dataInicio).toLocaleDateString('pt-BR'))
      .replace(/{{dataFim}}/g, dataFimObj.toLocaleDateString('pt-BR'))
      .replace(/{{motivo}}/g, formData.motivo || '________________')
      .replace(/{{cid}}/g, formData.cid || '____.___')
      .replace(/{{recomendacoes}}/g, formData.recomendacoes || 'Repouso')
      .replace(/{{data}}/g, hoje.toLocaleDateString('pt-BR'))
      .replace(/{{horarioInicio}}/g, formData.horarioInicio)
      .replace(/{{horarioFim}}/g, formData.horarioFim)
      .replace(/{{local}}/g, 'HEMOSE - Hemocentro de Sergipe')
      .replace(/{{dataEmissao}}/g, hoje.toLocaleDateString('pt-BR'));
  };

  // Imprimir atestado
  const imprimirAtestado = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Atestado Médico</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 40px; }
                .content { white-space: pre-line; }
                .signature { margin-top: 60px; text-align: center; }
                .line { border-bottom: 1px solid #000; width: 300px; margin: 0 auto; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
              <div class="signature">
                <div class="line"></div>
                <p>Dr(a). Nome do Médico</p>
                <p>CRM: 12345</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const atestadoData = {
        ...formData,
        pacienteId,
        conteudoProcessado: processarTemplate(formData.conteudo),
        dataEmissao: new Date().toISOString()
      };

      // Simular salvamento
      console.log('Salvando atestado:', atestadoData);
      onSave(atestadoData);
    } catch (error) {
      console.error('Erro ao salvar atestado:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {previewMode ? 'Pré-visualização do Atestado' : 'Novo Atestado Médico'}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Editar' : 'Pré-visualizar'}
            </Button>
            {previewMode && (
              <Button variant="outline" onClick={imprimirAtestado}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {previewMode ? (
          // Modo de pré-visualização
          <div ref={printRef} className="bg-white p-8 border rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">HEMOSE</h2>
              <p className="text-gray-600">Hemocentro de Sergipe</p>
              <h3 className="text-xl font-semibold mt-4">{formData.titulo}</h3>
            </div>
            
            <div className="content whitespace-pre-line text-justify leading-relaxed">
              {processarTemplate(formData.conteudo)}
            </div>
          </div>
        ) : (
          // Modo de edição
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de atestado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Atestado
                </label>
                <div className="flex gap-2">
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="afastamento">Atestado de Afastamento</option>
                    <option value="comparecimento">Declaração de Comparecimento</option>
                    <option value="acompanhamento">Atestado de Acompanhamento</option>
                  </select>
                  <Button type="button" variant="outline" onClick={aplicarTemplate}>
                    Aplicar Template
                  </Button>
                </div>
              </div>

              {/* Paciente */}
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
            </div>

            {/* Campos específicos para afastamento */}
            {formData.tipo === 'afastamento' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias de Afastamento
                  </label>
                  <input
                    type="number"
                    name="dias"
                    value={formData.dias}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Campos específicos para comparecimento */}
            {formData.tipo === 'comparecimento' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    name="horarioInicio"
                    value={formData.horarioInicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Fim
                  </label>
                  <input
                    type="time"
                    name="horarioFim"
                    value={formData.horarioFim}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Campos complementares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo/Diagnóstico
                </label>
                <input
                  type="text"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Gastroenterite aguda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CID-10
                </label>
                <input
                  type="text"
                  name="cid"
                  value={formData.cid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: K59.1"
                />
              </div>
            </div>

            {/* Recomendações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recomendações
              </label>
              <input
                type="text"
                name="recomendacoes"
                value={formData.recomendacoes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Repouso, hidratação, medicação conforme prescrição"
              />
            </div>

            {/* Título personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Documento
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Atestado Médico"
              />
            </div>

            {/* Editor de texto rico para o conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo do Atestado
              </label>
              <RichTextEditor
                value={formData.conteudo}
                onChange={(value) => setFormData(prev => ({ ...prev, conteudo: value }))}
                placeholder="Digite o conteúdo do atestado..."
                height="200px"
              />
              <div className="text-xs text-gray-500 mt-1">
                Use {`{{nome}}, {{cpf}}, {{dias}}, {{dataInicio}}, {{dataFim}}, etc. como variáveis`}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Atestado'}
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
