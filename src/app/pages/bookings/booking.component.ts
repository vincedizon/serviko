import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Booking } from '../../core/services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  // 1. Data Signals used by the HTML
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMsg = signal<string | null>(null);
  activeTab = signal('all');

  // 2. Modal & Rating Signals
  showModal = signal(false);
  ratingTarget = signal<Booking | null>(null);
  tempRating = signal(0);
  ratingText = '';
  starsArray = [1, 2, 3, 4, 5];

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit() {
    this.loadBookings();
  }

  // 3. Methods for loading and filtering data
  loadBookings() {
  this.isLoading.set(true);
  this.bookingService.getMyBookings().subscribe({
    next: (res: any) => {
      // res is { success: true, data: [...] }
      this.bookings.set(res.data || []); 
      this.isLoading.set(false);
    },
    error: (err) => {
      this.errorMsg.set('Server connection failed.');
      this.isLoading.set(false);
    }
  });
  }

  // Computed signal for the dashboard stats section
  dashStats = computed(() => [
    { label: 'Total', val: this.bookings().length, sub: 'All time', color: 'var(--text)' },
    { label: 'Active', val: this.bookings().filter(b => b.status === 'Active').length, sub: 'In progress', color: 'var(--accent)' },
    { label: 'Pending', val: this.bookings().filter(b => b.status === 'Pending').length, sub: 'Awaiting', color: '#f59e0b' }
  ]);

  // Computed signal for the filtered table rows
  filtered = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.bookings();
    return this.bookings().filter(b => b.status.toLowerCase() === tab);
  });

  // 4. Action Handlers
  setTab(tab: string) { this.activeTab.set(tab); }

  go(path: string) { this.router.navigate([path]); }

  statusBadge(status: string) {
    return {
      'badge-pending': status === 'Pending',
      'badge-active': status === 'Active',
      'badge-completed': status === 'Completed',
      'badge-cancelled': status === 'Cancelled'
    };
  }

  // 5. Rating & Cancellation logic
  openRating(b: Booking) {
    this.ratingTarget.set(b);
    this.tempRating.set(0);
    this.ratingText = '';
    this.showModal.set(true);
  }

  setRating(val: number) { this.tempRating.set(val); }

  submitRating() {
    const target = this.ratingTarget();
    if (target) {
      this.bookingService.submitRating(target._id, this.tempRating(), this.ratingText).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadBookings();
        }
      });
    }
  }

  cancelBooking(b: Booking) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(b._id).subscribe({
        next: () => this.loadBookings()
      });
    }
  }
}