// Script para testar as duas APIs e comparar os resultados
const API_BASE = 'http://localhost:8000';

async function testDashboardAPI() {
  try {
    console.log('🔍 Testando API do Dashboard...');
    const response = await fetch(`${API_BASE}/api/v1/reports/dashboard`);
    const data = await response.json();
    
    console.log('📊 DASHBOARD API Response:');
    console.log('- low_stock_alerts:', data.low_stock_alerts);
    console.log('- Quantidade:', Array.isArray(data.low_stock_alerts) ? data.low_stock_alerts.length : 0);
    
    if (Array.isArray(data.low_stock_alerts)) {
      console.log('📋 Alertas do Dashboard:');
      data.low_stock_alerts.forEach((alert, index) => {
        console.log(`  ${index + 1}. ${alert.product_name}: ${alert.current_stock}/${alert.min_stock}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro na API do Dashboard:', error);
  }
}

async function testStockAlertsAPI() {
  try {
    console.log('🔍 Testando API de Alertas de Estoque...');
    const response = await fetch(`${API_BASE}/api/v1/reports/stock-alerts`);
    const data = await response.json();
    
    console.log('📦 STOCK ALERTS API Response:');
    console.log('- alerts:', data.alerts);
    console.log('- alerts_count:', data.alerts_count);
    console.log('- Quantidade:', Array.isArray(data.alerts) ? data.alerts.length : 0);
    
    if (Array.isArray(data.alerts)) {
      console.log('📋 Alertas de Estoque:');
      data.alerts.forEach((alert, index) => {
        console.log(`  ${index + 1}. ${alert.product_name}: ${alert.current_stock}/${alert.min_stock}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro na API de Alertas:', error);
  }
}

async function compareAPIs() {
  console.log('🚀 Iniciando comparação de APIs...');
  
  const dashboardData = await testDashboardAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  const stockAlertsData = await testStockAlertsAPI();
  
  console.log('\n' + '🔍 COMPARAÇÃO FINAL:');
  console.log('Dashboard alertas:', dashboardData?.low_stock_alerts?.length || 0);
  console.log('Stock alertas:', stockAlertsData?.alerts?.length || 0);
  
  // Comparar produtos específicos
  const dashboardProducts = (dashboardData?.low_stock_alerts || []).map(a => a.product_name);
  const stockProducts = (stockAlertsData?.alerts || []).map(a => a.product_name);
  
  console.log('\n📊 Produtos no Dashboard:', dashboardProducts);
  console.log('📦 Produtos no Stock:', stockProducts);
  
  // Encontrar diferenças
  const onlyInDashboard = dashboardProducts.filter(p => !stockProducts.includes(p));
  const onlyInStock = stockProducts.filter(p => !dashboardProducts.includes(p));
  
  if (onlyInDashboard.length > 0) {
    console.log('🔴 Só no Dashboard:', onlyInDashboard);
  }
  if (onlyInStock.length > 0) {
    console.log('🔴 Só no Stock:', onlyInStock);
  }
}

// Executar comparação
compareAPIs();
