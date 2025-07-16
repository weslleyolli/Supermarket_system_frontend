import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  Product, 
  CreateProductRequest, 
  ProductFilters,
  Sale, 
  CreateSaleRequest,
  Customer, 
  CreateCustomerRequest,
  DashboardData,
  PaginatedResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    return this.api.get('/api/products', { params: filters });
  }

  async getProduct(id: number): Promise<Product> {
    return this.api.get(`/api/products/${id}`);
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return this.api.post('/api/products', product);
  }

  async updateProduct(id: number, product: Partial<CreateProductRequest>): Promise<Product> {
    return this.api.put(`/api/products/${id}`, product);
  }

  async deleteProduct(id: number): Promise<void> {
    return this.api.delete(`/api/products/${id}`);
  }

  // Sales
  async createSale(sale: CreateSaleRequest): Promise<Sale> {
    return this.api.post('/api/sales', sale);
  }

  async getSales(params?: {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Sale>> {
    return this.api.get('/api/sales', { params });
  }

  async getSale(id: number): Promise<Sale> {
    return this.api.get(`/api/sales/${id}`);
  }

  // Customers
  async getCustomers(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Customer>> {
    return this.api.get('/api/customers', { params });
  }

  async createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
    return this.api.post('/api/customers', customer);
  }

  async updateCustomer(id: number, customer: Partial<CreateCustomerRequest>): Promise<Customer> {
    return this.api.put(`/api/customers/${id}`, customer);
  }

  async getCustomerHistory(id: number): Promise<Sale[]> {
    return this.api.get(`/api/customers/${id}/history`);
  }

  // Reports
  async getDashboardData(): Promise<DashboardData> {
    return this.api.get('/api/reports/dashboard');
  }

  async getSalesReport(params: {
    start_date: string;
    end_date: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<unknown> {
    return this.api.get('/api/reports/sales', { params });
  }

  // Hardware
  async scanBarcode(): Promise<{ success: boolean; barcode?: string; product?: Product }> {
    return this.api.post('/api/hardware/barcode/scan');
  }

  async getWeightFromScale(): Promise<{ weight: number }> {
    return this.api.get('/api/hardware/scale/weight');
  }

  async printReceipt(saleId: number): Promise<{ success: boolean }> {
    return this.api.post(`/api/hardware/printer/receipt/${saleId}`);
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }): Promise<{
    access_token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: 'admin' | 'manager' | 'cashier';
      permissions: string[];
    }
  }> {
    const response = await this.api.post('/api/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<{
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
    permissions: string[];
  }> {
    const response = await this.api.get('/api/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await this.api.post('/api/auth/refresh');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
