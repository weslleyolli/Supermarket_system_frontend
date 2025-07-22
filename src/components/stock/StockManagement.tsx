import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Truck,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useStock, type StockProduct, type StockMovement, type StockAlert, type Supplier } from '../../hooks/useStock';
import { apiService } from '../../services/api';
import { ProductFormModal } from '../inventory/ProductFormModal';

// Componente principal
const StockManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'movements' | 'alerts' | 'suppliers'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);

  // Usa o hook useStock para gerenciar dados
  const {
    products,
    movements,
    alerts,
    suppliers,
    summary,
    loading,
    error,
    createStockEntry,
    createStockAdjustment,
    exportStockData,
    refreshData,
    clearError
  } = useStock();

  // Componente de KPI Card
  const KPICard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }> = ({ title, value, icon, color, change, changeType = 'neutral' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {changeType === 'positive' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               changeType === 'negative' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
              {change}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Componente de Status Badge
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'ok':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'OK' };
        case 'low':
          return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Baixo' };
        case 'critical':
          return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Crítico' };
        case 'out':
          return { color: 'bg-gray-100 text-gray-800', icon: Minus, text: 'Zerado' };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'N/A' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Produtos"
          value={products.length}
          icon={<Package className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <KPICard
          title="Alertas Críticos"
          value={alerts.filter((a: any) => a.alert_level === 'critical').length}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="bg-red-100"
          change="+2 hoje"
          changeType="negative"
        />
        <KPICard
          title="Valor do Estoque"
          value={`R$ ${summary.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<BarChart3 className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          change="+5.2%"
          changeType="positive"
        />
        <KPICard
          title="Giro de Estoque"
          value="2.1x"
          icon={<RefreshCw className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          change="Mensal"
          changeType="neutral"
        />
      </div>

      {/* Alertas Críticos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Alertas Críticos de Estoque ({alerts.length})
          </h3>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver Todos
          </button>
        </div>
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{alert.product_name}</p>
                  <p className="text-sm text-gray-600">
                    Estoque: {alert.current_quantity} / Mínimo: {alert.min_stock}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status="critical" />
                {alert.days_without_stock && (
                  <p className="text-xs text-red-600 mt-1">
                    {alert.days_without_stock} dias restantes
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowEntryModal(true)}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Entrada de Estoque</span>
        </button>
        <button
          onClick={typeof handleOpenProductModal === 'function' ? handleOpenProductModal : undefined}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar novo produto</span>
        </button>
        <button
          onClick={() => setShowAdjustmentModal(true)}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <Minus className="w-5 h-5" />
          <span>Remover do Estoque</span>
        </button>
      </div>
    </div>
  );

  // Estado global do modal de produto
  const [showProductModal, setShowProductModal] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [productModalRefresh, setProductModalRefresh] = useState(0);

  // Função global para abrir modal de produto
  const fetchProductCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setProductCategories(categoriesData);
    } catch (err) {
      setProductCategories([]);
    }
  };
  const handleOpenProductModal = async () => {
    await fetchProductCategories();
    setShowProductModal(true);
  };
  const handleProductModalSave = () => {
    setShowProductModal(false);
    setProductModalRefresh((v) => v + 1);
    if (typeof refreshData === 'function') refreshData();
  };

  // Products Tab como função nomeada
  function ProductsTab() {
    const filteredProducts = products.filter((product: any) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode || '').includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || product.stock_status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        {/* Filtros e botão novo produto */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="ok">OK</option>
            <option value="low">Estoque Baixo</option>
            <option value="critical">Crítico</option>
            <option value="out">Zerado</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center" onClick={handleOpenProductModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </button>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.barcode}</div>
                        <div className="text-sm text-gray-500">{product.category_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{product.quantity} unidades</div>
                        <div className="text-gray-500">Mín: {product.min_stock}</div>
                        {product.reorder_point && (
                          <div className="text-gray-500">Reposição: {product.reorder_point}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={product.stock_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>R$ {(product.sale_price || 0).toFixed(2)}</div>
                      {product.unit_cost && (
                        <div className="text-gray-500">Custo: R$ {(product.unit_cost || 0).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEntryModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Entrada de Estoque"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowAdjustmentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ajustar Estoque"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de cadastro de produto */}
        {/* O modal é global, não precisa duplicar aqui */}
      </div>
    );
  }

  // Movements Tab
  const MovementsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Movimentações de Estoque
          </h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement: any) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(movement.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{movement.product_name}</div>
                    {movement.supplier_name && (
                      <div className="text-sm text-gray-500">{movement.supplier_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      movement.movement_type === 'entrada' ? 'bg-green-100 text-green-800' :
                      movement.movement_type === 'saida' ? 'bg-red-100 text-red-800' :
                      movement.movement_type === 'ajuste' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {movement.movement_type === 'entrada' ? <Plus className="w-3 h-3 mr-1" /> :
                       movement.movement_type === 'saida' ? <Minus className="w-3 h-3 mr-1" /> :
                       <Settings className="w-3 h-3 mr-1" />}
                      {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.quantity}
                    {movement.unit_cost && (
                      <div className="text-gray-500">R$ {(movement.unit_cost || 0).toFixed(2)}/un</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.previous_quantity} → {movement.new_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Alerts Tab
  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Estoque ({alerts.length})
        </h3>
        <div className="space-y-4">
          {alerts.map((alert: any) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${
              alert.alert_level === 'critical' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className={`w-5 h-5 mr-3 ${
                    alert.alert_level === 'critical' ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      Estoque atual: {alert.current_quantity} | Estoque mínimo: {alert.min_stock}
                    </p>
                    {alert.days_without_stock && (
                      <p className="text-sm text-red-600">
                        Estimativa: {alert.days_without_stock} dias até acabar
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const product = products.find((p: any) => p.id === alert.product_id);
                      if (product) {
                        setSelectedProduct(product);
                        setShowEntryModal(true);
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Repor Estoque
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Ver Produto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Suppliers Tab
  const SuppliersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Fornecedores
          </h3>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ativo
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {supplier.contact_person && <p>Contato: {supplier.contact_person}</p>}
                {supplier.phone && <p>Telefone: {supplier.phone}</p>}
                {supplier.email && <p>Email: {supplier.email}</p>}
                <p>Produtos: {supplier.products_count}</p>
                {supplier.last_purchase && <p>Última compra: {supplier.last_purchase}</p>}
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="text-blue-600 hover:text-blue-900 text-sm">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900 text-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900 text-sm">
                  <Truck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modal de Entrada de Estoque
  const EntryModal = () => {
    const [barcode, setBarcode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [reason, setReason] = useState('Reposição de estoque');
    const [notes, setNotes] = useState('');
    const [barcodeError, setBarcodeError] = useState('');
    // Buscar produto pelo código de barras
    const handleBarcodeSearch = () => {
      if (!barcode) return;
      const found = products.find(p => p.barcode === barcode);
      if (found) {
        setSelectedProduct(found);
        setBarcodeError('');
      } else {
        setSelectedProduct(null);
        setBarcodeError('Produto não encontrado!');
      }
    };

    if (!showEntryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            Entrada de Estoque
            {selectedProduct && (
              <span className="text-sm font-normal text-gray-600 block">
                {selectedProduct.name}
              </span>
            )}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleBarcodeSearch(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Digite ou escaneie o código de barras"
              />
              <button
                type="button"
                onClick={handleBarcodeSearch}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >Buscar</button>
            </div>
            {barcodeError && <div className="text-red-600 text-xs mt-1">{barcodeError}</div>}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 50"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Unitário (R$)
              </label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 18.50"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowEntryModal(false);
                setSelectedProduct(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                try {
                  const result = await createStockEntry({
                    product_id: selectedProduct?.id || 0,
                    quantity: parseInt(quantity),
                    unit_cost: parseFloat(unitCost),
                    reason,
                    notes
                  });
                  if (result.success) {
                    setShowEntryModal(false);
                    setSelectedProduct(null);
                    setBarcode('');
                    setBarcodeError('');
                    setQuantity('');
                    setUnitCost('');
                    setReason('Reposição de estoque');
                    setNotes('');
                  }
                } catch (error) {
                  console.error('Erro ao registrar entrada:', error);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirmar Entrada
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Ajuste de Estoque
  const AdjustmentModal = () => {
    const [newQuantity, setNewQuantity] = useState('');
    const [reason, setReason] = useState('Ajuste de inventário');
    const [notes, setNotes] = useState('');

    if (!showAdjustmentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            Ajuste de Estoque
                    setBarcode('');
                    setBarcodeError('');
            {selectedProduct && (
              <span className="text-sm font-normal text-gray-600 block">
                {selectedProduct.name} - Atual: {selectedProduct.quantity}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Quantidade
              </label>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`Atual: ${selectedProduct?.quantity || 0}`}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAdjustmentModal(false);
                setSelectedProduct(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                try {
                  const result = await createStockAdjustment({
                    product_id: selectedProduct?.id || 0,
                    new_quantity: parseInt(newQuantity),
                    reason,
                    notes
                  });
                  
                  if (result.success) {
                    setShowAdjustmentModal(false);
                    setSelectedProduct(null);
                    setNewQuantity('');
                    setReason('Ajuste de inventário');
                    setNotes('');
                  }
                } catch (error) {
                  console.error('Erro ao registrar ajuste:', error);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirmar Ajuste
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Gestão de Estoque
              </h1>
              <p className="text-sm text-gray-600">
                Controle completo do seu estoque
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Relatório
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <nav className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'products', label: 'Produtos', icon: Package },
              { id: 'movements', label: 'Movimentações', icon: RefreshCw },
              { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
              { id: 'suppliers', label: 'Fornecedores', icon: Truck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'movements' && <MovementsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'suppliers' && <SuppliersTab />}
      </div>

      {/* Modals */}
      <EntryModal />
      <AdjustmentModal />
      {showProductModal && (
        <ProductFormModal
          product={null}
          categories={productCategories}
          onClose={() => setShowProductModal(false)}
          onSave={handleProductModalSave}
        />
      )}
    </div>
  );
};

export default StockManagement;
