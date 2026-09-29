import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';
import { Category, Product, Store } from '../../models/ecommerce.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  stores: Store[] = [];
  featuredProducts: Product[] = [];
  isLoading = true;
  selectedCategorySlug = '';
  searchQuery = '';
  selectedSort = 'latest';
  minPrice?: number;
  maxPrice?: number;
  maxMoq?: number;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    public router: Router,
    public cart: CartService,
    public currencyService: CurrencyService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategorySlug = params['category'] || '';
      this.searchQuery = params['q'] || '';
      this.loadCatalog();
    });

    this.loadCategoriesAndStores();
  }

  loadCategoriesAndStores(): void {
    this.api.get<{ categories: Category[] }>('categories').subscribe({
      next: res => this.categories = res.categories || []
    });

    this.api.get<{ data: Store[] }>('stores').subscribe({
      next: res => this.stores = res.data || []
    });
  }

  loadCatalog(): void {
    this.isLoading = true;
    const params: any = {
      sort: this.selectedSort,
    };
    if (this.selectedCategorySlug) params.category = this.selectedCategorySlug;
    if (this.searchQuery) params.q = this.searchQuery;
    if (this.minPrice) params.min_price = this.minPrice;
    if (this.maxPrice) params.max_price = this.maxPrice;
    if (this.maxMoq) params.max_moq = this.maxMoq;

    this.api.get<{ data: Product[] }>('products', params).subscribe({
      next: res => {
        this.products = res.data || [];
        this.featuredProducts = this.products.filter(p => p.is_featured);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByCategory(slug: string): void {
    this.selectedCategorySlug = slug;
    this.router.navigate(['/'], { queryParams: { category: slug || null }, queryParamsHandling: 'merge' });
  }

  getLowestTierPrice(product: Product): number {
    if (!product.tiers || product.tiers.length === 0) {
      return Number(product.base_price);
    }
    const lowest = Math.min(...product.tiers.map(t => Number(t.unit_price)));
    return lowest;
  }

  addToCartQuick(product: Product, event: Event): void {
    event.stopPropagation();
    this.cart.addItem(product, product.moq);
  }
}
