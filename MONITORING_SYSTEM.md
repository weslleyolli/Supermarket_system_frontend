# Sistema de Monitoramento e Conectividade - o'Barateiro

Este documento descreve o sistema completo de monitoramento de conectividade e notificações implementado no projeto o'Barateiro.

## 📋 Visão Geral

O sistema de monitoramento é composto por varios componentes que trabalham em conjunto para garantir uma experiência de usuário robusta, com monitoramento em tempo real da conectividade da API e notificações automáticas.

## 🏗️ Arquitetura dos Componentes

### 1. **useConnectionStatus** Hook
**Arquivo:** `src/hooks/useConnectionStatus.ts`

Hook personalizado que gerencia o status da conexão com a API.

**Funcionalidades:**
- ✅ Verificação automática da conexão (intervalo configurável)
- ✅ Retry automático em caso de falha
- ✅ Histórico de conexões (últimos 10 checks)
- ✅ Cálculo de estatísticas (uptime, latência média)
- ✅ Forçar verificação manual

**Configurações:**
```typescript
const { isConnected, connectionStats, forceReconnect } = useConnectionStatus({
  checkInterval: 30000,    // 30 segundos
  retryOnFailure: true,
  retryDelay: 5000        // 5 segundos
});
```

### 2. **ConnectionStatus** Component
**Arquivo:** `src/components/common/ConnectionStatus.tsx`

Componente visual compacto que exibe o status da conexão.

**Funcionalidades:**
- 🟢 Indicador visual de status (Online/Offline)
- 🔄 Ícone de loading durante verificações
- 🔧 Botão de retry manual
- 📊 Informações de latência

### 3. **SystemHealthMonitor** Component
**Arquivo:** `src/components/common/SystemHealthMonitor.tsx`

Modal completo para monitoramento detalhado do sistema.

**Funcionalidades:**
- 📈 Dashboard completo de status
- 📊 Estatísticas detalhadas (Uptime, Latência)
- 📋 Histórico de conexões
- 📉 Timeline visual de status
- 🔧 Ações de manutenção

### 4. **NotificationCenter** Component
**Arquivo:** `src/components/common/NotificationCenter.tsx`

Sistema de notificações automáticas baseado no status da conexão.

**Funcionalidades:**
- 🔔 Notificações automáticas de mudanças de status
- ⚠️ Alertas de qualidade de conexão baixa
- ⏰ Auto-hide configurável
- 📍 Posicionamento flexível
- 🎨 Diferentes tipos de notificação

### 5. **ApplicationShell** Component
**Arquivo:** `src/components/common/ApplicationShell.tsx`

Wrapper principal da aplicação que integra todos os componentes de monitoramento.

**Funcionalidades:**
- 🎯 Header com status integrado
- 📊 Mini-indicadores de status
- 🔧 Acesso rápido ao monitor de sistema
- 📄 Footer com informações detalhadas

## 🚀 Como Usar

### Implementação Básica

```typescript
import ApplicationShell from './components/common/ApplicationShell';
import NotificationCenter from './components/common/NotificationCenter';

function App() {
  return (
    <ApplicationShell showMonitoring={true}>
      <YourMainContent />
      
      <NotificationCenter 
        position="top-right"
        maxNotifications={5}
        defaultDuration={5000}
      />
    </ApplicationShell>
  );
}
```

### Uso Individual dos Componentes

```typescript
// Apenas o hook
import useConnectionStatus from './hooks/useConnectionStatus';

const MyComponent = () => {
  const { isConnected, connectionStats } = useConnectionStatus();
  
  return (
    <div>
      Status: {isConnected ? 'Online' : 'Offline'}
      Uptime: {connectionStats.uptime.toFixed(1)}%
    </div>
  );
};

// Componente de status standalone
import ConnectionStatus from './components/common/ConnectionStatus';

const Header = () => (
  <header>
    <h1>Minha App</h1>
    <ConnectionStatus />
  </header>
);
```

