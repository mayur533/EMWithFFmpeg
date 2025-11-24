import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarStyle, getTabBarItemStyle, getTabBarLabelStyle } from '../utils/notchUtils';
import authService from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { navigationRef, navigate as navigateService } from './NavigationService';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Device size helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isTablet = SCREEN_WIDTH >= 768;

// Define navigation types
export type RootStackParamList = {
  MainApp: undefined;
  Login: undefined;
  Registration: undefined;
  Splash: undefined;
  PrivacyPolicy: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  PosterEditor: {
    selectedImage: {
      uri: string;
      title?: string;
      description?: string;
    };
    selectedLanguage: string;
    selectedTemplateId: string;
  };
  PosterPlayer: {
    selectedPoster: any;
    relatedPosters: any[];
    searchQuery?: string;
    templateSource?: 'greeting' | 'professional' | 'featured';
    businessCategory?: string;
    greetingCategory?: string;
    originScreen?: string;
  };
  AboutUs: undefined;
  PrivacyPolicy: undefined;
  PosterPreview: {
    capturedImageUri: string;
    selectedImage: {
      uri: string;
      title?: string;
      description?: string;
    };
    selectedLanguage: string;
    selectedTemplateId: string;
    selectedBusinessProfile?: any;
  };
  VideoEditor: {
    selectedVideo: {
      uri: string;
      title?: string;
      description?: string;
    };
    selectedLanguage: string;
    selectedTemplateId: string;
  };
  VideoPlayer: {
    selectedVideo: any;
    relatedVideos: any[];
  };
  VideoPreview: {
    selectedVideo: {
      uri: string;
      title?: string;
      description?: string;
    };
    selectedLanguage: string;
    selectedTemplateId: string;
    layers: any[];
    selectedProfile?: any;
    processedVideoPath?: string;
    canvasData?: {
      width: number;
      height: number;
      layers: any[];
    };
  };
  BusinessProfiles: undefined;
  Events: undefined;
  Subscription: undefined;
  TransactionHistory: undefined;
  GreetingTemplates: undefined;
  GreetingEditor: {
    template: any;
  };
  MyPosters: undefined;
  HelpSupport: undefined;
};

export type TabParamList = {
  Home: undefined;
  Templates: undefined;
  PosterPlayer: undefined;
  Greetings: undefined;
  Profile: undefined;
};

