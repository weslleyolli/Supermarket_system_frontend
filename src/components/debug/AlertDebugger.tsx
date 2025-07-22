import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

interface AlertComparison {
  dashboardAlerts: any[];
  stockAlerts: any[];
  differences: string[];
}

const AlertDebugger: React.FC = () => {
  const [comparison, setComparison] = useState<AlertComparison | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAndCompare = async () => {
    setLoading(true);
    try {
      console.log('🔍 INICIANDO COMPARAÇÃO DE APIs DE ALERTAS');
      
      // 1. Buscar dados do dashboard
      console.log('📊 Buscando dados do dashboard...');
      const dashboardData = await apiService.getDashboardData();
      
      console.log('📊 DASHBOARD API - Dados completos:', dashboardData);
      console.log('📊 DASHBOARD API - low_stock_alerts:', (dashboardData as any).low_stock_alerts);
      console.log('📊 DASHBOARD API - Tipo:', typeof (dashboardData as any).low_stock_alerts);
      
      let dashboardAlerts = [];
      const rawDashboardAlerts = (dashboardData as any).low_stock_alerts;
      
      if (Array.isArray(rawDashboardAlerts)) {
        dashboardAlerts = rawDashboardAlerts;
      } else if (typeof rawDashboardAlerts === 'number') {
        console.log('📊 DASHBOARD API retorna apenas a QUANTIDADE:', rawDashboardAlerts);
        dashboardAlerts = []; // Se é só um número, não temos os detalhes dos alertas
      } else {
        console.log('📊 DASHBOARD API - Formato inesperado:', rawDashboardAlerts);
        dashboardAlerts = [];
      }
      
      console.log('📊 DASHBOARD API - Alertas processados:', dashboardAlerts);
      console.log('📊 DASHBOARD API - Quantidade final:', dashboardAlerts.length);
      
      // 2. Buscar alertas de estoque diretamente
      console.log('📦 Buscando alertas de estoque...');
      const stockAlertsResponse = await apiService.getStockAlerts();
      let stockAlerts = [];
      
      if (Array.isArray(stockAlertsResponse)) {
        stockAlerts = stockAlertsResponse;
      } else if (stockAlertsResponse && typeof stockAlertsResponse === 'object' && 'alerts' in stockAlertsResponse) {
        stockAlerts = (stockAlertsResponse as any).alerts;
      }
      
      console.log('📦 STOCK ALERTS API - Alertas encontrados:', stockAlerts);
      console.log('📦 STOCK ALERTS API - Quantidade:', stockAlerts.length);
      
      // 3. Comparar os resultados
      const dashboardProducts = Array.isArray(dashboardAlerts) ? dashboardAlerts.map((alert: any) => alert.product_name) : [];
      const stockProducts = Array.isArray(stockAlerts) ? stockAlerts.map((alert: any) => alert.product_name) : [];
      
      console.log('📊 Produtos no Dashboard:', dashboardProducts);
      console.log('📦 Produtos no Stock:', stockProducts);
      
      const differences = [];
      
      // Se dashboard não retorna array, explicar isso
      if (!Array.isArray((dashboardData as any).low_stock_alerts)) {
        differences.push(`❗ Dashboard API retorna apenas QUANTIDADE (${(dashboardData as any).low_stock_alerts}), não lista de produtos`);
      }
      
      // Produtos só no dashboard
      const onlyInDashboard = dashboardProducts.filter((p: string) => !stockProducts.includes(p));
      if (onlyInDashboard.length > 0) {
        differences.push(`Só no Dashboard: ${onlyInDashboard.join(', ')}`);
      }
      
      // Produtos só no stock
      const onlyInStock = stockProducts.filter((p: string) => !dashboardProducts.includes(p));
      if (onlyInStock.length > 0) {
        differences.push(`Só no Stock: ${onlyInStock.join(', ')}`);
      }
      
      console.log('🔍 DIFERENÇAS ENCONTRADAS:', differences);
      
      setComparison({
        dashboardAlerts,
        stockAlerts,
        differences
      });
      
    } catch (error) {
      console.error('❌ Erro na comparação:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCompare();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p>🔍 Comparando APIs de alertas...</p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p>❌ Erro ao carregar comparação</p>
        <button 
          onClick={fetchAndCompare}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-bold text-lg mb-4">🔍 Debug: Comparação de APIs de Alertas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-green-700">📊 Dashboard API</h4>
          <p>Quantidade: {comparison.dashboardAlerts.length}</p>
          {comparison.dashboardAlerts.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">⚠️ Dashboard retorna apenas quantidade, não lista de produtos</p>
          ) : (
            <ul className="text-sm mt-2">
              {comparison.dashboardAlerts.map((alert: any, index: number) => (
                <li key={index}>
                  {alert.product_name}: {alert.current_stock}/{alert.min_stock}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-blue-700">📦 Stock Alerts API</h4>
          <p>Quantidade: {comparison.stockAlerts.length}</p>
          <ul className="text-sm mt-2">
            {comparison.stockAlerts.map((alert: any, index: number) => (
              <li key={index}>
                {alert.product_name}: {alert.current_stock}/{alert.min_stock}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {comparison.differences.length > 0 && (
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <h4 className="font-semibold text-red-700">🚨 Diferenças Encontradas:</h4>
          <ul className="text-sm mt-2">
            {comparison.differences.map((diff, index) => (
              <li key={index} className="text-red-600">• {diff}</li>
            ))}
          </ul>
        </div>
      )}
      
      {comparison.differences.length === 0 && (
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-green-700">✅ As duas APIs retornam os mesmos alertas!</p>
        </div>
      )}
      
      <button 
        onClick={fetchAndCompare}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        🔄 Comparar novamente
      </button>
    </div>
  );
};

export default AlertDebugger;
