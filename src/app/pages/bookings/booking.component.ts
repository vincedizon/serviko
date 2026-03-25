import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BookingService, Booking } from '../../core/services/booking.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMsg = signal<string | null>(null);
  activeTab = signal('all');

  showModal = signal(false);
  ratingTarget = signal<Booking | null>(null);
  tempRating = signal(0);
  ratingText = '';
  starsArray = [1, 2, 3, 4, 5];
  statusOptions = ['Pending', 'Active', 'Completed', 'Cancelled'];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.isLoading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (res: any) => {
        this.bookings.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load bookings.');
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(b: Booking, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.updateStatusDirect(b, newStatus);
  }

  updateStatusDirect(b: Booking, newStatus: string) {
    const prevStatus = b.status;

    // Optimistically update local signal so the dropdown + action buttons reflect change immediately
    this.bookings.update(list =>
      list.map(item => item._id === b._id ? { ...item, status: newStatus as Booking['status'] } : item)
    );

    this.http.patch(`${environment.apiUrl}/bookings/${b._id}/status`, { status: newStatus })
      .subscribe({
        next: () => this.loadBookings(),
        error: (err) => {
          // Revert on failure
          this.bookings.update(list =>
            list.map(item => item._id === b._id ? { ...item, status: prevStatus } : item)
          );
          alert('Update failed: ' + (err?.error?.message ?? 'Error'));
        }
      });
  }

  dashStats = computed(() => {
    const data = this.bookings();
    return [
      { label: 'Total', val: data.length, sub: 'All time', color: 'var(--text)' },
      { label: 'Active', val: data.filter(b => b.status === 'Active').length, sub: 'In progress', color: 'var(--accent)' },
      { label: 'Pending', val: data.filter(b => b.status === 'Pending').length, sub: 'Awaiting', color: '#f59e0b' }
    ];
  });

  filtered = computed(() => {
    const tab = this.activeTab();
    const data = this.bookings();
    if (tab === 'all') return data;
    return data.filter(b => b.status.toLowerCase() === tab.toLowerCase());
  });

  statusBadge(status: string) {
    return {
      'badge-pending': status === 'Pending',
      'badge-active': status === 'Active',
      'badge-completed': status === 'Completed',
      'badge-cancelled': status === 'Cancelled'
    };
  }

  openRating(b: Booking) {
    this.ratingTarget.set(b);
    this.tempRating.set(0);
    this.ratingText = '';
    this.showModal.set(true);
  }

  setRating(val: number) { this.tempRating.set(val); }

  submitRating() {
    const target = this.ratingTarget();
    if (!target) return;

    if (this.tempRating() === 0) {
      alert('Please select a star rating before submitting.');
      return;
    }

    // POST to /api/ratings — creates the Rating document AND marks booking as rated
    this.http.post(`${environment.apiUrl}/ratings`, {
      bookingId:    target._id,
      listingId:    (target as any).listingId,  // needed for listing avg update
      providerName: target.provider,             // shown on ratings page
      service:      target.service,              // shown on ratings page
      rating:       this.tempRating(),
      review:       this.ratingText
    }).subscribe({
      next: () => {
        // Optimistically mark as rated in local signal so Rate button disappears immediately
        this.bookings.update(list =>
          list.map(item => item._id === target._id ? { ...item, rated: true } : item)
        );
        this.showModal.set(false);
        this.loadBookings();
        // Navigate to ratings page so it re-initialises with fresh data
        this.router.navigate(['/ratings']);
      },
      error: (err) => alert('Failed to submit rating: ' + (err?.error?.message ?? 'Error'))
    });
  }

  setTab(tab: string) { this.activeTab.set(tab); }
  go(path: string) { this.router.navigate([path]); }
  trackById(_: number, b: Booking) { return b._id; }

  cancelBooking(b: Booking) {
    if (confirm('Cancel this booking?')) {
      // Optimistically update so Cancel button disappears immediately
      this.bookings.update(list =>
        list.map(item => item._id === b._id ? { ...item, status: 'Cancelled' as Booking['status'] } : item)
      );

      this.bookingService.cancelBooking(b._id).subscribe({
        next: () => this.loadBookings(),
        error: () => {
          // Revert on failure
          this.bookings.update(list =>
            list.map(item => item._id === b._id ? { ...item, status: 'Pending' as Booking['status'] } : item)
          );
          alert('Failed to cancel booking.');
        }
      });
    }
  }
}