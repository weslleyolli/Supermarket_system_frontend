import { Product } from './product';
import { PaymentMethod } from './pos';

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  weight?: number;
  unit_price: number;
  original_total_price: number;
  discount_applied: number;
  bulk_discount_applied: number;
  final_total_price: number;
  product_name: string;
  product_barcode: string;
}

export interface Sale {
  id: number;
  customer_id?: number;
  user_id: number;
  subtotal_amount: number;
  discount_amount: number;
  bulk_discount_amount: number;
  final_amount: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'cancelled';
  created_at: string;
  items: SaleItem[];
  // Campos calculados:
  total_items?: number;
  total_quantity?: number;
  total_savings?: number;
}

export interface SaleSummary {
  id: number;
  final_amount: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'cancelled';
  total_items: number;
  created_at: string;
  cashier_name: string;
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

export interface SaleCart extends Omit<Product, 'stock_quantity' | 'min_stock_level'> {
  quantity: number;
  discount?: number;
}