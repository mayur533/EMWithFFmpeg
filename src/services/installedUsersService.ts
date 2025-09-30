import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InstalledUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  installDate: string;
  totalViews?: number;
  downloadAttempts?: number;
  isConverted?: boolean;
  lastActiveAt?: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  phone: string;
  appVersion: string;
}

export interface RegisterUserResponse {
  success: boolean;
  user: InstalledUser;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserProfileResponse {
  success: boolean;
  user: InstalledUser;
}

class InstalledUsersService {
  private currentUser: InstalledUser | null = null;

  // Register a new installed user
  async registerUser(userData: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      console.log('Registering installed user:', userData.email);
      const response = await api.post('/api/installed-users/register', userData);
      
      if (response.data.success) {
        this.currentUser = response.data.user;
        await this.saveUserToStorage(response.data.user);
        console.log('✅ User registered successfully:', response.data.user.id);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to register user:', error);
      throw error;
    }
  }

  // Get user profile by user ID
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      console.log('Fetching user profile for user:', userId);
      const response = await api.get(`/api/installed-users/profile/${userId}`);
      
      if (response.data.success) {
        this.currentUser = response.data.user;
        await this.saveUserToStorage(response.data.user);
        console.log('✅ User profile loaded:', response.data.user.name);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, userData: UpdateUserRequest): Promise<UserProfileResponse> {
    try {
      console.log('Updating user profile for user:', userId);
      const response = await api.put(`/api/installed-users/profile/${userId}`, userData);
      
      if (response.data.success) {
        this.currentUser = response.data.user;
        await this.saveUserToStorage(response.data.user);
        console.log('✅ User profile updated:', response.data.user.name);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<InstalledUser | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const storedUser = await AsyncStorage.getItem('installedUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Save user to storage
  private async saveUserToStorage(user: InstalledUser): Promise<void> {
    try {
      await AsyncStorage.setItem('installedUser', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  // Clear user from storage
  async clearUser(): Promise<void> {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('installedUser');
      console.log('User data cleared from storage');
    } catch (error) {
      console.error('Failed to clear user from storage:', error);
    }
  }

  // Check if user is registered
  async isUserRegistered(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Failed to check if user is registered:', error);
      return false;
    }
  }


  // Get app version (you might want to implement this using a proper version library)
  getAppVersion(): string {
    // This should be replaced with actual app version from package.json or native modules
    return '1.0.0';
  }

  // Register current user
  async registerCurrentUser(userInfo: {
    name: string;
    email: string;
    phone: string;
  }): Promise<RegisterUserResponse> {
    try {
      const appVersion = this.getAppVersion();
      
      const userData: RegisterUserRequest = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        appVersion
      };
      
      return await this.registerUser(userData);
    } catch (error) {
      console.error('Failed to register current user:', error);
      throw error;
    }
  }

  // Update current user profile
  async updateCurrentUserProfile(userData: UpdateUserRequest): Promise<UserProfileResponse> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user found');
      }
      
      return await this.updateUserProfile(currentUser.id, userData);
    } catch (error) {
      console.error('Failed to update current user profile:', error);
      throw error;
    }
  }
}

export default new InstalledUsersService();
