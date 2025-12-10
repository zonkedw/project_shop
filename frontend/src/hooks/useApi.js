import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Хук для работы с API с автоматической обработкой ошибок и загрузки
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { onSuccess, onError, showError = true } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Обработка 401 - очистка токена и редирект
      if (err?.status === 401 || err?.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        if (options.onAuthError) {
          options.onAuthError();
        }
      }
      
      if (onError) {
        onError(err, errorMessage);
      }
      
      if (showError && !onError) {
        // Можно показать Alert или Snackbar
        console.error('API Error:', errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

