import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/ecommerce.models';

describe('CartService - Alibaba Volume Tier Pricing & MOQ', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 1,
    store_id: 1,
    name: 'Wholesale AMOLED Ultra Smart Watch',
    slug: 'ultra-smartwatch-amoled-gps',
    description: 'Rugged smartwatch',
    base_price: 22.00,
    moq: 10,
    stock: 3000,
    unit: 'pieces',
    images: [],
    is_featured: true,
    is_trade_assurance: true,
    tiers: [
      { min_quantity: 10, max_quantity: 49, unit_price: 19.50 },
      { min_quantity: 50, max_quantity: 199, unit_price: 16.80 },
      { min_quantity: 200, max_quantity: null, unit_price: 13.90 }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    service.clearCart();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enforce Minimum Order Quantity (MOQ) upon adding item', () => {
    // Attempt adding with quantity 2 (below MOQ of 10)
    service.addItem(mockProduct, 2);

    expect(service.items.length).toBe(1);
    // Quantity should be clamped to at least MOQ (10)
    expect(service.items[0].quantity).toBe(10);
    // Unit price for 10 units matches Tier 1 (19.50)
    expect(service.items[0].unit_price).toBe(19.50);
    expect(service.items[0].subtotal).toBe(195.00);
  });

  it('should apply graduated volume discount for large orders (Tier 3: 200+ units)', () => {
    // Add 250 units
    service.addItem(mockProduct, 250);

    expect(service.items[0].quantity).toBe(250);
    // Matches tier 3 (13.90)
    expect(service.items[0].unit_price).toBe(13.90);
    expect(service.items[0].subtotal).toBe(3475.00);
    expect(service.totalAmount).toBe(3475.00);
  });

  it('should recalculate tier price dynamically when quantity updates', () => {
    service.addItem(mockProduct, 10);
    expect(service.items[0].unit_price).toBe(19.50);

    // Update quantity to 60 (Tier 2: 50-199 units -> 16.80)
    service.updateQuantity(mockProduct.id, 60);
    expect(service.items[0].quantity).toBe(60);
    expect(service.items[0].unit_price).toBe(16.80);
    expect(service.items[0].subtotal).toBe(1008.00);
  });
});
