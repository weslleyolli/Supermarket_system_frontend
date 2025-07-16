import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { DollarSign, Package, Users, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import type { DashboardData, StockAlert } from '../../types';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs mês anterior
          </p>
        )}
      </div>
      <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const {
    data: dashboardData,
    loading,
    error,
    execute: fetchDashboardData
  } = useApi(apiService.getDashboardData, {
    immediate: true,
    onError: (error) => {
      console.error('Erro ao carregar dashboard:', error);
    }
  });

  const handleRefresh = () => {
    fetchDashboardData();
  };

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
          <p className="text-red-700 mt-2">{error.detail}</p>
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

  const data = dashboardData as DashboardData;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do desempenho da loja</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Vendas Hoje"
          value={`R$ ${data?.today_sales?.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2 
          }) || '0,00'}`}
          icon={DollarSign}
          color="text-green-600"
          trend={data?.sales_trend}
        />
        <KPICard
          title="Produtos Vendidos"
          value={data?.products_sold?.toLocaleString('pt-BR') || '0'}
          icon={Package}
          color="text-blue-600"
          trend={data?.products_trend}
        />
        <KPICard
          title="Clientes Atendidos"
          value={data?.customers_served?.toLocaleString('pt-BR') || '0'}
          icon={Users}
          color="text-purple-600"
          trend={data?.customers_trend}
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${data?.average_ticket?.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2 
          }) || '0,00'}`}
          icon={TrendingUp}
          color="text-orange-600"
          trend={data?.ticket_trend}
        />
      </div>

      {/* Low Stock Alerts */}
      {data?.low_stock_alerts && data.low_stock_alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">
              Alertas de Estoque Baixo ({data.low_stock_alerts.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.low_stock_alerts.slice(0, 6).map((alert: StockAlert, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.product_name}</h4>
                    <p className="text-sm text-gray-600">{alert.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-700">
                      {alert.current_stock} / {alert.min_stock}
                    </p>
                    <p className="text-xs text-gray-500">Atual / Mínimo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.low_stock_alerts.length > 6 && (
            <p className="text-sm text-yellow-700 mt-4">
              E mais {data.low_stock_alerts.length - 6} produtos com estoque baixo...
            </p>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vendas dos Últimos 30 Dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.daily_sales || []}>
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
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Vendas'
                ]}
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
              <Line 
                type="monotone" 
                dataKey="total_sales" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top 5 Produtos Mais Vendidos
          </h3>
          <div className="space-y-4">
            {data?.top_products?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.quantity_sold} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">Receita</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">
                Nenhum dado de produtos disponível
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Número de Transações por Dia
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.daily_sales || []}>
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
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              formatter={(value: number) => [value, 'Transações']}
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
  );
};

export default Dashboard;
