import { useState, useEffect, useCallback } from 'react';
import type { ApiError } from '../types';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err: unknown) {
        let apiError: ApiError;
        
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as {
            response?: {
              data?: { detail?: string };
              status?: number;
            };
            message?: string;
          };
          
          apiError = {
            detail: axiosError.response?.data?.detail || axiosError.message || 'Erro desconhecido',
            status_code: axiosError.response?.status || 500,
          };
        } else if (err instanceof Error) {
          apiError = {
            detail: err.message,
            status_code: 500,
          };
        } else {
          apiError = {
            detail: 'Erro desconhecido',
            status_code: 500,
          };
        }
        
        setError(apiError);
        
        if (onError) {
          onError(apiError);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, reset };
}
