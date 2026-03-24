import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FullReview {
  client: string; date: string; service: string;
  provider: string; providerService: string;
  rating: number; text: string;
}

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent {
  rFilter    = signal<number | null>(null);
  starsArray = [1, 2, 3, 4, 5];

  breakdown = [
    { stars: 5, pct: 82, count: 1920 },
    { stars: 4, pct: 12, count: 281  },
    { stars: 3, pct: 4,  count: 94   },
    { stars: 2, pct: 1,  count: 23   },
    { stars: 1, pct: 1,  count: 23   },
  ];

  allReviews: FullReview[] = [
    { client:'Ana Santos',    date:'Feb 28, 2026', service:'Electrical Repair',  provider:'Roldan Santos',       providerService:'Electrician',      rating:5, text:'Outstanding! Fixed our wiring issue so fast. Very professional and clean work. Highly recommend!' },
    { client:'Mario Reyes',   date:'Feb 25, 2026', service:'AC Cleaning',        provider:'Jun Escoto',          providerService:'Aircon Technician', rating:5, text:'Best aircon technician in Pampanga! Very thorough and honest. My unit works like new again.' },
    { client:'Grace Flores',  date:'Feb 18, 2026', service:'Leak Repair',        provider:'Maria Lacson',        providerService:'Plumber',           rating:4, text:'Great work on the pipe repair. Arrived on time and explained everything clearly before starting.' },
    { client:'Pedro Cruz',    date:'Feb 10, 2026', service:'House Cleaning',     provider:'Lenie Buenaventura',  providerService:'House Cleaner',     rating:5, text:'Incredible attention to detail! My house has never been this clean. Will book again next week.' },
    { client:'Rosa Manalo',   date:'Feb 5, 2026',  service:'Carpentry',          provider:'Arnel Dizon',         providerService:'Carpenter',         rating:4, text:'Built us a beautiful custom cabinet. Very skilled craftsman and fair pricing.' },
    { client:'Ben Torres',    date:'Jan 29, 2026', service:'Painting',           provider:'Rey Cunanan',         providerService:'Painter',           rating:3, text:'Good paint job but took longer than expected. Final result looks nice though.' },
    { client:'Lisa Garcia',   date:'Jan 22, 2026', service:'Pest Control',       provider:'Carlo Manansala',     providerService:'Pest Control',      rating:5, text:'Termite problem completely solved! Knowledgeable and used safe chemicals around the kids.' },
  ];

  filtered = computed(() => {
    const f = this.rFilter();
    return f === null ? this.allReviews : this.allReviews.filter(r => r.rating === f);
  });

  setFilter(f: number | null): void { this.rFilter.set(f); }

  starsRange(n: number): number[] {
    return Array.from({ length: Math.round(n) }, (_, i) => i + 1);
  }
}
