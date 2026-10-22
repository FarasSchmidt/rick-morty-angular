import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CharacterDetailComponent } from './character-detail.component';

describe('Character detail', () => {
  let fixture: ComponentFixture<CharacterDetailComponent>;
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const base = 'https://rickandmortyapi.com/api';
  const character = {
    id: 1, name: 'Rick', image: '', status: 'Alive', species: 'Human', gender: 'Male',
    origin: { name: 'Earth' }, location: { name: 'Earth' },
    episode: [`${base}/episode/1`, `${base}/episode/2`],
  };

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: '1' }));
    TestBed.configureTestingModule({
      imports: [CharacterDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } }],
    });
    fixture = TestBed.createComponent(CharacterDetailComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });
  afterEach(() => { http.verify(); fixture.destroy(); });

  it('loads episodes in one request and retains character data if episodes fail', () => {
    http.expectOne(`${base}/character/1`).flush(character);
    expect(fixture.componentInstance.state.character?.id).toBe(1);
    http.expectOne(`${base}/episode/1,2`).flush({}, { status: 500, statusText: 'Error' });
    expect(fixture.componentInstance.state.character?.name).toBe('Rick');
    expect(fixture.componentInstance.state.episodesError).not.toBe('');
    fixture.componentInstance.retry();
    http.expectOne(`${base}/character/1`).flush(character);
    http.expectOne(`${base}/episode/1,2`).flush([{ id: 1, name: 'Pilot', episode: 'S01E01' }]);
    expect(fixture.componentInstance.state.episodesError).toBe('');
  });

  it('distinguishes missing characters and invalid ids from connection errors', () => {
    http.expectOne(`${base}/character/1`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(fixture.componentInstance.state.notFound).toBeTrue();
    params.next(convertToParamMap({ id: 'invalid' }));
    expect(fixture.componentInstance.state.notFound).toBeTrue();
    http.expectNone(request => request.url.startsWith(base));
    params.next(convertToParamMap({ id: '2' }));
    http.expectOne(`${base}/character/2`).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(fixture.componentInstance.state.notFound).toBeFalse();
    expect(fixture.componentInstance.state.error).not.toBe('');
  });

  it('supports a single episode response and characters without episodes', () => {
    http.expectOne(`${base}/character/1`).flush({ ...character, episode: [`${base}/episode/1`] });
    http.expectOne(`${base}/episode/1`).flush({ id: 1, name: 'Pilot', episode: 'S01E01' });
    expect(fixture.componentInstance.state.episodes.length).toBe(1);
    params.next(convertToParamMap({ id: '2' }));
    http.expectOne(`${base}/character/2`).flush({ ...character, id: 2, episode: [] });
    expect(fixture.componentInstance.state.episodes).toEqual([]);
    expect(fixture.componentInstance.state.episodesLoading).toBeFalse();
  });
});
