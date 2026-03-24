import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  animations: [
    trigger('checkAnim', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class PaymentComponent {
  payMethod    = signal('gcash');
  paymentDone  = signal(false);
  loading      = signal(false);
  totalAmount  = 750;
  gcashNum     = '';
  mayaNum      = '';
  selectedBank = 'BDO';
  accountNum   = '';
  banks        = ['BDO', 'BPI', 'UnionBank', 'Metrobank', 'PNB'];

  bookingRef = this.bookingService.confirmedRef() ?? 'SK-10023';

  constructor(private bookingService: BookingService, private router: Router) {}

  setMethod(m: string): void { this.payMethod.set(m); }

  processPayment(): void {
    if (!this.payMethod()) return;
    this.loading.set(true);
    setTimeout(() => {
      // Ensure booking is confirmed in service if not already
      if (!this.bookingRef) {
        this.bookingRef = this.bookingService.confirm();
      }
      // In a real app, here we would validate the payment transaction
      this.loading.set(false);
      this.paymentDone.set(true);
    }, 2000);
  }

  go(path: string): void { this.router.navigate([path]); }
}
