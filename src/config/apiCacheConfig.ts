/**
 * API Cache Configuration
 * 
 * This file contains TTL (Time To Live) configurations for all APIs.
 * TTL values are in milliseconds.
 * 
 * staleTime: How long data is considered fresh (won't refetch during this time)
 * gcTime: How long unused data stays in cache (previously called cacheTime)
 * 
 * Usage: Import this config and use it in React Query hooks
 */

export const API_CACHE_CONFIG = {
  // Home API
  home: {
    featured: {
      staleTime: 0, // Will be configured - data is immediately stale
      gcTime: 0, // Will be configured - how long to keep in cache
    },
    events: {
      staleTime: 0,
      gcTime: 0,
    },
    templates: {
      staleTime: 0,
      gcTime: 0,
    },
    videos: {
      staleTime: 0,
      gcTime: 0,
    },
  },
  
  // Greeting Templates
  greetingTemplates: {
    categories: {
      staleTime: 0,
      gcTime: 0,
    },
    templates: {
      staleTime: 0,
      gcTime: 0,
    },
    search: {
      staleTime: 0,
      gcTime: 0,
    },
    byCategory: {
      staleTime: 0,
      gcTime: 0,
    },
  },
  
  // Business Categories
  businessCategories: {
    list: {
      staleTime: hoursToMs(30 * 24), // 30 days
      gcTime: hoursToMs(60 * 24), // 60 days
    },
    byId: {
      staleTime: 0,
      gcTime: 0,
    },
    search: {
      staleTime: 0,
      gcTime: 0,
    },
  },
  
  // Business Category Posters
  businessCategoryPosters: {
    byCategory: {
      staleTime: hoursToMs(30 * 24), // 30 days
      gcTime: hoursToMs(60 * 24), // 60 days
    },
  },
  
  // Dashboard
  dashboard: {
    templates: {
      staleTime: 0,
      gcTime: 0,
    },
    search: {
      staleTime: 0,
      gcTime: 0,
    },
  },
};

/**
 * Helper function to convert minutes to milliseconds
 */
export const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

/**
 * Helper function to convert hours to milliseconds
 */
export const hoursToMs = (hours: number): number => hours * 60 * 60 * 1000;

/**
 * Update TTL for a specific API
 * 
 * Example:
 * updateApiTTL('home', 'featured', { staleTime: minutesToMs(5), gcTime: minutesToMs(10) });
 */
export const updateApiTTL = (
  service: keyof typeof API_CACHE_CONFIG,
  endpoint: string,
  config: { staleTime: number; gcTime: number }
) => {
  const serviceConfig = API_CACHE_CONFIG[service] as any;
  if (serviceConfig && serviceConfig[endpoint]) {
    serviceConfig[endpoint] = config;
  }
};

