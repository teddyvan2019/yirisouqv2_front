import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';
import { Product, ProductTier } from '../../models/ecommerce.models';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  selectedImageIndex = 0;
  quantity = 1;
  calculatedUnitPrice = 0;
  calculatedSubtotal = 0;
  savingsPercentage = 0;
  isLoading = true;
  errorMessage = '';

  // RFQ Modal State
  showRfqModal = false;
  rfqQuantity = 100;
  rfqTargetPrice = 0;
  rfqMessage = '';
  rfqSuccessMessage = '';
  rfqErrorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public cart: CartService,
    public currencyService: CurrencyService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.isLoading = true;
    this.api.get<{ product: Product }>(`products/${slug}`).subscribe({
      next: res => {
        this.product = res.product;
        this.quantity = Math.max(1, this.product.moq || 1);
        this.calculatePrice();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Produit introuvable ou indisponible.';
        this.isLoading = false;
      }
    });
  }

  onQuantityChange(newQty: number): void {
    if (newQty < 1) newQty = 1;
    this.quantity = newQty;
    this.calculatePrice();
  }

  calculatePrice(): void {
    if (!this.product) return;

    this.calculatedUnitPrice = this.cart.calculateTierPrice(this.product, this.quantity);
    this.calculatedSubtotal = Math.round(this.calculatedUnitPrice * this.quantity * 100) / 100;

    const base = Number(this.product.base_price);
    if (base > 0) {
      this.savingsPercentage = Math.round((1 - (this.calculatedUnitPrice / base)) * 100);
    }
  }

  isTierActive(tier: ProductTier): boolean {
    if (!this.quantity) return false;
    if (this.quantity >= tier.min_quantity) {
      if (!tier.max_quantity || this.quantity <= tier.max_quantity) {
        return true;
      }
    }
    return false;
  }

  selectImage(idx: number): void {
    this.selectedImageIndex = idx;
  }

  addToCart(): void {
    if (!this.product) return;
    this.cart.addItem(this.product, this.quantity);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  openRfqModal(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.rfqQuantity = Math.max(this.quantity, (this.product?.moq || 1) * 2);
    this.rfqTargetPrice = this.calculatedUnitPrice * 0.9;
    this.rfqMessage = `Bonjour ${this.product?.store?.name}, nous souhaitons obtenir un devis proforma pour ${this.rfqQuantity} unités de ${this.product?.name}. Quel est votre meilleur délai d'expédition ?`;
    this.showRfqModal = true;
  }

  submitRfq(): void {
    if (!this.product) return;
    this.rfqErrorMessage = '';
    this.rfqSuccessMessage = '';

    this.api.post('rfqs', {
      product_id: this.product.id,
      quantity: this.rfqQuantity,
      target_price: this.rfqTargetPrice,
      message: this.rfqMessage
    }).subscribe({
      next: () => {
        this.rfqSuccessMessage = 'Votre demande de cotation (RFQ) a été envoyée directement au fabricant.';
        setTimeout(() => {
          this.showRfqModal = false;
        }, 2000);
      },
      error: (err) => {
        this.rfqErrorMessage = err.error?.message || 'Erreur lors de la transmission de la demande.';
      }
    });
  }
}
