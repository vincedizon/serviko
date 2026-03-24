import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 1. DEFINE THE INTERFACE FIRST (Above the class)
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

// 2. NOW THE CLASS CAN USE THAT NAME
@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = 'http://localhost:3000/api/bookings';

  confirmedId = signal<string | null>(null);
  confirmedRef = signal<string | null>(null);
  cities = ['Angeles City', 'Mabalacat', 'San Fernando', 'Mexico', 'Porac'];

  constructor(private http: HttpClient) {}

  // If your API returns { data: Booking[] }, use Observable<any>
  // If your API returns just the array [Booking, Booking], use Observable<Booking[]>
  getMyBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/my-bookings`);
  }

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