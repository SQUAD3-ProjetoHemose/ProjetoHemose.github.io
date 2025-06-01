'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Save,
  FileText
} from 'lucide-react';

// Interface para o editor
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  showTemplates?: boolean;
}

// Templates de texto salvos
const savedTemplates = [
  {
    id: 'liberacao-trabalho',
    nome: 'Liberação para Trabalho',
    conteudo: `Atesto que o(a) paciente {{nome}}, portador(a) do CPF {{cpf}}, encontra-se apto(a) para retornar às suas atividades laborais normais a partir de {{data}}.

Não há restrições médicas para o exercício de suas funções habituais.

Local e data: {{local}}, {{dataEmissao}}`
  },
  {
    id: 'restricao-atividade',
    nome: 'Restrição de Atividade',
    conteudo: `Atesto que o(a) paciente {{nome}}, portador(a) do CPF {{cpf}}, apresenta restrições para atividades físicas pelo período de {{dias}} dias.

Restrições: {{restricoes}}

Recomendações: {{recomendacoes}}

Local e data: {{local}}, {{dataEmissao}}`
  },
  {
    id: 'atestado-saude',
    nome: 'Atestado de Saúde',
    conteudo: `Atesto que o(a) Sr(a). {{nome}}, portador(a) do CPF {{cpf}}, foi submetido(a) a exame clínico nesta data e encontra-se em boas condições de saúde.

Não foram detectadas alterações que impeçam suas atividades normais.

Local e data: {{local}}, {{dataEmissao}}`
  }
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Digite aqui...', 
  height = '300px',
  showTemplates = true 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showTemplatesList, setShowTemplatesList] = useState(false);

  // Aplicar formatação
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  // Atualizar conteúdo
  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Aplicar template
  const applyTemplate = (template: typeof savedTemplates[0]) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = template.conteudo;
      updateContent();
      setShowTemplatesList(false);
    }
  };

  // Configurar editor quando o valor muda externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Barra de ferramentas */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        {/* Formatação de texto */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('bold')}
            className="p-1 h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('italic')}
            className="p-1 h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('underline')}
            className="p-1 h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('justifyLeft')}
            className="p-1 h-8 w-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('justifyCenter')}
            className="p-1 h-8 w-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('justifyRight')}
            className="p-1 h-8 w-8"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('insertUnorderedList')}
            className="p-1 h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('insertOrderedList')}
            className="p-1 h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesList(!showTemplatesList)}
              className="gap-1"
            >
              <FileText className="h-4 w-4" />
              Templates
            </Button>
            
            {showTemplatesList && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Templates Salvos</h4>
                  <div className="space-y-1">
                    {savedTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {template.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Área de edição */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
        style={{ height, maxHeight: '500px', overflowY: 'auto' }}
        onInput={updateContent}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Clique fora para fechar templates */}
      {showTemplatesList && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowTemplatesList(false)}
        />
      )}
    </div>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
