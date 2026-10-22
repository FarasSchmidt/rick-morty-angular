import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header', standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  get user() { return this.auth.getUser(); }
  get visible(): boolean {
    return !/^\/(login|register)(?:[/?#]|$)/.test(this.router.url);
  }
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}
