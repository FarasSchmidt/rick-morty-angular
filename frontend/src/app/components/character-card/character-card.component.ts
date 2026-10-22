import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Character } from '../../types/character.type';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-card.html',
  styleUrls: ['./character-card.css']
})
export class CharacterCardComponent {
  @Input({ required: true }) character!: Character;
}
