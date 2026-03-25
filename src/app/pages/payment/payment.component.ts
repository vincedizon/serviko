import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { BookingService } from '../../core/services/booking.service';
import { environment } from '../../../environments/environment';

export interface PaymentPayload {
  method:       'gcash' | 'maya' | 'bank' | 'cash';
  amount:       number;
  mobileNumber?: string | null;
  bank?:         string | null;
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

  // ── Signals ────────────────────────────────────────────────────────────────
  loading     = signal(false);
  errorMsg    = signal<string | null>(null);
  paymentDone = signal(false);
  payMethod   = signal<'gcash' | 'maya' | 'bank' | 'cash'>('gcash');

  // ── Form fields ────────────────────────────────────────────────────────────
  gcashNum     = '';
  mayaNum      = '';
  selectedBank = 'BDO';
  banks        = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'PNB'];

  // ── Receipt data ───────────────────────────────────────────────────────────
  bookingRef  = '';
  totalAmount = 0;
  paymentDate = new DatePipe('en-PH').transform(new Date(), 'MMMM d, y') ?? '';

  constructor(
    private router:         Router,
    private http:           HttpClient,
    private bookingService: BookingService
  ) {}

  // ── Single ngOnInit ────────────────────────────────────────────────────────
  ngOnInit(): void {
    const intent = window.history.state;
    if (!intent?.providerId) {
      this.router.navigate(['/listings']);
      return;
    }
    this.totalAmount = intent.amount ?? 0;
  }

  setMethod(m: 'gcash' | 'maya' | 'bank' | 'cash'): void {
    this.payMethod.set(m);
  }

  processPayment(): void {
    const intent = window.history.state;

    if (!intent?.providerId) {
      this.errorMsg.set('Missing booking info. Please go back and try again.');
      return;
    }

    // Validation
    if (this.payMethod() === 'gcash' && !this.gcashNum.trim()) {
      this.errorMsg.set('Please enter your GCash number.');
      return;
    }
    if (this.payMethod() === 'maya' && !this.mayaNum.trim()) {
      this.errorMsg.set('Please enter your Maya number.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const paymentPayload: PaymentPayload = {
      method:       this.payMethod(),
      amount:       intent.amount,
      mobileNumber: this.payMethod() === 'gcash' ? this.gcashNum
                  : this.payMethod() === 'maya'  ? this.mayaNum : null,
      bank:         this.payMethod() === 'bank'  ? this.selectedBank : null
    };

    // Step 1: Process payment
    this.http.post(`${environment.apiUrl}/payments`, paymentPayload).subscribe({
      next: () => {

        // Step 2: Create booking record
        const bookingData = {
          providerId:    intent.providerId,
          service:       intent.serviceName,
          provider:      intent.providerName,
          date:          new Date(),
          time:          '10:00 AM',
          address:       'To be confirmed',
          amount:        intent.amount,
          paymentMethod: this.payMethod(),
          status:        'Pending'
        };

        this.http.post(`${environment.apiUrl}/bookings`, bookingData).subscribe({
          next: (bookRes: any) => {
            this.bookingRef = bookRes.data?.ref ?? 'SK-XXXXX';
            this.loading.set(false);
            this.paymentDone.set(true);
            setTimeout(() => this.router.navigate(['/bookings']), 4000);
          },
          error: () => {
            this.loading.set(false);
            this.errorMsg.set('Payment verified, but booking record failed. Contact support.');
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Payment failed. Please try again.');
      }
    });
  }

  go(path: string): void {
    this.router.navigate([path]);
  }
}