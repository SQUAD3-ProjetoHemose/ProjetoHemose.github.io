import { CreateUserDto, UpdateUserDto, User, UserRole } from '../../types';
import { usersAPI } from '../api';

export class UsersService {
  // Listar todos os usuários
  static async getUsers(role?: UserRole): Promise<User[]> {
    return usersAPI.getAll(role);
  }

  // Obter usuário por ID
  static async getUserById(id: number): Promise<User> {
    return usersAPI.getById(id);
  }

  // Criar novo usuário
  static async createUser(userData: CreateUserDto): Promise<User> {
    return usersAPI.create(userData);
  }

  // Atualizar usuário
  static async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    return usersAPI.update(id, userData);
  }

  // Excluir usuário
  static async deleteUser(id: number): Promise<void> {
    await usersAPI.delete(id);
  }

  // Obter médicos
  static async getMedicos(): Promise<User[]> {
    return usersAPI.getMedicos();
  }

  // Obter enfermeiras
  static async getEnfermeiras(): Promise<User[]> {
    return usersAPI.getEnfermeiras();
  }

  // Obter recepcionistas
  static async getRecepcionistas(): Promise<User[]> {
    return usersAPI.getRecepcionistas();
  }

  // Validar email
  static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Obter nome do tipo de usuário
  static getUserTypeName(tipo: UserRole): string {
    const types = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.MEDICO]: 'Médico',
      [UserRole.ENFERMEIRA]: 'Enfermeira',
      [UserRole.RECEPCIONISTA]: 'Recepcionista',
      [UserRole.TECNICA_ENFERMAGEM]: 'Técnica de Enfermagem', // Nova role
    };
    return types[tipo] || tipo;
  }

  // Obter cor do badge do tipo
  static getUserTypeColor(tipo: UserRole): string {
    const colors = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.MEDICO]: 'bg-blue-100 text-blue-800',
      [UserRole.ENFERMEIRA]: 'bg-green-100 text-green-800',
      [UserRole.RECEPCIONISTA]: 'bg-yellow-100 text-yellow-800',
      [UserRole.TECNICA_ENFERMAGEM]: 'bg-teal-100 text-teal-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  }

  // Validar senha
  static validarSenha(senha: string): { valida: boolean; mensagem?: string } {
    if (!senha) {
      return { valida: false, mensagem: 'Senha é obrigatória' };
    }

    if (senha.length < 6) {
      return { valida: false, mensagem: 'Senha deve ter pelo menos 6 caracteres' };
    }

    return { valida: true };
  }

  // Filtrar usuários por status
  static filtrarPorStatus(users: User[], ativo: boolean): User[] {
    return users.filter((user) => user.ativo === ativo);
  }
  // Buscar usuários por termo
  static buscarUsuarios(users: User[], term: string): User[] {
    if (!term) return users;

    const termLower = term.toLowerCase();
    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(termLower) ||
        user.email.toLowerCase().includes(termLower) ||
        (user.especialidade && user.especialidade.toLowerCase().includes(termLower)) ||
        (user.registroProfissional && user.registroProfissional.toLowerCase().includes(termLower))
    );
  }
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
