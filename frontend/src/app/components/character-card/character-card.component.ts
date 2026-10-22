import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Character } from '../../types/character.type';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './character-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./character-card.css']
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;
}
