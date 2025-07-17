import React, { useState } from 'react';
import { BarChart3, ShoppingCart, Package, Users, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/auth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import POSInterface from './components/pos/POSInterface';
import Dashboard from './components/reports/Dashboard';
import ProductList from './components/inventory/ProductList';

type AppView = 'pos' | 'dashboard' | 'inventory' | 'customers' | 'settings';

interface NavigationItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: 'pos', label: 'Ponto de Venda', icon: ShoppingCart },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'pos':
        return <POSInterface />;
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <ProductList />;
      case 'customers':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestão de Clientes</h1>
            <p className="text-gray-600">Componente em desenvolvimento...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h1>
            <p className="text-gray-600">Componente em desenvolvimento...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            {import.meta.env.VITE_APP_NAME || 'oBarateiro'}
          </h1>
          <p className="text-sm text-gray-600">Sistema de Gestão</p>
        </div>
        
        <nav className="mt-6 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
