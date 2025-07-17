import React, { useState, useEffect, useCallback } from 'react';
import { X, WifiOff, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useConnectionStatus from '../../hooks/useConnectionStatus';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // em milissegundos
}

interface NotificationCenterProps {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isConnected, connectionStats } = useConnectionStatus();
  const [lastConnectionState, setLastConnectionState] = useState<boolean | null>(null);

  // Adicionar uma nova notificação
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      autoHide: notification.autoHide ?? true,
      duration: notification.duration ?? defaultDuration
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Auto-hide se configurado
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }, [defaultDuration, maxNotifications]);

  // Remover notificação
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Monitorar mudanças na conexão
  useEffect(() => {
    if (lastConnectionState === null) {
      setLastConnectionState(isConnected);
      return;
    }

    if (lastConnectionState !== isConnected) {
      if (isConnected) {
        // Conexão restaurada
        addNotification({
          type: 'success',
          title: 'Conexão Restaurada',
          message: `API online. Uptime: ${connectionStats.uptime.toFixed(1)}%`,
          autoHide: true,
          duration: 3000
        });
      } else {
        // Conexão perdida
        addNotification({
          type: 'error',
          title: 'Conexão Perdida',
          message: 'API offline. O sistema tentará reconectar automaticamente.',
          autoHide: false
        });
      }
      setLastConnectionState(isConnected);
    }
  }, [isConnected, lastConnectionState, connectionStats.uptime, addNotification]);

  // Monitorar qualidade da conexão
  useEffect(() => {
    if (connectionStats.uptime > 0 && connectionStats.uptime < 80 && isConnected) {
      addNotification({
        type: 'warning',
        title: 'Qualidade de Conexão Baixa',
        message: `Uptime atual: ${connectionStats.uptime.toFixed(1)}%. Verifique sua conexão.`,
        autoHide: true,
        duration: 7000
      });
    }
  }, [connectionStats.uptime, isConnected, addNotification]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <WifiOff className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionStyles()} z-50 space-y-2 max-w-sm w-full`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {notification.title}
              </p>
              <p className="text-sm opacity-90">
                {notification.message}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
