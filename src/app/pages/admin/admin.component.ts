import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';
import { DashboardStats, Delivery, Dispute, Order, PaymentGateway, PlatformSettings, Product, Store, User } from '../../models/ecommerce.models';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'overview' | 'gateways' | 'stores' | 'escrow' | 'logistics' | 'catalog' | 'disputes' | 'settings' = 'overview';
  isLoading = true;

  // 1. Overview & Financial KPIs
  stats?: DashboardStats;

  // 2. Payment Gateway Vault
  gateways: PaymentGateway[] = [];
  selectedGateway?: PaymentGateway;
  editCredentials: Record<string, any> = {};
  editIsActive = true;
  editIsSandbox = true;
  saveMessage = '';
  saveErrorMessage = '';
  isSaving = false;
  isTesting = false;
  testResult?: { success: boolean; message: string; details?: any };

  // Simulation Modal
  showSimulateModal = false;
  simulateGatewayCode = '';
  simulateAmount = 250.00;
  simulateCurrency = 'USD';
  simulatePhone = '+225 0707070707';
  simulateResult?: any;
  isSimulating = false;

  // 3. Multi-Vendor Governance
  stores: Store[] = [];
  storeSearch = '';
  selectedStore?: Store;

  // 4. Financial Escrow & Orders
  orders: Order[] = [];
  escrowFilter = '';
  isReleasingEscrow = false;
  escrowFeedback = '';

  // 5. Logistics Fleet Oversight
  deliveries: Delivery[] = [];
  availableCouriers: User[] = [];
  selectedDelivery?: Delivery;
  showReassignModal = false;
  reassignCourierId?: number;
  reassignReason = '';
  isReassigning = false;
  reassignMessage = '';

  // 6. Catalog Moderation
  products: Product[] = [];
  productFilter = '';
  productSearch = '';

  // 7. Disputes & B2B Arbitration
  disputes: Dispute[] = [];
  selectedDispute?: Dispute;
  showArbitrateModal = false;
  arbitrationDecision: 'RESOLVED_REFUNDED' | 'RESOLVED_RELEASED' | 'REJECTED' = 'RESOLVED_RELEASED';
  arbitrationNotes = '';
  isArbitrating = false;
  arbitrationMessage = '';

  // 8. Platform Global Settings
  settings?: PlatformSettings;
  isSavingSettings = false;
  settingsMessage = '';

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.auth.quickLoginAs('ADMIN').subscribe({
        next: () => this.loadAllAdminData()
      });
    } else {
      this.loadAllAdminData();
    }
  }

  loadAllAdminData(): void {
    this.isLoading = true;
    this.loadOverview();
    this.loadGateways();
    this.loadStores();
    this.loadOrders();
    this.loadDeliveries();
    this.loadProducts();
    this.loadDisputes();
    this.loadSettings();
  }

  // 1. Overview
  loadOverview(): void {
    this.api.get<DashboardStats>('admin/dashboard-stats').subscribe({
      next: res => {
        this.stats = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // 2. Gateways
  loadGateways(): void {
    this.api.get<{ gateways: PaymentGateway[] }>('admin/payment-gateways').subscribe({
      next: res => {
        this.gateways = res.gateways || [];
        if (this.gateways.length > 0 && !this.selectedGateway) {
          this.selectGateway(this.gateways[0]);
        }
      }
    });
  }

  selectGateway(gw: PaymentGateway): void {
    this.selectedGateway = gw;
    this.editIsActive = gw.is_active;
    this.editIsSandbox = gw.is_sandbox;
    this.editCredentials = { ...(gw.credentials || {}) };
    this.testResult = undefined;
    this.saveMessage = '';
    this.saveErrorMessage = '';
  }

  saveGateway(): void {
    if (!this.selectedGateway) return;
    this.isSaving = true;
    this.saveMessage = '';
    this.saveErrorMessage = '';

    const payload = {
      is_active: this.editIsActive,
      is_sandbox: this.editIsSandbox,
      credentials: this.editCredentials
    };

    this.api.put<{ message: string; gateway: PaymentGateway }>(`admin/payment-gateways/${this.selectedGateway.code}`, payload).subscribe({
      next: res => {
        this.selectedGateway = res.gateway;
        const idx = this.gateways.findIndex(g => g.code === res.gateway.code);
        if (idx > -1) this.gateways[idx] = res.gateway;
        this.saveMessage = 'Clés API enregistrées dans le coffre-fort sécurisé.';
        this.isSaving = false;
      },
      error: err => {
        this.saveErrorMessage = err.error?.message || 'Erreur lors de la sauvegarde.';
        this.isSaving = false;
      }
    });
  }

  runDiagnosticTest(code: string): void {
    this.isTesting = true;
    this.testResult = undefined;

    this.api.post<{ gateway: PaymentGateway; result: { success: boolean; message: string; details?: any } }>(
      `admin/payment-gateways/${code}/test`, 
      {}
    ).subscribe({
      next: res => {
        this.testResult = res.result;
        const idx = this.gateways.findIndex(g => g.code === code);
        if (idx > -1) {
          this.gateways[idx].last_tested_at = res.gateway.last_tested_at;
          this.gateways[idx].test_status = res.gateway.test_status;
          this.gateways[idx].test_message = res.gateway.test_message;
        }
        this.isTesting = false;
      },
      error: err => {
        this.testResult = {
          success: false,
          message: err.error?.message || 'Échec du test de connexion à la passerelle.',
        };
        this.isTesting = false;
      }
    });
  }

  openSimulateModal(code: string): void {
    this.simulateGatewayCode = code;
    this.simulateResult = undefined;
    this.showSimulateModal = true;
  }

  executeSimulatedTransaction(): void {
    this.isSimulating = true;
    this.simulateResult = undefined;

    this.api.post<{ message: string; gateway: string; result: any }>(
      `admin/payment-gateways/${this.simulateGatewayCode}/simulate`,
      {
        amount: this.simulateAmount,
        currency: this.simulateCurrency,
        phone: this.simulatePhone
      }
    ).subscribe({
      next: res => {
        this.simulateResult = res;
        this.isSimulating = false;
        this.loadOverview(); // update stats
      },
      error: err => {
        this.simulateResult = { error: err.error?.message || 'Erreur lors de la simulation' };
        this.isSimulating = false;
      }
    });
  }

  // 3. Multi-Vendor Governance
  loadStores(): void {
    this.api.get<{ stores: Store[] }>('admin/stores', { q: this.storeSearch }).subscribe({
      next: res => {
        this.stores = res.stores || [];
      }
    });
  }

  toggleStoreVerification(store: Store): void {
    this.api.patch<{ message: string; store: Store }>(`admin/stores/${store.id}/verify`, {}).subscribe({
      next: res => {
        store.is_verified = res.store.is_verified;
      }
    });
  }

  toggleStoreActive(store: Store): void {
    this.api.patch<{ message: string; store: Store }>(`admin/stores/${store.id}/status`, {}).subscribe({
      next: res => {
        store.is_active = res.store.is_active;
        this.loadOverview();
      }
    });
  }

  // 4. Financial Escrow & Orders
  loadOrders(): void {
    const params: any = {};
    if (this.escrowFilter) params.escrow_status = this.escrowFilter;

    this.api.get<{ data: Order[] }>('admin/orders', params).subscribe({
      next: res => {
        this.orders = res.data || [];
      }
    });
  }

  releaseEscrowPayout(order: Order): void {
    if (!confirm(`Confirmer le déblocage des fonds séquestrés (${order.currency} ${order.total_amount}) pour le vendeur ${order.store?.name} ?`)) {
      return;
    }

    this.isReleasingEscrow = true;
    this.escrowFeedback = '';

    this.api.patch<{ message: string; order: Order }>(`admin/orders/${order.id}/escrow-release`, {}).subscribe({
      next: res => {
        order.escrow_status = res.order.escrow_status;
        this.escrowFeedback = res.message;
        this.isReleasingEscrow = false;
        this.loadOverview();
      },
      error: err => {
        this.escrowFeedback = err.error?.message || 'Erreur lors du déblocage.';
        this.isReleasingEscrow = false;
      }
    });
  }

  // 5. Logistics Fleet Oversight
  loadDeliveries(): void {
    this.api.get<{ deliveries: { data: Delivery[] }; available_couriers: User[] }>('admin/deliveries').subscribe({
      next: res => {
        this.deliveries = res.deliveries?.data || [];
        this.availableCouriers = res.available_couriers || [];
      }
    });
  }

  openReassignModal(d: Delivery): void {
    this.selectedDelivery = d;
    this.reassignCourierId = d.delivery_agent_id;
    this.reassignReason = '';
    this.reassignMessage = '';
    this.showReassignModal = true;
  }

  executeReassignment(): void {
    if (!this.selectedDelivery || !this.reassignCourierId) return;

    this.isReassigning = true;
    this.reassignMessage = '';

    this.api.patch<{ message: string; delivery: Delivery }>(`admin/deliveries/${this.selectedDelivery.id}/reassign`, {
      courier_id: this.reassignCourierId,
      reason: this.reassignReason
    }).subscribe({
      next: res => {
        const idx = this.deliveries.findIndex(d => d.id === this.selectedDelivery?.id);
        if (idx > -1) this.deliveries[idx] = res.delivery;
        this.reassignMessage = res.message;
        this.isReassigning = false;
        setTimeout(() => {
          this.showReassignModal = false;
          this.loadDeliveries();
        }, 1200);
      },
      error: err => {
        this.reassignMessage = err.error?.message || 'Erreur lors de la réassignation.';
        this.isReassigning = false;
      }
    });
  }

  // 6. Catalog Moderation
  loadProducts(): void {
    const params: any = {};
    if (this.productFilter) params.moderation_status = this.productFilter;
    if (this.productSearch) params.q = this.productSearch;

    this.api.get<{ data: Product[] }>('admin/products', params).subscribe({
      next: res => {
        this.products = res.data || [];
      }
    });
  }

  setProductModeration(product: Product, status: 'APPROVED' | 'FLAGGED'): void {
    this.api.patch<{ message: string; product: Product }>(`admin/products/${product.id}/status`, {
      moderation_status: status
    }).subscribe({
      next: res => {
        product.moderation_status = res.product.moderation_status;
        this.loadOverview();
      }
    });
  }

  toggleProductFeatured(product: Product): void {
    this.api.patch<{ message: string; product: Product }>(`admin/products/${product.id}/status`, {
      is_featured: !product.is_featured
    }).subscribe({
      next: res => {
        product.is_featured = res.product.is_featured;
      }
    });
  }

  // 7. Disputes & Arbitration
  loadDisputes(): void {
    this.api.get<{ disputes: Dispute[] }>('admin/disputes').subscribe({
      next: res => {
        this.disputes = res.disputes || [];
      }
    });
  }

  openArbitrateModal(dispute: Dispute): void {
    this.selectedDispute = dispute;
    this.arbitrationDecision = 'RESOLVED_RELEASED';
    this.arbitrationNotes = '';
    this.arbitrationMessage = '';
    this.showArbitrateModal = true;
  }

  executeArbitrationRuling(): void {
    if (!this.selectedDispute || !this.arbitrationNotes) return;

    this.isArbitrating = true;
    this.arbitrationMessage = '';

    this.api.patch<{ message: string; dispute: Dispute }>(`admin/disputes/${this.selectedDispute.id}/resolve`, {
      decision: this.arbitrationDecision,
      admin_notes: this.arbitrationNotes
    }).subscribe({
      next: res => {
        const idx = this.disputes.findIndex(d => d.id === this.selectedDispute?.id);
        if (idx > -1) this.disputes[idx] = res.dispute;
        this.arbitrationMessage = res.message;
        this.isArbitrating = false;
        setTimeout(() => {
          this.showArbitrateModal = false;
          this.loadDisputes();
          this.loadOverview();
        }, 1200);
      },
      error: err => {
        this.arbitrationMessage = err.error?.message || 'Erreur lors du rendu du jugement d\'arbitrage.';
        this.isArbitrating = false;
      }
    });
  }

  // 8. Platform Global Settings
  loadSettings(): void {
    this.api.get<{ settings: PlatformSettings }>('admin/settings').subscribe({
      next: res => {
        this.settings = res.settings;
      }
    });
  }

  saveSettings(): void {
    if (!this.settings) return;
    this.isSavingSettings = true;
    this.settingsMessage = '';

    this.api.put<{ settings: PlatformSettings }>('admin/settings', this.settings).subscribe({
      next: res => {
        this.settings = res.settings;
        this.settingsMessage = 'Paramètres globaux de la plateforme mis à jour avec succès.';
        this.isSavingSettings = false;
        this.loadOverview();
      },
      error: err => {
        this.settingsMessage = err.error?.message || 'Erreur lors de la mise à jour des paramètres.';
        this.isSavingSettings = false;
      }
    });
  }
}
