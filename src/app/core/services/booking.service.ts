import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingForm } from '../models/booking.model';

export interface Booking {
  _id: string;
  id?: string; // alias for display (e.g. SK-10023)
  service: string;
  provider: string;
  providerId?: string;
  listingId?: string;
  date: string;
  amount: number | string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  rated: boolean;
  description?: string;
  address?: string;
  city?: string;
  duration?: string;
  time?: string;
  urgency?: string;
  contactName?: string;
  phone?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:3000/api';

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

  constructor(private http: HttpClient) {}

  
  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/bookings/my`);
  }

 
  createBooking(data: Partial<Booking>): Observable<{ success: boolean; data: Booking; ref: string }> {
    return this.http.post<{ success: boolean; data: Booking; ref: string }>(`${this.apiUrl}/bookings`, data);
  }

  
  cancelBooking(id: string): Observable<{ success: boolean; data: Booking }> {
    return this.http.put<{ success: boolean; data: Booking }>(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }

  
  submitRating(bookingId: string, rating: number, review: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/ratings`, {
      bookingId,
      rating,
      review
    });
  }

  
  update(partial: Partial<BookingForm>): void {
    this._current.update(f => ({ ...f, ...partial }));
  }

  
  setConfirmedRef(ref: string): void {
    this._confirmedRef.set(ref);
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