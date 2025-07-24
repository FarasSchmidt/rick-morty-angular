import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="['/characters', character.id]" class="text-decoration-none text-dark">
      <div class="card h-100">
        <img [src]="character.image" class="card-img-top" [alt]="character.name" />
        <div class="card-body">
          <h5 class="card-title text-center">{{ character.name }}</h5>
        </div>
      </div>
    </a>
  `,
  styles: []
})
export class CharacterCardComponent {
  @Input() character!: any;
}
