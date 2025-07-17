// src/components/debug/DebugPanel.tsx
import React, { useState, useEffect } from 'react';
import { Bug, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { debugDashboardAPI, compareDataSources, monitorNetworkRequests } from '../../utils/debugDashboard';
import { apiService } from '../../services/api';

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false, onToggle }) => {
  const [debugResult, setDebugResult] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ativar monitoramento de rede quando o componente montar
    monitorNetworkRequests();
  }, []);

  const runFullDebug = async () => {
    setIsLoading(true);
    
    try {
      console.clear();
      console.log('🚀 INICIANDO DEBUG COMPLETO DO DASHBOARD...');
      
      // 1. Verificar API
      const apiResult = await debugDashboardAPI();
      
      // 2. Comparar dados
      const comparisonResult = await compareDataSources();
      
      // 3. Verificar dados atuais do localStorage
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      // 4. Fazer uma requisição manual para verificar
      const manualTest = await apiService.getDashboardData();
      
      const result = {
        timestamp: new Date().toISOString(),
        apiConnected: !!apiResult,
        hasToken: !!token,
        hasUserData: !!userData,
        dashboardData: manualTest,
        comparison: comparisonResult,
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
      };
      
      setDebugResult(result);
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      const err = error as { message: string; response?: { data: unknown } };
      setDebugResult({
        error: true,
        message: err.message,
        response: err.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificEndpoint = async (endpoint: string) => {
    try {
      console.log(`🔍 Testando endpoint: ${endpoint}`);
      let response;
      
      switch (endpoint) {
        case '/reports/dashboard':
          response = await apiService.getDashboardData();
          break;
        case '/reports/kpis':
          response = await apiService.getKPIsOnly();
          break;
        case '/products':
          response = await apiService.getProducts();
          break;
        case '/customers':
          response = await apiService.getCustomers();
          break;
        default:
          throw new Error('Endpoint não reconhecido');
      }
      
      console.log(`✅ Sucesso:`, response);
      alert(`✅ Endpoint ${endpoint} funcionando!\nDados: ${JSON.stringify(response, null, 2).substring(0, 500)}...`);
    } catch (error) {
      console.error(`❌ Erro em ${endpoint}:`, error);
      const err = error as { response?: { data?: { detail?: string } }; message: string };
      alert(`❌ Erro em ${endpoint}:\n${err.response?.data?.detail || err.message}`);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Abrir Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <Bug className="w-5 h-5 mr-2" />
          Debug Dashboard
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={runFullDebug}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '🔄 Executando...' : '🚀 Debug Completo'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => testSpecificEndpoint('/reports/dashboard')}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            <Database className="w-4 h-4 inline mr-1" />
            Dashboard
          </button>
          
          <button
            onClick={() => testSpecificEndpoint('/reports/kpis')}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            📊 KPIs
          </button>
          
          <button
            onClick={() => testSpecificEndpoint('/products')}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            📦 Produtos
          </button>
          
          <button
            onClick={() => console.log('Current API config:', { baseURL: import.meta.env.VITE_API_URL })}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            ⚙️ Config
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={() => {
              console.clear();
              console.log('🧪 TESTE ESPECÍFICO DE KPIs - Verificando logs detalhados...');
              testSpecificEndpoint('/reports/kpis');
            }}
            className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
          >
            🔍 Debug KPIs (Ver Console)
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={async () => {
              console.clear();
              console.log('📊 TESTANDO DADOS COMPLETOS DO DASHBOARD...');
              try {
                const dashboardData = await apiService.getDashboardData();
                const rawData = dashboardData as unknown as Record<string, unknown>;
                console.log('📈 DADOS COMPLETOS DO DASHBOARD:', rawData);
                
                // Verificar dados que sabemos que existem
                console.log('✅ DADOS DISPONÍVEIS:');
                console.log('  📊 today_sales:', rawData.today_sales);
                console.log('  💰 total_revenue:', rawData.total_revenue);
                console.log('  📦 products_sold:', rawData.products_sold);
                console.log('  � customers_served:', rawData.customers_served);
                console.log('  🎯 average_ticket:', rawData.average_ticket);
                console.log('  ⚠️ low_stock_alerts:', rawData.low_stock_alerts);
                
                // Verificar dados extras descobertos
                console.log('🎁 DADOS EXTRAS DESCOBERTOS:');
                console.log('  � recent_sales:', rawData.recent_sales);
                console.log('  📊 sales_by_period:', rawData.sales_by_period);
                console.log('  🏆 top_products:', rawData.top_products);
                
                // Verificar dados que ainda não existem
                console.log('❌ DADOS NÃO DISPONÍVEIS (ainda):');
                console.log('  📅 daily_sales:', rawData.daily_sales);
                console.log('  🚨 stock_alerts:', rawData.stock_alerts);
                
                const recentSalesCount = Array.isArray(rawData.recent_sales) ? rawData.recent_sales.length : 0;
                const topProductsCount = Array.isArray(rawData.top_products) ? rawData.top_products.length : 0;
                
                alert(`📊 Dashboard Data Analisado!\n\n✅ KPIs: Todos funcionando\n🛒 Vendas recentes: ${recentSalesCount}\n🏆 Top produtos: ${topProductsCount}\n📅 Vendas diárias: Gerando artificialmente\n\nVerifique console para detalhes completos`);
              } catch (error) {
                console.error('❌ Erro ao buscar dados do dashboard:', error);
                alert('❌ Erro ao buscar dados do dashboard');
              }
            }}
            className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
          >
            📊 Debug Dashboard Completo
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={async () => {
              console.clear();
              console.log('🔍 COMPARANDO ENDPOINTS DASHBOARD vs KPIs...');
              try {
                console.log('1️⃣ Testando /reports/dashboard...');
                const dashboardData = await apiService.getDashboardData();
                const dashRaw = dashboardData as unknown as Record<string, unknown>;
                console.log('📊 DASHBOARD DATA:', dashRaw);
                
                console.log('2️⃣ Testando /reports/kpis...');
                const kpisData = await apiService.getKPIsOnly();
                const kpisRaw = kpisData as unknown as Record<string, unknown>;
                console.log('📈 KPIs DATA:', kpisRaw);
                
                console.log('🔍 COMPARAÇÃO DETALHADA:');
                console.log('Dashboard today_sales:', dashRaw.today_sales);
                console.log('KPIs total_sales:', kpisRaw.total_sales);
                console.log('Dashboard total_revenue:', dashRaw.total_revenue);
                console.log('KPIs total_revenue:', kpisRaw.total_revenue);
                console.log('Dashboard products_sold:', dashRaw.products_sold);
                console.log('KPIs total_products:', kpisRaw.total_products);
                
                alert('🔍 Comparação concluída!\nVerifique console para ver diferenças entre endpoints');
              } catch (error) {
                console.error('❌ Erro ao comparar endpoints:', error);
                alert('❌ Erro ao comparar endpoints');
              }
            }}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
          >
            🔍 Comparar Dashboard vs KPIs
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={async () => {
              console.clear();
              console.log('🛒 EXPLORANDO VENDAS RECENTES...');
              try {
                const dashboardData = await apiService.getDashboardData();
                const rawData = dashboardData as unknown as Record<string, unknown>;
                const recentSales = rawData.recent_sales as Array<{id: number, total: number, created_at: string}>;
                
                if (Array.isArray(recentSales) && recentSales.length > 0) {
                  console.log('📊 VENDAS RECENTES ENCONTRADAS:', recentSales.length);
                  recentSales.forEach((sale, index) => {
                    const date = new Date(sale.created_at);
                    console.log(`${index + 1}. Venda #${sale.id}: R$ ${sale.total} - ${date.toLocaleString()}`);
                  });
                  
                  // Calcular estatísticas
                  const totalValue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
                  const avgValue = totalValue / recentSales.length;
                  
                  console.log('\n📈 ESTATÍSTICAS DAS VENDAS RECENTES:');
                  console.log('Total de vendas:', recentSales.length);
                  console.log('Valor total:', `R$ ${totalValue.toFixed(2)}`);
                  console.log('Valor médio:', `R$ ${avgValue.toFixed(2)}`);
                  
                  alert(`🛒 Vendas Recentes Analisadas!\n\n📊 ${recentSales.length} vendas encontradas\n💰 Total: R$ ${totalValue.toFixed(2)}\n🎯 Média: R$ ${avgValue.toFixed(2)}\n\nVerifique console para detalhes completos`);
                } else {
                  console.log('❌ Nenhuma venda recente encontrada');
                  alert('❌ Nenhuma venda recente encontrada');
                }
              } catch (error) {
                console.error('❌ Erro ao buscar vendas recentes:', error);
                alert('❌ Erro ao buscar vendas recentes');
              }
            }}
            className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
          >
            🛒 Explorar Vendas Recentes
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={async () => {
              console.clear();
              console.log('🔍 DEBUG PDV - TESTANDO CÓDIGO DE BARRAS...');
              const testBarcode = '7894900555001'; // Código da água
              
              try {
                console.log(`🧪 Testando código de barras: ${testBarcode}`);
                
                // 1. Testar busca direta por código de barras
                console.log('1️⃣ Testando busca direta por código de barras...');
                try {
                  const product = await apiService.searchByBarcode(testBarcode);
                  console.log('✅ Produto encontrado via searchByBarcode:', product);
                } catch (searchError) {
                  console.log('❌ Erro na busca direta:', searchError);
                  const err = searchError as { response?: { data?: unknown; status?: number } };
                  console.log('📊 Status da resposta:', err.response?.status);
                  console.log('📊 Dados da resposta:', err.response?.data);
                }
                
                // 2. Testar adição ao carrinho
                console.log('2️⃣ Testando adição ao carrinho...');
                try {
                  const cartResult = await apiService.addProductToCart({
                    barcode: testBarcode,
                    quantity: 1
                  });
                  console.log('✅ Produto adicionado ao carrinho:', cartResult);
                } catch (cartError) {
                  console.log('❌ Erro na adição ao carrinho:', cartError);
                  const err = cartError as { response?: { data?: unknown; status?: number } };
                  console.log('📊 Status da resposta:', err.response?.status);
                  console.log('📊 Dados da resposta:', err.response?.data);
                }
                
                // 3. Testar busca geral de produtos para ver estrutura
                console.log('3️⃣ Testando busca geral de produtos...');
                try {
                  const products = await apiService.getProducts({});
                  console.log('📦 Produtos encontrados:', products);
                  if (Array.isArray(products) && products.length > 0) {
                    console.log('🔍 Estrutura do primeiro produto:', products[0]);
                    console.log('📊 Campos disponíveis:', Object.keys(products[0]));
                  }
                } catch (productError) {
                  console.log('❌ Erro na busca de produtos:', productError);
                }
                
                alert(`🔍 Debug PDV concluído!\n\nTestou código: ${testBarcode}\nVerifique console para detalhes completos`);
              } catch (error) {
                console.error('❌ Erro geral no debug PDV:', error);
                alert('❌ Erro no debug PDV');
              }
            }}
            className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
          >
            🔍 Debug PDV - Código Barras
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={async () => {
              console.clear();
              console.log('📦 VERIFICANDO PRODUTOS CADASTRADOS...');
              
              try {
                console.log('1️⃣ Buscando todos os produtos...');
                const products = await apiService.getProducts({});
                console.log(`📊 Total de produtos encontrados: ${products.length}`);
                
                if (products.length === 0) {
                  console.log('❌ NENHUM PRODUTO CADASTRADO!');
                  alert('❌ Nenhum produto cadastrado no sistema!\n\nEste pode ser o motivo do erro.\nCadastre produtos primeiro na aba Inventário.');
                  return;
                }
                
                console.log('✅ Produtos cadastrados:');
                products.forEach((product, index) => {
                  const productData = product as unknown as Record<string, unknown>;
                  console.log(`${index + 1}. ${productData.name} - Código: ${productData.barcode}`);
                });
                
                // Verificar se existe produto com o código da água
                const testBarcode = '7894900555001';
                const waterProduct = products.find((p: unknown) => {
                  const prod = p as Record<string, unknown>;
                  return prod.barcode === testBarcode;
                });
                
                if (waterProduct) {
                  console.log('✅ PRODUTO DA ÁGUA ENCONTRADO:', waterProduct);
                  const prodData = waterProduct as unknown as Record<string, unknown>;
                  alert(`✅ Produto encontrado!\n\nNome: ${prodData.name}\nCódigo: ${testBarcode}\n\nO produto existe no sistema.`);
                } else {
                  console.log('❌ PRODUTO DA ÁGUA NÃO ENCONTRADO');
                  console.log('📋 Códigos de barras disponíveis:');
                  products.forEach((p: unknown) => {
                    const prod = p as Record<string, unknown>;
                    console.log(`  - ${prod.barcode}`);
                  });
                  alert(`❌ Produto com código ${testBarcode} não está cadastrado!\n\nVerifique se:\n1. O código está correto\n2. O produto foi cadastrado\n3. O código foi salvo corretamente`);
                }
                
              } catch (error) {
                console.error('❌ Erro ao verificar produtos:', error);
                alert('❌ Erro ao verificar produtos cadastrados');
              }
            }}
            className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
          >
            📦 Verificar Produtos Cadastrados
          </button>
        </div>

        {debugResult && (
          <div className="bg-gray-100 p-3 rounded text-xs">
            <h4 className="font-bold mb-2">Resultado:</h4>
            {debugResult.error ? (
              <div className="text-red-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Erro: {debugResult.message as string}
              </div>
            ) : (
              <div className="space-y-1">
                <div className={debugResult.apiConnected ? 'text-green-600' : 'text-red-600'}>
                  {debugResult.apiConnected ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <AlertCircle className="w-4 h-4 inline mr-1" />}
                  API: {debugResult.apiConnected ? 'Conectada' : 'Erro'}
                </div>
                
                <div className={debugResult.hasToken ? 'text-green-600' : 'text-red-600'}>
                  🔑 Token: {debugResult.hasToken ? 'Presente' : 'Ausente'}
                </div>
                
                <div>
                  📊 Vendas (qtd): {(debugResult.dashboardData as { today_sales?: number })?.today_sales || 'N/A'}
                </div>
                
                <div>
                  � Receita: R$ {((debugResult.dashboardData as { total_revenue?: number })?.total_revenue || 0).toFixed(2)}
                </div>
                
                <div>
                  �📦 Produtos: {(debugResult.dashboardData as { products_sold?: number })?.products_sold || 'N/A'}
                </div>
                
                <div>
                  👥 Clientes: {(debugResult.dashboardData as { customers_served?: number })?.customers_served || 'N/A'}
                </div>
                
                <div>
                  🌐 Base URL: {debugResult.baseURL as string}
                </div>
                
                <ComparisonResult comparison={debugResult.comparison} />
              </div>
            )}
          </div>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer font-bold">📋 Logs Console</summary>
          <div className="bg-black text-green-400 p-2 rounded mt-1 max-h-32 overflow-y-auto">
            Verifique o console do navegador (F12) para logs detalhados
          </div>
        </details>
      </div>
    </div>
  );
};

// Componente auxiliar para renderizar o resultado da comparação
const ComparisonResult: React.FC<{ comparison: unknown }> = ({ comparison }) => {
  if (!comparison) return null;
  
  const comp = comparison as { isDifferent?: boolean };
  return (
    <div className={comp.isDifferent ? 'text-green-600' : 'text-orange-600'}>
      🎯 Dados: {comp.isDifferent ? 'REAIS' : 'MOCK?'}
    </div>
  );
};
