import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError, timeout } from 'rxjs';
import { AUTH_API_URL } from '../config/auth-api.config';
import { BACKEND_TIMEOUT_MS } from '../config/request-timeouts';

export interface User { id: string; name: string; email: string; role: string; profilePhoto?: string; }
export interface RegisterInput { name: string; email: string; password: string; }
export interface ProfileInput { name: string; currentPassword?: string; newPassword?: string; profilePhoto?: string; }
interface UserResponse { user: User; }
interface Session extends UserResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly sessionKey = 'auth_session';

  register(input: RegisterInput): Observable<void> {
    return this.http.post<UserResponse>(AUTH_API_URL + '/register', {
      name: input.name.trim(), email: input.email.trim(), password: input.password
    }).pipe(timeout(BACKEND_TIMEOUT_MS), map(() => undefined), catchError(error => this.handleError(error)));
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<Session>(AUTH_API_URL + '/login', { email: email.trim(), password })
      .pipe(timeout(BACKEND_TIMEOUT_MS), map(session => {
        if (!this.validUser(session?.user) || !this.validToken(session?.token)) {
          throw new Error('El servidor devolvió una sesión inválida.');
        }
        this.saveSession(session);
        return session.user;
      }), catchError(error => this.handleError(error)));
  }

  loadProfile(): Observable<User> {
    return this.profileRequest();
  }

  update(input: ProfileInput): Observable<User> {
    return this.profileRequest(input);
  }

  private profileRequest(input?: ProfileInput): Observable<User> {
    const session = this.getSession();
    if (!session) return throwError(() => new Error('Iniciá sesión para continuar.'));
    const options = { headers: { Authorization: 'Bearer ' + session.token } };
    const request = input
      ? this.http.put<UserResponse>(AUTH_API_URL + '/profile', input, options)
      : this.http.get<UserResponse>(AUTH_API_URL + '/profile', options);
    return request.pipe(timeout(BACKEND_TIMEOUT_MS), map(response => {
      if (!this.validUser(response?.user)) throw new Error('El servidor devolvió un perfil inválido.');
      return response.user;
    }), tap(user => this.saveSession({ user, token: session.token })),
      catchError(error => this.handleError(error)));
  }

  getToken(): string | null { return this.getSession()?.token ?? null; }
  getUser(): User | null { return this.getSession()?.user ?? null; }
  isAuthenticated(): boolean { return this.getSession() !== null; }
  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('registered_users');
  }

  private saveSession(session: Session): void {
    const { id, name, email, role, profilePhoto } = session.user;
    sessionStorage.setItem(this.sessionKey, JSON.stringify({ user: { id, name, email, role, profilePhoto: profilePhoto ?? '' }, token: session.token }));
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('registered_users');
  }

  private getSession(): Session | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(this.sessionKey) ?? 'null');
      if (value && this.validUser(value.user) && this.validToken(value.token)) return value as Session;
    } catch { /* Discard invalid or legacy sessions. */ }
    this.logout();
    return null;
  }

  private validUser(value: unknown): value is User {
    return value !== null && typeof value === 'object' &&
      ['id', 'name', 'email', 'role'].every(key => typeof (value as Record<string, unknown>)[key] === 'string');
  }

  // The server verifies the signature; the UI only checks expiry for navigation.
  private validToken(token: unknown): token is string {
    if (typeof token !== 'string') return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  private handleError(error: unknown): Observable<never> {
    let message = 'No pudimos conectar con el servicio. Intentá nuevamente.';
    if (error instanceof HttpErrorResponse) {
      const messages: Record<number, string> = {
        400: 'Revisá los datos ingresados y la longitud de los campos.',
        401: 'La sesión venció o las credenciales son incorrectas.',
        409: 'Ese correo ya está registrado.',
      };
      if (error.status) message = messages[error.status] ?? 'El servidor no pudo completar la solicitud.';
      if (error.status === 401 && typeof error.error?.message === 'string') message = error.error.message;
    } else if (error instanceof Error && error.name !== 'TimeoutError') message = error.message;
    return throwError(() => new Error(message));
  }
}
