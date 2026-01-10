import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export const useApi = <T,>(initialData: T | null = null) => {
  const [state, setState] = useState<ApiResponse<T>>({
    data: initialData,
    error: null,
    isLoading: false,
  });

  const fetchData = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  }, []);

  return { ...state, fetchData };
};
