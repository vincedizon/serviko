import { Injectable, signal } from '@angular/core';
import { BookingForm } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly cities = [
    'Angeles City', 'San Fernando', 'Mabalacat', 'Clark',
    'Porac', 'Mexico', 'Lubao', 'Guagua', 'Bacolor', 'Magalang', 'Apalit', 'Macabebe'
  ];

  readonly serviceTypes = [
    'Electrical Repair', 'Lighting Installation', 'Panel Upgrade',
    'Leak Repair', 'Pipe Installation', 'Carpentry', 'Painting',
    'AC Cleaning', 'Freon Recharge', 'General Cleaning', 'Deep Cleaning',
    'Gate Fabrication', 'Welding Repair', 'Pest Control'
  ];

  private _current = signal<BookingForm>({
    service: '', description: '', address: '',
    city: 'Angeles City', duration: '2 hours', date: '',
    time: '', urgency: 'Standard (within 2 days)',
    contactName: '', phone: '', notes: ''
  });

  private _confirmedRef = signal<string | null>(null);

  readonly current      = this._current.asReadonly();
  readonly confirmedRef = this._confirmedRef.asReadonly();

  update(partial: Partial<BookingForm>): void {
    this._current.update(f => ({ ...f, ...partial }));
  }

  confirm(): string {
    const ref = 'SK-' + Math.floor(Math.random() * 90000 + 10000);
    this._confirmedRef.set(ref);
    return ref;
  }

  reset(): void {
    this._current.set({
      service: '', description: '', address: '',
      city: 'Angeles City', duration: '2 hours', date: '',
      time: '', urgency: 'Standard (within 2 days)',
      contactName: '', phone: '', notes: ''
    });
    this._confirmedRef.set(null);
  }
}
