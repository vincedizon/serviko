import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .main-content { flex: 1; min-height: 80vh; }
    :host { display: flex; flex-direction: column; min-height: 100vh; }
  `]
})
export class AppComponent {
  constructor(private router: Router) {
    // This will tell us in the Console (F12) exactly where the app is going
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🚀 Route Change Detected:', event.url);
      }
    });
  }
}