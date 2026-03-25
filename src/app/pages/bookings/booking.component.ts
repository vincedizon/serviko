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
    this.http.patch(`${environment.apiUrl}/bookings/${b._id}/status`, { status: newStatus })
      .subscribe({
        next: () => this.loadBookings(),
        error: (err) => alert('Update failed: ' + (err?.error?.message ?? 'Error'))
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
    if (target) {
      this.http.post(`${environment.apiUrl}/bookings/rate/${target._id}`, {
        rating: this.tempRating(),
        comment: this.ratingText
      }).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadBookings();
        },
        error: () => alert('Failed to submit rating.')
      });
    }
  }

  setTab(tab: string) { this.activeTab.set(tab); }
  go(path: string) { this.router.navigate([path]); }

  cancelBooking(b: Booking) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(b._id).subscribe({
        next: () => this.loadBookings()
      });
    }
  }
}