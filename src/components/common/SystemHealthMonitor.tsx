import React, { useState } from 'react';
import { Activity, Wifi, Database, Server, AlertTriangle, X } from 'lucide-react';
import useConnectionStatus from '../../hooks/useConnectionStatus';

interface SystemHealthMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    isChecking, 
    lastCheck, 
    connectionHistory, 
    connectionStats,
    forceReconnect 
  } = useConnectionStatus();

  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const formatTime = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('pt-BR');
  };

  const formatUptime = (percentage: number) => {
    if (percentage >= 95) return { text: 'Excelente', color: 'text-green-600' };
    if (percentage >= 80) return { text: 'Bom', color: 'text-yellow-600' };
    return { text: 'Crítico', color: 'text-red-600' };
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Monitor de Sistema</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(isConnected)}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status da API</p>
                  <p className={`text-lg font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Server className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Uptime</p>
                  <p className={`text-lg font-semibold ${formatUptime(connectionStats.uptime).color}`}>
                    {connectionStats.uptime.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Latência Média</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {connectionStats.averageResponseTime.toFixed(0)}ms
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalhes da Conexão</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Última Verificação</p>
                <p className="font-medium">{formatTime(lastCheck)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Conexão Bem-sucedida</p>
                <p className="font-medium">{formatTime(connectionStats.lastSuccessfulConnection)}</p>
              </div>
            </div>

            {showDetails && (
              <div className="space-y-4">
                {/* Histórico de Conexão */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Histórico Recente</h4>
                  <div className="space-y-2">
                    {connectionHistory.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(entry.status)}`}></div>
                          <span className="text-sm text-gray-600">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${entry.status ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.status ? 'Online' : 'Offline'}
                          </span>
                          {entry.responseTime && (
                            <span className="text-sm text-gray-500">
                              ({entry.responseTime}ms)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico de Status (Representação Visual Simples) */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Status Timeline</h4>
                  <div className="flex space-x-1 h-4">
                    {connectionHistory.slice(-20).map((entry, index) => (
                      <div
                        key={index}
                        className={`flex-1 ${getStatusColor(entry.status)} rounded-sm`}
                        title={`${formatTime(entry.timestamp)}: ${entry.status ? 'Online' : 'Offline'}`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mais Antigo</span>
                    <span>Mais Recente</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex space-x-3">
              <button
                onClick={forceReconnect}
                disabled={isChecking}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wifi className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Verificando...' : 'Testar Conexão'}</span>
              </button>
              
              {!isConnected && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Sistema tentará reconectar automaticamente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
