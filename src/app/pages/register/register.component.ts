import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // Role
  role = signal<'client' | 'provider'>('client');

  // Shared fields
  firstName       = '';
  lastName        = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  agree           = false;

  // Provider-only fields
  serviceType   = '';
  city          = '';
  rate: number | null = null;       // ← NEW: hourly rate
  idFile: File | null = null;
  idDisplayName = '';

  // UI state
  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  // Must match Listing.js enum exactly
  serviceTypes = [
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'Aircon Technician',
    'House Cleaner',
    'Welder',
    'Pest Control',
    'Landscaping',
    'Tiling',
    'Masonry',
    'Appliance Repair'
  ];

  cities = [
    'Angeles City',
    'Mabalacat',
    'San Fernando',
    'Clark',
    'Porac',
    'Magalang',
    'Floridablanca',
    'Guagua',
    'Lubao',
    'Sasmuan'
  ];

  constructor(private http: HttpClient, private router: Router) {}

  setRole(r: 'client' | 'provider'): void {
    this.role.set(r);
    this.errorMsg.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.idFile = input.files[0];
      this.idDisplayName = this.idFile.name;
    }
  }

  register(): void {
    this.errorMsg.set(null);

    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMsg.set('Please fill in all required fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Passwords do not match.');
      return;
    }

    if (!this.agree) {
      this.errorMsg.set('Please agree to the Terms of Service.');
      return;
    }

    if (this.role() === 'provider' && !this.serviceType) {
      this.errorMsg.set('Please select a service type.');
      return;
    }

    if (this.role() === 'provider' && !this.city) {
      this.errorMsg.set('Please select your city.');
      return;
    }

    // ← NEW: validate rate for providers
    if (this.role() === 'provider') {
      if (!this.rate || this.rate < 100) {
        this.errorMsg.set('Please enter a valid hourly rate (minimum ₱100).');
        return;
      }
      if (this.rate > 10000) {
        this.errorMsg.set('Hourly rate cannot exceed ₱10,000.');
        return;
      }
    }

    this.loading.set(true);

    const payload: any = {
      name:     `${this.firstName} ${this.lastName}`.trim(),
      email:    this.email,
      password: this.password,
      role:     this.role() === 'client' ? 'customer' : 'provider',
    };

    if (this.role() === 'provider') {
      payload.serviceType = this.serviceType;
      payload.city        = this.city;
      payload.rate        = this.rate;   // ← NEW: send rate to backend
    }

    this.http.post(`${environment.apiUrl}/auth/register`, payload).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          // Redirect providers to dashboard, customers to listings
          this.router.navigate([res.user.role === 'provider' ? '/dashboard' : '/listings']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Registration failed. Please try again.');
      }
    });
  }
}