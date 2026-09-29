import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CurrencyService } from '../../services/currency.service';
import { Delivery } from '../../models/ecommerce.models';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  trackingCode = '';
  searchCode = '';
  delivery?: Delivery;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const code = params.get('trackingCode');
      if (code) {
        this.trackingCode = code;
        this.searchCode = code;
        this.loadTracking(code);
      }
    });
  }

  loadTracking(code: string): void {
    if (!code) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<{ tracking: Delivery }>(`deliveries/track/${code}`).subscribe({
      next: res => {
        this.delivery = res.tracking;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = `Aucun colis trouvé avec le code de suivi '${code}'. Vérifiez le code fourni.`;
        this.delivery = undefined;
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchCode) {
      this.loadTracking(this.searchCode.trim());
    }
  }

  isMilestoneReached(status: string): boolean {
    if (!this.delivery) return false;
    const stages = ['UNASSIGNED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    const currentIdx = stages.indexOf(this.delivery.status);
    const targetIdx = stages.indexOf(status);
    return currentIdx >= targetIdx;
  }
}
