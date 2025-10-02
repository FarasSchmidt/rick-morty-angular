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
  styleUrls: ['./character-detail.component.scss'],
  templateUrl: './character-detail.component.html'
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
    if (id && !isNaN(+id)) {
      this.rmService.getCharacterById(+id).subscribe(data => {
        this.character = data;

        const episodeUrls: string[] = data.episode;
        const episodeIds = episodeUrls.map(url => url.split('/').pop());

        forkJoin(
          episodeIds
            .filter(eid => eid && !isNaN(+eid))
            .map(eid => this.rmService.getEpisodeById(+eid!))
        ).subscribe(episodesData => {
          this.episodes = episodesData;
        });
      });
    } else {
      this.character = null;
      this.episodes = [];
    }
  }
}
