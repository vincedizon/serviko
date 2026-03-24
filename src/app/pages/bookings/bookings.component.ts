import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Booking } from '../../core/models/booking.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  animations: [
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-10px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class BookingsComponent {
  activeTab       = signal<'all'|'pending'|'active'|'completed'>('all');
  showModal       = signal(false);
  ratingTarget    = signal<Booking | null>(null);
  tempRating      = signal(5);
  ratingText      = '';
  starsArray      = [1, 2, 3, 4, 5];

  constructor(private router: Router) {}

  dashStats = [
    { label: 'Total Bookings', val: '12',     sub: 'All time',             color: 'var(--text)'    },
    { label: 'Completed',      val: '9',      sub: 'Jobs done',            color: 'var(--success)' },
    { label: 'Pending',        val: '2',      sub: 'Awaiting confirmation',color: 'var(--accent)'  },
    { label: 'Total Spent',    val: '₱8,450', sub: 'This year',            color: 'var(--cyan)'    },
  ];

  bookings: Booking[] = [
    { id: 'SK-10023', service: 'Electrical Repair',  provider: 'Roldan Santos',      date: 'Mar 10, 2026', amount: '750',   status: 'Pending',   rated: false },
    { id: 'SK-10018', service: 'AC Cleaning',         provider: 'Jun Escoto',         date: 'Feb 28, 2026', amount: '400',   status: 'Completed', rated: false },
    { id: 'SK-10011', service: 'Leak Repair',         provider: 'Maria Lacson',       date: 'Feb 14, 2026', amount: '600',   status: 'Completed', rated: true  },
    { id: 'SK-10005', service: 'House Cleaning',      provider: 'Lenie Buenaventura', date: 'Jan 30, 2026', amount: '400',   status: 'Completed', rated: true  },
    { id: 'SK-09997', service: 'Painting',            provider: 'Rey Cunanan',        date: 'Jan 15, 2026', amount: '1,500', status: 'Completed', rated: true  },
    { id: 'SK-09988', service: 'Carpentry',           provider: 'Arnel Dizon',        date: 'Dec 22, 2025', amount: '800',   status: 'Active',    rated: false },
  ];

  filtered = computed(() => {
    const t = this.activeTab();
    if (t === 'all') return this.bookings;
    const map: Record<string, string> = { pending: 'Pending', active: 'Active', completed: 'Completed' };
    return this.bookings.filter(b => b.status === map[t]);
  });

  setTab(t: 'all'|'pending'|'active'|'completed'): void { this.activeTab.set(t); }

  statusBadge(s: string): string {
    const map: Record<string,string> = { Pending:'badge-accent', Active:'badge-info', Completed:'badge-success', Cancelled:'badge-danger' };
    return map[s] ?? 'badge-muted';
  }

  openRating(b: Booking): void {
    this.ratingTarget.set(b); this.tempRating.set(5); this.ratingText = ''; this.showModal.set(true);
  }

  submitRating(): void {
    const t = this.ratingTarget();
    if (t) {
      // Find and update the specific booking object to reflect change in UI
      const booking = this.bookings.find(b => b.id === t.id);
      if (booking) {
        booking.rated = true;
      }
    }
    this.showModal.set(false);
    // Removed alert for a smoother experience; in a real app, a toast would go here.
  }

  cancelBooking(b: Booking): void {
    if (confirm('Cancel booking #' + b.id + '?')) {
      const idx = this.bookings.indexOf(b);
      if (idx > -1) this.bookings[idx] = { ...b, status: 'Cancelled' };
    }
  }

  setRating(n: number): void { this.tempRating.set(n); }
  go(path: string): void { this.router.navigate([path]); }
}
