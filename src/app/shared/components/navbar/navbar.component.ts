import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showMenu = signal(false);

  constructor(public auth: AuthService, private router: Router) {}

  toggleMenu(): void { this.showMenu.update(v => !v); }
  closeMenu(): void  { this.showMenu.set(false); }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }
}
