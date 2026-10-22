import { Component, DestroyRef, ElementRef, HostListener, Input, OnChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { CharacterComment, CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comments', standalone: true, imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments.component.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './comments.component.scss'
})
export class CommentsComponent implements OnChanges {
  @Input({ required: true }) characterId!: number;
  comments: CharacterComment[] = [];
  text = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)] });
  form = new FormGroup({ text: this.text });
  loading = false;
  saving = false;
  error = '';
  actionError = '';
  status = '';
  hasMore = false;
  total = 0;
  page = 1;
  deletingId: string | null = null;
  private api = inject(CommentsService);
  private destroyRef = inject(DestroyRef);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('document:click', ['$event'])
  closeOutsideMenus(event: MouseEvent): void {
    this.host.nativeElement.querySelectorAll<HTMLDetailsElement>('details.comment-options[open]').forEach(menu => {
      if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    });
  }

  @HostListener('keydown.escape')
  closeMenus(): void {
    this.host.nativeElement.querySelectorAll<HTMLDetailsElement>('details.comment-options[open]').forEach(menu => {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    });
  }
  private requests = new Subject<{ characterId: number; page: number }>();

  constructor() {
    this.requests.pipe(
      tap(() => { this.loading = true; this.error = ''; }),
      switchMap(({ characterId, page }) => this.api.list(characterId, page).pipe(
        catchError((error: Error) => { this.error = error.message; return of(null); })
      )), takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.loading = false;
      if (!result) return;
      const rows = this.page === 1 ? result.comments : [...this.comments, ...result.comments];
      this.comments = [...new Map(rows.map(row => [row.id, row])).values()];
      this.hasMore = result.hasMore;
      this.total = result.total;
    });
  }

  ngOnChanges(): void { this.text.reset(); this.comments = []; this.status = ''; this.refresh(); }
  refresh(): void { this.page = 1; this.deletingId = null; this.load(); }
  load(): void { this.requests.next({ characterId: this.characterId, page: this.page }); }
  more(): void { if (!this.loading && this.hasMore) { this.page++; this.load(); } }

  post(): void {
    if (this.saving) return;
    if (this.text.invalid) { this.text.markAsTouched(); return; }
    this.perform(this.api.create(this.characterId, this.text.value.trim()), 'Comentario publicado.', true);
  }
  toggle(comment: CharacterComment): void {
    this.perform(this.api.visibility(comment.id, !comment.hidden), comment.hidden ? 'Comentario visible.' : 'Comentario oculto.');
  }
  remove(comment: CharacterComment): void {
    if (this.deletingId !== comment.id) { this.deletingId = comment.id; return; }
    this.perform(this.api.remove(comment.id), 'Comentario eliminado.');
  }
  private perform(request: import('rxjs').Observable<unknown>, message: string, clear = false): void {
    if (this.saving) return;
    this.saving = true; this.actionError = ''; this.status = '';
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving = false)).subscribe({
      next: () => { if (clear) this.text.reset(); this.status = message; this.refresh(); },
      error: (error: Error) => this.actionError = error.message
    });
  }
  trackComment(_index: number, comment: CharacterComment): string { return comment.id; }
}
