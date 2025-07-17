// src/utils/debugDashboard.ts
import { apiService } from '../services/api';

// Função para testar conectividade com a API
export const debugDashboardAPI = async () => {
  console.log('🔍 INICIANDO DEBUG DO DASHBOARD API...');
  console.log('📡 Base URL da API:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
  
  try {
    // 1. Verificar se o usuário está autenticado
    console.log('\n1️⃣ Verificando autenticação...');
    const token = localStorage.getItem('token');
    console.log('Token presente:', !!token);
    console.log('Token (primeiros 50 chars):', token?.substring(0, 50) + '...');

    // 2. Testar conectividade básica
    console.log('\n2️⃣ Testando conectividade básica...');
    try {
      const isConnected = await apiService.testConnection();
      console.log('✅ Conectividade:', isConnected ? 'OK' : 'FALHOU');
    } catch (connError) {
      console.log('❌ Erro de conectividade:', (connError as Error).message);
      return false;
    }

    // 3. Testar endpoint do dashboard
    console.log('\n3️⃣ Testando endpoint /reports/dashboard...');
    try {
      const dashboardResponse = await apiService.getDashboardData();
      const rawData = dashboardResponse as unknown as Record<string, unknown>;
      
      console.log('✅ Dados do dashboard recebidos:');
      console.log('📊 Dashboard completo:', dashboardResponse);
      
      // Mostrar com os nomes corretos que o backend está enviando
      console.log('💰 Vendas (total_sales):', rawData.total_sales);
      console.log('💵 Receita (total_revenue):', rawData.total_revenue);
      console.log('� Produtos vendidos (total_products):', rawData.total_products);
      console.log('🛒 Clientes servidos (customers_served):', rawData.customers_served);
      console.log('🎯 Ticket médio (average_ticket):', rawData.average_ticket);
      console.log('🏆 Top produtos:', Array.isArray(rawData.top_products) ? rawData.top_products.length : 0);
      console.log('⚠️ Alertas de estoque:', Array.isArray(rawData.stock_alerts) ? rawData.stock_alerts.length : 0);
      console.log('📈 Vendas diárias:', Array.isArray(rawData.daily_sales) ? rawData.daily_sales.length : 0);
      
      return dashboardResponse;
    } catch (dashboardError) {
      const error = dashboardError as { response?: { status: number; data: unknown }; message: string };
      console.log('❌ Erro no dashboard:', error.response?.status, error.response?.data);
      console.log('❌ Detalhes do erro:', error.message);
      return false;
    }

    // 4. Testar endpoints individuais se disponíveis
    console.log('\n4️⃣ Testando endpoints específicos...');
    
    const testEndpoints = [
      { name: 'Produtos', method: () => apiService.getProducts() },
      { name: 'Clientes', method: () => apiService.getCustomers() }
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await endpoint.method();
        // Simplificar contagem para evitar problemas de tipos
        let count = 0;
        if (Array.isArray(response)) {
          count = (response as unknown[]).length;
        } else if (response && typeof response === 'object' && 'items' in response) {
          count = ((response as { items: unknown[] }).items).length;
        } else {
          count = Object.keys(response || {}).length;
        }
        console.log(`✅ ${endpoint.name}:`, count, 'itens');
      } catch (error) {
        const err = error as { response?: { status: number }; message: string };
        console.log(`❌ ${endpoint.name}:`, err.response?.status || err.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Função para comparar dados mock vs reais
export const compareDataSources = async () => {
  console.log('\n🔄 COMPARANDO DADOS MOCK vs REAIS...');
  
  try {
    const realData = await apiService.getDashboardData();
    const rawData = realData as unknown as Record<string, unknown>;
    
    // Dados mock para comparação (baseados nos dados mock do useDashboard)
    const mockData = {
      today_sales: 12450.75,
      today_transactions: 87,
      products_sold: 234,
      customers_served: 87,
      average_ticket: 143.12,
      top_products_count: 5,
      stock_alerts_count: 3
    };

    console.log('\n📊 COMPARAÇÃO DE KPIs:');
    console.log('Vendas (total_sales) - Mock:', mockData.today_transactions, '| Real:', rawData.total_sales);
    console.log('Receita (total_revenue) - Mock:', mockData.today_sales, '| Real:', rawData.total_revenue);
    console.log('Produtos vendidos (total_products) - Mock:', mockData.products_sold, '| Real:', rawData.total_products);
    console.log('Clientes atendidos - Mock:', mockData.customers_served, '| Real:', rawData.customers_served);
    console.log('Ticket médio - Mock:', mockData.average_ticket, '| Real:', rawData.average_ticket);

    console.log('\n📈 COMPARAÇÃO DE ARRAYS:');
    console.log('Top produtos - Mock:', mockData.top_products_count, '| Real:', Array.isArray(rawData.top_products) ? rawData.top_products.length : 0);
    console.log('Alertas estoque - Mock:', mockData.stock_alerts_count, '| Real:', Array.isArray(rawData.stock_alerts) ? rawData.stock_alerts.length : 0);

    // Verificar se os dados são diferentes (indicando que está usando dados reais)
    // Usar os nomes corretos do backend
    const realRevenue = Number(rawData.total_revenue) || 0;
    const realProducts = Number(rawData.total_products) || 0;
    const realCustomers = Number(rawData.customers_served) || 0;
    
    const isDifferent = (
      Math.abs(mockData.today_sales - realRevenue) > 100 ||
      Math.abs(mockData.products_sold - realProducts) > 20 ||
      Math.abs(mockData.customers_served - realCustomers) > 10
    );

    console.log('\n🎯 RESULTADO:', isDifferent ? '✅ DADOS REAIS DETECTADOS' : '⚠️ DADOS SIMILARES AO MOCK');
    
    return { 
      realData, 
      mockData, 
      isDifferent,
      dataSource: isDifferent ? 'API_REAL' : 'POSSIVELMENTE_MOCK'
    };
    
  } catch (error) {
    console.error('❌ Erro na comparação:', error);
    return {
      error: true,
      message: 'Falhou ao buscar dados reais',
      dataSource: 'MOCK_FALLBACK'
    };
  }
};

// Função para monitorar requisições em tempo real
export const monitorNetworkRequests = () => {
  console.log('\n📡 MONITORANDO REQUISIÇÕES DE REDE...');
  
  // Note: Como estamos usando apiService em vez de api diretamente,
  // vamos interceptar no nível mais baixo possível
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const [resource, config] = args;
    
    console.log(`📤 REQUEST: ${config?.method || 'GET'} ${resource}`);
    console.log('Config:', config);
    
    try {
      const response = await originalFetch(...args);
      console.log(`📥 RESPONSE: ${response.status} ${resource}`);
      return response;
    } catch (error) {
      console.log(`❌ RESPONSE ERROR: ${resource}`, error);
      throw error;
    }
  };
};

// Hook de debug para usar no componente
export const useDebugDashboard = () => {
  const runDebug = async () => {
    await debugDashboardAPI();
    await compareDataSources();
  };

  return { runDebug, monitorNetworkRequests };
};

// Função para adicionar debug tools ao window
export const addDebugToDashboard = () => {
  (window as Window & { debugDashboard?: Record<string, unknown> }).debugDashboard = {
    full: async () => {
      console.clear();
      console.log('🚀 DEBUG COMPLETO INICIADO...');
      await debugDashboardAPI();
      await compareDataSources();
    },
    api: debugDashboardAPI,
    compare: compareDataSources,
    monitor: monitorNetworkRequests
  };
  
  console.log('🔧 DEBUG TOOLS CARREGADAS!');
  console.log('Use no console: debugDashboard.full()');
};
