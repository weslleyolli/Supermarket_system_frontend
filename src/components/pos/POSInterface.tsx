import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Scan, DollarSign, Trash2, Plus, Minus } from 'lucide-react';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import type { Cart, Product, CreateSaleRequest, Customer } from '../../types';

const POSInterface: React.FC = () => {
  const [cart, setCart] = useState<Cart[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [total, setTotal] = useState(0);

  // API hooks
  const { 
    loading: scanLoading, 
    execute: scanProduct 
  } = useApi(apiService.scanBarcode);

  const [saleLoading, setSaleLoading] = useState(false);

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = item.discount || 0;
      return sum + (itemTotal - discount);
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      const cartItem: Cart = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost_price: product.cost_price,
        category: product.category,
        brand: product.brand,
        description: product.description,
        unit: product.unit,
        weight: product.weight,
        active: product.active,
        created_at: product.created_at,
        updated_at: product.updated_at,
        quantity: 1,
      };
      
      return [...prev, cartItem];
    });
  }, []);

  const handleBarcodeScan = useCallback(async () => {
    if (!currentBarcode.trim()) return;

    try {
      const result = await scanProduct({ barcode: currentBarcode });
      if (result?.success && result.product) {
        addToCart(result.product);
        setCurrentBarcode('');
      }
    } catch (error) {
      console.error('Erro ao escanear:', error);
    }
  }, [currentBarcode, scanProduct, addToCart]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [removeFromCart]);

  const handleSaleSuccess = useCallback((sale: unknown) => {
    // Print receipt
    const saleData = sale as { id: number };
    apiService.printReceipt(saleData.id);
    
    // Clear cart
    setCart([]);
    setCustomer(null);
    setCurrentBarcode('');
    
    alert('Venda realizada com sucesso!');
  }, []);

  const handlePayment = useCallback(async () => {
    if (cart.length === 0) return;

    const saleData: CreateSaleRequest = {
      customer_id: customer?.id,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
      })),
      payment_method: 'cash', // Would be selected by user
      discount_total: cart.reduce((sum, item) => sum + (item.discount || 0), 0),
    };

    try {
      setSaleLoading(true);
      const sale = await apiService.createSale(saleData);
      handleSaleSuccess(sale);
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      alert(`Erro ao processar venda: ${error}`);
    } finally {
      setSaleLoading(false);
    }
  }, [cart, customer, handleSaleSuccess]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomer(null);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Area */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Ponto de Venda</h2>
          
          {/* Barcode Scanner */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              placeholder="Digite o código de barras..."
              value={currentBarcode}
              onChange={(e) => setCurrentBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleBarcodeScan}
              disabled={scanLoading || !currentBarcode.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Scan className="h-5 w-5" />
              <span>{scanLoading ? 'Escaneando...' : 'Escanear'}</span>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Itens do Carrinho</h3>
          </div>
          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-sm text-gray-400">Escaneie um produto para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-sm font-medium text-gray-900">
                        R$ {item.price.toFixed(2)} / {item.unit}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="font-medium w-12 text-center bg-gray-100 py-1 px-2 rounded">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right ml-6 min-w-[100px]">
                      <p className="font-bold text-lg">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.discount && (
                        <p className="text-sm text-green-600">
                          -R$ {item.discount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Summary */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium mb-4">Resumo do Pedido</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Itens:</span>
                <span className="font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (opcional)
            </label>
            <input
              type="text"
              placeholder="CPF ou Nome do cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {customer && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">{customer.name}</p>
                <p className="text-sm text-blue-700">
                  {customer.loyalty_points} pontos de fidelidade
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-6 border-t">
          <button
            onClick={handlePayment}
            disabled={cart.length === 0 || saleLoading}
            className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
          >
            <DollarSign className="h-5 w-5" />
            <span>
              {saleLoading ? 'Processando...' : 'Finalizar Venda'}
            </span>
          </button>

          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
