#!/usr/bin/env node

// Script para explorar endpoints disponíveis da API
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

async function exploreAPI() {
  console.log('🔍 EXPLORANDO API DISPONÍVEL\n');
  
  const token = await login();
  
  // Testar possíveis endpoints de relatórios
  const possibleEndpoints = [
    '/api/v1/reports',
    '/api/v1/dashboard',
    '/api/v1/analytics',
    '/api/v1/stats',
    '/api/v1/sales/stats',
    '/api/v1/sales/summary',
    '/api/v1/sales/reports',
    '/api/v1/products/top',
    '/api/v1/products/stats',
    '/docs',
    '/openapi.json'
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: Disponível`);
        if (typeof data === 'object' && data !== null) {
          console.log(`   📋 Campos:`, Object.keys(data));
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Erro - ${error.message}`);
    }
  }

  // Verificar se há informações no health check
  try {
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('\n🏥 HEALTH CHECK DETALHADO:');
    console.log(JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Erro no health check');
  }

  // Analisar a venda existente para entender a estrutura
  try {
    const salesResponse = await fetch(`${API_BASE}/api/v1/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sales = await salesResponse.json();
    
    if (sales.length > 0) {
      console.log('\n🔍 ESTRUTURA DA VENDA EXISTENTE:');
      console.log(JSON.stringify(sales[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Erro ao analisar vendas');
  }
}

exploreAPI().catch(console.error);