## ⚙️ Configurações

### Intervalos de Verificação
```typescript
const connectionOptions = {
  checkInterval: 30000,     // Verificação a cada 30 segundos
  retryOnFailure: true,     // Retry automático
  retryDelay: 5000         // Aguardar 5 segundos antes do retry
};
```

### Posições do NotificationCenter
- `top-right` (padrão)
- `top-left`
- `bottom-right`  
- `bottom-left`

### Tipos de Notificação
- `success` - Conexão restaurada
- `error` - Conexão perdida
- `warning` - Qualidade baixa
- `info` - Informações gerais

## 🎨 Customização Visual

### Classes CSS Disponíveis
```css
/* Status indicators */
.bg-green-500  /* Online */
.bg-red-500    /* Offline */
.bg-yellow-500 /* Warning */

/* Notification types */
.bg-green-50.border-green-200   /* Success */
.bg-red-50.border-red-200       /* Error */
.bg-yellow-50.border-yellow-200 /* Warning */
.bg-blue-50.border-blue-200     /* Info */
```

### Animações
- `animate-spin` - Loading indicator
- `animate-slide-in-right` - Notification entrance
- Transições suaves em hover states

## 📊 Estatísticas Disponíveis

### ConnectionStats Interface
```typescript
interface ConnectionStats {
  uptime: number;                    // Porcentagem de uptime
  averageResponseTime: number;       // Latência média em ms
  lastSuccessfulConnection: Date;    // Última conexão bem-sucedida
}
```

### Histórico de Conexões
```typescript
interface ConnectionHistory {
  timestamp: Date;
  status: boolean;
  responseTime?: number;
}
```

## 🛠️ Dependências

### React Hooks Utilizados
- `useState` - Gerenciamento de estado
- `useEffect` - Efeitos e intervalos
- `useCallback` - Otimização de performance

### Ícones (Lucide React)
- `Wifi`, `WifiOff` - Status de conexão
- `RefreshCw` - Atualização/Retry
- `Activity` - Monitor de sistema
- `AlertTriangle` - Avisos
- `CheckCircle` - Sucesso
- `X` - Fechar

### APIs Necessárias
- `apiService.testConnection()` - Método para testar conectividade

## 🔧 Troubleshooting

### Problemas Comuns

1. **Hook não funciona**
   - Verifique se `apiService.testConnection()` está implementado
   - Confirme se o método retorna `Promise<boolean>`

2. **Notificações não aparecem**
   - Verifique se `NotificationCenter` está renderizado
   - Confirme a posição (z-index pode estar sendo sobreposto)

3. **Performance issues**
   - Ajuste o `checkInterval` para um valor maior
   - Reduza `maxNotifications`

### Debug Mode
```typescript
// Ativar logs detalhados
const { isConnected } = useConnectionStatus({
  checkInterval: 10000 // Verificação mais frequente para debug
});
```

## 📈 Métricas e Monitoramento

### Logs Console
- `✅ API Online (XXXms)` - Conexão bem-sucedida
- `❌ API Offline` - Falha na conexão
- `🔄 Tentando reconectar automaticamente...` - Retry automático

### Indicadores Visuais
- **Verde**: Conexão estável (>95% uptime)
- **Amarelo**: Conexão instável (80-95% uptime)
- **Vermelho**: Conexão crítica (<80% uptime)

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] Persistência do histórico no localStorage
- [ ] Integração com analytics
- [ ] Notificações push do navegador
- [ ] Dashboard de métricas em tempo real
- [ ] Configuração de alertas personalizados
- [ ] Integração com sistemas de monitoramento externos

### Extensões Possíveis
- [ ] Monitoramento de performance
- [ ] Status de diferentes microserviços
- [ ] Métricas de uso da aplicação
- [ ] Sistema de logs centralizado

---

*Documentação atualizada em: Dezembro 2024*
*Versão do Sistema: 1.0.0*
