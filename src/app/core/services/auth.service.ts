import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  
  currentUser = signal<User | null>(this.getUserFromStorage());
  
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  userName = computed(() => this.currentUser()?.name || 'Guest'); // Fixes the NG9 Error

  constructor(private http: HttpClient, private router: Router) {}
  // Change this line to accept one object instead of two arguments
  login(credentials: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
    tap(res => this.setSession(res))
  );
  } 
  // ✅ ADDED THIS BACK: Register method
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData).pipe(
      tap(res => this.setSession(res))
    );
  }

  private setSession(res: any): void {
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  checkAuthStatus(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      if (!this.currentUser()) this.currentUser.set(JSON.parse(user));
      return true;
    }
    return false;
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    try { return userJson ? JSON.parse(userJson) : null; } catch { return null; }
  }
}