import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProviderService } from '../../core/services/provider.service';
import { BookingService } from '../../core/services/booking.service';
import { Provider } from '../../core/models/provider.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class BookingComponent {
  step        = signal(1);
  bookingDone = signal(false);

  // Initialized immediately so template never sees undefined
  provider: Provider = this.providerService.getSelectedOrFirst();

  service     = ''; description = ''; address = '';
  city        = 'Angeles City'; duration = '2 hours';
  date        = ''; time = ''; urgency = 'Standard (within 2 days)';
  contactName = ''; phone = ''; notes = '';

  today = new Date().toISOString().split('T')[0];
  services  = this.bookingService.serviceTypes;
  cities    = this.bookingService.cities;

  timeSlots = [
    { time: '7:00 AM',  available: true  }, { time: '8:00 AM',  available: true  },
    { time: '9:00 AM',  available: false }, { time: '10:00 AM', available: true  },
    { time: '11:00 AM', available: true  }, { time: '1:00 PM',  available: false },
    { time: '2:00 PM',  available: true  }, { time: '3:00 PM',  available: true  },
    { time: '4:00 PM',  available: true  },
  ];

  total = computed(() => {
    const map: Record<string, number> = {
      '1 hour': 1, '2 hours': 2, '3 hours': 3,
      'Half day (4hrs)': 4, 'Full day (8hrs)': 8
    };
    const hrs     = map[this.duration] ?? 2;
    const base    = this.provider.rate * hrs;
    const express = this.urgency.includes('Express') ? 150 : 0;
    return base + express + 50;
  });

  constructor(
    private providerService: ProviderService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  nextStep(): void   { this.step.update(s => s + 1); }
  prevStep(): void   { this.step.update(s => s - 1); }
  selectTime(t: string): void { this.time = t; }

  submit(): void {
    this.bookingService.confirm();
    this.bookingDone.set(true);
  }

  go(path: string): void { this.router.navigate([path]); }
}
