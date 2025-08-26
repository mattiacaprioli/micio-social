import { useState, useCallback } from 'react';

interface NetworkErrorState {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseNetworkErrorReturn {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
  setError: (error: string | null) => void;
  clearError: () => void;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    retryDelay?: number
  ) => Promise<T>;
}

const useNetworkError = (): UseNetworkErrorReturn => {
  const [state, setState] = useState<NetworkErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isRetrying: false }));
  }, []);

  const clearError = useCallback(() => {
    setState({ error: null, isRetrying: false, retryCount: 0 });
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt }));
          await delay(retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
        }

        const result = await operation();
        
        // Successo - pulisci lo stato di errore
        setState({ error: null, isRetrying: false, retryCount: 0 });
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        
        // Se è l'ultimo tentativo, imposta l'errore
        if (attempt === maxRetries) {
          const errorMessage = getErrorMessage(error);
          setState({
            error: errorMessage,
            isRetrying: false,
            retryCount: attempt + 1,
          });
        }
      }
    }
    
    throw lastError!;
  }, []);

  return {
    error: state.error,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,
    setError,
    clearError,
    executeWithRetry,
  };
};

// Funzione helper per estrarre messaggi di errore user-friendly
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Errori di rete comuni
    if (error.message.includes('Network request failed')) {
      return 'Connessione internet assente. Controlla la tua connessione e riprova.';
    }
    
    if (error.message.includes('timeout')) {
      return 'La richiesta ha impiegato troppo tempo. Riprova.';
    }
    
    if (error.message.includes('404')) {
      return 'Risorsa non trovata. Potrebbe essere stata rimossa.';
    }
    
    if (error.message.includes('500')) {
      return 'Errore del server. Riprova più tardi.';
    }
    
    return error.message;
  }
  
  return 'Si è verificato un errore imprevisto. Riprova.';
};

export default useNetworkError;
