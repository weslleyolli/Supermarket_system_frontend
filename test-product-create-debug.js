#!/usr/bin/env node

// Script para debugar criação de produto na API
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

async function createProductDebug(productData) {
  const token = await login();
  console.log('Enviando payload para /api/v1/products:', productData);
  const response = await fetch(`${API_BASE}/api/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  let responseBody;
  try {
    responseBody = await response.json();
  } catch (e) {
    responseBody = await response.text();
  }
  console.log('Status HTTP:', response.status);
  console.log('Resposta da API:', responseBody);
  if (response.status >= 400) {
    console.error('❌ Erro ao criar produto!');
  } else {
    console.log('✅ Produto criado com sucesso!');
  }
}

// Exemplo de payload (ajuste conforme necessário)
const payload = {
  name: 'Teste debug produto',
  barcode: '1234567890123',
  price: 10,
  cost_price: 7,
  stock_quantity: 5,
  min_stock_level: 2,
  category_id: 2,
  unit: 'UN',
  description: 'Produto de teste para debug'
};

createProductDebug(payload);
