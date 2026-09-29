import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LangCode = 'FR' | 'EN';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<LangCode>('FR');
  public currentLang$ = this.currentLangSubject.asObservable();

  private translations: Record<LangCode, Record<string, string>> = {
    FR: {
      'site_title': 'YiriV2 - Place de Marché Internationale B2B & Logistique',
      'search_placeholder': 'Rechercher des produits industriels, électroniques, matières premières...',
      'categories': 'Toutes les catégories',
      'trade_assurance': 'Trade Assurance Garantie',
      'trade_assurance_desc': 'Protection complète des commandes de la production à la livraison',
      'verified_supplier': 'Fournisseur Vérifié Gold',
      'moq': 'Quantité Min. (MOQ)',
      'tier_pricing': 'Tarifs Dégressifs par Volume',
      'cart': 'Panier',
      'checkout': 'Passer la commande',
      'request_quote': 'Demander un Devis (RFQ)',
      'contact_supplier': 'Contacter le Fournisseur',
      'track_order': 'Suivi de Livraison en Direct',
      'admin_portal': 'Administration Globale',
      'vendor_portal': 'Espace Vendeur Boutique',
      'courier_portal': 'Espace Livreur',
      'payment_gateways': 'Configuration des Passerelles de Paiement',
      'test_connection': 'Tester la Connexion API',
      'simulate_payment': 'Simuler un Paiement Test',
      'orange_money': 'Orange Money',
      'moov_money': 'Moov Money / Flooz',
      'paypal': 'PayPal',
      'credit_card': 'Carte Bancaire / Stripe',
      'delivery_status': 'Statut de Livraison',
      'picked_up': 'Colis Récupéré chez le Vendeur',
      'in_transit': 'En Cours d\'Acheminement',
      'delivered': 'Livré au Destinataire',
    },
    EN: {
      'site_title': 'YiriV2 - International B2B Marketplace & Logistics',
      'search_placeholder': 'Search industrial products, electronics, raw commodities...',
      'categories': 'All Categories',
      'trade_assurance': 'Trade Assurance Guarantee',
      'trade_assurance_desc': 'End-to-end order protection from manufacture to delivery',
      'verified_supplier': 'Verified Gold Supplier',
      'moq': 'Min. Order Qty (MOQ)',
      'tier_pricing': 'Tiered Volume Wholesale Pricing',
      'cart': 'Cart',
      'checkout': 'Checkout Order',
      'request_quote': 'Request For Quote (RFQ)',
      'contact_supplier': 'Contact Supplier',
      'track_order': 'Live Shipment Tracking',
      'admin_portal': 'Global Administration',
      'vendor_portal': 'Vendor Boutique Hub',
      'courier_portal': 'Courier Delivery Hub',
      'payment_gateways': 'Payment Gateway Configuration',
      'test_connection': 'Test API Connection',
      'simulate_payment': 'Simulate Test Payment',
      'orange_money': 'Orange Money',
      'moov_money': 'Moov Money / Flooz',
      'paypal': 'PayPal',
      'credit_card': 'Credit Card / Stripe',
      'delivery_status': 'Delivery Status',
      'picked_up': 'Picked Up from Merchant Depot',
      'in_transit': 'In Transit to Destination',
      'delivered': 'Delivered to Customer',
    }
  };

  constructor() {
    const saved = localStorage.getItem('yiri_lang') as LangCode;
    if (saved && (saved === 'FR' || saved === 'EN')) {
      this.currentLangSubject.next(saved);
    }
  }

  public get currentLang(): LangCode {
    return this.currentLangSubject.value;
  }

  public setLanguage(lang: LangCode): void {
    this.currentLangSubject.next(lang);
    localStorage.setItem('yiri_lang', lang);
  }

  public t(key: string): string {
    return this.translations[this.currentLang][key] || key;
  }
}
