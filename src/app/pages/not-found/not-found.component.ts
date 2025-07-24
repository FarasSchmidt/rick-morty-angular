import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <h1 class="display-1 fw-bold">404</h1>
      <p class="lead">Oops, la página que estás buscando no existe.</p>
      <a routerLink="/characters" class="btn btn-primary mt-3">Volver al inicio</a>
    </div>
  `
})
export class NotFoundComponent {}
