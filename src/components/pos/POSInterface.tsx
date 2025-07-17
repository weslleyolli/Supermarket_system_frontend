import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Scan, DollarSign, Trash2, Plus, Minus, User, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';

interface CartItem {
  product_id: number;
  product_name: string;
  product_barcode: string;
  unit_price: number;
  quantity: number;
  weight?: number;
  requires_weighing: boolean;
  original_total: number;
  discount_applied: number;
  bulk_discount_applied: number;
  final_total: number;
  has_promotion: boolean;
  promotion_description: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  total_discount: number;
  bulk_discount: number;
  final_total: number;
  total_items: number;
  total_quantity: number;
}

interface Customer {
  id: number;
  name: string;
  cpf: string;
  loyalty_points: number;
}

type PaymentMethod = 'cash' | 'card' | 'pix';

const POSInterface: React.FC = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    total_discount: 0,
    bulk_discount: 0,
    final_total: 0,
    total_items: 0,
    total_quantity: 0
  });
  
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buscar carrinho atual ao carregar
  useEffect(() => {
    fetchCurrentCart();
  }, []);

  useEffect(() => {
    // Limpar mensagens após 5 segundos
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchCurrentCart = async () => {
    try {
      const currentCart = await apiService.getCurrentCart();
      setCart(currentCart);
    } catch (err) {
      console.error('Erro ao buscar carrinho:', err);
      // Se der erro, manter carrinho vazio
    }
  };

  const handleAddProduct = useCallback(async () => {
    if (!currentBarcode.trim()) {
      setError('Digite um código de barras');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const barcodeInput = {
        barcode: currentBarcode,
        quantity: quantity,
        weight: weight
      };

      const response = await apiService.addProductToCart(barcodeInput);
      
      if (response.success) {
        setCart(response.cart);
        setCurrentBarcode('');
        setQuantity(1);
        setWeight(undefined);
        setSuccess(`${response.product.name} adicionado ao carrinho!`);
      }
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      setError('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  }, [currentBarcode, quantity, weight]);

  const handleRemoveItem = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      const updatedCart = await apiService.updateCartItem({
        operation: 'remove',
        product_id: productId
      });
      setCart(updatedCart);
      setSuccess('Item removido do carrinho');
    } catch {
      setError('Erro ao remover item');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateQuantity = useCallback(async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setLoading(true);
    try {
      const updatedCart = await apiService.updateCartItem({
        operation: 'update',
        product_id: productId,
        quantity: newQuantity
      });
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao atualizar quantidade');
    } finally {
      setLoading(false);
    }
  }, [handleRemoveItem]);

  const handleClearCart = useCallback(async () => {
    if (!window.confirm('Limpar todo o carrinho?')) return;

    setLoading(true);
    try {
      const updatedCart = await apiService.updateCartItem({
        operation: 'clear'
      });
      setCart(updatedCart);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setAmountReceived(0);
      setSuccess('Carrinho limpo');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao limpar carrinho');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomer = async () => {
    if (!customerSearch.trim()) return;

    try {
      const customers = await apiService.getCustomers({ search: customerSearch });
      if (customers.items && customers.items.length > 0) {
        setSelectedCustomer(customers.items[0]);
        setSuccess(`Cliente ${customers.items[0].name} selecionado`);
      } else {
        setError('Cliente não encontrado');
      }
    } catch (err: any) {
      setError('Erro ao buscar cliente');
    }
  };

  const handlePayment = useCallback(async () => {
    if (cart.items.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    if (paymentMethod === 'cash' && amountReceived < cart.final_total) {
      setError('Valor recebido insuficiente!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentRequest = {
        customer_id: selectedCustomer?.id,
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? amountReceived : cart.final_total
      };

      const response = await apiService.processPayment(paymentRequest);
      
      // Venda realizada com sucesso
      const changeAmount = response.change_amount || 0;
      
      // Resetar estado
      setCart({
        items: [],
        subtotal: 0,
        total_discount: 0,
        bulk_discount: 0,
        final_total: 0,
        total_items: 0,
        total_quantity: 0
      });
      setSelectedCustomer(null);
      setCustomerSearch('');
      setAmountReceived(0);
      
      // Mostrar sucesso
      setSuccess(
        `Venda ${response.sale_id} realizada com sucesso!${
          changeAmount > 0 ? ` Troco: R$ ${changeAmount.toFixed(2)}` : ''
        }`
      );

      // Imprimir recibo (se configurado)
      try {
        await apiService.printReceipt(response.sale_id);
      } catch (printErr) {
        console.warn('Erro ao imprimir recibo:', printErr);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  }, [cart, paymentMethod, amountReceived, selectedCustomer]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddProduct();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Ponto de Venda (PDV)</h2>
          
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">✅ {success}</p>
            </div>
          )}
          
          {/* Scanner Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <input
                type="text"
                placeholder="Digite ou escaneie o código..."
                value={currentBarcode}
                onChange={(e) => setCurrentBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Opcional"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={handleAddProduct}
              disabled={loading || !currentBarcode.trim()}
              className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Scan className="h-4 w-4" />
              <span>{loading ? 'Adicionando...' : 'Adicionar'}</span>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Itens do Carrinho ({cart.total_items})</h3>
            <button
              onClick={handleClearCart}
              disabled={cart.items.length === 0}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Limpar Carrinho
            </button>
          </div>
          
          <div className="p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {item.unit_price.toFixed(2)}
                        {item.requires_weighing && item.weight && ` x ${item.weight}kg`}
                      </p>
                      {item.has_promotion && (
                        <p className="text-sm text-green-600">🎉 {item.promotion_description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right ml-6">
                      <p className="font-bold">R$ {item.final_total.toFixed(2)}</p>
                      {item.bulk_discount_applied > 0 && (
                        <p className="text-sm text-green-600">
                          -R$ {item.bulk_discount_applied.toFixed(2)}
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

      {/* Payment Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (opcional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="CPF ou Nome..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchCustomer}
                disabled={!customerSearch.trim()}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <User className="h-4 w-4" />
              </button>
            </div>
            
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">{selectedCustomer.name}</div>
                <div className="text-sm text-blue-700">CPF: {selectedCustomer.cpf}</div>
                <div className="text-sm text-blue-700">
                  {selectedCustomer.loyalty_points} pontos de fidelidade
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Remover cliente
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Itens ({cart.total_quantity}):</span>
                <span>R$ {cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.bulk_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto promocional:</span>
                  <span>-R$ {cart.bulk_discount.toFixed(2)}</span>
                </div>
              )}
              {cart.total_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Outros descontos:</span>
                  <span>-R$ {cart.total_discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {cart.final_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">💵 Dinheiro</option>
              <option value="card">💳 Cartão</option>
              <option value="pix">📱 PIX</option>
            </select>
          </div>

          {/* Amount Received (only for cash) */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Recebido
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountReceived || ''}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
              {amountReceived > cart.final_total && (
                <div className="text-sm text-green-600 mt-1">
                  💰 Troco: R$ {(amountReceived - cart.final_total).toFixed(2)}
                </div>
              )}
              {amountReceived > 0 && amountReceived < cart.final_total && (
                <div className="text-sm text-red-600 mt-1">
                  ⚠️ Valor insuficiente: faltam R$ {(cart.final_total - amountReceived).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Payment Buttons */}
          <div className="space-y-3 pt-6 border-t">
            <button
              onClick={handlePayment}
              disabled={cart.items.length === 0 || loading || (paymentMethod === 'cash' && amountReceived < cart.final_total)}
              className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium text-lg"
            >
              <DollarSign className="h-6 w-6" />
              <span>
                {loading ? 'Processando...' : 'Finalizar Venda'}
              </span>
            </button>

            {/* Quick Payment Buttons for Cash */}
            {paymentMethod === 'cash' && cart.final_total > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAmountReceived(cart.final_total)}
                  className="bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 text-sm"
                >
                  💰 Exato
                </button>
                <button
                  onClick={() => setAmountReceived(Math.ceil(cart.final_total / 10) * 10)}
                  className="bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 text-sm"
                >
                  💵 Arredondar
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleClearCart}
                disabled={cart.items.length === 0 || loading}
                className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar</span>
              </button>
              
              <button
                onClick={fetchCurrentCart}
                disabled={loading}
                className="bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Cart Statistics */}
          {cart.items.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Estatísticas</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="flex justify-between">
                  <span>Total de itens:</span>
                  <span>{cart.total_items}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade total:</span>
                  <span>{cart.total_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket médio/item:</span>
                  <span>R$ {(cart.final_total / cart.total_items).toFixed(2)}</span>
                </div>
                {(cart.bulk_discount + cart.total_discount) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Economia total:</span>
                    <span>R$ {(cart.bulk_discount + cart.total_discount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
