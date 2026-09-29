import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  
  // Login fields
  loginEmail = '';
  loginPassword = '';
  
  // Register fields
  regName = '';
  regEmail = '';
  regPassword = '';
  regPhone = '';
  regRole: 'BUYER' | 'VENDOR' | 'DELIVERY_AGENT' = 'BUYER';
  regStoreName = '';
  regStoreCountry = 'Ivory Coast';

  errorMessage = '';
  isLoading = false;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.auth.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectAfterAuth();
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Identifiants incorrects.';
      }
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    this.isLoading = true;

    const payload: any = {
      name: this.regName,
      email: this.regEmail,
      password: this.regPassword,
      phone: this.regPhone,
      role: this.regRole
    };

    if (this.regRole === 'VENDOR') {
      payload.store_name = this.regStoreName;
      payload.store_country = this.regStoreCountry;
    }

    this.auth.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectAfterAuth();
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
      }
    });
  }

  fillCredentials(role: 'ADMIN' | 'VENDOR' | 'DELIVERY_AGENT' | 'BUYER'): void {
    if (role === 'ADMIN') {
      this.loginEmail = 'admin@yiriv2.com';
      this.loginPassword = 'password123';
    } else if (role === 'VENDOR') {
      this.loginEmail = 'vendor1@shenzhentech.cn';
      this.loginPassword = 'password123';
    } else if (role === 'DELIVERY_AGENT') {
      this.loginEmail = 'livreur1@express.com';
      this.loginPassword = 'password123';
    } else if (role === 'BUYER') {
      this.loginEmail = 'buyer@yiriv2.com';
      this.loginPassword = 'password123';
    }
  }

  private redirectAfterAuth(): void {
    if (this.auth.isAdmin()) this.router.navigate(['/admin']);
    else if (this.auth.isVendor()) this.router.navigate(['/vendor']);
    else if (this.auth.isDelivery()) this.router.navigate(['/courier']);
    else this.router.navigate(['/']);
  }
}
