import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Changed root redirect: If logged in, authGuard handles the rest
  {
    path: '',
    redirectTo: 'home', 
    pathMatch: 'full'
  },
  
  // Public routes
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

  // Protected routes
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
    path: 'payment', // <--- Ensure your book() function uses this EXACT string
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/bookings/booking.component').then(m => m.BookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ratings',
    loadComponent: () => import('./pages/ratings/ratings.component').then(m => m.RatingsComponent),
    canActivate: [authGuard]
  },

  // Admin
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },

  // 2. Changed Fallback: Don't send logged-in users back to login
  { path: '**', redirectTo: 'home' }
];