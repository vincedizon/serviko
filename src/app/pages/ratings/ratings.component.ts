import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { HttpClient }    from '@angular/common/http';

interface FullReview {
  _id:             string;
  client:          string;
  date:            string;
  service:         string;
  provider:        string;
  providerService: string;
  rating:          number;
  text:            string;
}

interface Breakdown { stars: number; pct: number; count: number; }

@Component({
  selector:    'app-ratings',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './ratings.component.html',
  styleUrls:   ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  rFilter    = signal<number | null>(null);
  loading    = signal(true);
  starsArray = [1, 2, 3, 4, 5];

  allReviews = signal<FullReview[]>([]);
  breakdown  = signal<Breakdown[]>([
    { stars: 5, pct: 0, count: 0 },
    { stars: 4, pct: 0, count: 0 },
    { stars: 3, pct: 0, count: 0 },
    { stars: 2, pct: 0, count: 0 },
    { stars: 1, pct: 0, count: 0 },
  ]);

  averageRating = signal('0.0');
  totalReviews  = signal(0);

  filtered = computed(() => {
    const f = this.rFilter();
    return f === null
      ? this.allReviews()
      : this.allReviews().filter(r => r.rating === f);
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  this.http.get<any>('http://localhost:3000/api/ratings').subscribe({
    next: (res) => {
      // Check if your backend wraps data in a 'data' property or returns a direct array
      const rawData = res.success ? res.data : res; 
      
      const reviews: FullReview[] = rawData.map((r: any) => ({
        _id:             r._id,
        client:          r.userName ?? 'Anonymous', 
        date:            new Date(r.createdAt).toLocaleDateString('en-PH'),
        service:         r.service ?? 'Service', // Matches the saved field
        provider:        r.providerName ?? 'Provider', // Matches the saved field
        providerService: r.service ?? '',
        rating:          Number(r.rating),
        text:            r.review ?? '',
      }));

      this.allReviews.set(reviews);
      this.totalReviews.set(reviews.length);

      if (reviews.length > 0) {
        // Calculate dynamic average
        const sum = reviews.reduce((s, r) => s + r.rating, 0);
        const avg = sum / reviews.length;
        this.averageRating.set(avg.toFixed(1));

        // Update the progress bar breakdown
        const bd = [5, 4, 3, 2, 1].map(stars => {
          const count = reviews.filter(r => Math.round(r.rating) === stars).length;
          return { 
            stars, 
            count, 
            pct: Math.round((count / reviews.length) * 100) 
          };
        });
        this.breakdown.set(bd);
      } else {
        this.averageRating.set('0.0');
      }

      this.loading.set(false);
    },
    error: (err) => {
      console.error('Failed to load ratings:', err);
      this.loading.set(false);
    }
  });
}

  setFilter(f: number | null): void { this.rFilter.set(f); }
}