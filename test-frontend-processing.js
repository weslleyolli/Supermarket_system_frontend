#!/usr/bin/env node

// Script para testar se o frontend vai processar os dados corretamente
const API_BASE = 'http://localhost:8000';

async function login() {
  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const data = await response.json();
  return data.access_token;
}

async function simulateFrontendProcessing() {
  console.log('🧪 SIMULANDO PROCESSAMENTO DO FRONTEND\n');
  
  const token = await login();
  
  // Buscar dados como o frontend faz
  const response = await fetch(`${API_BASE}/api/v1/reports/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const apiData = await response.json();
  
  console.log('📊 Dados brutos da API:');
  console.log('top_products:', apiData.top_products);
  console.log('');
  
  // Simular o processamento do frontend
  const processedTopProducts = Array.isArray(apiData.top_products) ? apiData.top_products.map((product) => ({
    product_id: product.product_id || 0,
    product_name: product.name || product.product_name || 'Produto sem nome',
    category_name: product.category_name || 'Sem categoria',
    quantity_sold: Number(product.quantity_sold || 0),
    revenue: Number(product.quantity_sold || 0) * Number(product.price || 0),
    profit: Number(product.profit || 0)
  })) : [];
  
  console.log('🏗️ Dados processados pelo frontend:');
  console.log(JSON.stringify(processedTopProducts, null, 2));
  console.log('');
  
  console.log('✅ Resultado final:');
  if (processedTopProducts.length > 0) {
    console.log(`🏆 ${processedTopProducts.length} produto(s) encontrado(s):`);
    processedTopProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.product_name}`);
      console.log(`   📦 Quantidade: ${product.quantity_sold} unidades`);
      console.log(`   💰 Receita: R$ ${product.revenue.toFixed(2)}`);
      console.log('');
    });
  } else {
    console.log('❌ Nenhum produto será exibido no frontend');
  }
}

simulateFrontendProcessing();
