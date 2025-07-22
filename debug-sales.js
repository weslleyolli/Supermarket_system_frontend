#!/usr/bin/env node

// Script para debugar vendas e produtos mais vendidos
const API_BASE = 'http://localhost:8000';

// Função para fazer login e obter token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login falhou: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Login realizado com sucesso');
    return data.access_token;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return null;
  }
}

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, token, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erro em ${endpoint}:`, error.message);
    return null;
  }
}

// Função principal de debug
async function debugSales() {
  console.log('🔍 INICIANDO DEBUG DE VENDAS E PRODUTOS MAIS VENDIDOS\n');

  // 1. Fazer login
  const token = await login();
  if (!token) {
    console.log('❌ Não foi possível fazer login. Parando execução.');
    return;
  }

  console.log('\n📊 VERIFICANDO ENDPOINTS DISPONÍVEIS:\n');

  // 2. Testar endpoints básicos
  const endpoints = [
    '/api/v1/sales',
    '/api/v1/reports/daily-sales',
    '/api/v1/reports/top-products',
    '/api/v1/products',
    '/health'
  ];

  for (const endpoint of endpoints) {
    const result = await apiRequest(endpoint, token);
    if (result) {
      if (Array.isArray(result)) {
        console.log(`✅ ${endpoint}: ${result.length} itens encontrados`);
      } else {
        console.log(`✅ ${endpoint}: Dados encontrados`, Object.keys(result));
      }
    } else {
      console.log(`❌ ${endpoint}: Não disponível ou erro`);
    }
  }

  console.log('\n🛒 ANALISANDO VENDAS ESPECÍFICAS:\n');

  // 3. Verificar vendas detalhadamente
  const sales = await apiRequest('/api/v1/sales', token);
  if (sales && Array.isArray(sales)) {
    console.log(`📈 Total de vendas no sistema: ${sales.length}`);
    
    if (sales.length > 0) {
      console.log('\n🔍 DETALHES DAS ÚLTIMAS 5 VENDAS:');
      sales.slice(-5).forEach((sale, index) => {
        console.log(`${index + 1}. Venda #${sale.id || 'N/A'}`);
        console.log(`   💰 Valor: R$ ${(sale.total_amount || sale.final_amount || 0).toFixed(2)}`);
        console.log(`   📅 Data: ${sale.created_at || 'N/A'}`);
        console.log(`   📦 Itens: ${sale.total_items || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('📭 Nenhuma venda encontrada no sistema');
    }
  }

  console.log('\n🏆 TESTANDO PRODUTOS MAIS VENDIDOS:\n');

  // 4. Testar produtos mais vendidos com diferentes limites
  for (const limit of [5, 10]) {
    const topProducts = await apiRequest(`/api/v1/reports/top-products?limit=${limit}`, token);
    if (topProducts) {
      console.log(`📊 Top ${limit} produtos mais vendidos: ${Array.isArray(topProducts) ? topProducts.length : 0} encontrados`);
      
      if (Array.isArray(topProducts) && topProducts.length > 0) {
        topProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.product_name || 'Nome não disponível'}`);
          console.log(`   📦 Quantidade vendida: ${product.quantity_sold || 0}`);
          console.log(`   💰 Receita: R$ ${(product.revenue || 0).toFixed(2)}`);
          console.log(`   📂 Categoria: ${product.category_name || 'N/A'}`);
          console.log('');
        });
      }
    }
  }

  console.log('\n📅 TESTANDO VENDAS DIÁRIAS:\n');

  // 5. Testar vendas diárias
  const dailySales = await apiRequest('/api/v1/reports/daily-sales?days=7', token);
  if (dailySales) {
    console.log(`📈 Vendas diárias (últimos 7 dias): ${Array.isArray(dailySales) ? dailySales.length : 0} dias encontrados`);
    
    if (Array.isArray(dailySales) && dailySales.length > 0) {
      dailySales.forEach(day => {
        console.log(`📅 ${day.date}: R$ ${(day.total_sales || 0).toFixed(2)} - ${day.total_transactions || 0} transações`);
      });
    }
  }

  console.log('\n📦 VERIFICANDO PRODUTOS CADASTRADOS:\n');

  // 6. Verificar produtos
  const products = await apiRequest('/api/v1/products', token);
  if (products && Array.isArray(products)) {
    console.log(`📦 Total de produtos cadastrados: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n🔍 PRIMEIROS 5 PRODUTOS:');
      products.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'Nome não disponível'}`);
        console.log(`   💰 Preço: R$ ${(product.price || 0).toFixed(2)}`);
        console.log(`   📊 Estoque: ${product.stock_quantity || product.current_quantity || 0}`);
        console.log(`   📋 Código: ${product.barcode || 'N/A'}`);
        console.log('');
      });
    }
  }

  console.log('\n✅ DEBUG CONCLUÍDO!');
}

// Executar o debug
debugSales().catch(error => {
  console.error('❌ Erro geral no debug:', error);
});
