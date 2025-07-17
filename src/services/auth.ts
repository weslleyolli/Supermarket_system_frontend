import { apiService } from './api';
import type { User, LoginDto, AuthResponse } from '../types';

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    // Load saved auth state on initialization
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        this.token = savedToken;
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        this.clearAuthState();
      }
    }
  }

  private saveAuthState(token: string, user: User): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token = token;
    this.currentUser = user;
  }

  private clearAuthState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.token = null;
    this.currentUser = null;
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiService.login({
        username: credentials.email,
        password: credentials.password
      });

      const user = response.user as unknown as User;
      this.saveAuthState(response.access_token, user);

      return {
        user,
        token: response.access_token,
        refreshToken: response.access_token // Assuming same token for now
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  }

  logout(): void {
    this.clearAuthState();
    window.location.href = '/login';
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  canAccess(requiredRoles: string[]): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    return this.hasAnyRole(requiredRoles);
  }

  async refreshToken(): Promise<boolean> {
    try {
      // Implement token refresh logic here
      // For now, just check if current token is still valid
      if (!this.token) {
        return false;
      }

      // You would typically make an API call to refresh the token
      // const response = await apiService.refreshToken(this.token);
      // this.saveAuthState(response.access_token, response.user);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
