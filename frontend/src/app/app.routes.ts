import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthGuard } from './guards/unauth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'characters', pathMatch: 'full' },
  { 
    path: 'characters', 
    component: CharactersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'characters/:id',
    loadComponent: () => import('./pages/character-detail/character-detail.component').then(m => m.CharacterDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [UnauthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [UnauthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/auth/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { path: '404', component: NotFoundComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/404' },
];
