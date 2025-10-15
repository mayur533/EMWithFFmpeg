import api from './api';

// Types for authentication
export interface RegisterRequest {
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
  description?: string;
  category?: string;
  address?: string;
  website?: string;
  alternatePhone?: string;
  companyLogo?: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  companyName: string; // Registered company name (from registration)
  phoneNumber: string;
  logo?: string;
  photo?: string;
  companyLogo?: string;
  displayName?: string;
  name?: string;
  phone?: string;
  bio?: string;
  description?: string;
  category?: string;
  address?: string;
  alternatePhone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  // Note: businessProfiles array removed - should not be part of user object
  // Business profiles should be fetched separately via businessProfileService
}

export interface UpdateProfileRequest {
  name?: string;              // Company/user name
  companyName?: string;       // Alias for name
  email?: string;             // Email address
  phone?: string;             // Phone number
  phoneNumber?: string;       // Alias for phone
  logo?: string;              // Logo URL
  photo?: string;             // Photo URL
  companyLogo?: string;       // Alias for logo
  description?: string;       // Company/business description
  category?: string;          // Business category
  address?: string;           // Business address
  alternatePhone?: string;    // Alternate phone number
  website?: string;           // Website URL
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserProfile;
    token: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}

// Authentication API service
class AuthApiService {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/mobile/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User login
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/mobile/auth/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(data: GoogleAuthRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/mobile/auth/google', data);
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId?: string): Promise<ProfileResponse> {
    try {
      // Use the correct endpoint that we know works
      const endpoints = ['/api/mobile/auth/me'];
      
      console.log('🔍 Trying profile endpoints:', endpoints);
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Attempting profile endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          console.log(`✅ Profile endpoint ${endpoint} succeeded`);
          return response.data;
        } catch (error: any) {
          console.log(`❌ Profile endpoint ${endpoint} failed:`, error.response?.status || error.message);
          // Continue to next endpoint
        }
      }
      
      throw new Error('All profile endpoints failed');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest, userId?: string): Promise<ProfileResponse> {
    try {
      // Try multiple update endpoints
      const endpoints = [];
      
      if (userId) {
        endpoints.push(`/api/mobile/users/${userId}`);
      }
      
      // Add fallback endpoint
      endpoints.push('/api/mobile/auth/profile');
      
      console.log('🔍 Trying profile update endpoints:', endpoints);
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Attempting profile update endpoint: ${endpoint}`);
          const response = await api.put(endpoint, data);
          console.log(`✅ Profile update endpoint ${endpoint} succeeded`);
          return response.data;
        } catch (error: any) {
          console.log(`❌ Profile update endpoint ${endpoint} failed:`, error.response?.status || error.message);
          // Continue to next endpoint
        }
      }
      
      throw new Error('All profile update endpoints failed');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/mobile/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export default new AuthApiService();
