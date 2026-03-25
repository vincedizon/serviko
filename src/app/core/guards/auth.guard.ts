import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects routes that require login
// src/app/core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isLoggedIn()) {
    console.log('Guard Passed: User is logged in');
    return true;
  }
  
  console.log('Guard Failed: Redirecting to login');
  return router.createUrlTree(['/login']);
};
// Protects admin-only routes
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/home']);
};

// Prevents logged-in users from accessing login/register pages
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  // Already logged in — send to home
  return router.createUrlTree(['/home']);


};

