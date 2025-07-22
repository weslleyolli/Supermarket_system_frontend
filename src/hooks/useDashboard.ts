import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Types específicos para o dashboard
interface DashboardKPIs {
  today_sales: number;
  today_transactions: number;
  products_sold: number;
  customers_served: number;
  average_ticket: number;
  sales_trend: number;
  transactions_trend: number;
  products_trend: number;
  customers_trend: number;
  ticket_trend: number;
}

interface DashboardData {
  kpis: DashboardKPIs;
  top_products: Array<{
    product_id: number;
    product_name: string;
    category_name: string;
    quantity_sold: number;
    revenue: number;
    profit: number;
  }>;
  daily_sales: Array<{
    date: string;
    total_sales: number;
    total_transactions: number;
    total_products: number;
    average_ticket: number;
  }>;
  low_stock_alerts: Array<{
    product_id: number;
    product_name: string;
    category_name: string;
    current_stock: number;
    min_stock: number;
    stock_status: 'critical' | 'warning' | 'low';
  }>;
  sales_goals: Array<{
    goal_id: number;
    goal_name: string;
    target_amount: number;
    current_amount: number;
    progress_percentage: number;
    deadline: string;
  }>;
  category_performance: Array<{
    category_id: number;
    category_name: string;
    total_sales: number;
    total_profit: number;
    total_products: number;
    average_margin: number;
  }>;
  hourly_analysis: Array<{
    hour: number;
    total_sales: number;
    total_transactions: number;
    average_ticket: number;
  }>;
  last_updated: string;
  period_start: string;
  period_end: string;
}

// Função para gerar vendas diárias realistas baseadas nos KPIs ou buscar dados reais
const generateOrFetchDailySales = async (apiService: any): Promise<DashboardData['daily_sales']> => {
  try {
    // Tentar buscar vendas reais dos últimos 7 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // 7 dias incluindo hoje
    
    console.log('📊 Buscando vendas reais dos últimos 7 dias...');
    console.log(`📅 Período: ${startDate.toISOString().split('T')[0]} até ${endDate.toISOString().split('T')[0]}`);
    
    const salesData = await apiService.getSales({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'COMPLETED'
    });
    
    console.log('📊 Vendas encontradas:', salesData);
    
    if (Array.isArray(salesData) && salesData.length > 0) {
      // Processar vendas reais por dia
      const salesByDay = new Map<string, {
        total_sales: number;
        total_transactions: number;
        total_products: number;
      }>();
      
      // Inicializar todos os dias com valores zerados
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        salesByDay.set(dateStr, {
          total_sales: 0,
          total_transactions: 0,
          total_products: 0
        });
      }
      
      // Processar vendas reais
      salesData.forEach((sale: any) => {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        if (salesByDay.has(saleDate)) {
          const dayData = salesByDay.get(saleDate)!;
          dayData.total_sales += Number(sale.final_amount || sale.total_amount || 0);
          dayData.total_transactions += 1;
          dayData.total_products += Number(sale.total_items || 1);
        }
      });
      
      // Converter para array
      const dailySales = Array.from(salesByDay.entries()).map(([date, data]) => ({
        date,
        total_sales: Math.round(data.total_sales * 100) / 100,
        total_transactions: data.total_transactions,
        total_products: data.total_products,
        average_ticket: data.total_transactions > 0 
          ? Math.round((data.total_sales / data.total_transactions) * 100) / 100 
          : 0
      }));
      
      console.log('📊 Vendas diárias processadas:', dailySales);
      return dailySales;
    } else {
      console.log('📊 Nenhuma venda encontrada, retornando dados zerados');
      return generateEmptyDailySales();
    }
  } catch (error) {
    console.error('❌ Erro ao buscar vendas reais:', error);
    console.log('📊 Fallback: gerando dados zerados');
    return generateEmptyDailySales();
  }
};

