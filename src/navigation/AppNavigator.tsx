import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarStyle, getTabBarItemStyle, getTabBarLabelStyle } from '../utils/notchUtils';
import authService from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { navigationRef } from './NavigationService';
import { Image, View, Text, TouchableOpacity } from 'react-native';

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
  };
  MyBusinessPlayer: {
    selectedPoster: any;
    relatedPosters: any[];
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
  LikedItems: undefined;
  HelpSupport: undefined;
};

export type TabParamList = {
  Home: undefined;
  Templates: undefined;
  MyBusiness: undefined;
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
import LikedItemsScreen from '../screens/LikedItemsScreen';
import MyBusinessScreen from '../screens/MyBusinessScreen';
import MyBusinessPlayerScreen from '../screens/MyBusinessPlayerScreen';
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
        name="MyBusinessPlayer" 
        component={MyBusinessPlayerScreen}
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
        name="LikedItems"
        component={LikedItemsScreen}
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

// Custom Tab Bar Component with Overlapping Logo
const CustomTabBar = (props: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
      paddingBottom: Math.max(12, insets.bottom + 4),
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
      position: 'relative',
    }}>
      {/* Background overlay to hide any squares behind the circle */}
      <View style={{
        position: 'absolute',
        top: -35,
        left: '50%',
        marginLeft: -35,
        zIndex: 999,
        backgroundColor: theme.colors.surface,
        width: 70,
        height: 70,
        borderRadius: 35,
      }} />
      
      {/* Logo positioned to overlap with screen content */}
      <View style={{
        position: 'absolute',
        top: -35, // Half logo above the tab bar
        left: '50%',
        marginLeft: -35, // Center the circular container (70px width / 2)
        zIndex: 1000,
        backgroundColor: theme.colors.surface,
        width: 70,
        height: 70,
        borderRadius: 35, // Perfect circle
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 2,
        borderColor: theme.colors.border,
        // Ensure the circle completely covers any background elements
        overflow: 'hidden',
      }}>
        <Image
          source={require('../assets/MainLogo/MB.png')}
          style={{
            width: 50,
            height: 50,
            resizeMode: 'contain',
          }}
        />
      </View>
      
      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 50,
        marginTop: 20, // Add space for the circular overlapping logo
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
                paddingVertical: 4,
              }}
            >
              {options.tabBarIcon && options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                size: 24,
              })}
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                marginTop: 2,
                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
        name="MyBusiness" 
        component={MyBusinessScreen}
        options={{
          title: 'My Business',
          tabBarIcon: ({ color, size }) => (
            <Icon name="business" size={size} color={color} />
          ),
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

  useEffect(() => {
    console.log('🚀 AppNavigator: Starting initialization');
    let authStateReceived = false;
    
    // Longer timeout to give AsyncStorage enough time to load (especially on slow devices or with debugging)
    const timeout = setTimeout(() => {
      if (!authStateReceived) {
        console.log('⚠️ AppNavigator: Timeout reached without auth state - showing login');
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 5000); // Increased from 3000ms to 5000ms

    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      authStateReceived = true;
      clearTimeout(timeout); // Clear timeout once we get auth state
      
      console.log('🔔 AppNavigator: Auth state changed:', user ? '✅ User logged in' : '❌ User logged out');
      if (user) {
        console.log('👤 User ID:', user.id || user.uid);
        console.log('📧 User Email:', user.email);
      }
      
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Explicitly call initialize to ensure async loading completes
    authService.initialize().catch((error) => {
      console.error('❌ AppNavigator: Error initializing auth service:', error);
      authStateReceived = true;
      clearTimeout(timeout);
      setIsLoading(false);
      setIsAuthenticated(false);
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