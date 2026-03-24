import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect root to login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Public routes (no auth needed)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  // Protected routes (must be logged in)
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'listings',
    loadComponent: () => import('./pages/listings/listings.component').then(m => m.ListingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'provider-profile',
    loadComponent: () => import('./pages/provider-profile/provider-profile.component').then(m => m.ProviderProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ratings',
    loadComponent: () => import('./pages/ratings/ratings.component').then(m => m.RatingsComponent),
    canActivate: [authGuard]
  },
  // Admin only
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  // Fallback - redirect unknown routes to login
  { path: '**', redirectTo: 'login' }
];