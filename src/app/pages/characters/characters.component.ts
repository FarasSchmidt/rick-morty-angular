import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RickMortyService } from '../../services/rick-morty.service';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  template: `
    <div>
      <h1>Rick y Morty personajes</h1>

      <div>
        <div
          *ngFor="let char of characters"
        >
          <app-character-card [character]="char"></app-character-card>
        </div>
      </div>

      <div>
        <button
          [disabled]="!info?.prev"
          (click)="goToPage(currentPage - 1)"
        >
          Prev
        </button>
        <button
          [disabled]="!info?.next"
          (click)="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  info: any;
  currentPage = 1;

  constructor(private rmService: RickMortyService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.rmService.getCharacters(this.currentPage).subscribe((data: any) => {
      this.characters = data.results;
      this.info = data.info;
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadCharacters();
  }
}
