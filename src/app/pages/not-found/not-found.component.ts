import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1>404</h1>
      <p>Oops, la página que estás buscando no existe.</p>
      <a routerLink="/characters">Volver al inicio</a>
    </div>
  `
})
export class NotFoundComponent {}
