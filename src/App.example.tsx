import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationShell from './components/common/ApplicationShell';
import NotificationCenter from './components/common/NotificationCenter';
import Dashboard from './components/reports/Dashboard';
import POSInterface from './components/pos/POSInterface';

// Componente de Navegação simples
const Navigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'pos', label: 'Ponto de Venda', path: '/pos' },
    { id: 'products', label: 'Produtos', path: '/products' },
    { id: 'reports', label: 'Relatórios', path: '/reports' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Componente de placeholder para páginas não implementadas
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-96 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">Esta página está em desenvolvimento</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ApplicationShell 
        showMonitoring={true}
        title="o'Barateiro - Sistema de Gestão"
      >
        <div className="flex flex-col min-h-screen">
          <Navigation />
          
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POSInterface />} />
              <Route path="/products" element={<PlaceholderPage title="Gestão de Produtos" />} />
              <Route path="/reports" element={<PlaceholderPage title="Relatórios Detalhados" />} />
            </Routes>
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter 
          position="top-right"
          maxNotifications={5}
          defaultDuration={5000}
        />
      </ApplicationShell>
    </Router>
  );
}

export default App;
