import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-card.html',
  styleUrls: ['./character-card.css']
})
export class CharacterCardComponent {
  @Input() character!: any;
}
