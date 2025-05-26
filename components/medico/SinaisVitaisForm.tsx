'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X, AlertCircle } from 'lucide-react';

// Interface para formulário de sinais vitais
interface SinaisVitaisFormProps {
  onSave: (sinais: any) => void;
  onCancel: () => void;
  pacienteId: number;
}

export default function SinaisVitaisForm({ onSave, onCancel, pacienteId }: SinaisVitaisFormProps) {
  const [formData, setFormData] = useState({
    pressaoSistolica: '',
    pressaoDiastolica: '',
    frequenciaCardiaca: '',
    frequenciaRespiratoria: '',
    temperatura: '',
    saturacaoOxigenio: '',
    peso: '',
    altura: '',
    escalaDor: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validações para sinais vitais
  const validateField = (name: string, value: string) => {
    const numValue = parseFloat(value);
    
    switch (name) {
      case 'pressaoSistolica':
        if (value && (numValue < 60 || numValue > 250)) {
          return 'Pressão sistólica deve estar entre 60 e 250 mmHg';
        }
        break;
      case 'pressaoDiastolica':
        if (value && (numValue < 30 || numValue > 150)) {
          return 'Pressão diastólica deve estar entre 30 e 150 mmHg';
        }
        break;
      case 'frequenciaCardiaca':
        if (value && (numValue < 30 || numValue > 200)) {
          return 'Frequência cardíaca deve estar entre 30 e 200 bpm';
        }
        break;
      case 'frequenciaRespiratoria':
        if (value && (numValue < 8 || numValue > 50)) {
          return 'Frequência respiratória deve estar entre 8 e 50 irpm';
        }
        break;
      case 'temperatura':
        if (value && (numValue < 30 || numValue > 45)) {
          return 'Temperatura deve estar entre 30°C e 45°C';
        }
        break;
      case 'saturacaoOxigenio':
        if (value && (numValue < 70 || numValue > 100)) {
          return 'Saturação deve estar entre 70% e 100%';
        }
        break;
      case 'peso':
        if (value && (numValue < 0.5 || numValue > 300)) {
          return 'Peso deve estar entre 0,5 kg e 300 kg';
        }
        break;
      case 'altura':
        if (value && (numValue < 30 || numValue > 250)) {
          return 'Altura deve estar entre 30 cm e 250 cm';
        }
        break;
      case 'escalaDor':
        if (value && (numValue < 0 || numValue > 10)) {
          return 'Escala de dor deve estar entre 0 e 10';
        }
        break;
    }
    return '';
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo em tempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Verificar se há erros
  const hasErrors = Object.values(errors).some(error => error !== '');

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/prontuario-eletronico/sinais-vitais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          pacienteId,
          dataRegistro: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const sinaisVitais = await response.json();
        onSave(sinaisVitais);
      } else {
        console.error('Erro ao salvar sinais vitais');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter cor do campo baseado no valor
  const getFieldColor = (name: string, value: string) => {
    if (!value) return 'border-gray-300';
    if (errors[name]) return 'border-red-500';
    
    const numValue = parseFloat(value);
    
    // Valores normais para referência
    const normalRanges: Record<string, { min: number; max: number }> = {
      pressaoSistolica: { min: 90, max: 140 },
      pressaoDiastolica: { min: 60, max: 90 },
      frequenciaCardiaca: { min: 60, max: 100 },
      temperatura: { min: 36, max: 37.5 },
      saturacaoOxigenio: { min: 95, max: 100 }
    };
    
    const range = normalRanges[name];
    if (range && numValue >= range.min && numValue <= range.max) {
      return 'border-green-300';
    } else if (range) {
      return 'border-yellow-300';
    }
    
    return 'border-gray-300';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pressão Arterial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressão Sistólica (mmHg)
              </label>
              <input
                type="number"
                name="pressaoSistolica"
                value={formData.pressaoSistolica}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('pressaoSistolica', formData.pressaoSistolica)}`}
                placeholder="120"
              />
              {errors.pressaoSistolica && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.pressaoSistolica}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressão Diastólica (mmHg)
              </label>
              <input
                type="number"
                name="pressaoDiastolica"
                value={formData.pressaoDiastolica}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('pressaoDiastolica', formData.pressaoDiastolica)}`}
                placeholder="80"
              />
              {errors.pressaoDiastolica && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.pressaoDiastolica}
                </div>
              )}
            </div>

            {/* Frequências */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência Cardíaca (bpm)
              </label>
              <input
                type="number"
                name="frequenciaCardiaca"
                value={formData.frequenciaCardiaca}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('frequenciaCardiaca', formData.frequenciaCardiaca)}`}
                placeholder="72"
              />
              {errors.frequenciaCardiaca && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.frequenciaCardiaca}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência Respiratória (irpm)
              </label>
              <input
                type="number"
                name="frequenciaRespiratoria"
                value={formData.frequenciaRespiratoria}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('frequenciaRespiratoria', formData.frequenciaRespiratoria)}`}
                placeholder="16"
              />
              {errors.frequenciaRespiratoria && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.frequenciaRespiratoria}
                </div>
              )}
            </div>

            {/* Temperatura e Saturação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperatura"
                value={formData.temperatura}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('temperatura', formData.temperatura)}`}
                placeholder="36.5"
              />
              {errors.temperatura && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.temperatura}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturação O₂ (%)
              </label>
              <input
                type="number"
                name="saturacaoOxigenio"
                value={formData.saturacaoOxigenio}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('saturacaoOxigenio', formData.saturacaoOxigenio)}`}
                placeholder="98"
              />
              {errors.saturacaoOxigenio && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.saturacaoOxigenio}
                </div>
              )}
            </div>

            {/* Medidas antropométricas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('peso', formData.peso)}`}
                placeholder="70.0"
              />
              {errors.peso && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.peso}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                name="altura"
                value={formData.altura}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('altura', formData.altura)}`}
                placeholder="170"
              />
              {errors.altura && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.altura}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escala de Dor (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                name="escalaDor"
                value={formData.escalaDor}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldColor('escalaDor', formData.escalaDor)}`}
                placeholder="0"
              />
              {errors.escalaDor && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.escalaDor}
                </div>
              )}
            </div>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações sobre os sinais vitais..."
            />
          </div>

          {/* Legenda de cores */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs">
            <p className="font-medium text-gray-700 mb-1">Legenda:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-green-300 rounded"></div>
                <span>Valores normais</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-yellow-300 rounded"></div>
                <span>Valores alterados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-red-300 rounded"></div>
                <span>Valores inválidos</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || hasErrors}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
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