// Import screens (you'll create these)
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventsScreen from '../screens/EventsScreen';
import BusinessProfilesScreen from '../screens/BusinessProfilesScreen';
import TemplateGalleryScreen from '../screens/TemplateGalleryScreen';
import PosterEditorScreen from '../screens/PosterEditorScreen';
import PosterPreviewScreen from '../screens/PosterPreviewScreen';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import PosterPlayerScreen from '../screens/PosterPlayerScreen';
import VideoPreviewScreen from '../screens/VideoPreviewScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import GreetingTemplatesScreen from '../screens/GreetingTemplatesScreen';
import GreetingEditorScreen from '../screens/GreetingEditorScreen';
import MyPostersScreen from '../screens/MyPostersScreen';
import businessCategoryPostersApi from '../services/businessCategoryPostersApi';
import AboutUsScreen from '../screens/AboutUsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createStackNavigator<RootStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom tab navigator for authenticated users
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <MainStack.Navigator>
      <MainStack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="PosterEditor" 
        component={PosterEditorScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="PosterPlayer" 
        component={PosterPlayerScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="PosterPreview" 
        component={PosterPreviewScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="VideoEditor" 
        component={VideoEditorScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="VideoPreview" 
        component={VideoPreviewScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="BusinessProfiles" 
        component={BusinessProfilesScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="GreetingTemplates" 
        component={GreetingTemplatesScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="GreetingEditor" 
        component={GreetingEditorScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="MyPosters" 
        component={MyPostersScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="AboutUs" 
        component={AboutUsScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
    </MainStack.Navigator>
  );
};

// Custom Tab Bar Component with Overlapping Logo - Compact & Responsive
const CustomTabBar = (props: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoadingPosters, setIsLoadingPosters] = React.useState(false);
  const isPosterPlayerFocused = props.state.routes[props.state.index]?.name === 'PosterPlayer';
  
  // Dynamic dimensions for screen rotation/resize support
  const [dimensions, setDimensions] = React.useState(() => {
    const { width } = Dimensions.get('window');
    return { width };
  });

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width });
    });

    return () => subscription?.remove();
  }, []);

  // Dynamic scaling based on current dimensions
  const currentScale = (size: number) => (dimensions.width / 375) * size;
  const currentModerateScale = (size: number, factor = 0.5) => size + (currentScale(size) - size) * factor;
  const isCurrentlySmall = dimensions.width < 375;
  
  // Ultra-compact responsive sizes - maximally reduced
  const logoSize = currentModerateScale(isCurrentlySmall ? 36 : 42);
  const logoContainerSize = logoSize + currentModerateScale(6);
  const logoTopOffset = -(logoContainerSize / 2);
  const tabBarHeight = currentModerateScale(isCurrentlySmall ? 40 : 44); // Increased for small devices
  const tabBarPaddingTop = currentModerateScale(0);
  const tabBarPaddingBottom = Math.max(currentModerateScale(6), insets.bottom + currentModerateScale(2));
  const iconSize = currentModerateScale(isCurrentlySmall ? 18 : 20);
  const fontSize = currentModerateScale(isCurrentlySmall ? 7 : 8);
  const borderWidth = currentModerateScale(0.8); // Further reduced from 1
  
  const handlePosterPlayerShortcut = React.useCallback(async () => {
    console.log('🖱️ [NAVBAR] Poster shortcut triggered - fetching user category posters');
    setIsLoadingPosters(true);

    try {
      // Get user's business category and fetch posters
      const response = await businessCategoryPostersApi.getUserCategoryPosters();

      if (response?.success && response.data?.posters && response.data.posters.length > 0) {
        // Map BusinessCategoryPoster to Template format for PosterPlayerScreen
        const mapPosterToTemplate = (poster: any) => ({
          id: poster.id,
          name: poster.title || 'Poster',
          thumbnail: poster.imageUrl || poster.thumbnail || '',
          category: poster.category || response.data.category || 'General',
          downloads: poster.downloads || 0,
          isDownloaded: false,
          languages: [],
          tags: poster.tags || [],
        });

        const selectedPoster = mapPosterToTemplate(response.data.posters[0]);
        const relatedPosters = response.data.posters.slice(1).map(mapPosterToTemplate);

        // Navigate to PosterPlayerScreen with the posters
        const navigationParams = {
          selectedPoster,
          relatedPosters,
          searchQuery: '',
          templateSource: 'professional' as const,
        };

        if (navigationRef.isReady()) {
          navigateService('PosterPlayer', navigationParams);
        } else {
          const parentNavigator = props.navigation.getParent();
          if (parentNavigator) {
            parentNavigator.navigate('PosterPlayer', navigationParams);
          } else {
            props.navigation.navigate('PosterPlayer', navigationParams);
          }
        }
      } else {
        console.warn('⚠️ [NAVBAR] No posters available for user category');
        Alert.alert(
          'No posters available',
          'We could not find posters for your business category right now. Please try again later.',
        );
      }
    } catch (error) {
      console.error('❌ [NAVBAR] Error loading user category posters:', error);
      Alert.alert(
        'Unable to load posters',
        'Something went wrong while loading your posters. Please try again later.',
      );
    } finally {
      setIsLoadingPosters(false);
    }
  }, [props.navigation]);

  if (isPosterPlayerFocused) {
    return null;
  }

  return (
    <>
    <View style={{
      backgroundColor: theme.colors.surface,
      borderTopWidth: currentModerateScale(0.3), // Further reduced from 0.5
      borderTopColor: theme.colors.border,
      paddingTop: tabBarPaddingTop,
      paddingBottom: tabBarPaddingBottom,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: currentModerateScale(-0.5) }, // Further reduced from -1
      shadowOpacity: 0.05, // Further reduced from 0.08
      shadowRadius: currentModerateScale(2), // Further reduced from 3
      elevation: 4, // Further reduced from 6
      position: 'relative',
    }}>
      {/* Background overlay to hide any squares behind the circle */}
      <View style={{
        position: 'absolute',
        top: logoTopOffset,
        left: '50%',
        marginLeft: -(logoContainerSize / 2),
        zIndex: 999,
        backgroundColor: theme.colors.surface,
        width: logoContainerSize,
        height: logoContainerSize,
        borderRadius: logoContainerSize / 2,
      }} />
      
      {/* Logo positioned to overlap with screen content - Clickable to navigate to Poster Player */}
      <TouchableOpacity
        onPress={handlePosterPlayerShortcut}
        activeOpacity={0.7}
        style={{
          position: 'absolute',
          top: logoTopOffset,
          left: '50%',
          marginLeft: -(logoContainerSize / 2),
          zIndex: 1000,
          backgroundColor: theme.colors.surface,
          width: logoContainerSize,
          height: logoContainerSize,
          borderRadius: logoContainerSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: currentModerateScale(0.5) }, // Further reduced from 1
          shadowOpacity: 0.08, // Further reduced from 0.12
          shadowRadius: currentModerateScale(4), // Further reduced from 6
          elevation: 4, // Further reduced from 6
          borderWidth: borderWidth,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('../assets/MainLogo/MB.png')}
          style={{
            width: logoSize,
            height: logoSize,
            resizeMode: 'contain',
          }}
        />
      </TouchableOpacity>
      
      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: tabBarHeight,
        marginTop: currentModerateScale(10), // Add space for the circular overlapping logo
      }}>
        {props.state.routes.map((route: any, index: number) => {
          const { options } = props.descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = props.state.index === index;

          const onPress = () => {
            if (route.name === 'PosterPlayer') {
              handlePosterPlayerShortcut();
              return;
            }

            const event = props.navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            props.navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: currentModerateScale(4),
              }}
            >
              {options.tabBarIcon ? (
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                  size: iconSize,
                })
              ) : (
                // Add invisible spacer for tabs without icon to maintain text alignment
                <View style={{ height: iconSize }} />
              )}
              <Text style={{
                fontSize: fontSize,
                fontWeight: '600',
                marginTop: currentModerateScale(0.3), // Further reduced from 0.5
                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>

    {/* Loading overlay while fetching user category posters */}
    <Modal transparent animationType="fade" visible={isLoadingPosters}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: 14,
            width: 220,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text,
              textAlign: 'center',
            }}
          >
            Loading posters...
          </Text>
        </View>
      </View>
    </Modal>
    </>
  );
};

