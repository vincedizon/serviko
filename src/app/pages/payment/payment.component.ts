import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { BookingService } from '../../core/services/booking.service';
import { environment } from '../../../environments/environment';

export interface PaymentPayload {
  bookingId: string;
  method:    'gcash' | 'maya' | 'bank' | 'cash';
  amount:    number;
  reference?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  animations: [
    trigger('checkAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PaymentComponent implements OnInit {

  // ── Signals — names match exactly what the HTML template uses ──────────────
  loading     = signal(false);
  errorMsg    = signal<string | null>(null);
  paymentDone = signal(false);
  payMethod   = signal<'gcash' | 'maya' | 'bank' | 'cash'>('gcash');

  // ── Form fields ─────────────────────────────────────────────────────────────
  gcashNum     = '';
  mayaNum      = '';
  selectedBank = 'BDO';
  banks        = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'PNB'];

  // ── Receipt data ─────────────────────────────────────────────────────────────
  bookingRef  = '';
  totalAmount = 0;
  paymentDate = new DatePipe('en-PH').transform(new Date(), 'MMMM d, y') ?? '';

  constructor(
    private router:         Router,
    private http:           HttpClient,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Guard: no confirmed booking → redirect to dashboard
    if (!this.bookingService.confirmedId()) {
      this.router.navigate(['/bookings']);
      return;
    }
    // Pre-fill receipt ref for display
    this.bookingRef = this.bookingService.confirmedRef() ?? '';
  }

  setMethod(m: 'gcash' | 'maya' | 'bank' | 'cash'): void {
    this.payMethod.set(m);
  }

  // Called by (click)="processPayment()" in the template
  processPayment(): void {
    const id = this.bookingService.confirmedId();

    if (!id) {
      this.errorMsg.set('No active booking found. Please start a new booking.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const payload: PaymentPayload = {
      bookingId: id,                  // ← THE FIX: was always undefined before
      method:    this.payMethod(),
      amount:    this.totalAmount,
    };

    this.http.post(`${environment.apiUrl}/api/payments`, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.paymentDone.set(true);
        this.bookingService.clearConfirmedBooking();
        // Auto-navigate after showing success screen
        setTimeout(() => this.router.navigate(['/bookings']), 4000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Payment failed. Please try again.');
      },
    });
  }

  go(path: string): void {
    this.router.navigate([path]);
  }
}