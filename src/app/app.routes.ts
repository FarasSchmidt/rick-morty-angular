import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'characters', pathMatch: 'full' },
  { path: 'characters', component: CharactersComponent },

{
  path: 'characters/:id',
  loadComponent: () => import('./pages/character-detail/character-detail.component').then(m => m.CharacterDetailComponent),
  data: {
    renderMode: 'client'
  }
},

  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];
