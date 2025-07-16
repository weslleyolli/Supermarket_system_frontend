export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  category: string;
  brand: string;
  description?: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  weight?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  category: string;
  brand: string;
  description?: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  weight?: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  active?: boolean;
  low_stock?: boolean;
}

export interface StockAlert {
  product_id: number;
  product_name: string;
  current_stock: number;
  min_stock: number;
  category: string;
}