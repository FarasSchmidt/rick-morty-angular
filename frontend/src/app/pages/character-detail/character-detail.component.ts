import { CommentsComponent } from '../../components/comments/comments.component';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, map, of, startWith, switchMap, timeout } from 'rxjs';
import { EpisodeSummary, RickMortyService } from '../../services/rick-morty.service';
import { Character } from '../../types/character.type';
import { StatusTranslatePipe } from '../../pipes/status-translate-pipe';
import { GenderTranslatePipe } from '../../pipes/gender-translate-pipe';

interface DetailState {
  character: Character | null;
  episodes: EpisodeSummary[];
  loading: boolean;
  episodesLoading: boolean;
  notFound: boolean;
  error: string;
  episodesError: string;
}
const initialState: DetailState = {
  character: null, episodes: [], loading: false, episodesLoading: false,
  notFound: false, error: '', episodesError: ''
};

@Component({
  selector: 'app-character-detail', standalone: true,
  imports: [CommentsComponent, StatusTranslatePipe, GenderTranslatePipe],
  styleUrls: ['./character-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './character-detail.component.html'
})
export class CharacterDetailComponent implements OnInit {
  state: DetailState = { ...initialState };
  readonly episodePageSize = 8;
  visibleEpisodeCount = this.episodePageSize;

  get visibleEpisodes(): EpisodeSummary[] {
    return this.state.episodes.slice(0, this.visibleEpisodeCount);
  }

  showMoreEpisodes(): void {
    this.visibleEpisodeCount = Math.min(this.visibleEpisodeCount + this.episodePageSize, this.state.episodes.length);
  }
  showFewerEpisodes(): void {
    this.visibleEpisodeCount = this.episodePageSize;
  }
  private destroyRef = inject(DestroyRef);
  private retries = new BehaviorSubject(0);

  constructor(private route: ActivatedRoute, private rmService: RickMortyService) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.retries]).pipe(
      switchMap(([params]) => {
        this.visibleEpisodeCount = this.episodePageSize;
        const rawId = params.get('id') ?? '';
        const id = Number(rawId);
        if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
          return of<DetailState>({ ...initialState, notFound: true });
        }
        return this.rmService.getCharacterById(id).pipe(
          timeout(15000),
          switchMap(character => {
            const loaded = { ...initialState, character };
            const ids = character.episode.map(url => Number(url.split('/').pop()));
            return this.rmService.getEpisodesByIds(ids).pipe(
              timeout(15000),
              map(episodes => ({ ...loaded, episodes })),
              catchError(() => of<DetailState>({ ...loaded, episodesError: 'No pudimos cargar los episodios.' })),
              startWith<DetailState>({ ...loaded, episodesLoading: ids.length > 0 })
            );
          }),
          catchError((error: unknown) => of<DetailState>({
            ...initialState,
            notFound: error instanceof HttpErrorResponse && error.status === 404,
            error: error instanceof HttpErrorResponse && error.status === 404
              ? '' : 'No pudimos cargar el personaje. Intentá nuevamente.'
          })),
          startWith<DetailState>({ ...initialState, loading: true })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(state => this.state = state);
  }

  retry(): void { this.retries.next(this.retries.value + 1); }
  trackEpisode(_index: number, episode: EpisodeSummary): number { return episode.id; }
}
