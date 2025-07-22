import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface StockProduct {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  sale_price: number;
  min_stock: number;
  max_stock?: number;
  supplier?: string;
  location?: string;
  stock_status: 'ok' | 'low' | 'critical' | 'out';
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  movement_type: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'devolucao';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason?: string;
  user_name?: string;
  supplier_name?: string;
  created_at: string;
}

export interface StockAlert {
  id: number;
  product_id: number;
  product_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expired' | 'damaged';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  products_count: number;
  last_purchase?: string;
}

export interface StockSummary {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_movements_today: number;
  pending_alerts: number;
}

export interface StockEntryData {
  product_id: number;
  quantity: number;
  unit_cost: number;
  reason?: string;
  notes?: string;
}

export interface StockExitData {
  product_id: number;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface StockAdjustmentData {
  product_id: number;
  new_quantity: number;
  reason?: string;
  notes?: string;
}

export const useStock = () => {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<StockSummary>({
    total_products: 0,
    total_value: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_movements_today: 0,
    pending_alerts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Tenta buscar produtos da API real
      const apiProducts = await apiService.getProducts();
      
      console.log('🔍 Resposta da API getProducts:', apiProducts);
      console.log('🔍 Quantidade de produtos da API:', apiProducts?.length);
      
      if (apiProducts && Array.isArray(apiProducts)) {
        // Primeira vamos ver os dados brutos da API
        console.log('🔍 DADOS BRUTOS DA API (primeiros 3 produtos):');
        apiProducts.slice(0, 3).forEach((product: any, index: number) => {
          const estimatedCost = product.price ? (product.price * 0.7) : 0;
          console.log(`Produto ${index + 1}:`, {
            name: product.name,
            stock_quantity: product.stock_quantity,
            cost_price_original: product.cost_price,
            price: product.price,
            estimated_cost: estimatedCost,
            todas_propriedades: Object.keys(product)
          });
        });
        
        // Converte produtos da API para o formato do StockProduct
        const convertedProducts: StockProduct[] = apiProducts.map((product: any) => {
          // Como cost_price não está disponível na API, vamos estimar como 70% do preço de venda
          const estimatedCostPrice = product.price ? (product.price * 0.7) : 0;
          
          return {
            id: product.id,
            name: product.name,
            sku: product.barcode || `SKU${product.id}`,
            barcode: product.barcode || `SKU${product.id}`, // Para compatibilidade
            category: typeof product.category === 'object' ? product.category.name : product.category || 'Geral',
            category_name: typeof product.category === 'object' ? product.category.name : product.category || 'Geral', // Para compatibilidade
            description: product.description,
            quantity: product.stock_quantity || 0,
            stock_quantity: product.stock_quantity || 0, // Para compatibilidade
            unit: 'unidade',
            unit_cost: estimatedCostPrice, // Usando custo estimado
            cost_price: estimatedCostPrice, // Para compatibilidade
            sale_price: product.price || 0,
            price: product.price || 0, // Para compatibilidade
            min_stock: product.min_stock || 10,
            max_stock: product.max_stock,
            reorder_point: product.reorder_point,
            supplier: product.supplier || 'Não informado',
            location: product.location || 'Estoque Principal',
            stock_status: getStockStatus(product.stock_quantity || 0, product.min_stock || 10)
          } as any;
        });
        
        setProducts(convertedProducts);
        console.log(`✅ Produtos carregados da API: ${convertedProducts.length} itens`);
        if (convertedProducts.length > 0) {
          console.log('🔍 Primeiro produto convertido:', convertedProducts[0]);
        }
      } else {
        console.warn('⚠️ API não retornou produtos válidos, usando lista vazia');
        console.warn('⚠️ Resposta recebida:', apiProducts);
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos da API:', error);
      console.warn('⚠️ Usando lista vazia devido ao erro');
      setProducts([]);
    }
    setLoading(false);
  };

  // Função auxiliar para determinar status do estoque
  const getStockStatus = (quantity: number, minStock: number): 'ok' | 'low' | 'critical' | 'out' => {
    if (quantity === 0) return 'out';
    if (quantity <= minStock * 0.5) return 'critical';
    if (quantity <= minStock) return 'low';
    return 'ok';
  };

  const fetchMovements = async () => {
    setLoading(true);
    setTimeout(() => {
      setMovements([]); // Usar lista vazia em vez de dados mock
      setLoading(false);
    }, 300);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // 🔧 NOVA ABORDAGEM: Gerar alertas baseados nos produtos carregados
      // em vez de confiar apenas na API de alertas que pode ter dados inconsistentes
      
      if (products.length > 0) {
        console.log('🔧 Gerando alertas baseados nos produtos carregados (dados corretos)');
        
        const alertsFromProducts = products
          .filter(product => {
            const needsAlert = product.quantity <= product.min_stock;
            console.log(`🔍 ${product.name}: ${product.quantity}/${product.min_stock} - ${needsAlert ? 'ALERTA NECESSÁRIO' : 'OK'}`);
            return needsAlert;
          })
          .map(product => {
            const isCritical = product.quantity <= 3;
            
            return {
              id: product.id,
              product_id: product.id,
              product_name: product.name,
              current_stock: product.quantity,
              current_quantity: product.quantity,
              min_stock: product.min_stock,
              category: product.category,
              category_name: product.category,
              alert_type: product.quantity === 0 ? 'out_of_stock' as const : 'low_stock' as const,
              alert_level: isCritical ? 'critical' as const : 'high' as const,
              priority: isCritical ? 'critical' as const : 'high' as const,
              message: product.quantity === 0
                ? `${product.name} está sem estoque!`
                : `${product.name} está com estoque baixo (${product.quantity}/${product.min_stock})`,
              is_resolved: false,
              created_at: new Date().toISOString()
            } as any;
          });
        
        setAlerts(alertsFromProducts);
        
        const criticalCount = alertsFromProducts.filter(a => (a as any).alert_level === 'critical').length;
        const highCount = alertsFromProducts.filter(a => (a as any).alert_level === 'high').length;
        
        console.log(`✅ Alertas gerados dos produtos: ${alertsFromProducts.length} itens`);
        console.log(`🚨 Alertas CRÍTICOS: ${criticalCount}`);
        console.log(`⚠️ Alertas HIGH: ${highCount}`);
        console.log('🔍 Alertas gerados:', alertsFromProducts.map(a => `${a.product_name}: ${(a as any).current_stock}/${(a as any).min_stock} (${(a as any).alert_level})`));
        
        setLoading(false);
        return;
      }
      
      // 🔧 FALLBACK: Se não há produtos carregados, usar API de alertas como antes
      console.log('⚠️ Produtos não carregados ainda, usando API de alertas como fallback');
      
      // Busca alertas de estoque baixo da API
      const stockAlertsResponse = await apiService.getStockAlerts();
      
      console.log('🔍 Resposta da API getStockAlerts:', stockAlertsResponse);
      console.log('🔍 Tipo da resposta:', typeof stockAlertsResponse);
      console.log('🔍 STOCK ALERTS API - Comparação com Dashboard');
      
      // A API retorna {alerts_count: number, alerts: Array} ou diretamente um Array
      let stockAlerts: any[] = [];
      
      if (Array.isArray(stockAlertsResponse)) {
        stockAlerts = stockAlertsResponse;
      } else if (stockAlertsResponse && typeof stockAlertsResponse === 'object' && 'alerts' in stockAlertsResponse) {
        stockAlerts = (stockAlertsResponse as any).alerts;
      }
      
      console.log('🔍 Alertas extraídos:', stockAlerts);
      console.log('🔍 É array?', Array.isArray(stockAlerts));
      
      // Log detalhado dos alertas da gestão de estoque
      if (Array.isArray(stockAlerts) && stockAlerts.length > 0) {
        console.log('🔍 STOCK ALERTS API - Alertas detalhados:');
        stockAlerts.forEach((alert: any, index: number) => {
          console.log(`   ${index + 1}. ${alert.product_name || alert.name}: ${alert.current_stock || alert.stock_quantity}/${alert.min_stock}`);
          console.log(`       Propriedades disponíveis:`, Object.keys(alert));
          console.log(`       Valores: current_stock=${alert.current_stock}, stock_quantity=${alert.stock_quantity}, current_quantity=${alert.current_quantity}, min_stock=${alert.min_stock}`);
          console.log(`       🔍 VALORES CRÍTICOS: current_quantity=${alert.current_quantity}, min_stock=${alert.min_stock}`);
        });
      }
      
      if (stockAlerts && Array.isArray(stockAlerts) && stockAlerts.length > 0) {
        const convertedAlerts: StockAlert[] = stockAlerts
          .filter((alert: any) => {
            // Só processar alertas que realmente precisam de atenção
            const currentStock = alert.current_stock ?? alert.current_quantity ?? alert.stock_quantity ?? alert.quantity ?? alert.remaining_stock ?? 0;
            const minStock = alert.min_stock ?? alert.minimum_stock ?? alert.reorder_point ?? 10;
            
            // CORREÇÃO: Incluir se current_stock <= min_stock (estoque baixo)
            const needsAttention = currentStock <= minStock;
            
            console.log(`� Verificando alerta: ${alert.product_name} (${currentStock}/${minStock}) - ${needsAttention ? 'PRECISA DE ATENÇÃO' : 'estoque OK'}`);
            
            return needsAttention;
          })
          .map((alert: any) => {
          // Buscar current_stock com nomes alternativos
          const currentStock = alert.current_stock ?? alert.current_quantity ?? alert.stock_quantity ?? alert.quantity ?? alert.remaining_stock ?? 0;
          const minStock = alert.min_stock ?? alert.minimum_stock ?? alert.reorder_point ?? 10;
          
          // CORREÇÃO: Lógica de criticidade conforme solicitado
          const isOutOfStock = currentStock === 0;
          const isCritical = currentStock === 0 || currentStock <= 3; // Crítico quando ≤ 3
          
          console.log(`📊 ${alert.product_name}: ${currentStock}/${minStock} - ${isCritical ? 'CRÍTICO' : 'BAIXO'}`);
          
          return {
            id: alert.product_id || Date.now() + Math.random(),
            product_id: alert.product_id,
            product_name: alert.product_name,
            current_stock: currentStock,
            current_quantity: currentStock, // Para compatibilidade com o componente
            min_stock: minStock,
            category: alert.category,
            category_name: alert.category, // Para compatibilidade
            alert_type: isOutOfStock ? 'out_of_stock' as const : 'low_stock' as const,
            alert_level: isCritical ? 'critical' as const : 'high' as const, // Lógica corrigida!
            priority: isCritical ? 'critical' as const : 'high' as const,
            message: isOutOfStock 
              ? `${alert.product_name} está sem estoque!`
              : `${alert.product_name} está com estoque baixo (${currentStock}/${minStock})`,
            is_resolved: false,
            created_at: new Date().toISOString()
          } as any;
        });
        
        setAlerts(convertedAlerts);
        
        // Log detalhado para debug
        const criticalCount = convertedAlerts.filter(a => (a as any).alert_level === 'critical').length;
        const highCount = convertedAlerts.filter(a => (a as any).alert_level === 'high').length;
        
        console.log(`✅ Alertas carregados da API: ${convertedAlerts.length} itens`);
        console.log(`🚨 Alertas CRÍTICOS: ${criticalCount}`);
        console.log(`⚠️ Alertas HIGH: ${highCount}`);
        console.log('🔍 Alertas convertidos com propriedades:', convertedAlerts.map(a => ({
          id: a.id,
          product_name: a.product_name,
          current_stock: (a as any).current_stock,
          min_stock: (a as any).min_stock,
          alert_level: (a as any).alert_level,
          priority: (a as any).priority
        })));
      } else {
        console.warn('⚠️ Nenhum alerta encontrado na API, usando lista vazia');
        console.warn('⚠️ Resposta recebida:', stockAlertsResponse);
        
        setAlerts([]);
        console.log(`🔍 Usando lista vazia de alertas`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar alertas da API:', error);
      console.warn('⚠️ Usando lista vazia devido ao erro');
      setAlerts([]);
    }
    setLoading(false);
    console.log('🏁 fetchAlerts finalizada');
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuppliers([]); // Usar lista vazia em vez de dados mock
      setLoading(false);
    }, 300);
  };

  const calculateSummary = async () => {
    try {
      // Busca dados reais do dashboard
      const dashboardData = await apiService.getDashboardData();
      
      if (dashboardData) {
        const calculatedTotalValue = products.reduce((sum, product) => sum + (product.quantity * product.unit_cost), 0);
        
        console.log(`💰 CÁLCULO DO VALOR DO ESTOQUE (API Dashboard):`);
        console.log(`💰 Produtos considerados: ${products.length}`);
        console.log(`💰 Detalhes do cálculo:`, products.map(p => ({
          nome: p.name,
          quantidade: p.quantity,
          custo_unitario: p.unit_cost,
          valor_total: p.quantity * p.unit_cost
        })));
        console.log(`💰 VALOR TOTAL CALCULADO: R$ ${calculatedTotalValue.toFixed(2)}`);
        
        setSummary({
          total_products: products.length, // Calculamos baseado nos produtos carregados
          total_value: calculatedTotalValue,
          low_stock_count: dashboardData.low_stock_alerts?.length || 0,
          out_of_stock_count: products.filter(p => p.stock_status === 'out').length,
          total_movements_today: 0, // Pode ser implementado futuramente
          pending_alerts: dashboardData.low_stock_alerts?.length || 0,
        });
        console.log(`✅ Resumo do dashboard atualizado da API`);
        console.log(`📊 Total de produtos: ${products.length}`);
        console.log(`� Alertas de estoque baixo: ${dashboardData.low_stock_alerts?.length || 0}`);
      } else {
        // Fallback para cálculo local
        calculateSummaryFromLocal();
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      calculateSummaryFromLocal();
    }
  };

  const calculateSummaryFromLocal = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.unit_cost), 0);
    console.log(`💰 CÁLCULO DO VALOR DO ESTOQUE:`);
    console.log(`💰 Produtos considerados: ${products.length}`);
    console.log(`💰 Detalhes do cálculo:`, products.map(p => ({
      nome: p.name,
      quantidade: p.quantity,
      custo_unitario: p.unit_cost,
      valor_total: p.quantity * p.unit_cost
    })));
    console.log(`💰 VALOR TOTAL DO ESTOQUE: R$ ${totalValue.toFixed(2)}`);
    