// Main tab navigator
const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  
  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplateGalleryScreen}
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="PosterPlayer" 
        component={PosterPlayerScreen}
        options={{
          title: 'My Business',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen 
        name="Greetings" 
        component={GreetingTemplatesScreen}
        options={{
          title: 'Greetings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="celebration" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator with authentication state
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { refreshSubscription, refreshTransactions } = useSubscription();

  useEffect(() => {
    console.log('🚀 AppNavigator: Starting initialization');
    let authStateReceived = false;
    let authUser: any = null;
    const startTime = Date.now();
    const MIN_SPLASH_TIME = 2000; // Reduced to 2 seconds for faster app startup
    
    // Extended timeout to allow intro video to play fully before checking auth state
    const timeout = setTimeout(() => {
      if (!authStateReceived) {
        console.log('⚠️ AppNavigator: Timeout reached without auth state - showing login');
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 5000); // Reduced to 5 seconds timeout for auth state

    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      authStateReceived = true;
      authUser = user;
      clearTimeout(timeout); // Clear timeout once we get auth state
      
      console.log('🔔 AppNavigator: Auth state changed:', user ? '✅ User logged in' : '❌ User logged out');
      if (user) {
        console.log('👤 User ID:', user.id || user.uid);
        console.log('📧 User Email:', user.email);
        
        // Preload subscription and transaction data for logged-in users
        console.log('📡 Preloading subscription and transaction data...');
        refreshSubscription().then(() => {
          console.log('✅ Subscription data preloaded');
        }).catch((error) => {
          console.error('❌ Error preloading subscription data:', error);
        });
        
        refreshTransactions().then(() => {
          console.log('✅ Transaction data preloaded');
        }).catch((error) => {
          console.error('❌ Error preloading transaction data:', error);
        });
      }
      
      // Calculate remaining time for minimum splash display
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_SPLASH_TIME - elapsedTime);
      
      console.log(`⏱️ Elapsed: ${elapsedTime}ms, Waiting: ${remainingTime}ms before navigation`);
      
      // Wait for minimum splash time before navigating
      setTimeout(() => {
        setIsAuthenticated(!!authUser);
        setIsLoading(false);
        console.log('🎬 Minimum splash time reached - navigating now');
      }, remainingTime);
    });

    // Explicitly call initialize to ensure async loading completes
    authService.initialize().catch((error) => {
      console.error('❌ AppNavigator: Error initializing auth service:', error);
      authStateReceived = true;
      clearTimeout(timeout);
      
      // Still respect minimum time even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_SPLASH_TIME - elapsedTime);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsAuthenticated(false);
      }, remainingTime);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  console.log('🎨 AppNavigator: Rendering with isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Show splash screen while loading
  if (isLoading) {
    console.log('AppNavigator: Showing splash screen');
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Show main navigation
  console.log('AppNavigator: Showing main navigation, isAuthenticated:', isAuthenticated);
  
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {isAuthenticated ? (
          // Authenticated user - show main app
          <Stack.Screen 
            name="MainApp" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          // Not authenticated - show auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Registration" 
              component={RegistrationScreen}
              options={{ 
                headerShown: false
              }}
            />
          </>
        )}
        {/* Privacy Policy - accessible from both authenticated and unauthenticated states */}
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 