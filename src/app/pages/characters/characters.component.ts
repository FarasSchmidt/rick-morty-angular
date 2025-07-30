import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RickMortyService } from '../../services/rick-morty.service';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { FormsModule } from '@angular/forms';
import { Character } from '../../types/character.type';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent, FormsModule],
  templateUrl: './characters.html',
  styleUrl: 'characters.css'
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  terminoBusqueda: string = ""
  info: any;
  currentPage = 1;

  constructor(private rmService: RickMortyService) { }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.rmService.getCharacters(this.currentPage).subscribe((data: any) => {
      this.characters = data.results;
      this.info = data.info;
      console.log(this.characters)
    });
  }

  filterCharacters(criteria: string): any {
    return this.characters.filter(char => char.name.includes(criteria))
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadCharacters();
  }
}
