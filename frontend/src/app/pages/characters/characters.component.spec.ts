import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CharactersComponent } from './characters.component';
import { AuthService } from '../../services/auth.service';

describe('Characters search and pagination', () => {
  let fixture: ComponentFixture<CharactersComponent>;
  let component: CharactersComponent;
  let http: HttpTestingController;
  const base = 'https://rickandmortyapi.com/api/character';
  const response = {
    results: [],
    info: { count: 30, pages: 2, prev: null, next: `${base}?page=2` },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CharactersComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { getUser: () => ({ name: 'Demo' }), logout: () => {} } }],
    });
    fixture = TestBed.createComponent(CharactersComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${base}?page=1`).flush(response);
  });

  afterEach(() => { http.verify(); fixture.destroy(); });

  it('queries all characters by name and keeps the filter when paging', () => {
    component.terminoBusqueda = ' Rick ';
    component.search();
    expect(component.loading).toBe(true);
    http.expectOne(`${base}?page=1&name=Rick`).flush(response);
    component.goToPage(2);
    http.expectOne(`${base}?page=2&name=Rick`).flush({ ...response, info: { ...response.info, next: null, prev: base } });
    component.terminoBusqueda = 'Morty';
    component.search();
    expect(component.currentPage).toBe(1);
    http.expectOne(`${base}?page=1&name=Morty`).flush(response);
  });

  it('shows empty results on 404 and can search again', () => {
    component.terminoBusqueda = 'nonexistent';
    component.search();
    http.expectOne(`${base}?page=1&name=nonexistent`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(component.error).toBe('');
    expect(component.characters).toEqual([]);
    expect(component.loading).toBe(false);
    component.clearSearch();
    http.expectOne(`${base}?page=1`).flush(response);
    expect(component.info?.count).toBe(30);
  });

  it('recovers after a server failure and rejects pages outside the range', () => {
    component.goToPage(0);
    component.goToPage(3);
    http.expectNone(request => request.url === base);
    component.loadCharacters();
    http.expectOne(`${base}?page=1`).flush({}, { status: 500, statusText: 'Server Error' });
    expect(component.error).not.toBe('');
    expect(component.loading).toBe(false);
    component.loadCharacters();
    http.expectOne(`${base}?page=1`).flush(response);
    expect(component.error).toBe('');
  });

  it('cancels a previous search when the query changes', () => {
    component.terminoBusqueda = 'Rick';
    component.search();
    const old = http.expectOne(`${base}?page=1&name=Rick`);
    component.terminoBusqueda = 'Morty';
    component.search();
    expect(old.cancelled).toBe(true);
    http.expectOne(`${base}?page=1&name=Morty`).flush(response);
    expect(component.loading).toBe(false);
    expect(component.appliedSearch).toBe('Morty');
  });
});
