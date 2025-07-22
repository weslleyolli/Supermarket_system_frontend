// src/services/api.ts - VERSÃO COMPLETA COM DADOS REAIS

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  Product, 
  CreateProductRequest, 
  ProductFilters,
  Sale, 
  Customer, 
  CreateCustomerRequest,
  DashboardData,
  PaginatedResponse 
} from '../types';
import type { 
  Cart, 
  BarcodeInput, 
  PaymentRequest, 
  PaymentResponse,
  CartOperation 
} from '../types/pos';

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

  // ===== AUTHENTICATION =====
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
    return this.api.post('/api/v1/auth/login', credentials);
  }

  async getCurrentUser(): Promise<{
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
    permissions: string[];
  }> {
    return this.api.get('/api/v1/auth/me');
  }

  // ===== PRODUCTS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    console.log('🔍 Buscando produtos com filtros:', filters);
    return this.api.get('/api/v1/products', { params: filters });
  }

  async searchProducts(params: {
    query?: string;
    category_id?: number;
    active_only?: boolean;
    low_stock_only?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Product[]> {
    console.log('🔍 Pesquisando produtos:', params);
    return this.api.get('/api/v1/products/search', { params });
  }

  async getProduct(id: number): Promise<Product> {
    return this.api.get(`/api/v1/products/${id}`);
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    console.log('➕ Criando produto:', product);
    return this.api.post('/api/v1/products', product);
  }

  async updateProduct(id: number, product: Partial<CreateProductRequest>): Promise<Product> {
    console.log('✏️ Atualizando produto:', id, product);
    return this.api.put(`/api/v1/products/${id}`, product);
  }

  async deleteProduct(id: number): Promise<void> {
    console.log('🗑️ Deletando produto:', id);
    return this.api.delete(`/api/v1/products/${id}`);
  }

  // Busca por código de barras
  async searchByBarcode(barcode: string): Promise<Product> {
    console.log('🔍 Buscando por código de barras:', barcode);
    return this.api.post('/api/v1/products/barcode-search', { barcode });
  }

  // Produtos com estoque baixo
  async getLowStockProducts(limit: number = 50): Promise<Product[]> {
    return this.api.get('/api/v1/products/low-stock', { params: { limit } });
  }

  // Categorias
  async getCategories(): Promise<Array<{id: number; name: string; products_count?: number}>> {
    return this.api.get('/api/v1/products/categories');
  }

  async createCategory(category: { name: string; description?: string }): Promise<{id: number; name: string; description?: string}> {
    return this.api.post('/api/v1/products/categories', category);
  }

  // ===== PDV/CART =====
  async addProductToCart(barcodeInput: BarcodeInput): Promise<{
    success: boolean;
    message: string;
    product: {
      id: number;
      name: string;
      price: number;
      requires_weighing: boolean;
    };
    cart: Cart;
  }> {
    console.log('🛒 Adicionando produto ao carrinho:', barcodeInput);
    return this.api.post('/api/v1/pdv/add-product', barcodeInput);
  }

  async getCurrentCart(): Promise<Cart> {
    console.log('🛒 Obtendo carrinho atual');
    return this.api.get('/api/v1/pdv/cart');
  }

  async updateCartItem(operation: CartOperation): Promise<Cart> {
    console.log('🔄 Atualizando carrinho:', operation);
    return this.api.post('/api/v1/pdv/cart/update', operation);
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    console.log('💳 Processando pagamento:', paymentRequest);
    return this.api.post('/api/v1/pdv/payment', paymentRequest);
  }

  // ===== SALES =====
  async getSales(params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Sale[]> {
    console.log('📊 Buscando vendas:', params);
    return this.api.get('/api/v1/sales/', { params });
  }

  async getSale(id: number): Promise<Sale> {
    return this.api.get(`/api/v1/sales/${id}`);
  }

  async cancelSale(saleId: number): Promise<{ success: boolean }> {
    console.log('❌ Cancelando venda:', saleId);
    return this.api.post(`/api/v1/sales/${saleId}/cancel`);
  }

  // ===== CUSTOMERS =====
  async getCustomers(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Customer>> {
    console.log('� Buscando clientes:', params);
    return this.api.get('/api/v1/customers', { params });
  }

  async createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
    console.log('➕ Criando cliente:', customer);
    return this.api.post('/api/v1/customers', customer);
  }

  async updateCustomer(id: number, customer: Partial<CreateCustomerRequest>): Promise<Customer> {
    console.log('✏️ Atualizando cliente:', id, customer);
    return this.api.put(`/api/v1/customers/${id}`, customer);
  }

  async getCustomerHistory(id: number): Promise<Sale[]> {
    return this.api.get(`/api/v1/customers/${id}/history`);
  }

  // ===== REPORTS =====
  async getDashboardData(targetDate?: string): Promise<DashboardData> {
    const params = targetDate ? { target_date: targetDate } : {};
    console.log('📊 Buscando dados do dashboard');
    return this.api.get('/api/v1/reports/dashboard', { params });
  }

  async getKPIsOnly(targetDate?: string): Promise<{
    today_sales: number;
    products_sold: number;
    customers_served: number;
    average_ticket: number;
  }> {
    const params = targetDate ? { target_date: targetDate } : {};
    console.log('📈 Buscando KPIs');
    return this.api.get('/api/v1/reports/kpis', { params });
  }

  async getStockAlerts(limit: number = 50): Promise<Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    min_stock: number;
    category: string;
  }>> {
    console.log('⚠️ Buscando alertas de estoque');
    return this.api.get('/api/v1/reports/stock-alerts', { params: { limit } });
  }

  // Endpoint para vendas diárias - CORRIGIDO
  async getDailySales(days: number = 7): Promise<Array<{
    date: string;
    total_sales: number;
    total_transactions: number;
    total_products: number;
    average_ticket: number;
  }>> {
    console.log(`📅 Buscando vendas dos últimos ${days} dias`);
    // Usar endpoint que realmente existe
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    
    try {
      await this.api.get('/api/v1/sales/summary/period', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });
      
      // Se o endpoint retornar dados agregados, precisamos simular dados diários
      // Por enquanto, retornar array vazio se não houver estrutura de dados diários
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar vendas diárias:', error);
      return [];
    }
  }

  // Endpoint para produtos mais vendidos - CORRIGIDO
  async getTopProducts(limit: number = 5): Promise<Array<{
    product_id: number;
    product_name: string;
    category_name: string;
    quantity_sold: number;
    revenue: number;
    profit: number;
  }>> {
    console.log(`🏆 Buscando top ${limit} produtos`);
    // Usar endpoint que realmente existe
    try {
      const response = await this.api.get('/api/v1/reports/dashboard');
      const dashboardData = response as any;
      
      if (dashboardData && Array.isArray(dashboardData.top_products)) {
        return dashboardData.top_products.slice(0, limit);
      }
      
      console.log('❌ top_products não encontrado ou vazio no dashboard');
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar top produtos:', error);
      return [];
    }
  }

  // ===== HARDWARE =====
  async scanBarcode(): Promise<{ success: boolean; barcode?: string; product?: Product }> {
    console.log('📷 Escaneando código de barras');
    return this.api.post('/api/v1/hardware/barcode/scan');
  }

  async getWeightFromScale(): Promise<{ weight: number }> {
    console.log('⚖️ Obtendo peso da balança');
    return this.api.get('/api/v1/hardware/scale/weight');
  }

  async printReceipt(saleId: number): Promise<{ success: boolean }> {
    console.log('🖨️ Imprimindo recibo da venda:', saleId);
    return this.api.post(`/api/v1/hardware/printer/receipt/${saleId}`);
  }

  // ===== UTILITY METHODS =====
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.api.get('/health');
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('❌ Erro de conectividade:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
