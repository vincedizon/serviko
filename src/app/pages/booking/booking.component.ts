import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Booking } from '../../core/services/booking.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
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
export class BookingsComponent implements OnInit {
  activeTab    = signal<'all'|'pending'|'active'|'completed'>('all');
  showModal    = signal(false);
  ratingTarget = signal<Booking | null>(null);
  tempRating   = signal(5);
  ratingText   = '';
  starsArray   = [1, 2, 3, 4, 5];

  // State
  bookings  = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMsg  = signal('');

  // Computed dash stats from real data
  dashStats = computed(() => {
    const all       = this.bookings();
    const completed = all.filter(b => b.status === 'Completed');
    const pending   = all.filter(b => b.status === 'Pending');
    const totalSpent = completed.reduce((sum, b) => sum + Number(b.amount), 0);
    return [
      { label: 'Total Bookings', val: all.length.toString(),       sub: 'All time',              color: 'var(--text)'    },
      { label: 'Completed',      val: completed.length.toString(), sub: 'Jobs done',             color: 'var(--success)' },
      { label: 'Pending',        val: pending.length.toString(),   sub: 'Awaiting confirmation', color: 'var(--accent)'  },
      { label: 'Total Spent',    val: '₱' + totalSpent.toLocaleString(), sub: 'This year',       color: 'var(--cyan)'    },
    ];
  });

  filtered = computed(() => {
    const t = this.activeTab();
    if (t === 'all') return this.bookings();
    const map: Record<string, string> = { pending: 'Pending', active: 'Active', completed: 'Completed' };
    return this.bookings().filter(b => b.status === map[t]);
  });

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.errorMsg.set('Failed to load bookings. Make sure you are logged in and the backend is running.');
        this.isLoading.set(false);
      }
    });
  }

  setTab(t: 'all'|'pending'|'active'|'completed'): void { this.activeTab.set(t); }

  statusBadge(s: string): string {
    const map: Record<string,string> = {
      Pending: 'badge-accent', Active: 'badge-info',
      Completed: 'badge-success', Cancelled: 'badge-danger'
    };
    return map[s] ?? 'badge-muted';
  }

  openRating(b: Booking): void {
    this.ratingTarget.set(b);
    this.tempRating.set(5);
    this.ratingText = '';
    this.showModal.set(true);
  }

  submitRating(): void {
    const target = this.ratingTarget();
    if (!target) return;

    this.bookingService.submitRating(target._id, this.tempRating(), this.ratingText).subscribe({
      next: () => {
        // Mark as rated in local state immediately
        this.bookings.update(list =>
          list.map(b => b._id === target._id ? { ...b, rated: true } : b)
        );
        this.showModal.set(false);
      },
      error: (err) => {
        console.error('Failed to submit rating:', err);
        alert('Failed to submit rating. Please try again.');
      }
    });
  }

  cancelBooking(b: Booking): void {
    if (!confirm('Cancel booking #' + (b.id || b._id) + '?')) return;

    this.bookingService.cancelBooking(b._id).subscribe({
      next: () => {
        // Update status in local state immediately
        this.bookings.update(list =>
          list.map(booking => booking._id === b._id ? { ...booking, status: 'Cancelled' } : booking)
        );
      },
      error: (err) => {
        console.error('Failed to cancel booking:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    });
  }

  setRating(n: number): void { this.tempRating.set(n); }
  go(path: string): void { this.router.navigate([path]); }
}