import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await apiService.testConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
      
      if (connected) {
        console.log('✅ Conexão com API estabelecida');
      } else {
        console.warn('❌ API não está respondendo');
      }
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Verificar conexão ao carregar
    checkConnection();
    
    // Verificar conexão a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-600';
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    return isConnected ? 'Online' : 'Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {!isConnected && (
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          Tentar novamente
        </button>
      )}
      
      {lastCheck && (
        <span className="text-xs text-gray-500">
          {lastCheck.toLocaleTimeString('pt-BR')}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
