// ============================================================
// ANGULAR FRONTEND INTEGRATION
// Place this file in: src/app/core/services/api.service.ts
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // ── AUTH ──────────────────────────────────────────────────
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
  }

  updateMe(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/me`, data, { headers: this.getHeaders() });
  }

  // ── LISTINGS ──────────────────────────────────────────────
  getListings(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/listings`, { params });
  }

  getListing(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/listings/${id}`);
  }

  createListing(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/listings`, data, { headers: this.getHeaders() });
  }

  updateListing(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/listings/${id}`, data, { headers: this.getHeaders() });
  }

  deleteListing(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/listings/${id}`, { headers: this.getHeaders() });
  }

  // ── BOOKINGS ─────────────────────────────────────────────
  getBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings`, { headers: this.getHeaders() });
  }

  getBooking(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/${id}`, { headers: this.getHeaders() });
  }

  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookings`, data, { headers: this.getHeaders() });
  }

  updateBookingStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // ── RATINGS ───────────────────────────────────────────────
  getListingRatings(listingId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ratings/listing/${listingId}`);
  }

  submitRating(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ratings`, data, { headers: this.getHeaders() });
  }

  // ── PAYMENTS ──────────────────────────────────────────────
  getPayments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments`, { headers: this.getHeaders() });
  }

  createPayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments`, data, { headers: this.getHeaders() });
  }

  // ── ADMIN ────────────────────────────────────────────────
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`, { headers: this.getHeaders() });
  }

  getAdminUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/users`, { headers: this.getHeaders() });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/users/${id}`, data, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/users/${id}`, { headers: this.getHeaders() });
  }
}
