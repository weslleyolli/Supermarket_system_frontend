export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  POS: '/pos',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  DASHBOARD: '/dashboard',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT: 'credit',
  DEBIT: 'debit',
  PIX: 'pix',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export const SALE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
