import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CommentsComponent } from './comments.component';
import { CommentsService, CharacterComment } from '../../services/comments.service';

describe('Character comments', () => {
  let fixture: ComponentFixture<CommentsComponent>;
  let api: jasmine.SpyObj<CommentsService>;
  const comment: CharacterComment = {
    id: 'test', text: 'Hello', hidden: false, createdAt: '2026-01-01T00:00:00Z',
    author: { id: 'author', name: 'Demo', profilePhoto: '' }, canManage: false,
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('CommentsService', ['list', 'create', 'visibility', 'remove']);
    api.list.and.returnValue(of({ comments: [comment], hasMore: false, total: 1 }));
    TestBed.configureTestingModule({ imports: [CommentsComponent], providers: [{ provide: CommentsService, useValue: api }] });
    fixture = TestBed.createComponent(CommentsComponent);
    fixture.componentRef.setInput('characterId', 1);
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  it('does not show moderation buttons for a comment without permission', () => {
    expect(fixture.nativeElement.querySelector('.comment-actions')).toBeNull();
    api.list.and.returnValue(of({ comments: [{ ...comment, canManage: true, hidden: true }], hasMore: false, total: 1 }));
    fixture.componentInstance.refresh(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Volver a mostrar');
    expect(fixture.nativeElement.querySelector('.hidden-label')).not.toBeNull();
  });

  it('retains a draft on failure and clears it only after successful publication', () => {
    const component = fixture.componentInstance;
    component.text.setValue('My draft');
    api.create.and.returnValue(throwError(() => new Error('Connection failed')));
    component.post();
    expect(component.text.value).toBe('My draft');
    expect(component.saving).toBeFalse();
    api.create.and.returnValue(of({}));
    component.post();
    expect(component.text.value).toBe('');
    expect(component.status).toBe('Comentario publicado.');
  });

  it('requires a second action before deleting a comment', () => {
    const component = fixture.componentInstance;
    api.remove.and.returnValue(of({}));
    component.remove(comment);
    expect(api.remove).not.toHaveBeenCalled();
    component.remove(comment);
    expect(api.remove).toHaveBeenCalledWith(comment.id);
  });

  it('submits through Angular and prevents a native page reload', () => {
    api.create.and.returnValue(of({}));
    fixture.componentInstance.text.setValue('Published from the form');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector('form').dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(api.create).toHaveBeenCalledOnceWith(1, 'Published from the form');
  });
});
