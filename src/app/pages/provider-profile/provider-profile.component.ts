import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListingService, Listing } from '../../core/services/listing.service';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
}

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css'],
  animations: [
    trigger('tabContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProviderProfileComponent implements OnInit {
  // Built from the selected listing
  provider: any = null;
  isLoading = signal(true);
  errorMsg  = signal('');

  tab        = signal<'overview' | 'services' | 'reviews'>('overview');
  starsArray = [1, 2, 3, 4, 5];

  reviews: Review[] = [];
  ratingBreakdown: { stars: number; pct: number; count: number }[] = [];

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private listingService: ListingService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const selected = this.listingService.selectedListing();

    if (!selected) {
      // No listing selected — go back to listings
      this.router.navigate(['/listings']);
      return;
    }

    this.buildProvider(selected);
    this.loadReviews(selected._id);
  }

  /** Map a Listing into the shape the template expects */
  buildProvider(listing: Listing): void {
    this.provider = {
      _id:          listing._id,
      name:         listing.name,
      service:      listing.service,
      icon:         listing.name.charAt(0).toUpperCase(),
      verified:     listing.verified,
      rating:       listing.rating ?? 0,
      rate:         listing.rate,
      reviews:      0,       // updated after loadReviews
      jobs:         0,       // can be extended later
      years:        1,       // can be extended later
      city:         (listing as any).city ?? 'Angeles City',
      responseTime: (listing as any).responseTime ?? 'Within 1 hour',
      memberSince:  (listing as any).memberSince ?? '2024',
      about:        (listing as any).description ?? `${listing.name} is a verified ${listing.service} professional serving Pampanga and Central Luzon.`,
      specialties:  (listing as any).specialties ?? [listing.service],
      serviceList:  (listing as any).serviceList ?? [
        { icon: '🔧', name: listing.service, desc: 'Standard service', rate: listing.rate, unit: 'hr' }
      ]
    };

    this.isLoading.set(false);
  }

  /** Load real reviews from backend for this listing */
  loadReviews(listingId: string): void {
    this.http.get<{ success: boolean; data: any[] }>(
      `${this.apiUrl}/ratings/listing/${listingId}`
    ).subscribe({
      next: (res) => {
        this.reviews = res.data.map(r => ({
          name:   r.userName ?? 'Anonymous',
          date:   new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          rating: r.rating,
          text:   r.review ?? ''
        }));

        // Update review count on provider
        if (this.provider) {
          this.provider.reviews = this.reviews.length;
        }

        this.buildRatingBreakdown();
      },
      error: () => {
        // Silently fall back — no reviews yet
        this.reviews = [];
        this.buildRatingBreakdown();
      }
    });
  }

  buildRatingBreakdown(): void {
    const total = this.reviews.length || 1;
    [5, 4, 3, 2, 1].forEach(star => {
      const count = this.reviews.filter(r => Math.round(r.rating) === star).length;
      this.ratingBreakdown.push({
        stars: star,
        pct:   Math.round((count / total) * 100),
        count
      });
    });
  }

  setTab(t: 'overview' | 'services' | 'reviews'): void { this.tab.set(t); }

  book(): void { this.router.navigate(['/booking']); }

  starsRange(n: number): number[] {
    return Array.from({ length: Math.round(n) }, (_, i) => i + 1);
  }
}