import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Note: For now, we'll use QueryClient without persistence wrapper
// React Query's built-in cache will work with AsyncStorage through the hooks
// We can add persistence later if needed

// Create QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache time: 5 minutes (how long unused data stays in cache)
      gcTime: 5 * 60 * 1000, // Previously called cacheTime
      // Default stale time: 0 (data is immediately stale, will refetch)
      staleTime: 0,
      // Retry failed requests
      retry: 2,
      // Refetch on window focus (disabled for React Native)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount
      refetchOnMount: true,
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});

