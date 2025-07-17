export interface CartItem {
  product_id: number;
  product_name: string;
  product_barcode: string;
  unit_price: number;
  quantity: number;
  weight?: number;
  requires_weighing: boolean;
  original_total: number;
  discount_applied: number;
  bulk_discount_applied: number;
  final_total: number;
  has_promotion: boolean;
  promotion_description: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total_discount: number;
  bulk_discount: number;
  final_total: number;
  total_items: number;
  total_quantity: number;
}

export interface BarcodeInput {
  barcode: string;
  quantity: number;
  weight?: number;
}

export interface CartOperation {
  operation: 'add' | 'remove' | 'update' | 'clear';
  product_id?: number;
  quantity?: number;
  weight?: number;
}

export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface PaymentRequest {
  customer_id?: number;
  payment_method: PaymentMethod;
  amount_received: number;
}

export interface PaymentResponse {
  sale_id: number;
  final_amount: number;
  amount_received: number;
  change_amount: number;
  payment_method: PaymentMethod;
  receipt_data: {
    sale_id: number;
    date: string;
    items: Array<{
      name: string;
      quantity: number;
      weight?: number;
      unit_price: number;
      total: number;
      discount: number;
    }>;
    subtotal: number;
    total_discount: number;
    final_total: number;
    payment_method: string;
    amount_received: number;
    change: number;
  };
}

export interface POSSaleSummary {
  id: number;
  created_at: string;
  total_amount: number;
  payment_method: PaymentMethod;
  status: string;
  user_id: number;
  user_name: string;
  total_items: number;
}
