import { useState, useEffect, useCallback } from 'react';
import { hardwareService } from '../services';

interface ReceiptData {
  saleId: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  paymentMethod: string;
}

interface UseHardwareReturn {
  isConnected: boolean;
  connecting: boolean;
  scanBarcode: () => Promise<string | null>;
  getWeight: () => Promise<number | null>;
  printReceipt: (receiptData: ReceiptData) => Promise<boolean>;
  error: string | null;
}

export function useHardware(): UseHardwareReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeHardware = async () => {
      try {
        setConnecting(true);
        setError(null);
        await hardwareService.init();
        setIsConnected(hardwareService.isHardwareConnected());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize hardware');
        setIsConnected(false);
      } finally {
        setConnecting(false);
      }
    };

    initializeHardware();

    return () => {
      hardwareService.disconnect();
    };
  }, []);

  const scanBarcode = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      const barcode = await hardwareService.scanBarcode();
      return barcode;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      return null;
    }
  }, []);

  const getWeight = useCallback(async (): Promise<number | null> => {
    try {
      setError(null);
      const weight = await hardwareService.getWeight();
      return weight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get weight');
      return null;
    }
  }, []);

  const printReceipt = useCallback(async (receiptData: ReceiptData): Promise<boolean> => {
    try {
      setError(null);
      const success = await hardwareService.printReceipt(receiptData);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print receipt');
      return false;
    }
  }, []);

  return {
    isConnected,
    connecting,
    scanBarcode,
    getWeight,
    printReceipt,
    error,
  };
}
