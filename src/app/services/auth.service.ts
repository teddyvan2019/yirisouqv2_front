import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    const savedUser = localStorage.getItem('yiri_user');
    const token = localStorage.getItem('yiri_token');
    if (savedUser && token) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
        // Verify with server
        this.api.get<{ user: User }>('auth/me').subscribe({
          next: (res) => {
            this.setUser(res.user, token);
          },
          error: () => {
            this.logout();
          }
        });
      } catch (e) {
        this.logout();
      }
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser && !!localStorage.getItem('yiri_token');
  }

  public isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  public isVendor(): boolean {
    return this.currentUser?.role === 'VENDOR';
  }

  public isDelivery(): boolean {
    return this.currentUser?.role === 'DELIVERY_AGENT';
  }

  public isBuyer(): boolean {
    return this.currentUser?.role === 'BUYER';
  }

  public login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.post<any>('auth/login', credentials).pipe(
      tap((res) => {
        if (res.token && res.user) {
          this.setUser(res.user, res.token);
        }
      })
    );
  }

  public register(payload: any): Observable<any> {
    return this.api.post<any>('auth/register', payload).pipe(
      tap((res) => {
        if (res.token && res.user) {
          this.setUser(res.user, res.token);
        }
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('yiri_token');
    localStorage.removeItem('yiri_user');
    this.currentUserSubject.next(null);
  }

  public setUser(user: User, token: string): void {
    localStorage.setItem('yiri_token', token);
    localStorage.setItem('yiri_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * One-click demo role switcher for quick QA and review
   */
  public quickLoginAs(role: 'ADMIN' | 'VENDOR' | 'DELIVERY_AGENT' | 'BUYER'): Observable<any> {
    const roleAccounts = {
      ADMIN: { email: 'admin@yiriv2.com', password: 'password123' },
      VENDOR: { email: 'vendor1@techglobal.com', password: 'password123' },
      DELIVERY_AGENT: { email: 'livreur1@express.com', password: 'password123' },
      BUYER: { email: 'buyer1@importcorp.com', password: 'password123' },
    };

    return this.login(roleAccounts[role]);
  }
}