// Função para gerar dados zerados dos últimos 7 dias
const generateEmptyDailySales = (): DashboardData['daily_sales'] => {
  const sales = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    sales.push({
      date: date.toISOString().split('T')[0],
      total_sales: 0,
      total_transactions: 0,
      total_products: 0,
      average_ticket: 0
    });
  }
  
  return sales;
};

// Hook customizado para o dashboard
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [targetDate] = useState(new Date().toISOString().split('T')[0]);

  // Função principal para buscar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando busca de dados do dashboard...');
      
      // Tentar buscar dados do backend
      const apiData = await apiService.getDashboardData(targetDate) as any;
      
      // Buscar alertas de estoque dos produtos - simplificado
      let stockAlertsForDashboard: any[] = [];
      try {
        console.log('📦 Buscando produtos para gerar alertas de estoque...');
        const products = await apiService.getProducts();
        
        if (products && Array.isArray(products)) {
          // Gerar alertas APENAS dos produtos que realmente precisam de atenção
          stockAlertsForDashboard = products
            .filter((product: any) => {
              const currentStock = product.current_quantity || product.stock_quantity || 0;
              const minStock = product.minimum_stock || product.min_stock || 10;
              return currentStock <= minStock; // Filtro básico: estoque atual <= mínimo
            })
            .map((product: any) => ({
              product_id: product.id,
              product_name: product.name,
              category_name: product.category || 'Geral',
              current_stock: product.current_quantity || product.stock_quantity || 0,
              min_stock: product.minimum_stock || product.min_stock || 10,
              stock_status: (product.current_quantity || product.stock_quantity || 0) === 0 ? 'critical' : 
                           (product.current_quantity || product.stock_quantity || 0) <= 3 ? 'critical' :
                           'warning'
            }));
            
          console.log(`🎯 Dashboard gerou ${stockAlertsForDashboard.length} alertas de estoque`);
        }
      } catch (stockError) {
        console.warn('⚠️ Falha ao buscar alertas de estoque para dashboard:', stockError);
      }
      
      if (apiData && typeof apiData === 'object') {
        // Adaptar dados recebidos para o formato esperado
        const adaptedData: DashboardData = {
          kpis: {
            today_sales: Number(apiData.today_sales || 0),
            today_transactions: Number(apiData.today_transactions || 0),
            products_sold: Number(apiData.products_sold || 0),
            customers_served: Number(apiData.customers_served || 0),
            average_ticket: Number(apiData.average_ticket || 0),
            sales_trend: Number(apiData.sales_trend || 0),
            transactions_trend: Number(apiData.transactions_trend || 0),
            products_trend: Number(apiData.products_trend || 0),
            customers_trend: Number(apiData.customers_trend || 0),
            ticket_trend: Number(apiData.ticket_trend || 0)
          },
          top_products: Array.isArray(apiData.top_products) ? apiData.top_products.map((product: any) => ({
            product_id: product.product_id || 0,
            product_name: product.name || product.product_name || 'Produto sem nome',
            category_name: product.category_name || 'Sem categoria',
            quantity_sold: Number(product.quantity_sold || 0),
            revenue: Number(product.quantity_sold || 0) * Number(product.price || 0),
            profit: Number(product.profit || 0)
          })) : [],
          daily_sales: await generateOrFetchDailySales(apiService),
          low_stock_alerts: stockAlertsForDashboard.length > 0 ? stockAlertsForDashboard : [],
          sales_goals: Array.isArray(apiData.sales_goals) ? apiData.sales_goals as DashboardData['sales_goals'] : [],
          category_performance: Array.isArray(apiData.category_performance) ? apiData.category_performance as DashboardData['category_performance'] : [],
          hourly_analysis: Array.isArray(apiData.hourly_analysis) ? apiData.hourly_analysis as DashboardData['hourly_analysis'] : [],
          last_updated: String(apiData.last_updated || new Date().toISOString()),
          period_start: String(apiData.period_start || new Date().toISOString().split('T')[0]),
          period_end: String(apiData.period_end || new Date().toISOString().split('T')[0])
        };
        
        setDashboardData(adaptedData);
        setKpis(adaptedData.kpis);
        
        console.log(`✅ Dashboard carregado! ${stockAlertsForDashboard.length} alertas encontrados`);
      } else {
        // Se não há dados da API, usar valores zerados em vez de mock
        console.log('⚠️ API não retornou dados válidos, usando valores zerados');
        const emptyData: DashboardData = {
          kpis: {
            today_sales: 0,
            today_transactions: 0,
            products_sold: 0,
            customers_served: 0,
            average_ticket: 0,
            sales_trend: 0,
            transactions_trend: 0,
            products_trend: 0,
            customers_trend: 0,
            ticket_trend: 0
          },
          top_products: [],
          daily_sales: [],
          low_stock_alerts: stockAlertsForDashboard,
          sales_goals: [],
          category_performance: [],
          hourly_analysis: [],
          last_updated: new Date().toISOString(),
          period_start: new Date().toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0]
        };
        setDashboardData(emptyData);
        setKpis(emptyData.kpis);
      }
      
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('❌ Erro ao buscar dados do dashboard:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Erro ao carregar dashboard');
      
      // Usar dados zerados em caso de erro
      console.log('🔄 Usando dados zerados devido ao erro...');
      const emptyData: DashboardData = {
        kpis: {
          today_sales: 0,
          today_transactions: 0,
          products_sold: 0,
          customers_served: 0,
          average_ticket: 0,
          sales_trend: 0,
          transactions_trend: 0,
          products_trend: 0,
          customers_trend: 0,
          ticket_trend: 0
        },
        top_products: [],
        daily_sales: [],
        low_stock_alerts: [],
        sales_goals: [],
        category_performance: [],
        hourly_analysis: [],
        last_updated: new Date().toISOString(),
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0]
      };
      setDashboardData(emptyData);
      setKpis(emptyData.kpis);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  const fetchKPIsOnly = useCallback(async () => {
    try {
      console.log('📈 Atualizando KPIs...');
      const kpisData = await apiService.getKPIsOnly(targetDate) as Record<string, unknown>;
      
      if (kpisData && typeof kpisData === 'object') {
        const updatedKpis: DashboardKPIs = {
          today_sales: Number(kpisData.today_sales || kpis?.today_sales || 0),
          today_transactions: Number(kpisData.today_transactions || kpis?.today_transactions || 0),
          products_sold: Number(kpisData.products_sold || kpis?.products_sold || 0),
          customers_served: Number(kpisData.customers_served || kpis?.customers_served || 0),
          average_ticket: Number(kpisData.average_ticket || kpis?.average_ticket || 0),
          sales_trend: Number(kpisData.sales_trend || kpis?.sales_trend || 0),
          transactions_trend: Number(kpisData.transactions_trend || kpis?.transactions_trend || 0),
          products_trend: Number(kpisData.products_trend || kpis?.products_trend || 0),
          customers_trend: Number(kpisData.customers_trend || kpis?.customers_trend || 0),
          ticket_trend: Number(kpisData.ticket_trend || kpis?.ticket_trend || 0)
        };
        
        setKpis(updatedKpis);
        
        // Atualizar também no dashboardData se existir
        if (dashboardData) {
          setDashboardData({
            ...dashboardData,
            kpis: updatedKpis,
            last_updated: new Date().toISOString()
          });
        }
        
        setLastUpdated(new Date());
        console.log('✅ KPIs atualizados com sucesso!');
      }
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar KPIs:', err);
      // Não fazer nada em caso de erro na atualização de KPIs
    }
  }, [targetDate, kpis, dashboardData]);

  const refreshData = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Atualizar KPIs a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !error) {
        fetchKPIsOnly();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchKPIsOnly, loading, error]);

  return {
    dashboardData,
    kpis,
    loading,
    error,
    lastUpdated,
    refreshData,
    fetchKPIsOnly
  };
};
