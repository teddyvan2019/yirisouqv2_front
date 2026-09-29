import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';
import { Delivery } from '../../models/ecommerce.models';

@Component({
  selector: 'app-courier',
  templateUrl: './courier.component.html',
  styleUrls: ['./courier.component.css']
})
export class CourierComponent implements OnInit {
  activeTab: 'available' | 'my_missions' = 'available';
  availableDeliveries: Delivery[] = [];
  myDeliveries: Delivery[] = [];
  isLoading = true;
  actionMessage = '';

  // Delivery Completion Modal State
  selectedDeliveryForComplete?: Delivery;
  proofNote = 'Colis remis en main propre au destinataire. Signature client obtenue.';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isDelivery()) {
      this.auth.quickLoginAs('DELIVERY_AGENT').subscribe({
        next: () => this.loadDeliveries()
      });
    } else {
      this.loadDeliveries();
    }
  }

  loadDeliveries(): void {
    this.isLoading = true;
    this.actionMessage = '';

    // Load available unassigned missions
    this.api.get<{ data: Delivery[] }>('courier/deliveries/available').subscribe({
      next: res => {
        this.availableDeliveries = res.data || [];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    // Load my claimed missions
    this.api.get<{ data: Delivery[] }>('courier/deliveries/my-missions').subscribe({
      next: res => {
        this.myDeliveries = res.data || [];
      }
    });
  }

  acceptMission(delivery: Delivery): void {
    this.api.post<{ message: string; delivery: Delivery }>(`courier/deliveries/${delivery.id}/accept`, {}).subscribe({
      next: () => {
        this.actionMessage = `Mission ${delivery.tracking_code} acceptée avec succès !`;
        this.activeTab = 'my_missions';
        this.loadDeliveries();
      }
    });
  }

  startTransit(delivery: Delivery): void {
    this.api.patch<{ message: string; delivery: Delivery }>(`courier/deliveries/${delivery.id}/status`, {
      status: 'IN_TRANSIT',
      location_note: 'Colis ramassé chez le fournisseur. En cours de livraison vers le client.'
    }).subscribe({
      next: () => {
        this.actionMessage = `Statut mis à jour : Colis en transit.`;
        this.loadDeliveries();
      }
    });
  }

  openCompleteModal(delivery: Delivery): void {
    this.selectedDeliveryForComplete = delivery;
  }

  confirmDelivered(): void {
    if (!this.selectedDeliveryForComplete) return;

    this.api.patch<{ message: string; delivery: Delivery }>(`courier/deliveries/${this.selectedDeliveryForComplete.id}/status`, {
      status: 'DELIVERED',
      proof_of_delivery_note: this.proofNote,
      location_note: 'Colis remis avec succès au destinataire.'
    }).subscribe({
      next: () => {
        this.actionMessage = `Félicitations ! Livraison clôturée avec succès.`;
        this.selectedDeliveryForComplete = undefined;
        this.loadDeliveries();
      }
    });
  }
}