    const outOfStockCount = products.filter(p => p.stock_status === 'out').length;
    const pendingAlerts = alerts.filter(a => !a.is_resolved).length;
    
    // Contagem específica de alertas de estoque baixo (incluindo críticos)
    const lowStockAlerts = alerts.filter(a => 
      !a.is_resolved && 
      (a.alert_type === 'low_stock' || a.alert_type === 'out_of_stock')
    ).length;
    
    const today = new Date().toDateString();
    const totalMovementsToday = movements.filter(m => 
      new Date(m.created_at).toDateString() === today
    ).length;

    setSummary({
      total_products: totalProducts,
      total_value: totalValue,
      low_stock_count: lowStockAlerts, // Usar contagem de alertas em vez de produtos
      out_of_stock_count: outOfStockCount,
      total_movements_today: totalMovementsToday,
      pending_alerts: pendingAlerts,
    });
    
    console.log(`📊 Resumo calculado localmente:`);
    console.log(`📊 Total de produtos: ${totalProducts}`);
    console.log(`📊 Alertas de estoque baixo: ${lowStockAlerts}`);
    console.log(`📊 Alertas pendentes: ${pendingAlerts}`);
  };

  const createStockEntry = async (data: StockEntryData) => {
    try {
      console.log('Simulando entrada de estoque:', data);
      // Simula a operação localmente
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        const updatedProducts = products.map(p => 
          p.id === data.product_id 
            ? { ...p, quantity: p.quantity + data.quantity }
            : p
        );
        setProducts(updatedProducts);
        
        const newMovement: StockMovement = {
          id: Date.now(),
          product_id: data.product_id,
          product_name: product.name,
          movement_type: 'entrada',
          quantity: data.quantity,
          previous_quantity: product.quantity,
          new_quantity: product.quantity + data.quantity,
          unit_cost: data.unit_cost,
          total_cost: data.quantity * data.unit_cost,
          reason: data.reason || 'Entrada de estoque',
          user_name: 'Admin',
          created_at: new Date().toISOString()
        };
        setMovements(prev => [newMovement, ...prev]);
      }
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar entrada:', err);
      return { success: false };
    }
  };

  const createStockExit = async (data: StockExitData) => {
    try {
      console.log('Simulando saída de estoque:', data);
      // Simula a operação localmente
      const product = products.find(p => p.id === data.product_id);
      if (product && product.quantity >= data.quantity) {
        const updatedProducts = products.map(p => 
          p.id === data.product_id 
            ? { ...p, quantity: p.quantity - data.quantity }
            : p
        );
        setProducts(updatedProducts);
        
        const newMovement: StockMovement = {
          id: Date.now(),
          product_id: data.product_id,
          product_name: product.name,
          movement_type: 'saida',
          quantity: data.quantity,
          previous_quantity: product.quantity,
          new_quantity: product.quantity - data.quantity,
          reason: data.reason || 'Saída de estoque',
          user_name: 'Admin',
          created_at: new Date().toISOString()
        };
        setMovements(prev => [newMovement, ...prev]);
      }
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar saída:', err);
      return { success: false };
    }
  };

  const createStockAdjustment = async (data: StockAdjustmentData) => {
    try {
      console.log('Simulando ajuste de estoque:', data);
      // Simula a operação localmente
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        const updatedProducts = products.map(p => 
          p.id === data.product_id 
            ? { ...p, quantity: data.new_quantity }
            : p
        );
        setProducts(updatedProducts);
        
        const newMovement: StockMovement = {
          id: Date.now(),
          product_id: data.product_id,
          product_name: product.name,
          movement_type: 'ajuste',
          quantity: Math.abs(data.new_quantity - product.quantity),
          previous_quantity: product.quantity,
          new_quantity: data.new_quantity,
          reason: data.reason || 'Ajuste de estoque',
          user_name: 'Admin',
          created_at: new Date().toISOString()
        };
        setMovements(prev => [newMovement, ...prev]);
      }
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar ajuste:', err);
      return { success: false };
    }
  };

  const exportStockData = async () => {
    try {
      console.log('Simulando exportação de dados');
      return { success: true, message: 'Dados exportados com sucesso!' };
    } catch (err) {
      console.warn('Erro na exportação');
      return { success: false };
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchMovements(),
      fetchAlerts(),
      fetchSuppliers()
    ]);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      console.log('🔄 Produtos carregados, recalculando alertas...');
      fetchAlerts(); // Recalcular alertas baseados nos produtos
    }
  }, [products]);

  useEffect(() => {
    if (products.length > 0 && alerts.length >= 0) {
      console.log('🔄 Recalculando summary - produtos:', products.length, 'alertas:', alerts.length);
      calculateSummary();
    }
  }, [products, movements, alerts]);

  return {
    products,
    movements,
    alerts,
    suppliers,
    summary,
    loading,
    error,
    createStockEntry,
    createStockExit,
    createStockAdjustment,
    exportStockData,
    refreshData,
    clearError
  };
};
