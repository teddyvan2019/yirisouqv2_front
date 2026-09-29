export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'VENDOR' | 'DELIVERY_AGENT' | 'BUYER';
  phone?: string;
  avatar?: string;
  store?: Store;
}

export interface Store {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  country: string;
  is_verified: boolean;
  is_active?: boolean;
  rating: number;
  total_sales: number;
  email?: string;
  phone?: string;
  products_count?: number;
  orders_count?: number;
  rfqs_count?: number;
}

export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  products_count?: number;
  children?: Category[];
}

export interface ProductTier {
  id?: number;
  min_quantity: number;
  max_quantity?: number | null;
  unit_price: number;
}

export interface Product {
  id: number;
  store_id: number;
  category_id?: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  moq: number;
  stock: number;
  unit: string;
  images: string[];
  is_featured: boolean;
  is_trade_assurance: boolean;
  moderation_status?: 'APPROVED' | 'PENDING_REVIEW' | 'FLAGGED';
  tiers: ProductTier[];
  store?: Store;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: Product;
}

export interface DeliveryLog {
  id: number;
  status: string;
  location_note: string;
  logged_at: string;
}

export interface Delivery {
  id: number;
  order_id: number;
  delivery_agent_id?: number;
  tracking_code: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  pickup_address?: string;
  dropoff_address?: string;
  courier_notes?: string;
  proof_of_delivery_note?: string;
  estimated_delivery_at?: string;
  delivered_at?: string;
  courier?: User;
  order?: Order;
  logs?: DeliveryLog[];
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  store_id: number;
  total_amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'ASSIGNED_TO_COURIER' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  escrow_status?: 'HELD_IN_ESCROW' | 'RELEASED_TO_VENDOR' | 'REFUNDED_TO_BUYER';
  platform_fee?: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  notes?: string;
  payment_method?: string;
  created_at: string;
  items?: OrderItem[];
  delivery?: Delivery;
  store?: Store;
  user?: User;
}

export interface PaymentGateway {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  is_sandbox: boolean;
  credentials?: Record<string, any>;
  icon?: string;
  last_tested_at?: string;
  test_status: 'SUCCESS' | 'FAILED' | 'PENDING';
  test_message?: string;
}

export interface Rfq {
  id: number;
  user_id: number;
  product_id: number;
  store_id: number;
  quantity: number;
  target_price?: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEGOTIATING';
  vendor_reply?: string;
  created_at: string;
  product?: Product;
  store?: Store;
  user?: User;
}

export interface Dispute {
  id: number;
  order_id: number;
  user_id: number;
  store_id: number;
  dispute_code: string;
  reason: string;
  disputed_amount: number;
  currency: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUNDED' | 'RESOLVED_RELEASED' | 'REJECTED';
  buyer_statement: string;
  vendor_statement?: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  order?: Order;
  buyer?: User;
  store?: Store;
}

export interface DashboardStats {
  financials: {
    total_gmv: number;
    platform_revenue: number;
    commission_rate_percent: number;
    escrow_held: number;
    escrow_released: number;
    currency: string;
  };
  counts: {
    total_orders: number;
    orders_by_status: Record<string, number>;
    total_stores: number;
    verified_stores: number;
    active_stores: number;
    total_products: number;
    approved_products: number;
    flagged_products: number;
    total_deliveries: number;
    active_deliveries: number;
    completed_deliveries: number;
    total_disputes: number;
    open_disputes: number;
    total_couriers: number;
    total_buyers: number;
  };
  payment_distribution: Array<{
    payment_gateway_code: string;
    total_amount: string | number;
    count: number;
  }>;
}

export interface PlatformSettings {
  platform_commission_rate: number;
  escrow_auto_release_days: number;
  default_currency: string;
  platform_support_email: string;
}
