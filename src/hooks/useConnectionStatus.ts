import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface UseConnectionStatusOptions {
  checkInterval?: number; // em milissegundos, padrão 30 segundos
  retryOnFailure?: boolean;
  retryDelay?: number; // em milissegundos, padrão 5 segundos
}

export const useConnectionStatus = (options: UseConnectionStatusOptions = {}) => {
  const { 
    checkInterval = 30000, 
    retryOnFailure = true, 
    retryDelay = 5000 
  } = options;

  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: Date;
    status: boolean;
    responseTime?: number;
  }>>([]);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const connected = await apiService.testConnection();
      const responseTime = Date.now() - startTime;
      
      setIsConnected(connected);
      setLastCheck(new Date());
      
      // Adicionar ao histórico
      setConnectionHistory(prev => [
        ...prev.slice(-9), // Manter apenas os últimos 10 checks
        {
          timestamp: new Date(),
          status: connected,
          responseTime
        }
      ]);
      
      if (connected) {
        console.log(`✅ API Online (${responseTime}ms)`);
      } else {
        console.warn('❌ API Offline');
      }
      
      return connected;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Erro ao testar conexão:', error);
      
      setIsConnected(false);
      setLastCheck(new Date());
      
      // Adicionar erro ao histórico
      setConnectionHistory(prev => [
        ...prev.slice(-9),
        {
          timestamp: new Date(),
          status: false,
          responseTime
        }
      ]);
      
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const forceReconnect = useCallback(async () => {
    if (isChecking) return false;
    return await checkConnection();
  }, [checkConnection, isChecking]);

  useEffect(() => {
    // Verificar conexão ao carregar
    checkConnection();
    
    // Configurar verificação periódica
    const interval = setInterval(() => {
      checkConnection();
    }, checkInterval);
    
    return () => clearInterval(interval);
  }, [checkConnection, checkInterval]);

  // Auto-retry quando a conexão falha
  useEffect(() => {
    if (!isConnected && retryOnFailure && !isChecking) {
      const retryTimer = setTimeout(() => {
        console.log('🔄 Tentando reconectar automaticamente...');
        checkConnection();
      }, retryDelay);

      return () => clearTimeout(retryTimer);
    }
  }, [isConnected, retryOnFailure, retryDelay, isChecking, checkConnection]);

  // Calcular estatísticas de conexão
  const connectionStats = {
    uptime: connectionHistory.length > 0 
      ? (connectionHistory.filter(h => h.status).length / connectionHistory.length) * 100 
      : 100,
    averageResponseTime: connectionHistory.length > 0
      ? connectionHistory
          .filter(h => h.responseTime)
          .reduce((acc, h) => acc + (h.responseTime || 0), 0) / connectionHistory.filter(h => h.responseTime).length
      : 0,
    lastSuccessfulConnection: connectionHistory
      .slice()
      .reverse()
      .find(h => h.status)?.timestamp || null
  };

  return {
    isConnected,
    isChecking,
    lastCheck,
    connectionHistory,
    connectionStats,
    checkConnection,
    forceReconnect
  };
};

export default useConnectionStatus;
