import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { AuthService } from './auth.service';
import { AUTH_API_URL } from '../config/auth-api.config';

export interface CharacterComment {
  id: string; text: string; hidden: boolean; createdAt: string; canManage: boolean;
  author: { id: string; name: string; profilePhoto: string };
}
export interface CommentPage { comments: CharacterComment[]; hasMore: boolean; total: number; }

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = AUTH_API_URL.replace(/\/auth$/, '');

  list(characterId: number, page: number): Observable<CommentPage> {
    return this.request('GET', '/characters/' + characterId + '/comments?page=' + page);
  }
  create(characterId: number, text: string): Observable<unknown> {
    return this.request('POST', '/characters/' + characterId + '/comments', { text });
  }
  visibility(id: string, hidden: boolean): Observable<unknown> {
    return this.request('PATCH', '/comments/' + id + '/visibility', { hidden });
  }
  remove(id: string): Observable<unknown> { return this.request('DELETE', '/comments/' + id); }

  private request<T>(method: string, path: string, body?: unknown): Observable<T> {
    const token = this.auth.getToken();
    if (!token) return throwError(() => new Error('Iniciá sesión para continuar.'));
    return this.http.request<T>(method, this.base + path, { body, headers: { Authorization: 'Bearer ' + token } })
      .pipe(timeout(15000), catchError((error: unknown) => {
        let message = 'No pudimos conectar con el servicio de comentarios. Intentá nuevamente.';
        if (error instanceof HttpErrorResponse && error.status) {
          message = ({ 400: 'Revisá el comentario: debe tener entre 1 y 2000 caracteres.',
            401: 'La sesión venció. Volvé a iniciar sesión.', 403: 'No tenés permiso para modificar este comentario.',
            404: method === 'GET' || method === 'POST'
              ? 'El servicio de comentarios no está disponible. Intentá nuevamente más tarde.'
              : 'El comentario ya no está disponible.' } as Record<number, string>)[error.status]
            ?? 'No pudimos completar la operación. Intentá nuevamente.';
          if (error.status === 404 && typeof error.error?.message === 'string' && /^Cannot (GET|POST|PATCH|DELETE)\s/.test(error.error.message)) {
            message = 'El servicio de comentarios no está disponible. Intentá nuevamente más tarde.';
          }
        }
        return throwError(() => new Error(message));
      }));
  }
}
