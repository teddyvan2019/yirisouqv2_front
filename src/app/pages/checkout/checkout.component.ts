import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';
import { PaymentGateway } from '../../models/ecommerce.models';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  gateways: PaymentGateway[] = [];
  selectedGatewayCode = 'orange_money';

  // Shipping Form
  shippingName = '';
  shippingPhone = '';
  shippingAddress = '';
  shippingCity = 'Abidjan';
  shippingCountry = 'Ivory Coast';
  notes = '';

  // Payment inputs
  customerPhone = '';
  otpCode = '1234';
  cardNumber = '4242 4242 4242 4242';
  cardExpiry = '12/28';
  cardCvc = '123';
  cardBrand = 'Visa';

  isSubmitting = false;
  errorMessage = '';
  confirmedOrders: any[] = [];
  isSuccess = false;

  constructor(
    public cart: CartService,
    public currencyService: CurrencyService,
    public auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.cart.items.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    // Prepopulate user shipping info
    const user = this.auth.currentUser;
    if (user) {
      this.shippingName = user.name;
      this.shippingPhone = user.phone || '+225 0744556677';
      this.customerPhone = user.phone || '+225 0744556677';
      this.shippingAddress = 'Rue du Commerce, Immeuble Horizon';
    }

    this.loadPaymentGateways();
  }

  loadPaymentGateways(): void {
    this.api.get<{ gateways: PaymentGateway[] }>('payment-gateways').subscribe({
      next: res => {
        this.gateways = res.gateways || [];
        if (this.gateways.length > 0 && !this.selectedGatewayCode) {
          this.selectedGatewayCode = this.gateways[0].code;
        }
      },
      error: () => {
        // Fallback default gateways if offline
        this.gateways = [
          { id: 1, code: 'orange_money', name: 'Orange Money', is_active: true, is_sandbox: true, test_status: 'SUCCESS' },
          { id: 2, code: 'moov_money', name: 'Moov Money / Flooz', is_active: true, is_sandbox: true, test_status: 'SUCCESS' },
          { id: 3, code: 'paypal', name: 'PayPal', is_active: true, is_sandbox: true, test_status: 'SUCCESS' },
          { id: 4, code: 'credit_card', name: 'Carte Bancaire / Stripe', is_active: true, is_sandbox: true, test_status: 'SUCCESS' },
        ];
      }
    });
  }

  submitOrder(): void {
    if (!this.shippingName || !this.shippingPhone || !this.shippingAddress) {
      this.errorMessage = 'Veuillez renseigner le nom, téléphone et adresse de livraison.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: any = {
      items: this.cart.items.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
      shipping_name: this.shippingName,
      shipping_phone: this.shippingPhone,
      shipping_address: this.shippingAddress,
      shipping_city: this.shippingCity,
      shipping_country: this.shippingCountry,
      currency: this.currencyService.currentCurrency,
      payment_gateway: this.selectedGatewayCode,
      payment_payload: {
        customer_phone: this.customerPhone || this.shippingPhone,
        otp: this.otpCode,
        card_last4: this.cardNumber.slice(-4),
        brand: this.cardBrand,
      },
      notes: this.notes
    };

    this.api.post<{ message: string; orders: any[] }>('orders', payload).subscribe({
      next: res => {
        this.confirmedOrders = res.orders;
        this.cart.clearCart();
        this.isSuccess = true;
        this.isSubmitting = false;
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Erreur lors du traitement de la commande.';
        this.isSubmitting = false;
      }
    });
  }
}
