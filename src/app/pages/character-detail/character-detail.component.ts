import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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
  templateUrl: './character-detail.html'
})
export class CharacterDetailComponent implements OnInit {
  character: any;
  episodes: { name: string; episode: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private rmService: RickMortyService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rmService.getCharacterById(+id).subscribe(data => {
        this.character = data;

        const episodeUrls: string[] = data.episode;
        const episodeIds = episodeUrls.map(url => url.split('/').pop());

        // Peticiones paralelas para traer los datos completos de cada episodio
        forkJoin(
          episodeIds.map(id => this.rmService.getEpisodeById(+id!))
        ).subscribe(episodesData => {
          this.episodes = episodesData;
        });
      });
    }
  }
}
