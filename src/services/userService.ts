import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  recordUserActivity,
  generateUserId 
} from '../constants/api';
import { User, UserActivity } from '../constants/api';

class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Initialize user service
   */
  async initialize(): Promise<void> {
    try {
      // Load current user if available
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to initialize user service:', error);
      throw error;
    }
  }

  /**
   * Register user with backend
   */
  async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
  }): Promise<User> {
    try {
      await this.initialize();

      const response = await registerUser({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });

      if (response.success && response.user) {
        this.currentUser = response.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Get user profile from backend
   */
  async getUserProfile(): Promise<User | null> {
    try {
      await this.initialize();

      if (!this.currentUser) {
        return null;
      }

      const response = await getUserProfile(this.currentUser.id);
      
      if (response.success && response.user) {
        this.currentUser = response.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      } else {
        // User not found, return null
        return null;
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
      // Try to get cached user data
      return await this.getCachedUser();
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      const response = await updateUserProfile(this.currentUser.id, profileData);
      
      if (response.success && response.user) {
        this.currentUser = response.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Record user activity
   */
  async recordActivity(activityData: {
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: any;
    userId?: string;
  }): Promise<void> {
    try {
      // Use provided userId or current user ID
      const identifier = activityData.userId || this.currentUser?.id;
      
      if (!identifier) {
        console.warn('No user identifier available, skipping activity recording');
        return;
      }

      const activity: UserActivity = {
        userId: identifier,
        action: activityData.action,
        resourceType: activityData.resourceType,
        resourceId: activityData.resourceId,
        metadata: {
          ...activityData.metadata,
          userId: identifier,
        },
      };

      await recordUserActivity(activity);
      console.log('✅ User activity recorded:', activityData.action, 'for user:', identifier);
    } catch (error) {
      console.error('Failed to record user activity:', error);
      // Don't throw error for activity recording failures
    }
  }

  /**
   * Track content view
   */
  async trackContentView(contentId: string, contentType: 'image' | 'video', metadata?: any, userId?: string): Promise<void> {
    await this.recordActivity({
      action: 'view',
      resourceType: contentType,
      resourceId: contentId,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track content download
   */
  async trackContentDownload(contentId: string, contentType: 'image' | 'video', metadata?: any, userId?: string): Promise<void> {
    await this.recordActivity({
      action: 'download',
      resourceType: contentType,
      resourceId: contentId,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get cached user data
   */
  async getCachedUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  }

  /**
   * Get current user (from memory or cache)
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is registered
   */
  async isUserRegistered(): Promise<boolean> {
    try {
      const user = await this.getUserProfile();
      return user !== null;
    } catch (error) {
      console.error('Failed to check user registration status:', error);
      return false;
    }
  }

  /**
   * Clear user data
   */
  async clearUserData(): Promise<void> {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalViews: number;
    downloadAttempts: number;
    isConverted: boolean;
  }> {
    try {
      const user = await this.getUserProfile();
      if (user) {
        return {
          totalViews: user.totalViews || 0,
          downloadAttempts: user.downloadAttempts || 0,
          isConverted: user.isConverted || false,
        };
      }
      return {
        totalViews: 0,
        downloadAttempts: 0,
        isConverted: false,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalViews: 0,
        downloadAttempts: 0,
        isConverted: false,
      };
    }
  }
}

// Export singleton instance
const userService = UserService.getInstance();
export default userService;

