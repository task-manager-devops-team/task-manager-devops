import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth';

const TOKEN_KEY = 'taskflow_token';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  readonly token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.saveToken(response.token)));
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, request);
  }

  /** Invalide le token côté serveur (au mieux), puis efface la session locale. */
  logoutRemote(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => this.logout()),
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  forgotPassword(email: string): Observable<void> {
    const body: ForgotPasswordRequest = { email };
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, body);
  }

  resetPassword(token: string, password: string): Observable<void> {
    const body: ResetPasswordRequest = { token, password };
    return this.http.post<void>(`${this.baseUrl}/reset-password`, body);
  }

  isAuthenticated(): boolean {
    const token = this.token();
    if (!token) {
      return false;
    }
    const expiresAt = this.expiresAt(token);
    return expiresAt === null || expiresAt > Date.now();
  }

  private saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  /** Date d'expiration (claim "exp") du JWT, en millisecondes. */
  private expiresAt(token: string): number | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const exp = JSON.parse(atob(payload)).exp;
      return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
      return null;
    }
  }
}