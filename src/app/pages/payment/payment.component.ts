import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router }            from '@angular/router';
import { BookingService }    from '../../core/services/booking.service';
import { PaymentService }    from '../../core/services/payment.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector:    'app-payment',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls:   ['./payment.component.css'],
  animations: [
    trigger('checkAnim', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class PaymentComponent {
  payMethod    = signal<'gcash' | 'maya' | 'bank'>('gcash');
  paymentDone  = signal(false);
  loading      = signal(false);
  errorMsg     = signal('');

  totalAmount  = 750;
  gcashNum     = '';
  mayaNum      = '';
  selectedBank = 'BDO';
  banks        = ['BDO', 'BPI', 'UnionBank', 'Metrobank', 'PNB'];

  // Populated after successful payment
  bookingRef  = '';
  paymentDate = '';

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  setMethod(m: 'gcash' | 'maya' | 'bank'): void { this.payMethod.set(m); }

  processPayment(): void {
    this.errorMsg.set('');

    // Basic validation
    const method = this.payMethod();
    if ((method === 'gcash' && !this.gcashNum.trim()) ||
        (method === 'maya'  && !this.mayaNum.trim())) {
      this.errorMsg.set('Please enter your mobile number.');
      return;
    }

    this.loading.set(true);

    const payload = {
      bookingId:    this.bookingService.confirmedRef() ? undefined : undefined, // attach if you store _id
      method,
      mobileNumber: method === 'gcash' ? this.gcashNum : method === 'maya' ? this.mayaNum : undefined,
      bank:         method === 'bank' ? this.selectedBank : undefined,
      amount:       this.totalAmount,
    };

    this.paymentService.createPayment(payload).subscribe({
      next: (res) => {
        this.bookingRef  = res.payment.ref;
        this.paymentDate = new Date(res.payment.createdAt).toLocaleDateString('en-PH', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        this.loading.set(false);
        this.paymentDone.set(true);
        this.bookingService.reset(); // clear booking state
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.error ?? 'Payment failed. Please try again.');
      }
    });
  }

  go(path: string): void { this.router.navigate([path]); }
}