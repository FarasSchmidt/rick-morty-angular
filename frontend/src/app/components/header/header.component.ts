import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header', standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html', styleUrl: './header.component.scss'
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
