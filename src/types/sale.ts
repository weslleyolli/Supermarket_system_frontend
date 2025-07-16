import { Product } from './product';

export interface SaleItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
}

export interface Sale {
  id: number;
  customer_id?: number;
  customer_name?: string;
  items: SaleItem[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateSaleRequest {
  customer_id?: number;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
  }[];
  payment_method: string;
  discount_total?: number;
}

export interface Cart extends Omit<Product, 'stock' | 'min_stock' | 'max_stock'> {
  quantity: number;
  discount?: number;
}