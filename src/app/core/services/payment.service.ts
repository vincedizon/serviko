import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';

export interface PaymentPayload {
  bookingId?:    string;
  method:        'gcash' | 'maya' | 'bank';
  mobileNumber?: string;
  bank?:         string;
  amount:        number;
}

export interface Payment {
  _id:      string;
  ref:      string;
  method:   string;
  amount:   number;
  status:   string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  createPayment(payload: PaymentPayload): Observable<{ success: boolean; payment: Payment }> {
    return this.http.post<{ success: boolean; payment: Payment }>(this.api, payload);
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/my`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.api);
  }

  releasePayment(id: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.api}/${id}/release`, {});
  }
}