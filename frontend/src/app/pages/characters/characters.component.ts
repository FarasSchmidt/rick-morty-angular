import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, map, of, startWith, switchMap, timeout } from 'rxjs';
import { RickMortyService } from '../../services/rick-morty.service';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { FormsModule } from '@angular/forms';
import { Character, PaginationInfo } from '../../types/character.type';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

interface ListState {
  characters: Character[];
  info: PaginationInfo | null;
  loading: boolean;
  error: string;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent, FormsModule, RouterModule, MatButtonModule],
  templateUrl: './characters.component.html',
  styleUrl: 'characters.component.scss'
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  terminoBusqueda = '';
  appliedSearch = '';
  info: PaginationInfo | null = null;
  currentPage = 1;
  userName = '';
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private requests = new BehaviorSubject({ page: 1, name: '' });

  constructor(private rmService: RickMortyService) {}

  ngOnInit(): void {
    this.userName = this.auth.getUser()?.name ?? '';
    this.requests.pipe(
      switchMap(({ page, name }) => this.rmService.getCharacters(page, name).pipe(
        timeout(15000),
        map(response => ({ characters: response.results, info: response.info, loading: false, error: '' } as ListState)),
        catchError((error: unknown) => of<ListState>({
          characters: [], info: null, loading: false,
          error: error instanceof HttpErrorResponse && error.status === 404
            ? '' : 'No pudimos cargar los personajes. Intentá nuevamente.'
        })),
        startWith<ListState>({ characters: [], info: null, loading: true, error: '' })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(state => {
      this.characters = state.characters;
      this.info = state.info;
      this.loading = state.loading;
      this.error = state.error;
    });
  }

  search(): void {
    this.appliedSearch = this.terminoBusqueda.trim();
    this.currentPage = 1;
    this.loadCharacters();
  }

  clearSearch(): void {
    this.terminoBusqueda = '';
    this.search();
  }

  loadCharacters(): void {
    this.requests.next({ page: this.currentPage, name: this.appliedSearch });
  }

  goToPage(page: number): void {
    if (this.loading || !this.info || !Number.isInteger(page) || page < 1 || page > this.info.pages) return;
    this.currentPage = page;
    this.loadCharacters();
  }

  trackCharacter(_index: number, character: Character): number { return character.id; }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
