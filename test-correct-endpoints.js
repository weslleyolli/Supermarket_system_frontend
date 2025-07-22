#!/usr/bin/env node

// Script para testar os endpoints corretos
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

async function testCorrectEndpoints() {
  console.log('🧪 TESTANDO ENDPOINTS CORRETOS\n');
  
  const token = await login();
  
  // Testar reports/dashboard
  try {
    const dashResponse = await fetch(`${API_BASE}/api/v1/reports/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (dashResponse.ok) {
      const dashData = await dashResponse.json();
      console.log('✅ /api/v1/reports/dashboard:');
      console.log('📊 Campos disponíveis:', Object.keys(dashData));
      
      // Verificar se tem top_products
      if (dashData.top_products) {
        console.log('🏆 Top produtos encontrados:', dashData.top_products);
      } else {
        console.log('❌ top_products não encontrado');
      }
      console.log('');
    }
  } catch (error) {
    console.log('❌ Erro em /api/v1/reports/dashboard:', error);
  }

  // Testar reports/sales
  try {
    const salesReportResponse = await fetch(`${API_BASE}/api/v1/reports/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (salesReportResponse.ok) {
      const salesData = await salesReportResponse.json();
      console.log('✅ /api/v1/reports/sales:');
      console.log('📊 Campos disponíveis:', Object.keys(salesData));
      console.log('📋 Dados:', salesData);
      console.log('');
    }
  } catch (error) {
    console.log('❌ Erro em /api/v1/reports/sales:', error);
  }

  // Testar sales/summary/period com diferentes parâmetros
  const periods = [
    '?days=7',
    '?start_date=2025-07-15&end_date=2025-07-21',
    ''
  ];

  for (const period of periods) {
    try {
      const summaryResponse = await fetch(`${API_BASE}/api/v1/sales/summary/period${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        console.log(`✅ /api/v1/sales/summary/period${period}:`);
        console.log('📊 Campos disponíveis:', Object.keys(summaryData));
        
        // Mostrar dados relevantes
        if (summaryData.daily_sales) {
          console.log('📅 Daily sales encontrado:', summaryData.daily_sales.length, 'dias');
        }
        if (summaryData.top_products) {
          console.log('🏆 Top products encontrado:', summaryData.top_products.length, 'produtos');
        }
        console.log('');
      } else {
        console.log(`❌ /api/v1/sales/summary/period${period}: ${summaryResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro em /api/v1/sales/summary/period${period}:`, error);
    }
  }
}

testCorrectEndpoints();
