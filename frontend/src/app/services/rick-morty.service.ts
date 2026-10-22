import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, defer, map, of, tap } from 'rxjs';
import { Character, CharacterResponse } from '../types/character.type';

export interface EpisodeSummary { id: number; name: string; episode: string; }

@Injectable({
  providedIn: 'root'
})
export class RickMortyService {
  private cache = new Map<string, { value: unknown; expires: number }>();

  private cachedGet<T>(url: string): Observable<T> {
    return defer(() => {
      const cached = this.cache.get(url);
      if (cached && cached.expires > Date.now()) return of(cached.value as T);
      this.cache.delete(url);
      return this.http.get<T>(url).pipe(tap(value => {
        if (this.cache.size >= 80) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(url, { value, expires: Date.now() + 5 * 60_000 });
      }));
    });
  }
  private API_URL = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) { }

  getCharacters(page = 1, name = ''): Observable<CharacterResponse> {
    let params = new HttpParams().set('page', page);
    if (name.trim()) params = params.set('name', name.trim());
    return this.http.get<CharacterResponse>(`${this.API_URL}/character`, { params });
  }

  getCharacterById(id: number): Observable<Character> {
    return this.cachedGet<Character>(`${this.API_URL}/character/${id}`);
  }

  getEpisodeById(id: number): Observable<{ name: string; episode: string }> {
    return this.http.get<{ name: string; episode: string }>(`https://rickandmortyapi.com/api/episode/${id}`);
  }

  getEpisodesByIds(ids: number[]): Observable<EpisodeSummary[]> {
    const uniqueIds = [...new Set(ids.filter(id => Number.isSafeInteger(id) && id > 0))];
    if (!uniqueIds.length) return of([]);
    return this.cachedGet<EpisodeSummary | EpisodeSummary[]>(`${this.API_URL}/episode/${uniqueIds.join(',')}`)
      .pipe(map(response => Array.isArray(response) ? response : [response]));
  }



}
