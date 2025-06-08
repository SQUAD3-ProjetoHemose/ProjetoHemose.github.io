import { prontuarioAPI } from '../api';

// Interfaces para prontuário eletrônico
export interface SinaisVitais {
  id?: number;
  pacienteId: number;
  dataMedicao: string;
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
}

export interface AnotacaoMedica {
  id?: number;
  pacienteId: number;
  tipo: string;
  titulo?: string;
  anotacao: string;
  diagnostico?: string;
  prescricao?: string;
  observacoes?: string;
  prioridade: string;
  visivelOutros: boolean;
  anotacaoPrivada: boolean;
  dataAnotacao: string;
}

export interface Exame {
  id?: number;
  pacienteId: number;
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
}

export class ProntuarioService {
  // Prontuário completo
  static async getProntuarioCompleto(pacienteId: number) {
    return prontuarioAPI.getProntuarioCompleto(pacienteId);
  }

  // Sinais vitais
  static async getSinaisVitais(pacienteId: number, dataInicio?: string, dataFim?: string) {
    return prontuarioAPI.getSinaisVitais(pacienteId, dataInicio, dataFim);
  }

  static async criarSinaisVitais(dados: SinaisVitais) {
    return prontuarioAPI.createSinaisVitais(dados);
  }

  // Anotações médicas
  static async getAnotacoes(pacienteId: number) {
    return prontuarioAPI.getAnotacoes(pacienteId);
  }

  static async criarAnotacao(dados: AnotacaoMedica) {
    return prontuarioAPI.createAnotacao(dados);
  }

  static async atualizarAnotacao(id: number, dados: Partial<AnotacaoMedica>) {
    return prontuarioAPI.updateAnotacao(id, dados);
  }

  static async deletarAnotacao(id: number) {
    return prontuarioAPI.deleteAnotacao(id);
  }

  // Exames
  static async getExames(pacienteId: number) {
    return prontuarioAPI.getExames(pacienteId);
  }

  static async criarExame(dados: Exame) {
    return prontuarioAPI.createExame(dados);
  }

  static async atualizarResultadoExame(id: number, dados: any) {
    return prontuarioAPI.updateExameResultado(id, dados);
  }

  // Timeline do paciente
  static async getTimeline(pacienteId: number) {
    return prontuarioAPI.getTimeline(pacienteId);
  }

  // Relatórios
  static async getRelatorio(pacienteId: number) {
    return prontuarioAPI.getRelatorio(pacienteId);
  }

  // Validações para sinais vitais
  static validarSinaisVitais(sinais: Partial<SinaisVitais>) {
    const erros: Record<string, string> = {};

    if (sinais.pressaoSistolica && (sinais.pressaoSistolica < 60 || sinais.pressaoSistolica > 250)) {
      erros.pressaoSistolica = 'Pressão sistólica deve estar entre 60 e 250 mmHg';
    }

    if (sinais.pressaoDiastolica && (sinais.pressaoDiastolica < 30 || sinais.pressaoDiastolica > 150)) {
      erros.pressaoDiastolica = 'Pressão diastólica deve estar entre 30 e 150 mmHg';
    }

    if (sinais.frequenciaCardiaca && (sinais.frequenciaCardiaca < 30 || sinais.frequenciaCardiaca > 200)) {
      erros.frequenciaCardiaca = 'Frequência cardíaca deve estar entre 30 e 200 bpm';
    }

    if (sinais.temperatura && (sinais.temperatura < 30 || sinais.temperatura > 45)) {
      erros.temperatura = 'Temperatura deve estar entre 30°C e 45°C';
    }

    if (sinais.saturacaoOxigenio && (sinais.saturacaoOxigenio < 70 || sinais.saturacaoOxigenio > 100)) {
      erros.saturacaoOxigenio = 'Saturação deve estar entre 70% e 100%';
    }

    return erros;
  }

  // Calcular IMC
  static calcularIMC(peso?: number, altura?: number): string {
    if (!peso || !altura) return 'N/A';
    const imc = peso / Math.pow(altura / 100, 2);
    return imc.toFixed(1);
  }

  // Classificar IMC
  static classificarIMC(imc: string): string {
    const valor = parseFloat(imc);
    if (isNaN(valor)) return '';
    
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    if (valor < 35) return 'Obesidade grau I';
    if (valor < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  }

  // Analisar valores normais
  static analisarSinaisVitais(sinais: SinaisVitais) {
    const alertas = [];

    // Pressão arterial
    if (sinais.pressaoSistolica && sinais.pressaoDiastolica) {
      if (sinais.pressaoSistolica > 140 || sinais.pressaoDiastolica > 90) {
        alertas.push('Pressão arterial elevada');
      } else if (sinais.pressaoSistolica < 90 || sinais.pressaoDiastolica < 60) {
        alertas.push('Pressão arterial baixa');
      }
    }

    // Temperatura
    if (sinais.temperatura) {
      if (sinais.temperatura > 37.5) {
        alertas.push('Febre');
      } else if (sinais.temperatura < 36) {
        alertas.push('Hipotermia');
      }
    }

    // Saturação
    if (sinais.saturacaoOxigenio && sinais.saturacaoOxigenio < 95) {
      alertas.push('Saturação de oxigênio baixa');
    }

    // Frequência cardíaca
    if (sinais.frequenciaCardiaca) {
      if (sinais.frequenciaCardiaca > 100) {
        alertas.push('Taquicardia');
      } else if (sinais.frequenciaCardiaca < 60) {
        alertas.push('Bradicardia');
      }
    }

    return alertas;
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
