import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { AdminComponent } from './pages/admin/admin.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { CourierComponent } from './pages/courier/courier.component';
import { AuthComponent } from './pages/auth/auth.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'track', component: TrackingComponent },
  { path: 'track/:trackingCode', component: TrackingComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'vendor', component: VendorComponent },
  { path: 'courier', component: CourierComponent },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
