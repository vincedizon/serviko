import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css'],
  animations: [
    trigger('cardStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(80, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ListingsComponent implements OnInit {
  search       = signal('');
  selectedCats = signal<Record<string, boolean>>({});
  minRating    = signal(0);
  maxRate      = signal(3000);
  verifiedOnly = signal(false);
  sortBy       = signal('rating');

  // State
  allProviders = signal<Listing[]>([]);
  isLoading    = signal(true);
  errorMsg     = signal('');

  categories = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Aircon Technician', 'House Cleaner', 'Welder', 'Pest Control'];

  filteredProviders = computed(() => {
    const s    = this.search().toLowerCase();
    const cats = Object.keys(this.selectedCats()).filter(k => this.selectedCats()[k]);

    return this.allProviders()
      .filter(p => {
        if (cats.length && !cats.includes(p.service)) return false;
        if (s && !p.name.toLowerCase().includes(s) && !p.service.toLowerCase().includes(s)) return false;
        if (p.rating < this.minRating()) return false;
        if (p.rate > this.maxRate()) return false;
        if (this.verifiedOnly() && !p.verified) return false;
        return true;
      })
      .sort((a, b) => {
        if (this.sortBy() === 'rating') return b.rating - a.rating;
        if (this.sortBy() === 'rate')   return a.rate - b.rate;
        return a.name.localeCompare(b.name);
      });
  });

  constructor(
    private listingService: ListingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read search query param from home page search bar
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.search.set(params['search']);
    });

    this.loadListings();
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.listingService.getListings().subscribe({
      next: (res) => {
        this.allProviders.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load listings:', err);
        this.errorMsg.set('Failed to load listings. Make sure the backend is running.');
        this.isLoading.set(false);
      }
    });
  }

  toggleCat(cat: string): void