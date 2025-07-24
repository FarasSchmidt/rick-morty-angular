import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="['/characters', character.id]">
      <div>
        <img [src]="character.image" [alt]="character.name" />
        <div>
          <h5>{{ character.name }}</h5>
        </div>
      </div>
    </a>
  `,
  styles: []
})
export class CharacterCardComponent {
  @Input() character!: any;
}
