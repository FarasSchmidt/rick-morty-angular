import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RickMortyService {
  private API_URL = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) { }

  getCharacters(page: number = 1): Observable<any> {
    return this.http.get(`${this.API_URL}/character?page=${page}&count=10`);
  }

  getCharacterById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/character/${id}`);
  }

  getEpisodeById(id: number): Observable<{ name: string; episode: string }> {
    return this.http.get<{ name: string; episode: string }>(`https://rickandmortyapi.com/api/episode/${id}`);
  }



}
