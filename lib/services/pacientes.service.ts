import { pacientesAPI } from '../api';

// Interface para paciente
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  tipo_sanguineo?: string;
  alergias?: string;
  historico_medico?: string;
  status: string;
}

export class PacientesService {
  // Buscar todos os pacientes
  static async getPacientes(): Promise<Paciente[]> {
    return pacientesAPI.getAll();
  }

  // Buscar paciente por ID
  static async getPacienteById(id: number): Promise<Paciente> {
    return pacientesAPI.getById(id);
  }

  // Buscar paciente por CPF
  static async getPacienteByCpf(cpf: string): Promise<Paciente> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return pacientesAPI.getByCpf(cpfLimpo) as Promise<Paciente>;
  }

  // Criar novo paciente
  static async criarPaciente(dados: Partial<Paciente>): Promise<Paciente> {
    return pacientesAPI.create(dados);
  }

  // Atualizar paciente
  static async atualizarPaciente(id: number, dados: Partial<Paciente>): Promise<Paciente> {
    return pacientesAPI.update(id, dados);
  }

  // Deletar paciente
  static async deletarPaciente(id: number): Promise<void> {
    return pacientesAPI.delete(id) as Promise<void>;
  }

  // Utilitários para formatação
  static formatarCPF(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return cpf;
    
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
  }

  static formatarTelefone(telefone: string): string {
    const telLimpo = telefone.replace(/\D/g, '');
    
    if (telLimpo.length === 11) {
      return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 7)}-${telLimpo.slice(7)}`;
    } else if (telLimpo.length === 10) {
      return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 6)}-${telLimpo.slice(6)}`;
    }
    
    return telefone;
  }

  static calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  // Validar CPF
  static validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cpfLimpo.charAt(9)) === digito1 && parseInt(cpfLimpo.charAt(10)) === digito2;
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
