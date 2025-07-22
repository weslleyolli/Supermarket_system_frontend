#!/usr/bin/env node

// Script para analisar OpenAPI e encontrar endpoints de relatórios
const API_BASE = 'http://localhost:8000';

async function analyzeOpenAPI() {
  console.log('📋 ANALISANDO OPENAPI PARA ENCONTRAR ENDPOINTS\n');
  
  try {
    const response = await fetch(`${API_BASE}/openapi.json`);
    const openapi = await response.json();
    
    console.log('🔍 ENDPOINTS DISPONÍVEIS:\n');
    
    const paths = openapi.paths || {};
    const relevantPaths = Object.keys(paths).filter(path => 
      path.includes('sales') || 
      path.includes('reports') || 
      path.includes('dashboard') ||
      path.includes('analytics') ||
      path.includes('stats') ||
      path.includes('top')
    );
    
    if (relevantPaths.length > 0) {
      console.log('📊 ENDPOINTS RELACIONADOS A VENDAS/RELATÓRIOS:');
      relevantPaths.forEach(path => {
        const methods = Object.keys(paths[path]);
        console.log(`📍 ${path} - Métodos: ${methods.join(', ')}`);
        
        methods.forEach(method => {
          const operation = paths[path][method];
          if (operation.summary || operation.description) {
            console.log(`   ${method.toUpperCase()}: ${operation.summary || operation.description}`);
          }
        });
        console.log('');
      });
    } else {
      console.log('❌ Nenhum endpoint específico de relatórios encontrado');
    }
    
    // Listar TODOS os endpoints para referência
    console.log('\n📋 TODOS OS ENDPOINTS DISPONÍVEIS:');
    Object.keys(paths).forEach(path => {
      const methods = Object.keys(paths[path]);
      console.log(`${path} - ${methods.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao analisar OpenAPI:', error);
  }
}

analyzeOpenAPI();
