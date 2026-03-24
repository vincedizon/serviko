import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProviderService } from '../../core/services/provider.service';
import { Provider } from '../../core/models/provider.model';
import { Review } from '../../core/models/user.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css'],
  animations: [
    trigger('tabContent', [
      transition(':enter', [style({ opacity: 0, transform: 'translateY(10px)' }), animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])
    ])
  ]
})
export class ProviderProfileComponent implements OnInit {
  provider!: Provider;
  tab = signal<'overview' | 'services' | 'reviews'>('overview');
  starsArray = [1, 2, 3, 4, 5];

  ratingBreakdown: { stars: number; pct: number; count: number }[] = [];

  reviews: Review[] = [
    { name: 'Ana Santos',   date: 'Feb 28, 2026', rating: 5, text: 'Excellent work! Fixed our electrical problem quickly and professionally. Will definitely hire again.' },
    { name: 'Mario Reyes',  date: 'Feb 20, 2026', rating: 5, text: 'Very knowledgeable and honest. Gave us a fair price and completed the job on time.' },
    { name: 'Grace Flores', date: 'Feb 10, 2026', rating: 4, text: 'Good work overall. Arrived a bit late but the quality of the repair was top notch.' },
    { name: 'Pedro Cruz',   date: 'Jan 30, 2026', rating: 5, text: 'Highly recommend! Professional, clean, and thorough. Fixed everything in one visit.' },
  ];

  constructor(private providerService: ProviderService, private router: Router) {}

  ngOnInit(): void {
    this.provider = this.providerService.getSelectedOrFirst();
    const total = this.provider.reviews;
    this.ratingBreakdown = [
      { stars: 5, pct: 78, count: Math.round(total * .78) },
      { stars: 4, pct: 14, count: Math.round(total * .14) },
      { stars: 3, pct: 5,  count: Math.round(total * .05) },
      { stars: 2, pct: 2,  count: Math.round(total * .02) },
      { stars: 1, pct: 1,  count: Math.round(total * .01) },
    ];
  }

  setTab(t: 'overview' | 'services' | 'reviews'): void { this.tab.set(t); }

  book(): void { this.router.navigate(['/booking']); }

  starsRange(n: number): number[] {
    return Array.from({ length: Math.round(n) }, (_, i) => i + 1);
  }
}
