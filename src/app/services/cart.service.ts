import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const saved = localStorage.getItem('yiri_cart');
    if (saved) {
      try {
        this.itemsSubject.next(JSON.parse(saved));
      } catch (e) {
        this.itemsSubject.next([]);
      }
    }
  }

  private saveCart(items: CartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem('yiri_cart', JSON.stringify(items));
  }

  public get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  public get itemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  public get totalAmount(): number {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Resolves the tiered unit price for a given product and volume quantity.
   */
  public calculateTierPrice(product: Product, quantity: number): number {
    if (!product.tiers || product.tiers.length === 0) {
      return Number(product.base_price);
    }

    const sortedTiers = [...product.tiers].sort((a, b) => a.min_quantity - b.min_quantity);
    let matchedPrice = Number(product.base_price);

    for (const tier of sortedTiers) {
      if (quantity >= tier.min_quantity) {
        if (!tier.max_quantity || quantity <= tier.max_quantity) {
          matchedPrice = Number(tier.unit_price);
          break;
        }
        matchedPrice = Number(tier.unit_price);
      }
    }

    return matchedPrice;
  }

  public addItem(product: Product, quantity: number): boolean {
    const minQty = Math.max(quantity, product.moq || 1);
    const current = [...this.items];
    const existingIndex = current.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const newQty = current[existingIndex].quantity + minQty;
      const unitPrice = this.calculateTierPrice(product, newQty);
      current[existingIndex] = {
        product,
        quantity: newQty,
        unit_price: unitPrice,
        subtotal: Math.round(unitPrice * newQty * 100) / 100
      };
    } else {
      const unitPrice = this.calculateTierPrice(product, minQty);
      current.push({
        product,
        quantity: minQty,
        unit_price: unitPrice,
        subtotal: Math.round(unitPrice * minQty * 100) / 100
      });
    }

    this.saveCart(current);
    return true;
  }

  public updateQuantity(productId: number, quantity: number): void {
    const current = [...this.items];
    const index = current.findIndex(i => i.product.id === productId);

    if (index > -1) {
      const item = current[index];
      const validQty = Math.max(quantity, item.product.moq || 1);
      const unitPrice = this.calculateTierPrice(item.product, validQty);
      current[index] = {
        ...item,
        quantity: validQty,
        unit_price: unitPrice,
        subtotal: Math.round(unitPrice * validQty * 100) / 100
      };
      this.saveCart(current);
    }
  }

  public removeItem(productId: number): void {
    const filtered = this.items.filter(i => i.product.id !== productId);
    this.saveCart(filtered);
  }

  public clearCart(): void {
    this.saveCart([]);
  }
}
