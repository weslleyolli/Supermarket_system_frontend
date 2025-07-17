import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import SystemHealthMonitor from './SystemHealthMonitor';
import useConnectionStatus from '../../hooks/useConnectionStatus';

interface ApplicationShellProps {
  children: React.ReactNode;
  showMonitoring?: boolean;
  title?: string;
}

export const ApplicationShell: React.FC<ApplicationShellProps> = ({ 
  children, 
  showMonitoring = true,
  title = "o'Barateiro - Sistema de Gestão" 
}) => {
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  const { isConnected, connectionStats } = useConnectionStatus({
    checkInterval: 30000, // 30 segundos
    retryOnFailure: true,
    retryDelay: 5000 // 5 segundos
  });

  const getConnectionQuality = () => {
    if (connectionStats.uptime >= 95) return 'excellent';
    if (connectionStats.uptime >= 80) return 'good';
    return 'poor';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Status */}
      {showMonitoring && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo e Título */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                </div>
              </div>

              {/* Status e Controles */}
              <div className="flex items-center space-x-4">
                {/* Mini Status de Conexão */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    API {isConnected ? 'Online' : 'Offline'}
                  </span>
                  {connectionStats.uptime > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getConnectionQuality() === 'excellent' ? 'bg-green-100 text-green-800' :
                      getConnectionQuality() === 'good' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {connectionStats.uptime.toFixed(0)}% uptime
                    </span>
                  )}
                </div>

                {/* Botão de Monitor de Sistema */}
                <button
                  onClick={() => setShowHealthMonitor(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Monitor de Sistema"
                >
                  <Activity className="w-5 h-5" />
                </button>

                {/* Status de Conexão Completo */}
                <ConnectionStatus />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Modal de Health Monitor */}
      <SystemHealthMonitor 
        isOpen={showHealthMonitor}
        onClose={() => setShowHealthMonitor(false)}
      />

      {/* Footer com Informações de Status (opcional) */}
      {showMonitoring && (
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>© 2024 o'Barateiro Sistema</span>
                <span>•</span>
                <span>Versão 1.0.0</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Latência: {connectionStats.averageResponseTime.toFixed(0)}ms</span>
                <span>•</span>
                <span>
                  Última verificação: {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ApplicationShell;
