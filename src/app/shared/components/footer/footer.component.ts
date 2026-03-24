import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer" *ngIf="!isAuthPage()">
      © 2026 <span>ServiKo</span> · A Local Home Services Platform · Pampanga, Philippines
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg2); border-top: 1px solid var(--border);
      padding: 2rem; text-align: center; font-size: .8rem; color: var(--muted);
    }
    .footer span { color: var(--accent); }
  `]
})
export class FooterComponent {
  constructor(private router: Router) {}
  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }
}
