# Sistema oBarateiro - Frontend

## 🚀 Sistema de Gestão Completo para Ponto de Venda

Este projeto implementa um sistema completo de ponto de venda (POS) com autenticação, dashboard analítico e gestão de vendas.

## ✅ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- **Context de Autenticação** com React Context API
- **Tela de Login** elegante e responsiva
- **Proteção de Rotas** automática
- **Gerenciamento de Token** JWT no localStorage
- **Estados de carregamento** e tratamento de erros

### 🛒 Ponto de Venda (POS)
- **Interface de Vendas** otimizada para uso rápido
- **Scanner de Código de Barras** (input manual e automático)
- **Carrinho de Compras** interativo com controle de quantidades
- **Cálculo automático** de totais e descontos
- **Finalização de Vendas** com múltiplos métodos de pagamento

### 📊 Dashboard Analítico
- **KPIs em tempo real**: vendas do dia, produtos vendidos, clientes atendidos, ticket médio
- **Gráficos interativos** de vendas diárias (linha e barras)
- **Alertas de estoque baixo** com notificações visuais
- **Top 5 produtos** mais vendidos com métricas de receita
- **Interface responsiva** com design moderno

## 🛠️ Tecnologias Utilizadas

- **React** 18.2.0 - Biblioteca principal
- **TypeScript** - Tipagem estática completa
- **Vite** 5.0.8 - Build tool e dev server
- **Tailwind CSS** - Framework de estilização
- **Axios** - Cliente HTTP para APIs
- **Lucide React** - Biblioteca de ícones
- **Recharts** - Gráficos interativos

## Como executar o projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm (incluído com Node.js)

### Instalação e execução

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o projeto em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse o projeto:**
   - Abra seu navegador em: `http://localhost:5173`

### Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter ESLint

## Estrutura do projeto

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Loading.tsx
│   │   └── Modal.tsx
│   ├── pos/
│   │   ├── POSInterface.tsx
│   │   ├── ProductScanner.tsx
│   │   ├── Cart.tsx
│   │   └── PaymentModal.tsx
│   ├── inventory/
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   └── StockAlerts.tsx
│   ├── customers/
│   │   ├── CustomerList.tsx
│   │   └── CustomerForm.tsx
│   ├── reports/
│   │   ├── Dashboard.tsx
│   │   └── Charts.tsx
│   └── auth/
│       ├── Login.tsx
│       └── ProtectedRoute.tsx
├── types/
│   ├── api.ts
│   ├── product.ts
│   ├── sale.ts
│   └── user.ts
├── services/
│   ├── api.ts
│   ├── hardware.ts
│   └── auth.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useHardware.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
├── styles.css
└── vite-env.d.ts

public/
└── vite.svg

index.html
vite.config.ts
tailwind.config.js
postcss.config.js
package.json
tsconfig.json
```

## Desenvolvimento

Para começar a desenvolver:

1. Edite os arquivos em `src/`
2. As mudanças serão refletidas automaticamente no navegador (Hot Module Replacement)
3. Use ESLint para manter a qualidade do código: `npm run lint`

## Deploy

Para fazer deploy da aplicação:

1. Execute `npm run build` para gerar os arquivos otimizados
2. Os arquivos serão gerados na pasta `dist/`
3. Faça upload da pasta `dist/` para seu servidor web
