import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'characters', pathMatch: 'full' },
  { path: 'characters', component: CharactersComponent },
  { path: 'characters/:id', component: CharacterDetailComponent },
  { path: '**', redirectTo: '/404' },
];
