import { HeaderComponent } from './components/header/header.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: 'app.component.html',
})
export class AppComponent {}
