import { pacientesAPI } from '../api';
import { 
  Paciente, 
  CreatePacienteDto, 
  UpdatePacienteDto,
  PaginatedResponse, 
  PaginationParams 
} from '../../types';

export class PacientesService {
  // Listar todos os pacientes
  static async getPacientes(params?: PaginationParams): Promise<Paciente[]> {
    return pacientesAPI.getAll();
  }

  // Obter paciente por ID
  static async getPacienteById(id: number): Promise<Paciente> {
    return pacientesAPI.getById(id);
  }

  // Criar novo paciente
  static async createPaciente(pacienteData: CreatePacienteDto): Promise<Paciente> {
    return pacientesAPI.create(pacienteData);
  }

  // Atualizar paciente
  static async updatePaciente(id: number, pacienteData: UpdatePacienteDto): Promise<Paciente> {
    return pacientesAPI.update(id, pacienteData);
  }

  // Excluir paciente
  static async deletePaciente(id: number): Promise<void> {
    await pacientesAPI.delete(id);
  }

  // Buscar pacientes por termo
  static async searchPacientes(term: string): Promise<Paciente[]> {
    return pacientesAPI.search(term);
  }

  // Validar CPF
  static validarCPF(cpf: string): boolean {
    if (!cpf) return false;
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    
    // Verificação de CPFs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  }

  // Formatar CPF para exibição
  static formatarCPF(cpf: string): string {
    if (!cpf) return '';
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    if (cpfLimpo.length === 11) {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
    }
    
    return cpf;
  }

  // Formatar telefone para exibição
  static formatarTelefone(telefone: string): string {
    if (!telefone) return '';
    
    const telefoneLimpo = telefone.replace(/[^\d]/g, '');
    
    if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  }

  // Calcular idade a partir da data de nascimento
  static calcularIdade(dataNascimento: string): number {
    if (!dataNascimento) return 0;
    
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
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
