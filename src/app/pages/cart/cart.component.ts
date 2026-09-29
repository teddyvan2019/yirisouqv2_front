import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  constructor(
    public cart: CartService,
    public currencyService: CurrencyService,
    public auth: AuthService,
    private router: Router
  ) {}

  updateQty(productId: number, newQty: number): void {
    if (newQty < 1) return;
    this.cart.updateQuantity(productId, newQty);
  }

  removeItem(productId: number): void {
    this.cart.removeItem(productId);
  }

  clear(): void {
    this.cart.clearCart();
  }

  proceedToCheckout(): void {
    if (!this.auth.isAuthenticated()) {
      // Auto login as buyer or redirect to auth
      this.auth.quickLoginAs('BUYER').subscribe({
        next: () => this.router.navigate(['/checkout'])
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }
}
