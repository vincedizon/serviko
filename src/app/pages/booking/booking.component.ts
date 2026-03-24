import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// REMOVE: import { Booking } from './booking.service'; <--- This was causing the circular error

export interface Booking {
  _id: string;
  ref?: string;
  userId: string;
  listingId?: string;
  service: string;
  provider: string;
  providerId?: string;
  description?: string;
  address?: string;
  city: string;
  duration?: string;
  date: Date | string;
  time?: string;
  urgency?: string;
  contactName?: string;
  phone?: string;
  notes?: string;
  amount: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  rated: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = 'http://localhost:3000/api/bookings';

  confirmedId = signal<string | null>(null);
  confirmedRef = signal<string | null>(null);
  cities = ['Angeles City', 'Mabalacat', 'San Fernando', 'Mexico', 'Porac'];

  constructor(private http: HttpClient) {}

  getMyBookings(): Observable<any> { 
    // Changed return type to 'any' temporarily because your component 
    // expects an object with a .data property (res.data)
    return this.http.get<any>(`${this.baseUrl}/my-bookings`);
  }

  // Fixed: Added 3rd parameter 'comment' to match your component call
  submitRating(id: string, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/rate/${id}`, { rating, comment });
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/cancel/${id}`, {});
  }

  clearConfirmedBooking() {
    this.confirmedId.set(null);
    this.confirmedRef.set(null);
  }
}