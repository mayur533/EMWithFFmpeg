import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// Event name for token expiration
export const TOKEN_EXPIRED_EVENT = 'TOKEN_EXPIRED';

// Flag to prevent multiple token expiration events
let hasEmittedTokenExpiration = false;

// Function to reset the token expiration flag (call this after successful login)
export const resetTokenExpirationFlag = () => {
  hasEmittedTokenExpiration = false;
};

// Create axios instance with the EventMarketers backend URL
const api = axios.create({
  //baseURL: 'http://192.168.0.106:3001', // Local development server (Android compatible)
  // baseURL: 'http://localhost:3001', // Local development server (Web only)
   baseURL: 'https://eventmarketersbackend.onrender.com', // Production backend server
  timeout: 10000, // 10 seconds timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Auth token added to request:', config.url);
        console.log('🌐 Full request URL:', (config.baseURL || '') + (config.url || ''));
        console.log('📤 Request method:', config.method?.toUpperCase());
        console.log('📋 Request headers:', config.headers);
      } else {
        console.log('⚠️ No auth token found for request:', config.url);
        console.log('🌐 Full request URL:', (config.baseURL || '') + (config.url || ''));
        console.log('📤 Request method:', config.method?.toUpperCase());
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('❌ API Error occurred:', error.config?.url);
    console.log('📊 Error status:', error.response?.status);
    console.log('📋 Error response:', error.response?.data);
    console.log('🌐 Error URL:', error.config?.baseURL + error.config?.url);
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('API request timed out');
      return Promise.reject(new Error('TIMEOUT'));
    }
    
    // Handle authentication errors (token expired or invalid)
    if (error.response?.status === 401) {
      // Check if this is a login/register endpoint (don't show modal for login failures)
      const isLoginEndpoint = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/auth/register') ||
                             error.config?.url?.includes('/auth/google');
      
      // Only show token expiration modal if NOT a login endpoint and user was authenticated
      if (!isLoginEndpoint) {
        const hasToken = await AsyncStorage.getItem('authToken');
        
        // Only emit once to prevent multiple modals, and only if user had a token
        if (!hasEmittedTokenExpiration && hasToken) {
          hasEmittedTokenExpiration = true;
          console.log('🔴 Token expired or invalid, clearing auth data');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('currentUser');
          
          // Emit token expiration event using React Native's DeviceEventEmitter
          DeviceEventEmitter.emit(TOKEN_EXPIRED_EVENT);
        }
      }
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
      return Promise.reject(new Error('SERVER_ERROR'));
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('NETWORK_ERROR'));
    }
    
    return Promise.reject(error);
  }
);

export default api; 