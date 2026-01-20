import { useState, useCallback } from 'react';

export interface ErrorState {
  error: string | null;
  type: 'error' | 'warning' | 'network' | 'validation';
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    type: 'error'
  });

  const clearError = useCallback(() => {
    setErrorState({ error: null, type: 'error' });
  }, []);

  const setError = useCallback((error: string | Error, type: ErrorState['type'] = 'error') => {
    const message = error instanceof Error ? error.message : error;
    setErrorState({ error: message, type });
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorType: ErrorState['type'] = 'error'
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (err) {
      const error = err as Error;

      // Check if it's a network error
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.', 'network');
      } else if (error.message.includes('timeout')) {
        setError('La operación tardó demasiado. Inténtalo de nuevo.', 'network');
      } else {
        setError(error.message || 'Ocurrió un error inesperado', errorType);
      }

      return null;
    }
  }, [clearError, setError]);

  return {
    error: errorState.error,
    errorType: errorState.type,
    setError,
    clearError,
    handleAsyncError,
    hasError: errorState.error !== null
  };
}