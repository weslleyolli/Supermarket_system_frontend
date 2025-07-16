export interface Customer {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string;
  birth_date?: string;
  loyalty_points: number;
  total_purchases: number;
  last_purchase_date?: string;
  created_at: string;
  active: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string;
  birth_date?: string;
}

export interface LoyaltyLevel {
  level: 'bronze' | 'silver' | 'gold' | 'vip';
  label: string;
  color: string;
  min_points: number;
}
