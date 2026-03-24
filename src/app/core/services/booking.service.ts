import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ── Booking model used by BookingsComponent ──────────────────────────────────
export interface Booking {
  _id:       string;
  id?:       string;
  ref?:      string;
  service:   string;
  provider:  string;
  date:      string;
  time?:     string;
  address?:  string;
  amount:    number | string;
  status:    'Pending' | 'Active' | 'Completed' | 'Cancelled';
  rated?:    boolean;
}

// ── Payload for creating a new booking ───────────────────────────────────────
export interface BookingPayload {
  providerId:    string;
  serviceId:     string;
  scheduledDate: string;
  scheduledTime: string;
  address:       string;
  notes?:        string;
  paymentMethod: 'gcash' | 'maya' | 'bank' | 'cash';
}

// ── API response shape after creating a booking ──────────────────────────────
export interface BookingResponse {
  success: boolean;
  data:    any;
  _id:     string;   // MongoDB ObjectId — used by PaymentComponent
  ref:     string;   // Human-readable SK-XXXXX — displayed on receipt
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/api/bookings`;

  // ── Confirmed booking state (set after wizard, read by PaymentComponent) ───
  private _confirmedId  = signal<string | null>(null);
  private _confirmedRef = signal<string | null>(null);

  readonly confirmedId  = this._confirmedId.asReadonly();
  readonly confirmedRef = this._confirmedRef.asReadonly();

  constructor(private http: HttpClient) {}

  // Call at end of booking wizard before navigating to /payment
  setConfirmedBooking(id: string, ref: string): void {
    this._confirmedId.set(id);
    this._confirmedRef.set(ref);
  }

  clearConfirmedBooking(): void {
    this._confirmedId.set(null);
    this._confirmedRef.set(null);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  createBooking(payload: BookingPayload) {
    return this.http.post<BookingResponse>(this.apiUrl, payload);
  }

  // Used by BookingsComponent
  getMyBookings() {
    return this.http.get<{ success: boolean; data: Booking[] }>(this.apiUrl);
  }

  getBookings() {
    return this.http.get<{ success: boolean; data: Booking[] }>(this.apiUrl);
  }

  getBookingById(id: string) {
    return this.http.get<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`);
  }

  updateBookingStatus(id: string, status: string) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelBooking(id: string) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status: 'Cancelled' });
  }

  submitRating(bookingId: string, rating: number, comment: string) {
    return this.http.post(`${environment.apiUrl}/api/ratings`, {
      bookingId,
      rating,
      comment,
    });
  }
}