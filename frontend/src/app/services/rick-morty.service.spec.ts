import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RickMortyService } from './rick-morty.service';

describe('Catalog cache', () => {
  let service: RickMortyService;
  let http: HttpTestingController;
  const url = 'https://rickandmortyapi.com/api/character/1';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RickMortyService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });

  it('reuses a successful response and refreshes after five minutes', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000);
    service.getCharacterById(1).subscribe();
    http.expectOne(url).flush({ id: 1, name: 'Rick' });
    let name = '';
    service.getCharacterById(1).subscribe(character => name = character.name);
    expect(name).toBe('Rick');
    http.expectNone(url);
    clock.mockReturnValue(301001);
    service.getCharacterById(1).subscribe();
    http.expectOne(url).flush({ id: 1, name: 'Rick' });
  });

  it('does not cache a failed request', () => {
    service.getCharacterById(1).subscribe({ error: () => {} });
    http.expectOne(url).flush({}, { status: 503, statusText: 'Unavailable' });
    service.getCharacterById(1).subscribe();
    http.expectOne(url).flush({ id: 1 });
  });
});
