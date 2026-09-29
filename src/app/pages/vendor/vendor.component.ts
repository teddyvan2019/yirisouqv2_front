import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';
import { Order, Product, Rfq, Store } from '../../models/ecommerce.models';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent implements OnInit {
  activeTab: 'products' | 'orders' | 'rfqs' | 'settings' = 'products';
  store?: Store;
  products: Product[] = [];
  orders: Order[] = [];
  rfqs: Rfq[] = [];
  totalRevenue = 0;
  isLoading = true;

  // Add Product Form Modal
  showAddProductModal = false;
  newProductName = '';
  newProductDescription = '';
  newProductBasePrice = 50.00;
  newProductMoq = 5;
  newProductStock = 1000;
  newProductUnit = 'pieces';
  newProductImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
  newProductTiers: { min_quantity: number; max_quantity?: number | null; unit_price: number }[] = [
    { min_quantity: 5, max_quantity: 49, unit_price: 45.00 },
    { min_quantity: 50, max_quantity: null, unit_price: 38.00 },
  ];
  productFormError = '';

  // Reply RFQ Modal
  showReplyRfqModal = false;
  selectedRfq?: Rfq;
  rfqReplyStatus: 'ACCEPTED' | 'REJECTED' | 'NEGOTIATING' = 'ACCEPTED';
  rfqReplyText = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isVendor()) {
      this.auth.quickLoginAs('VENDOR').subscribe({
        next: () => this.loadVendorData()
      });
    } else {
      this.loadVendorData();
    }
  }

  loadVendorData(): void {
    this.isLoading = true;

    // Load store & stats
    this.api.get<{ store: Store; total_revenue: number }>('vendor/store').subscribe({
      next: res => {
        this.store = res.store;
        this.totalRevenue = res.total_revenue || 0;
        this.loadProducts();
        this.loadOrders();
        this.loadRfqs();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadProducts(): void {
    if (!this.store) return;
    this.api.get<{ data: Product[] }>('products', { store_id: this.store.id }).subscribe({
      next: res => this.products = res.data || []
    });
  }

  loadOrders(): void {
    this.api.get<{ data: Order[] }>('vendor/orders').subscribe({
      next: res => this.orders = res.data || []
    });
  }

  loadRfqs(): void {
    this.api.get<{ data: Rfq[] }>('vendor/rfqs').subscribe({
      next: res => this.rfqs = res.data || []
    });
  }

  markReadyForPickup(order: Order): void {
    this.api.patch<{ message: string; order: Order }>(`vendor/orders/${order.id}/status`, {
      status: 'READY_FOR_PICKUP'
    }).subscribe({
      next: res => {
        order.status = res.order.status;
      }
    });
  }

  addTierRow(): void {
    const lastMin = this.newProductTiers.length > 0 
      ? (this.newProductTiers[this.newProductTiers.length - 1].min_quantity || 1) * 2 
      : 10;
    this.newProductTiers.push({
      min_quantity: lastMin,
      max_quantity: null,
      unit_price: Math.max(1, this.newProductBasePrice * 0.8)
    });
  }

  removeTierRow(idx: number): void {
    this.newProductTiers.splice(idx, 1);
  }

  createProduct(): void {
    this.productFormError = '';
    if (!this.newProductName || !this.newProductDescription) {
      this.productFormError = 'Veuillez saisir le nom et la description du produit.';
      return;
    }

    const payload = {
      name: this.newProductName,
      description: this.newProductDescription,
      base_price: this.newProductBasePrice,
      moq: this.newProductMoq,
      stock: this.newProductStock,
      unit: this.newProductUnit,
      images: [this.newProductImage],
      tiers: this.newProductTiers
    };

    this.api.post<{ message: string; product: Product }>('vendor/products', payload).subscribe({
      next: () => {
        this.showAddProductModal = false;
        this.loadProducts();
      },
      error: err => {
        this.productFormError = err.error?.message || 'Erreur lors de la création du produit.';
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Confirmez-vous la suppression de ce produit ?')) {
      this.api.delete(`vendor/products/${id}`).subscribe({
        next: () => this.loadProducts()
      });
    }
  }

  openReplyRfq(rfq: Rfq): void {
    this.selectedRfq = rfq;
    this.rfqReplyStatus = 'ACCEPTED';
    this.rfqReplyText = `Nous validons votre commande de ${rfq.quantity} unités. Expédition garantie sous 48h.`;
    this.showReplyRfqModal = true;
  }

  submitRfqReply(): void {
    if (!this.selectedRfq) return;

    this.api.patch(`vendor/rfqs/${this.selectedRfq.id}/reply`, {
      status: this.rfqReplyStatus,
      vendor_reply: this.rfqReplyText
    }).subscribe({
      next: () => {
        this.showReplyRfqModal = false;
        this.loadRfqs();
      }
    });
  }
}
