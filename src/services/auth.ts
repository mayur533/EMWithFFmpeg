import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import authApi, { type RegisterRequest, type LoginRequest, type GoogleAuthRequest } from './authApi';

// Authentication service with API-only integration (no local fallback)
class AuthService {
  private currentUser: any = null;
  private authStateListeners: ((user: any) => void)[] = [];
  private isInitialized: boolean = false; // Track if initial load is complete

  constructor() {
    // Note: Constructor cannot be async, so we call loadStoredUser without await
    // The initialize() method should be called by the app to ensure proper async initialization
    this.loadStoredUser();
    
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1037985236626-im6lbdis9q5g1bptng6g22ods7mf4bjh.apps.googleusercontent.com', // From your google-services.json
      offlineAccess: true,
    });
  }

  // Load stored user from AsyncStorage
  private async loadStoredUser() {
    try {
      console.log('🔄 Loading stored user from AsyncStorage...');
      
      // Check for regular user only
      const storedUser = await AsyncStorage.getItem('currentUser');
      const authToken = await AsyncStorage.getItem('authToken');
      
      console.log('📦 AsyncStorage check - User:', storedUser ? 'Found' : 'Not found');
      console.log('📦 AsyncStorage check - Token:', authToken ? 'Found' : 'Not found');
      
      if (storedUser && authToken) {
        this.currentUser = JSON.parse(storedUser);
        console.log('✅ Loaded stored user:', this.currentUser.id || this.currentUser.uid);
        console.log('✅ User email:', this.currentUser.email);
        console.log('✅ Token length:', authToken.length);
        
        // Mark as initialized and notify auth state listeners
        this.isInitialized = true;
        this.notifyAuthStateListeners(this.currentUser);
      } else {
        console.log('ℹ️ No stored user or token found - user needs to login');
        // Mark as initialized and notify with null to indicate no user
        this.isInitialized = true;
        this.notifyAuthStateListeners(null);
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
      // Mark as initialized and notify with null on error to show login screen
      this.isInitialized = true;
      this.notifyAuthStateListeners(null);
    }
  }


  // Save user to AsyncStorage
  async saveUserToStorage(user: any, token?: string) {
    try {
      console.log('💾 Saving user to AsyncStorage...', user.id);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      if (token) {
        console.log('🔐 Saving auth token to AsyncStorage...');
        await AsyncStorage.setItem('authToken', token);
        console.log('✅ Auth token saved successfully');
        
        // Verify token was saved
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log('🔍 Verified token in storage:', savedToken ? 'YES' : 'NO');
      }
      console.log('✅ User data saved to AsyncStorage successfully');
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  }


  // Register new user (API only)
  async registerUser(userData: any): Promise<any> {
    try {
      console.log('Registering new user with API...');
      
      // Prepare registration data with all available fields
      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        companyName: userData.companyName,
        phoneNumber: userData.phoneNumber,
        description: userData.description,
        category: userData.category,
        address: userData.address,
        website: userData.website,
        alternatePhone: userData.alternatePhone,
        companyLogo: userData.companyLogo,
        displayName: userData.displayName,
      };
      
      const response = await authApi.register(registerData);
      
      if (response.success) {
        // Save user and token, protect companyName from future API contamination
        const userData = {
          ...response.data.user,
          // Store original companyName to protect from business profile contamination
          _originalCompanyName: response.data.user.companyName,
        };
        this.currentUser = userData;
        await this.saveUserToStorage(userData, response.data.token);
        this.notifyAuthStateListeners(this.currentUser);
        
        console.log('User registration successful via API:', userData.id);
        return { success: true, user: userData };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('API registration failed:', error);
      throw error;
    }
  }


  // Email/Password sign-in (API only)
  async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      console.log('Email sign-in with API...');
      
      const loginData: LoginRequest = {
        email,
        password,
      };
      
      const response = await authApi.login(loginData);
      
      if (response.success) {
        // Save user and token
        this.currentUser = response.data.user;
        await this.saveUserToStorage(response.data.user, response.data.token);
        this.notifyAuthStateListeners(this.currentUser);
        
        console.log('✅ Email sign-in successful via API:', response.data.user.id);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔑 AUTH TOKEN (auth.ts):');
        console.log('Token:', response.data.token);
        console.log('Token Length:', response.data.token?.length || 0);
        console.log('Token Preview:', response.data.token?.substring(0, 50) + '...');
        console.log('═══════════════════════════════════════════════════════════');
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('API sign-in failed:', error);
      throw error;
    }
  }


  // Google Sign-In implementation (API only)
  async signInWithGoogle(): Promise<any> {
    try {
      console.log('Google Sign-In started...');
      
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In user info:', userInfo);
      
      const googleAuthData: GoogleAuthRequest = {
        idToken: userInfo.data?.idToken || '',
        accessToken: userInfo.data?.serverAuthCode || '',
      };
      
      const response = await authApi.googleLogin(googleAuthData);
      
      if (response.success) {
        // Save user and token
        this.currentUser = response.data.user;
        await this.saveUserToStorage(response.data.user, response.data.token);
        this.notifyAuthStateListeners(this.currentUser);
        
        console.log('✅ Google sign-in successful via API:', response.data.user.id);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔑 GOOGLE AUTH TOKEN (auth.ts):');
        console.log('Token:', response.data.token);
        console.log('Token Length:', response.data.token?.length || 0);
        console.log('Token Preview:', response.data.token?.substring(0, 50) + '...');
        console.log('═══════════════════════════════════════════════════════════');
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Google login failed');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Sign in was cancelled by user');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services not available');
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        throw new Error('Sign in required');
      } else {
        throw new Error('Google Sign-In failed. Please try again.');
      }
    }
  }


  // Anonymous sign-in (removed - API only)
  async signInAnonymously(): Promise<any> {
    throw new Error('Anonymous sign-in is not supported. Please use email/password or Google sign-in.');
  }

  // Sign out (API only)
  async signOut(): Promise<void> {
    try {
      console.log('Signing out user...');
      
      // Try API logout for all users
      try {
        console.log('Attempting API logout...');
        await authApi.logout();
        console.log('✅ API logout successful');
      } catch (apiError: any) {
        console.error('❌ API logout failed:', apiError);
        // Continue with local cleanup even if API logout fails
        // This ensures the user can still sign out locally
      }
      
      // Sign out from Google if user was signed in with Google
      if (this.currentUser?.providerId === 'google') {
        try {
          console.log('Signing out from Google...');
          await GoogleSignin.signOut();
          console.log('✅ Google Sign-Out successful');
        } catch (googleError) {
          console.error('❌ Google Sign-Out error:', googleError);
          // Continue with local cleanup even if Google sign-out fails
        }
      }
      
      // Clear all local data
      console.log('Clearing local data...');
      this.currentUser = null;
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user'); // Clear any demo user data
      await AsyncStorage.removeItem('isDemoUser'); // Clear demo flag
      
      // Clear any other user-related data
      await AsyncStorage.removeItem('user_likes');
      await AsyncStorage.removeItem('transaction_history');
      await AsyncStorage.removeItem('user_business_profiles');
      await AsyncStorage.removeItem('user_preferences');
      
      // Notify auth state listeners
      this.notifyAuthStateListeners(null);
      console.log('✅ Sign out completed successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Even if there's an error, we should clear local data
      try {
        this.currentUser = null;
        await AsyncStorage.removeItem('currentUser');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('isDemoUser');
        this.notifyAuthStateListeners(null);
        console.log('✅ Local cleanup completed despite error');
      } catch (cleanupError) {
        console.error('❌ Error during cleanup:', cleanupError);
      }
      throw error;
    }
  }

  // Get current user profile (API only)
  async getUserProfile(): Promise<any> {
    try {
      const response = await authApi.getProfile();
      if (response.success) {
        this.currentUser = response.data;
        await this.saveUserToStorage(response.data);
        return response.data;
      }
      throw new Error('Failed to get user profile');
    } catch (error) {
      console.error('API get profile failed:', error);
      throw error;
    }
  }

  // Update user profile (API only)
  async updateUserProfile(profileData: any): Promise<any> {
    try {
      const response = await authApi.updateProfile(profileData);
      if (response.success) {
        this.currentUser = response.data;
        await this.saveUserToStorage(response.data);
        return response.data;
      }
      throw new Error('Failed to update user profile');
    } catch (error) {
      console.error('API update profile failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): any {
    return this.currentUser;
  }

  // Set current user (for external services)
  setCurrentUser(user: any) {
    this.currentUser = user;
  }

  // Debug helper: Check AsyncStorage status
  async debugAsyncStorage(): Promise<void> {
    try {
      console.log('🐛 ===== AsyncStorage Debug Info =====');
      
      const currentUser = await AsyncStorage.getItem('currentUser');
      const authToken = await AsyncStorage.getItem('authToken');
      
      console.log('📦 currentUser in AsyncStorage:', currentUser ? 'EXISTS' : 'NOT FOUND');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        console.log('   - User ID:', parsed.id || parsed.uid);
        console.log('   - User Email:', parsed.email);
        console.log('   - User Name:', parsed.companyName || parsed.displayName);
      }
      
      console.log('🔑 authToken in AsyncStorage:', authToken ? 'EXISTS' : 'NOT FOUND');
      if (authToken) {
        console.log('   - Token Length:', authToken.length);
        console.log('   - Token Preview:', authToken.substring(0, 30) + '...');
      }
      
      console.log('👤 currentUser in memory:', this.currentUser ? 'EXISTS' : 'NOT FOUND');
      if (this.currentUser) {
        console.log('   - User ID:', this.currentUser.id || this.currentUser.uid);
        console.log('   - User Email:', this.currentUser.email);
      }
      
      console.log('🔧 Is Initialized:', this.isInitialized);
      console.log('👂 Auth State Listeners:', this.authStateListeners.length);
      console.log('🐛 ===================================');
    } catch (error) {
      console.error('❌ Error debugging AsyncStorage:', error);
    }
  }


  // Get current Google user info
  async getCurrentGoogleUser(): Promise<any> {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  }

  // Initialize auth service (load stored user only)
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing auth service...');
      
      // Ensure stored user is loaded (this may be called after constructor)
      await this.loadStoredUser();
      
      console.log('✅ Auth service initialized successfully');
      console.log('Current user:', this.currentUser ? `${this.currentUser.email} (${this.currentUser.id})` : 'None');
      
      // Check if user is already signed in with Google
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        const isGoogleSignedIn = !!currentUser;
        if (isGoogleSignedIn && !this.currentUser) {
          console.log('🔄 User is signed in with Google but not in local storage, attempting to restore session...');
          try {
            await this.signInWithGoogle();
          } catch (error) {
            console.error('❌ Failed to restore Google session:', error);
          }
        }
      } catch (googleError) {
        console.error('⚠️ Error checking Google sign-in status:', googleError);
      }
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
      throw error; // Re-throw to let AppNavigator handle it
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: any) => void) {
    this.authStateListeners.push(callback);
    
    // Immediately call the callback with current state if initialization is complete
    // This ensures listeners get the current state even if they subscribe after initialization
    if (this.isInitialized) {
      const userState = this.currentUser ? 'logged in' : 'logged out';
      console.log(`🔔 onAuthStateChanged: Immediately notifying new listener (user ${userState})`);
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('Error in immediate auth state callback:', error);
      }
    } else {
      console.log('⏳ onAuthStateChanged: Listener added, waiting for initialization to complete');
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Notify all auth state listeners
  notifyAuthStateListeners(user: any) {
    this.authStateListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
}

export default new AuthService(); 