import { authAPI } from '../api';
import { LoginDto, AuthResponse, User } from '../../types';

export class AuthService {
  // Login do usuário
  static async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await authAPI.login({
        email: credentials.email,
        password: credentials.senha, // Manter 'senha' no frontend mas enviar como 'password'
      });

      return {
        success: response.success,
        token: response.access_token, // Usar access_token em vez de token
        user: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
      };
    }
  }

  // Logout do usuário
  static async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } finally {
      // Sempre limpar dados locais, mesmo se a API falhar
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  // Obter dados do usuário atual
  static async me(): Promise<User> {
    const response = await authAPI.profile();
    return response.user;
  }

  // Verificar se o token é válido
  static async validateToken(): Promise<boolean> {
    try {
      await this.me();
      return true;
    } catch {
      return false;
    }
  }

  // Solicitar recuperação de senha
  static async forgotPassword(email: string): Promise<void> {
    // Como não temos endpoint específico na API atual, simular
    try {
      console.log('Solicitação de recuperação de senha para:', email);
      // Em uma implementação real, seria algo como:
      // return apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error('Erro ao solicitar recuperação de senha');
    }
  }

  // Redefinir senha
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Como não temos endpoint específico na API atual, simular
    try {
      console.log('Redefinindo senha com token:', token);
      // Em uma implementação real, seria algo como:
      // return apiClient.post('/auth/reset-password', { token, password: newPassword });
    } catch (error) {
      throw new Error('Erro ao redefinir senha');
    }
  }

  // Alterar senha
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Como não temos endpoint específico na API atual, simular
    try {
      console.log('Alterando senha do usuário atual');
      // Em uma implementação real, seria algo como:
      // return apiClient.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      throw new Error('Erro ao alterar senha');
    }
  }

  // Salvar dados do usuário no localStorage
  static saveUserData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Obter dados do usuário do localStorage
  static getUserData(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Obter token do localStorage
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Limpar dados do usuário
  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUserData());
  }

  // Verificar se o usuário tem uma role específica
  static hasRole(role: string): boolean {
    const user = this.getUserData();
    return user?.tipo === role;
  }

  // Verificar se o usuário tem permissão para acessar uma rota
  static canAccess(allowedRoles: string[]): boolean {
    if (!this.isAuthenticated()) return false;

    const user = this.getUserData();
    if (!user) return false;

    return allowedRoles.includes(user.tipo);
  }

  // Registrar novo usuário (se disponível)
  static async register(userData: any): Promise<{ user: User }> {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao registrar usuário');
    }
  }
}

/*
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
