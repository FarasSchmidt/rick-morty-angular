import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RickMortyService } from '../../services/rick-morty.service';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { FormsModule } from '@angular/forms';
import { Character } from '../../types/character.type';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent, FormsModule, RouterModule, MatButtonModule],
  templateUrl: './characters.component.html',
  styleUrl: 'characters.component.scss'
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  terminoBusqueda: string = "";
  info: any;
  currentPage = 1;
  userName: string = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(private rmService: RickMortyService) { }

  ngOnInit(): void {
    this.loadCharacters();
    const user = this.auth.getUser();
    if (user) {
      this.userName = user.name;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login'])
  }

  loadCharacters(): void {
    this.rmService.getCharacters(this.currentPage).subscribe((data: any) => {
      this.characters = data.results;
      this.info = data.info;
      console.log(this.characters)
    });
  }

  filterCharacters(criteria: string): any {
    return this.characters.filter(char => char.name.toLowerCase().includes(criteria.toLowerCase()))
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadCharacters();
  }
}
