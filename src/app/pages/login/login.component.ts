import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))])
    ])
  ]
})
export class LoginComponent {
  email    = '';
  password = '';
  remember = false;
  loading  = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false); // Set loading to false on success
        console.log('Login successful');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false); // Set loading to false on error
        // FIX: Use the correct variable name and the .set() method for signals
        this.errorMsg.set('Invalid email or password');
      }
    });
  }
}