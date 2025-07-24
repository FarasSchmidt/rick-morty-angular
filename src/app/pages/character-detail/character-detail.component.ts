import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RickMortyService } from '../../services/rick-morty.service';
import { StatusTranslatePipe } from '../../pipes/status-translate-pipe';
import { GenderTranslatePipe } from '../../pipes/gender-translate-pipe';


@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [
    CommonModule,
    StatusTranslatePipe,
    GenderTranslatePipe
  ],
  styleUrls: ['./character-detail.css'],
  template: `
    <div *ngIf="character">
      <div>
        <div>
          <img [src]="character.image" [alt]="character.name" />
        </div>
        <div>
          <h2>{{ character.name }}</h2>

          <p>
            <strong>Estado:</strong>
            <span
              [ngClass]="{
                'status-alive': character.status === 'Alive',
                'status-dead': character.status === 'Dead',
                'status-unknown': character.status === 'unknown'
              }"
            >
              {{ character.status | statusTranslate }}
            </span>
          </p>

          <p><strong>Especie:</strong> {{ character.species }}</p>
          <p><strong>Género:</strong> {{ character.gender | genderTranslate }}</p>
          <p><strong>Origen:</strong> {{ character.origin.name }}</p>
          <p><strong>Ubicación:</strong> {{ character.location.name }}</p>

          <h4>Episodios</h4>
          <ul>
            <li *ngFor="let ep of episodes">{{ ep }}</li>
          </ul>
        </div>
      </div>
    </div>
  `
})

export class CharacterDetailComponent implements OnInit {
  character: any;
  episodes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private rmService: RickMortyService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rmService.getCharacterById(+id).subscribe((data) => {
        this.character = data;

        const episodeUrls: string[] = data.episode;
        this.episodes = episodeUrls.map(url => `Episodio ${url.split('/').pop()}`);
      });
    }
  }
}
