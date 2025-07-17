export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_quantity: number;  // ⚠️ Não é "stock"
  min_stock_level: number; // ⚠️ Não é "min_stock"
  category: {
    id: number;
    name: string;
  };
  is_active: boolean;
  // Campos calculados pelo backend:
  profit_margin?: number;
  stock_status?: 'sem_estoque' | 'estoque_baixo' | 'ok';
  has_promotion?: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock_quantity: number;
  category_name: string;  // ⚠️ É "category_name", não "category"
  is_active: boolean;
  stock_status: string;
}

export interface CreateProductRequest {
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  category_id: number;  // ⚠️ Backend espera category_id
  description?: string;
  unit?: string;
  weight?: number;
  bulk_discount_enabled?: boolean;
  bulk_discount_percentage?: number;
}

export interface Category {
  id: number;
  name: string;
  products_count?: number;
}

export interface StockAlert {
  product_id: number;
  product_name: string;
  current_stock: number;
  min_stock: number;
  category_name: string;
}

export interface ProductFilters {
  query?: string;
  category_id?: number;
  active_only?: boolean;
  low_stock_only?: boolean;
  skip?: number;
  limit?: number;
}