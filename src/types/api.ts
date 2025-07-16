import { StockAlert } from './product';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface DashboardData {
  today_sales: number;
  products_sold: number;
  customers_served: number;
  average_ticket: number;
  sales_trend: number;
  products_trend: number;
  customers_trend: number;
  ticket_trend: number;
  top_products: Array<{
    id: number;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  daily_sales: Array<{
    date: string;
    total_sales: number;
    transactions: number;
  }>;
  low_stock_alerts: StockAlert[];
}