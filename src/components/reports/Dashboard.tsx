import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import { 
  RefreshCw, 
  Download, 
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { DebugPanel } from '../debug/DebugPanel';
import { addDebugToDashboard } from '../../utils/debugDashboard';

// Adicionar debug tools ao window em desenvolvimento
if (import.meta.env.DEV) {
  addDebugToDashboard();
}

// Componente de KPI Card
const KPICard = ({ title, value, icon: Icon, trend, color, format = 'number' }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color: string;
  format?: string;
}) => {
  const formatValue = (val: number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return `R$ ${numVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      default:
        return numVal.toLocaleString('pt-BR');
    }
  };

  const getTrendColor = (trendValue?: number) => {
    if (!trendValue) return 'text-gray-500';
    return trendValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const TrendIcon = trend && trend >= 0 ? TrendingUp : TrendingUp;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatValue(value)}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 ${getTrendColor(trend)}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

// Componente de Alertas de Estoque
const StockAlerts = ({ alerts, maxItems = 5 }: {
  alerts: Array<{product_name: string; current_stock: number; min_stock: number}>;
  maxItems?: number;
}) => {
  const getAlertConfig = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          label: 'Crítico'
        };
      case 'low':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800',
          label: 'Baixo'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-800',
          label: 'OK'
        };
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Alertas de Estoque</h3>
        </div>
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-medium">Todos os produtos com estoque adequado!</p>
        </div>
      </div>
    );
  }

  const displayAlerts = alerts.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Alertas de Estoque ({alerts.length})
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {displayAlerts.map((alert: {product_name: string; current_stock: number; min_stock: number}, index: number) => {
          const stockPercentage = (alert.current_stock / alert.min_stock) * 100;
          const status = stockPercentage <= 50 ? 'critical' : stockPercentage <= 75 ? 'warning' : 'low';
          const config = getAlertConfig(status);

          return (
            <div
              key={index}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className={`font-medium ${config.textColor}`}>
                    {alert.product_name}
                  </h4>
                  <p className="text-sm text-gray-600">Estoque baixo</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${config.textColor}`}>
                    {alert.current_stock} / {alert.min_stock}
                  </div>
                  <div className="text-xs text-gray-500">Atual / Mínimo</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    status === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Usar o hook useDashboard com auto-refresh
  const {
    dashboardData,
    loading,
    error,
    lastUpdated,
    refreshData
  } = useDashboard({
    autoRefresh: true,
    refreshInterval: 30000 // 30 segundos
  });

  const handleRefresh = () => {
    refreshData();
  };

  const handleExport = (format: string) => {
    if (!dashboardData) {
      alert('Nenhum dado disponível para exportar');
      return;
    }
    
    // 🔧 SIMULAR EXPORTAÇÃO
    setTimeout(() => {
      const transactionsCount = dashboardData.kpis.today_transactions || 0;
      const totalSales = dashboardData.kpis.today_sales || 0;
      alert(`✅ Relatório ${format.toUpperCase()} gerado com sucesso!\n📊 Dados de ${transactionsCount} transações\n💰 Total: R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }, 1000);
  };

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não há dados ainda
  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Nenhum dado disponível no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Gerencial</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Última atualização: {lastUpdated?.toLocaleTimeString('pt-BR') || 'Nunca'}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              !error 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {!error ? '📊 Dados Reais' : '📊 Demo'}
            </span>
            {error && (
              <span className="text-yellow-600 text-xs">⚠️ API não disponível - usando dados de demonstração</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Hoje</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Vendas Hoje"
          value={dashboardData.kpis.today_sales}
          icon={DollarSign}
          trend={dashboardData.kpis.sales_trend}
          color="text-green-600"
          format="currency"
        />
        
        <KPICard
          title="Transações"
          value={dashboardData.kpis.today_transactions}
          icon={ShoppingCart}
          trend={dashboardData.kpis.transactions_trend}
          color="text-blue-600"
        />
        
        <KPICard
          title="Produtos Vendidos"
          value={dashboardData.kpis.products_sold}
          icon={Package}
          trend={dashboardData.kpis.products_trend}
          color="text-purple-600"
        />
        
        <KPICard
          title="Clientes Atendidos"
          value={dashboardData.kpis.customers_served}
          icon={Users}
          trend={dashboardData.kpis.customers_trend}
          color="text-orange-600"
        />
        
        <KPICard
          title="Ticket Médio"
          value={dashboardData.kpis.average_ticket}
          icon={TrendingUp}
          trend={dashboardData.kpis.ticket_trend}
          color="text-indigo-600"
          format="currency"
        />
      </div>

      {/* Row 1: Vendas + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas dos Últimos Dias */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas dos Últimos Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.daily_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('pt-BR');
                }}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total_sales" 
                stroke="#4f46e5" 
                fill="#4f46e5"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alertas de Estoque */}
        <div>
          <StockAlerts alerts={dashboardData.stock_alerts?.map(alert => ({
            product_name: alert.product_name,
            current_stock: alert.current_stock,
            min_stock: alert.min_stock
          })) || []} />
        </div>
      </div>

      {/* Row 2: Top Produtos + Análise por Hora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Produtos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Produtos Mais Vendidos</h3>
          <div className="space-y-4">
            {(dashboardData.top_products || []).map((product, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.quantity_sold} unidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-green-600">
                    Receita
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transações por Dia */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transações por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.daily_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value) => [value, 'Transações']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('pt-BR');
                }}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="transactions" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
      
      {/* Debug Panel (apenas em desenvolvimento) */}
      {import.meta.env.DEV && (
        <DebugPanel 
          isVisible={showDebugPanel}
          onToggle={() => setShowDebugPanel(!showDebugPanel)}
        />
      )}
    </>
  );
};

export default Dashboard;
