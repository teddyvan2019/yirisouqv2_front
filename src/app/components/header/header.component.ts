import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyCode, CurrencyService } from '../../services/currency.service';
import { LangCode, LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/ecommerce.models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  categories: Category[] = [];
  showUserDropdown = false;
  showCategoriesMenu = false;

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public currencyService: CurrencyService,
    public langService: LanguageService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.get<{ categories: Category[] }>('categories').subscribe({
      next: (res) => {
        this.categories = res.categories || [];
      },
      error: () => {}
    });
  }

  onSearch(): void {
    const queryParams: any = {};
    if (this.searchQuery) queryParams.q = this.searchQuery;
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    this.router.navigate(['/'], { queryParams });
  }

  setCurrency(curr: CurrencyCode): void {
    this.currencyService.setCurrency(curr);
  }

  setLanguage(lang: LangCode): void {
    this.langService.setLanguage(lang);
  }

  logout(): void {
    this.auth.logout();
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }
}
