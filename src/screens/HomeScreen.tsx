// HomeScreen comprehensively optimized for all device sizes with ultra-compact header, search bar, and content sizing
// Performance optimizations: FastImage for better image loading and caching, lazy loading for lists
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import dashboardService, { Banner, Template } from '../services/dashboard';
import homeApi, { 
  FeaturedContent, 
  UpcomingEvent, 
  ProfessionalTemplate, 
  VideoContent 
} from '../services/homeApi';
import greetingTemplatesService from '../services/greetingTemplates';
import businessCategoryPostersApi from '../services/businessCategoryPostersApi';
import businessCategoriesService, { BusinessCategory } from '../services/businessCategoriesService';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth';
// import SimpleFestivalCalendar from '../components/SimpleFestivalCalendar';
import OptimizedImage from '../components/OptimizedImage';
import ComingSoonModal from '../components/ComingSoonModal';
import responsiveUtils, { 
  responsiveSpacing, 
  responsiveFontSize, 
  responsiveSize, 
  responsiveLayout, 
  responsiveShadow, 
  responsiveText, 
  responsiveGrid, 
  responsiveButton, 
  responsiveInput, 
  responsiveCard
} from '../utils/responsiveUtils';

// Compact spacing multiplier to reduce all spacing
const COMPACT_MULTIPLIER = 0.5;

const HomeScreen: React.FC = React.memo(() => {
  const { isDarkMode, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  
  // Dynamic dimensions for responsive layout
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  // Update dimensions on screen rotation/resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;
  
  // Dynamic device detection that updates on rotation
  const isTabletDevice = useMemo(() => screenWidth >= 768, [screenWidth]);
  const isLandscapeMode = useMemo(() => screenWidth > screenHeight, [screenWidth, screenHeight]);
  
  // Responsive icon sizes
  const getIconSize = useCallback((baseSize: number) => {
    const scale = screenWidth / 375; // Base on iPhone 8 width
    return Math.round(baseSize * scale);
  }, [screenWidth]);
  
  // Responsive card calculations - dynamically adapts to screen size and rotation
  const getCardWidth = useCallback(() => {
    if (isTabletDevice) {
      return screenWidth * 0.15; // 6-7 cards visible on tablet
    } else if (screenWidth >= 600) {
      return screenWidth * 0.22; // 4 cards on medium phones
    } else if (screenWidth >= 400) {
      return screenWidth * 0.28; // 3 cards on regular phones
    } else {
      return screenWidth * 0.32; // 3 cards on small phones with more spacing
    }
  }, [screenWidth, isTabletDevice]);

  const cardWidth = getCardWidth();
  
  // Helper function for moderateScale (matches the one defined at bottom of file)
  const getModerateScale = useCallback((size: number, factor = 0.5) => {
    const scale = (s: number) => (screenWidth / 375) * s;
    return size + (scale(size) - size) * factor;
  }, [screenWidth]);
  
  // Helper function for getResponsiveValue (matches the one defined at bottom of file)
  const getResponsiveValue = useCallback((small: number, medium: number, large: number) => {
    if (screenWidth < 400) return small;
    if (screenWidth < 768) return medium;
    return large;
  }, [screenWidth]);
  
  // Calculate item spacing for getItemLayout (matches templateCardWrapper marginRight)
  const itemSpacing = useMemo(() => {
    return getModerateScale(3);
  }, [getModerateScale]);
  
  // Memoized getItemLayout for horizontal FlatLists with fixed card width
  const getItemLayout = useCallback((data: any, index: number) => {
    const itemLength = cardWidth + itemSpacing;
    return {
      length: itemLength,
      offset: itemLength * index,
      index,
    };
  }, [cardWidth, itemSpacing]);
  
  // Memoized getItemLayout for banner carousel (different width)
  const getBannerItemLayout = useCallback((data: any, index: number) => {
    const bannerWidth = getResponsiveValue(screenWidth * 0.70, screenWidth * 0.65, screenWidth * 0.55);
    const bannerSpacing = getModerateScale(4); // matches bannerContainerWrapper marginRight
    const itemLength = bannerWidth + bannerSpacing;
    return {
      length: itemLength,
      offset: itemLength * index,
      index,
    };
  }, [screenWidth, getResponsiveValue, getModerateScale]);
  
  // Responsive icon sizes for different UI elements
  const searchIconSize = getIconSize(14);
  const statusIconSize = getIconSize(8);
  const playIconSize = getIconSize(16);


  const [activeTab, setActiveTab] = useState('trending');
  const [selectedCategory, setSelectedCategory] = useState<'business' | 'general'>('business');
  const [searchQuery, setSearchQuery] = useState('');
  const [greetingCategories, setGreetingCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoryFadeAnim = useRef(new Animated.Value(1)).current;
  
  // Business categories state
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [businessCategoriesLoading, setBusinessCategoriesLoading] = useState(false);
  const [businessCategoryImages, setBusinessCategoryImages] = useState<Record<string, string>>({});

  // Greeting categories state
  const [greetingCategoriesList, setGreetingCategoriesList] = useState<Array<{ id: string; name: string; icon: string; color?: string }>>([]);
  const [greetingCategoriesLoading, setGreetingCategoriesLoading] = useState(false);
  const [greetingCategoryImages, setGreetingCategoryImages] = useState<Record<string, string>>({});

  const animateCategoryChange = useCallback(() => {
    Animated.sequence([
      Animated.timing(categoryFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(categoryFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [categoryFadeAnim]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(0);
  const [disableBackgroundUpdates, setDisableBackgroundUpdates] = useState(false);
  const [isUpcomingEventsModalVisible, setIsUpcomingEventsModalVisible] = useState(false);
  const [isTemplatesModalVisible, setIsTemplatesModalVisible] = useState(false);
  const [isVideosModalVisible, setIsVideosModalVisible] = useState(false);
  const [showVideoComingSoonModal, setShowVideoComingSoonModal] = useState(false);
  
  // Greeting section modal states
  const [isMotivationModalVisible, setIsMotivationModalVisible] = useState(false);
  const [isGoodMorningModalVisible, setIsGoodMorningModalVisible] = useState(false);
  const [isBusinessEthicsModalVisible, setIsBusinessEthicsModalVisible] = useState(false);
  const [isDevotionalModalVisible, setIsDevotionalModalVisible] = useState(false);
  const [isLeaderQuotesModalVisible, setIsLeaderQuotesModalVisible] = useState(false);
  const [isAtmanirbharBharatModalVisible, setIsAtmanirbharBharatModalVisible] = useState(false);
  const [isGoodThoughtsModalVisible, setIsGoodThoughtsModalVisible] = useState(false);
  const [isTrendingModalVisible, setIsTrendingModalVisible] = useState(false);
  const [isBhagvatGitaModalVisible, setIsBhagvatGitaModalVisible] = useState(false);
  const [isBooksModalVisible, setIsBooksModalVisible] = useState(false);
  const [isCelebratesMomentsModalVisible, setIsCelebratesMomentsModalVisible] = useState(false);
  const [isFeaturedContentModalVisible, setIsFeaturedContentModalVisible] = useState(false);

  // New API data states
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [professionalTemplates, setProfessionalTemplates] = useState<ProfessionalTemplate[]>([]);
  const [videoContent, setVideoContent] = useState<VideoContent[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Greeting sections data states
  const [motivationTemplates, setMotivationTemplates] = useState<any[]>([]);
  const [motivationTemplatesRaw, setMotivationTemplatesRaw] = useState<any[]>([]);
  const [goodMorningTemplates, setGoodMorningTemplates] = useState<any[]>([]);
  const [goodMorningTemplatesRaw, setGoodMorningTemplatesRaw] = useState<any[]>([]);
  const [businessEthicsTemplates, setBusinessEthicsTemplates] = useState<any[]>([]);
  const [businessEthicsTemplatesRaw, setBusinessEthicsTemplatesRaw] = useState<any[]>([]);
  const [devotionalTemplates, setDevotionalTemplates] = useState<any[]>([]);
  const [devotionalTemplatesRaw, setDevotionalTemplatesRaw] = useState<any[]>([]);
  const [leaderQuotesTemplates, setLeaderQuotesTemplates] = useState<any[]>([]);
  const [leaderQuotesTemplatesRaw, setLeaderQuotesTemplatesRaw] = useState<any[]>([]);
  const [atmanirbharBharatTemplates, setAtmanirbharBharatTemplates] = useState<any[]>([]);
  const [atmanirbharBharatTemplatesRaw, setAtmanirbharBharatTemplatesRaw] = useState<any[]>([]);
  const [goodThoughtsTemplates, setGoodThoughtsTemplates] = useState<any[]>([]);
  const [goodThoughtsTemplatesRaw, setGoodThoughtsTemplatesRaw] = useState<any[]>([]);
  const [trendingTemplates, setTrendingTemplates] = useState<any[]>([]);
  const [trendingTemplatesRaw, setTrendingTemplatesRaw] = useState<any[]>([]);
  const [bhagvatGitaTemplates, setBhagvatGitaTemplates] = useState<any[]>([]);
  const [bhagvatGitaTemplatesRaw, setBhagvatGitaTemplatesRaw] = useState<any[]>([]);
  const [booksTemplates, setBooksTemplates] = useState<any[]>([]);
  const [booksTemplatesRaw, setBooksTemplatesRaw] = useState<any[]>([]);
  const [celebratesMomentsTemplates, setCelebratesMomentsTemplates] = useState<any[]>([]);
  const [celebratesMomentsTemplatesRaw, setCelebratesMomentsTemplatesRaw] = useState<any[]>([]);
  
  // Load data from APIs with caching for instant loads
  const loadApiData = useCallback(async (isRefresh: boolean = false) => {
    setApiLoading(true);
    setApiError(null);
    
    try {
      if (__DEV__) {
        console.log(isRefresh ? '🔄 Refreshing home screen data...' : '📡 Loading home screen data...');
      }
      
      // Track success count for error handling
      let successCount = 0;
      let totalMainRequests = 4;
      const networkErrors: string[] = [];
      
      // Load all 4 APIs in parallel (cache will make this instant on repeat loads)
      const [featuredResponse, eventsResponse, templatesResponse, videosResponse] = await Promise.allSettled([
        homeApi.getFeaturedContent({ limit: 10 }).catch(err => {
          if (__DEV__) {
            console.log('⚠️ Featured content API error:', err?.message || err);
          }
          if (err?.message === 'NETWORK_ERROR' || err?.message === 'TIMEOUT') {
            networkErrors.push('featured');
          }
          throw err;
        }),
        homeApi.getUpcomingEvents({ limit: 200 }).catch(err => {
          if (__DEV__) {
            console.log('⚠️ Events API error:', err?.message || err);
          }
          if (err?.message === 'NETWORK_ERROR' || err?.message === 'TIMEOUT') {
            networkErrors.push('events');
          }
          throw err;
        }),
        homeApi.getProfessionalTemplates({ limit: 200 }).catch(err => {
          if (__DEV__) {
            console.log('⚠️ Templates API error:', err?.message || err);
          }
          if (err?.message === 'NETWORK_ERROR' || err?.message === 'TIMEOUT') {
            networkErrors.push('templates');
          }
          throw err;
        }),
        homeApi.getVideoContent({ limit: 20 }).catch(err => {
          if (__DEV__) {
            console.log('⚠️ Videos API error:', err?.message || err);
          }
          if (err?.message === 'NETWORK_ERROR' || err?.message === 'TIMEOUT') {
            networkErrors.push('videos');
          }
          throw err;
        })
      ]);

      // Handle featured content
      if (featuredResponse.status === 'fulfilled' && featuredResponse.value.success) {
        const featured = featuredResponse.value.data;
        setFeaturedContent(featured);
        successCount++;
        
        // Convert featured content to banners format
        const convertedBanners: Banner[] = featured.map(item => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          link: item.link,
        }));
        setBanners(convertedBanners);
      } else {
        setFeaturedContent([]);
        setBanners([]);
        if (__DEV__ && featuredResponse.status === 'rejected') {
          console.log('❌ Featured content failed:', featuredResponse.reason?.message);
        }
      }

      // Handle upcoming festivals
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.success) {
        const events = eventsResponse.value.data;
        setUpcomingEvents(events);
        successCount++;
      } else {
        setUpcomingEvents([]);
        if (__DEV__ && eventsResponse.status === 'rejected') {
          console.log('❌ Events failed:', eventsResponse.reason?.message);
        }
      }

      // Handle business events
      if (templatesResponse.status === 'fulfilled' && templatesResponse.value.success) {
        const templates = templatesResponse.value.data;
        setProfessionalTemplates(templates);
        successCount++;
        // Initialize templates state with professional templates if not searching
        if (!disableBackgroundUpdates) {
          setTemplates(templates);
        }
        if (__DEV__) {
          console.log('✅ Business events loaded:', templates.length, 'items');
        }
      } else {
        if (__DEV__) {
          console.log('⚠️ Business events API failed');
          if (templatesResponse.status === 'rejected') {
            console.log('❌ Templates failed:', templatesResponse.reason?.message);
          }
        }
        setProfessionalTemplates([]);
        if (!disableBackgroundUpdates) {
          setTemplates([]);
        }
      }

      // Handle video content
      if (videosResponse.status === 'fulfilled' && videosResponse.value.success) {
        setVideoContent(videosResponse.value.data);
        successCount++;
        if (__DEV__) {
          console.log('✅ Video content loaded:', videosResponse.value.data.length, 'items');
        }
      } else {
        if (__DEV__) {
          console.log('⚠️ Video content API failed');
          if (videosResponse.status === 'rejected') {
            console.log('❌ Videos failed:', videosResponse.reason?.message);
          }
        }
        setVideoContent([]);
      }

      // Only show network error if ALL main requests failed AND they were network/timeout errors
      // Don't show error if at least one request succeeded (partial success is acceptable)
      if (successCount === 0 && networkErrors.length > 0) {
        // All requests failed and at least some were network errors
        if (networkErrors.length === totalMainRequests) {
          // All were network errors
          setApiError('Network connection issue. Please check your internet and try again.');
        } else {
          // Some network errors, some other errors - still show network issue
          setApiError('Network connection issue. Please check your internet and try again.');
        }
      } else if (successCount === 0 && networkErrors.length === 0) {
        // All failed but not network errors - might be server issue, don't show error immediately
        if (__DEV__) {
          console.log('⚠️ All requests failed but not network errors - might be temporary server issue');
        }
        // Only show error after retry fails or if it persists
      } else if (successCount > 0 && successCount < totalMainRequests) {
        // Partial success - don't show error, app is still functional
        if (__DEV__) {
          console.log(`✅ Partial success: ${successCount}/${totalMainRequests} requests succeeded`);
        }
      }

      // Load greeting sections in parallel (these are secondary, failures here won't trigger network error)
      const [
        motivationResponse,
        goodMorningResponse,
        businessEthicsResponse,
        devotionalResponse,
        leaderQuotesResponse,
        atmanirbharResponse,
        goodThoughtsResponse,
        trendingResponse,
        bhagvatGitaResponse,
        booksResponse,
        celebratesResponse
      ] = await Promise.allSettled([
        greetingTemplatesService.searchTemplates('motivational').catch(() => []),
        greetingTemplatesService.searchTemplates('good morning').catch(() => []),
        greetingTemplatesService.searchTemplates('business ethics').catch(() => []),
        greetingTemplatesService.searchTemplates('devotional').catch(() => []),
        greetingTemplatesService.searchTemplates('leader quotes').catch(() => []),
        greetingTemplatesService.searchTemplates('atmanirbhar bharat').catch(() => []),
        greetingTemplatesService.searchTemplates('good thoughts').catch(() => []),
        greetingTemplatesService.searchTemplates('trending').catch(() => []),
        greetingTemplatesService.searchTemplates('bhagvat gita').catch(() => []),
        greetingTemplatesService.searchTemplates('books').catch(() => []),
        greetingTemplatesService.searchTemplates('celebrates the moments').catch(() => [])
      ]);

      // Handle greeting sections responses - Batch state updates for better performance
      // React 18+ automatically batches, but we'll process all responses first then update state
      const greetingUpdates = {
        motivation: motivationResponse.status === 'fulfilled' && motivationResponse.value.length > 0
          ? { display: motivationResponse.value.slice(0, 10), raw: motivationResponse.value }
          : { display: [], raw: [] },
        goodMorning: goodMorningResponse.status === 'fulfilled' && goodMorningResponse.value.length > 0
          ? { display: goodMorningResponse.value.slice(0, 10), raw: goodMorningResponse.value }
          : { display: [], raw: [] },
        businessEthics: businessEthicsResponse.status === 'fulfilled' && businessEthicsResponse.value.length > 0
          ? { display: businessEthicsResponse.value.slice(0, 10), raw: businessEthicsResponse.value }
          : { display: [], raw: [] },
        devotional: devotionalResponse.status === 'fulfilled' && devotionalResponse.value.length > 0
          ? { display: devotionalResponse.value.slice(0, 10), raw: devotionalResponse.value }
          : { display: [], raw: [] },
        leaderQuotes: leaderQuotesResponse.status === 'fulfilled' && leaderQuotesResponse.value.length > 0
          ? { display: leaderQuotesResponse.value.slice(0, 10), raw: leaderQuotesResponse.value }
          : { display: [], raw: [] },
        atmanirbharBharat: atmanirbharResponse.status === 'fulfilled' && atmanirbharResponse.value.length > 0
          ? { display: atmanirbharResponse.value.slice(0, 10), raw: atmanirbharResponse.value }
          : { display: [], raw: [] },
        goodThoughts: goodThoughtsResponse.status === 'fulfilled' && goodThoughtsResponse.value.length > 0
          ? { display: goodThoughtsResponse.value.slice(0, 10), raw: goodThoughtsResponse.value }
          : { display: [], raw: [] },
        trending: trendingResponse.status === 'fulfilled' && trendingResponse.value.length > 0
          ? { display: trendingResponse.value.slice(0, 10), raw: trendingResponse.value }
          : { display: [], raw: [] },
        bhagvatGita: bhagvatGitaResponse.status === 'fulfilled' && bhagvatGitaResponse.value.length > 0
          ? { display: bhagvatGitaResponse.value.slice(0, 10), raw: bhagvatGitaResponse.value }
          : { display: [], raw: [] },
        books: booksResponse.status === 'fulfilled' && booksResponse.value.length > 0
          ? { display: booksResponse.value.slice(0, 10), raw: booksResponse.value }
          : { display: [], raw: [] },
        celebratesMoments: celebratesResponse.status === 'fulfilled' && celebratesResponse.value.length > 0
          ? { display: celebratesResponse.value.slice(0, 10), raw: celebratesResponse.value }
          : { display: [], raw: [] },
      };

      // Batch all state updates together (React 18+ auto-batches, but this makes it explicit)
      if (__DEV__ && greetingUpdates.motivation.raw.length > 0) {
        console.log('✅ [MOTIVATION] Setting templates:', greetingUpdates.motivation.raw.length);
      }
      if (__DEV__ && greetingUpdates.goodMorning.raw.length > 0) {
        console.log('✅ [GOOD MORNING] Setting templates:', greetingUpdates.goodMorning.raw.length);
        console.log('📦 [GOOD MORNING] Sample template structure:', JSON.stringify(greetingUpdates.goodMorning.raw[0], null, 2));
      }
      
      // Update all states in a single batch
      setMotivationTemplates(greetingUpdates.motivation.display);
      setMotivationTemplatesRaw(greetingUpdates.motivation.raw);
      setGoodMorningTemplates(greetingUpdates.goodMorning.display);
      setGoodMorningTemplatesRaw(greetingUpdates.goodMorning.raw);
      setBusinessEthicsTemplates(greetingUpdates.businessEthics.display);
      setBusinessEthicsTemplatesRaw(greetingUpdates.businessEthics.raw);
      setDevotionalTemplates(greetingUpdates.devotional.display);
      setDevotionalTemplatesRaw(greetingUpdates.devotional.raw);
      setLeaderQuotesTemplates(greetingUpdates.leaderQuotes.display);
      setLeaderQuotesTemplatesRaw(greetingUpdates.leaderQuotes.raw);
      setAtmanirbharBharatTemplates(greetingUpdates.atmanirbharBharat.display);
      setAtmanirbharBharatTemplatesRaw(greetingUpdates.atmanirbharBharat.raw);
      setGoodThoughtsTemplates(greetingUpdates.goodThoughts.display);
      setGoodThoughtsTemplatesRaw(greetingUpdates.goodThoughts.raw);
      setTrendingTemplates(greetingUpdates.trending.display);
      setTrendingTemplatesRaw(greetingUpdates.trending.raw);
      setBhagvatGitaTemplates(greetingUpdates.bhagvatGita.display);
      setBhagvatGitaTemplatesRaw(greetingUpdates.bhagvatGita.raw);
      setBooksTemplates(greetingUpdates.books.display);
      setBooksTemplatesRaw(greetingUpdates.books.raw);
      setCelebratesMomentsTemplates(greetingUpdates.celebratesMoments.display);
      setCelebratesMomentsTemplatesRaw(greetingUpdates.celebratesMoments.raw);

    } catch (error) {
      // Only catch unexpected errors (like state setting errors or promise.allSettled issues)
      // Expected API errors are already handled above
      if (__DEV__) {
        console.error('Unexpected error loading API data:', error);
      }
      // Don't set apiError here unless it's a truly unexpected error
      // Most errors should be handled by Promise.allSettled above
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      try {
        // Load data from APIs only - no mock data
        await loadApiData();
      } catch (error) {
        if (__DEV__) {
          console.log('Error loading API data:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [activeTab, loadApiData]);

  // Load API data on component mount
  useEffect(() => {
    loadApiData();
  }, [loadApiData]);

  // Load greeting categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await greetingTemplatesService.getCategories();
        if (categories && categories.length > 0) {
          setGreetingCategories(categories);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading greeting categories:', error);
        }
      }
    };
    
    loadCategories();
  }, []);


  const fetchBusinessCategoryPreviewImages = useCallback(async (categories: BusinessCategory[]) => {
    if (!categories || categories.length === 0) {
      return;
    }

    try {
      const imageEntries = await Promise.all(
        categories.map(async category => {
          try {
            const response = await businessCategoryPostersApi.getPostersByCategory(category.name, 1);
            const firstPoster = response.data?.posters?.[0];
            const previewUrl = firstPoster?.imageUrl || firstPoster?.thumbnail;
            if (previewUrl) {
              return [category.id, previewUrl] as const;
            }
          } catch (error) {
            if (__DEV__) {
              console.warn(`⚠️ Failed to fetch preview for category ${category.name}:`, error);
            }
          }
          return [category.id, undefined] as const;
        })
      );

      const nextImages: Record<string, string> = {};
      imageEntries.forEach(([categoryId, imageUrl]) => {
        if (imageUrl) {
          nextImages[categoryId] = imageUrl;
        }
      });

      setBusinessCategoryImages(prev => ({ ...prev, ...nextImages }));
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching business category preview images:', error);
      }
    }
  }, []);

  const fetchGreetingCategoryPreviewImages = useCallback(async (categories: Array<{ id: string; name: string }>) => {
    if (!categories || categories.length === 0) {
      return;
    }

    try {
      const imageEntries = await Promise.all(
        categories.map(async category => {
          try {
            // Use searchTemplates to search by category name in tags
            // This ensures we get templates that have the category name in their tags
            const templates = await greetingTemplatesService.searchTemplates(category.name);
            
            // Filter to find templates that have the category name in their tags
            // The search already filters by tags, but we'll verify the match
            const matchingTemplate = templates.find(template => {
              // Access tags from the template (tags may not be in interface but exist in API response)
              const templateAny = template as any;
              const templateTags = Array.isArray(templateAny.tags) ? templateAny.tags : [];
              
              // Check if any tag contains the category name (case-insensitive)
              const tagMatch = templateTags.some((tag: string) => 
                typeof tag === 'string' && tag.toLowerCase().includes(category.name.toLowerCase())
              );
              
              // Also check if category name matches
              const categoryMatch = template.category?.toLowerCase().includes(category.name.toLowerCase());
              
              return tagMatch || categoryMatch;
            });
            
            // Use the matching template or fall back to first result (search already filters by tags)
            const selectedTemplate = matchingTemplate || templates?.[0];
            const previewUrl = selectedTemplate?.thumbnail || selectedTemplate?.content?.background;
            
            if (previewUrl) {
              if (__DEV__) {
                const templateAny = selectedTemplate as any;
                console.log(`✅ [GREETING PREVIEW] Found preview for category "${category.name}":`, {
                  templateId: selectedTemplate?.id,
                  tags: templateAny?.tags || []
                });
              }
              return [category.id, previewUrl] as const;
            }
          } catch (error) {
            if (__DEV__) {
              console.warn(`⚠️ Failed to fetch preview for greeting category ${category.name}:`, error);
            }
          }
          return [category.id, undefined] as const;
        })
      );

      const nextImages: Record<string, string> = {};
      imageEntries.forEach(([categoryId, imageUrl]) => {
        if (imageUrl) {
          nextImages[categoryId] = imageUrl;
        }
      });

      setGreetingCategoryImages(prev => ({ ...prev, ...nextImages }));
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching greeting category preview images:', error);
      }
    }
  }, []);

  // Load greeting categories list for the section (different from rotating categories)
  useEffect(() => {
    const loadGreetingCategoriesList = async () => {
      setGreetingCategoriesLoading(true);
      try {
        const categories = await greetingTemplatesService.getCategories();
        if (categories && categories.length > 0) {
          setGreetingCategoriesList(categories);
          fetchGreetingCategoryPreviewImages(categories);
          
          if (__DEV__) {
            console.log('✅ [GENERAL CATEGORIES] Loaded:', categories.length, 'categories');
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading greeting categories list:', error);
        }
      } finally {
        setGreetingCategoriesLoading(false);
      }
    };
    
    loadGreetingCategoriesList();
  }, [fetchGreetingCategoryPreviewImages]);

  // Load business categories and filter out user's own category
  useEffect(() => {
    const loadBusinessCategories = async () => {
      setBusinessCategoriesLoading(true);
      try {
        const response = await businessCategoriesService.getBusinessCategories();
        if (response.success && response.categories) {
          // Get current user's business category
          const currentUser = authService.getCurrentUser();
          const userCategory = currentUser?.category || currentUser?._originalCategory || '';
          
          // Filter out user's own business category
          const filteredCategories = response.categories.filter((category: BusinessCategory) => {
            const categoryName = category.name?.trim() || '';
            const userCategoryName = userCategory?.trim() || '';
            // Compare both name and ID to ensure we filter correctly
            return categoryName.toLowerCase() !== userCategoryName.toLowerCase() &&
                   category.id !== userCategory;
          });
          
          setBusinessCategories(filteredCategories);
          fetchBusinessCategoryPreviewImages(filteredCategories);
          
          if (__DEV__) {
            console.log('✅ [BUSINESS CATEGORIES] Loaded:', filteredCategories.length, 'categories');
            console.log('   User category (excluded):', userCategory);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading business categories:', error);
        }
      } finally {
        setBusinessCategoriesLoading(false);
      }
    };
    
    loadBusinessCategories();
  }, [fetchBusinessCategoryPreviewImages]);

  // Rotate categories every 3 seconds
  useEffect(() => {
    if (greetingCategories.length === 0) return;
    
    const interval = setInterval(() => {
      animateCategoryChange();
      setCurrentCategoryIndex((prevIndex) => (prevIndex + 1) % greetingCategories.length);
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [greetingCategories, animateCategoryChange]);

  // Optimized: Use ref to cache greeting templates and only recalculate when data lengths change
  const greetingTemplatesCacheRef = useRef<{
    templates: any[];
    lengthsSignature: string; // Serialized lengths for quick comparison
  }>({ templates: [], lengthsSignature: '' });

  // Collect all greeting templates for unified search (optimized with caching)
  const allGreetingTemplates = useMemo(() => {
    // Calculate current lengths signature for quick comparison
    const currentLengthsSignature = [
      motivationTemplatesRaw.length,
      goodMorningTemplatesRaw.length,
      businessEthicsTemplatesRaw.length,
      devotionalTemplatesRaw.length,
      leaderQuotesTemplatesRaw.length,
      atmanirbharBharatTemplatesRaw.length,
      goodThoughtsTemplatesRaw.length,
      trendingTemplatesRaw.length,
      bhagvatGitaTemplatesRaw.length,
      booksTemplatesRaw.length,
      celebratesMomentsTemplatesRaw.length,
    ].join(',');
    
    // If lengths haven't changed, return cached result (optimization)
    if (greetingTemplatesCacheRef.current.lengthsSignature === currentLengthsSignature && 
        greetingTemplatesCacheRef.current.templates.length > 0) {
      return greetingTemplatesCacheRef.current.templates;
    }
    
    const all: any[] = [];
    
    // Collect from all greeting sections (use Raw arrays for complete data)
    if (motivationTemplatesRaw.length > 0) all.push(...motivationTemplatesRaw);
    if (goodMorningTemplatesRaw.length > 0) all.push(...goodMorningTemplatesRaw);
    if (businessEthicsTemplatesRaw.length > 0) all.push(...businessEthicsTemplatesRaw);
    if (devotionalTemplatesRaw.length > 0) all.push(...devotionalTemplatesRaw);
    if (leaderQuotesTemplatesRaw.length > 0) all.push(...leaderQuotesTemplatesRaw);
    if (atmanirbharBharatTemplatesRaw.length > 0) all.push(...atmanirbharBharatTemplatesRaw);
    if (goodThoughtsTemplatesRaw.length > 0) all.push(...goodThoughtsTemplatesRaw);
    if (trendingTemplatesRaw.length > 0) all.push(...trendingTemplatesRaw);
    if (bhagvatGitaTemplatesRaw.length > 0) all.push(...bhagvatGitaTemplatesRaw);
    if (booksTemplatesRaw.length > 0) all.push(...booksTemplatesRaw);
    if (celebratesMomentsTemplatesRaw.length > 0) all.push(...celebratesMomentsTemplatesRaw);
    
    // Convert greeting templates to Template format for unified search
    const converted = all.map(greetingTemplate => ({
      id: greetingTemplate.id,
      name: greetingTemplate.name || greetingTemplate.title || '',
      thumbnail: greetingTemplate.thumbnail || greetingTemplate.imageUrl || '',
      category: greetingTemplate.category || 'Greeting',
      downloads: greetingTemplate.downloads || 0,
      isDownloaded: greetingTemplate.isDownloaded || false,
      description: greetingTemplate.description || greetingTemplate.content?.text || '',
      tags: greetingTemplate.tags || [],
      isGreeting: true, // Flag to identify greeting templates
      originalTemplate: greetingTemplate, // Keep reference to original
    }));
    
    // Cache the result
    greetingTemplatesCacheRef.current = {
      templates: converted,
      lengthsSignature: currentLengthsSignature,
    };
    
    // Debug: Log Good Morning templates structure (dev only)
    if (__DEV__ && goodMorningTemplatesRaw.length > 0) {
      console.log('🔍 [SEARCH] Good Morning templates count:', goodMorningTemplatesRaw.length);
      console.log('🔍 [SEARCH] Sample Good Morning template:', JSON.stringify(converted.find(t => goodMorningTemplatesRaw.some(gm => gm.id === t.id)), null, 2));
    }
    
    return converted;
  }, [
    motivationTemplatesRaw,
    goodMorningTemplatesRaw,
    businessEthicsTemplatesRaw,
    devotionalTemplatesRaw,
    leaderQuotesTemplatesRaw,
    atmanirbharBharatTemplatesRaw,
    goodThoughtsTemplatesRaw,
    trendingTemplatesRaw,
    bhagvatGitaTemplatesRaw,
    booksTemplatesRaw,
    celebratesMomentsTemplatesRaw,
  ]);

  // Debounced search handler - triggers search after user stops typing
  useEffect(() => {
    // Clear any existing timeout
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        // Reset to show all business events from API
        setTemplates(professionalTemplates);
        setIsSearching(false);
        setDisableBackgroundUpdates(false);
      } else {
        // Trigger search after debounce delay
        const requestId = currentRequestId + 1;
        setCurrentRequestId(requestId);
        setIsSearching(true);
        setDisableBackgroundUpdates(true);
        
        // Combine professional templates and greeting templates for unified search
        const allTemplates = [...professionalTemplates, ...allGreetingTemplates];
        
        if (__DEV__) {
          console.log('🔍 [SEARCH] Total templates to search:', allTemplates.length);
          console.log('🔍 [SEARCH] Professional templates:', professionalTemplates.length);
          console.log('🔍 [SEARCH] Greeting templates:', allGreetingTemplates.length);
          console.log('🔍 [SEARCH] Query:', searchQuery);
        }
        
        // Use local search immediately for better performance
        // Search in name, category, description, and tags
        const searchLower = searchQuery.toLowerCase();
        const filtered = allTemplates.filter(template => {
          // Search in name
          if (template.name?.toLowerCase().includes(searchLower)) return true;
          
          // Search in category
          if (template.category?.toLowerCase().includes(searchLower)) return true;
          
          // Search in description
          if (template.description?.toLowerCase().includes(searchLower)) return true;
          
          // Search in tags array
          if (template.tags && Array.isArray(template.tags)) {
            const tagMatch = template.tags.some((tag: string) => 
              tag?.toLowerCase().includes(searchLower)
            );
            if (tagMatch) return true;
          }
          
          return false;
        });
        
        if (__DEV__) {
          console.log('🔍 [SEARCH] Filtered results:', filtered.length);
          if (filtered.length > 0) {
            console.log('🔍 [SEARCH] Sample result:', JSON.stringify(filtered[0], null, 2));
          }
        }
        
        setTemplates(filtered);
        
        // Try API search in background for professional templates
        setTimeout(async () => {
          if (currentRequestId !== requestId) return;
          try {
            // Search professional templates via API
            const professionalResults = await dashboardService.searchTemplates(searchQuery);
            
            // Search greeting templates via API
            const greetingResults = await greetingTemplatesService.searchTemplates(searchQuery);
            
            // Convert greeting results to Template format
            const convertedGreetingResults = greetingResults.map(greetingTemplate => ({
              id: greetingTemplate.id,
              name: greetingTemplate.name || '',
              thumbnail: greetingTemplate.thumbnail || '',
              category: greetingTemplate.category || 'Greeting',
              downloads: greetingTemplate.downloads || 0,
              isDownloaded: greetingTemplate.isDownloaded || false,
              description: greetingTemplate.content?.text || '',
              tags: (greetingTemplate as any).tags || [],
              isGreeting: true,
              originalTemplate: greetingTemplate,
            }));
            
            // Combine results
            const combinedResults = [...professionalResults, ...convertedGreetingResults];
            
            if (currentRequestId === requestId) {
              setTemplates(combinedResults);
            }
          } catch (error) {
            if (__DEV__) {
              if (__DEV__) {
              console.error('Search error:', error);
            }
            }
          }
        }, 100);
      }
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount or when searchQuery changes
    return () => clearTimeout(timeoutId);
  }, [searchQuery, professionalTemplates, allGreetingTemplates, currentRequestId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Clear all caches before refreshing
      homeApi.clearCache();
      
      // Refresh API data
      await loadApiData(true);
    } catch (error) {
      if (__DEV__) {
        console.log('Error refreshing data:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadApiData]);

  const handleTabChange = useCallback(async (tab: string) => {
    setActiveTab(tab);
    setIsSearching(false); // Reset search state
    
    // Use API data for different tabs
    try {
      // Filter business events based on tab
      const filteredTemplates = professionalTemplates.filter(template => {
        if (tab === 'daily') return template.category?.toLowerCase().includes('daily');
        if (tab === 'festival') return template.category?.toLowerCase().includes('festival');
        if (tab === 'special') return template.category?.toLowerCase().includes('special');
        return true; // 'all' tab shows all templates
      });
      setTemplates(filteredTemplates);
    } catch (error) {
      if (__DEV__) {
        console.log('Error filtering templates for tab:', tab, error);
      }
    }
  }, [professionalTemplates]);

  // Like functionality has been removed - templates no longer have like status
  const applyUserLikeStatus = useCallback(async (templates: Template[]) => {
    return templates;
  }, []);


  const handleDownloadTemplate = useCallback(async (templateId: string) => {
    // Update local state immediately for better UX
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isDownloaded: true, downloads: template.downloads + 1 }
        : template
    ));
    
    // Try API call in background
    setTimeout(async () => {
      try {
        await dashboardService.downloadTemplate(templateId);
      } catch (error) {
        if (__DEV__) {
          console.error('Error downloading template:', error);
        }
      }
    }, 100);
  }, []);

  const handleSearch = useCallback(async () => {
    const requestId = currentRequestId + 1;
    setCurrentRequestId(requestId);
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setDisableBackgroundUpdates(false); // Re-enable background updates when clearing search
      setTemplates(professionalTemplates);
      
      // Try API call in background
      setTimeout(async () => {
        // Check if this is still the current request
        if (currentRequestId !== requestId) return;
        
        try {
          const templatesData = await dashboardService.getTemplatesByTab(activeTab);
          // Only update if this is still the current request
          if (currentRequestId === requestId) {
            setTemplates(templatesData);
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Search reset error:', error);
          }
        }
      }, 100);
      return;
    }
    
    setIsSearching(true);
    setDisableBackgroundUpdates(true); // Disable background updates when searching
    // Use local search immediately for better performance with API data
    const filtered = professionalTemplates.filter(template => 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setTemplates(filtered);
    
    // Try API search in background
    setTimeout(async () => {
      // Check if this is still the current request
      if (currentRequestId !== requestId) return;
      
      try {
        const results = await dashboardService.searchTemplates(searchQuery);
        // Only update if this is still the current request and we're still searching
        if (currentRequestId === requestId && isSearching) {
          setTemplates(results);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 100);
  }, [searchQuery, activeTab, professionalTemplates, currentRequestId, isSearching]);

const handleTemplatePress = useCallback((template: Template | VideoContent | any) => {
  const matchedVideo = videoContent.find(video => video.id === template.id);

  if (matchedVideo) {
    const related = videoContent.filter(video => video.id !== matchedVideo.id);
    navigation.navigate('VideoPlayer', {
      selectedVideo: matchedVideo,
      relatedVideos: related,
    });
    return;
  }

  // Check if it's a greeting template
  if (template.isGreeting && template.originalTemplate) {
    const relatedTemplates = allGreetingTemplates.filter(t => t.id !== template.id);
    navigation.navigate('PosterPlayer', {
      selectedPoster: template.originalTemplate,
      relatedPosters: relatedTemplates.map(t => t.originalTemplate || t),
      searchQuery: searchQuery,
      templateSource: 'greeting',
    });
    return;
  }

  const matchedPoster = professionalTemplates.find(poster => poster.id === template.id);
  const related = professionalTemplates.filter(poster => poster.id !== (matchedPoster?.id ?? template.id));

  navigation.navigate('PosterPlayer', {
    selectedPoster: (matchedPoster ?? template) as Template,
    relatedPosters: related,
  });
}, [videoContent, professionalTemplates, allGreetingTemplates, navigation, searchQuery]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedTemplate(null);
  }, []);

  const handleViewAllUpcomingEvents = useCallback(() => {
    setIsUpcomingEventsModalVisible(true);
  }, []);

  const closeUpcomingEventsModal = useCallback(() => {
    setIsUpcomingEventsModalVisible(false);
  }, []);

  const handleViewAllTemplates = useCallback(() => {
    setIsTemplatesModalVisible(true);
  }, []);

  const closeTemplatesModal = useCallback(() => {
    setIsTemplatesModalVisible(false);
  }, []);

  const handleViewAllVideos = useCallback(() => {
    setIsVideosModalVisible(true);
  }, []);

  const closeVideosModal = useCallback(() => {
    setIsVideosModalVisible(false);
  }, []);

  // Greeting section modal handlers
  const handleViewAllMotivation = useCallback(() => {
    setIsMotivationModalVisible(true);
  }, []);

  const closeMotivationModal = useCallback(() => {
    setIsMotivationModalVisible(false);
  }, []);

  const handleViewAllGoodMorning = useCallback(() => {
    setIsGoodMorningModalVisible(true);
  }, []);

  const closeGoodMorningModal = useCallback(() => {
    setIsGoodMorningModalVisible(false);
  }, []);

  const handleViewAllBusinessEthics = useCallback(() => {
    setIsBusinessEthicsModalVisible(true);
  }, []);

  const closeBusinessEthicsModal = useCallback(() => {
    setIsBusinessEthicsModalVisible(false);
  }, []);

  const handleViewAllDevotional = useCallback(() => {
    setIsDevotionalModalVisible(true);
  }, []);

  const closeDevotionalModal = useCallback(() => {
    setIsDevotionalModalVisible(false);
  }, []);

  const handleViewAllLeaderQuotes = useCallback(() => {
    setIsLeaderQuotesModalVisible(true);
  }, []);

  const closeLeaderQuotesModal = useCallback(() => {
    setIsLeaderQuotesModalVisible(false);
  }, []);

  const handleViewAllAtmanirbharBharat = useCallback(() => {
    setIsAtmanirbharBharatModalVisible(true);
  }, []);

  const closeAtmanirbharBharatModal = useCallback(() => {
    setIsAtmanirbharBharatModalVisible(false);
  }, []);

  const handleViewAllGoodThoughts = useCallback(() => {
    setIsGoodThoughtsModalVisible(true);
  }, []);

  const closeGoodThoughtsModal = useCallback(() => {
    setIsGoodThoughtsModalVisible(false);
  }, []);

  const handleViewAllTrending = useCallback(() => {
    setIsTrendingModalVisible(true);
  }, []);

  const closeTrendingModal = useCallback(() => {
    setIsTrendingModalVisible(false);
  }, []);

  const handleViewAllBhagvatGita = useCallback(() => {
    setIsBhagvatGitaModalVisible(true);
  }, []);

  const closeBhagvatGitaModal = useCallback(() => {
    setIsBhagvatGitaModalVisible(false);
  }, []);

  const handleViewAllBooks = useCallback(() => {
    setIsBooksModalVisible(true);
  }, []);

  const closeBooksModal = useCallback(() => {
    setIsBooksModalVisible(false);
  }, []);

  const handleViewAllCelebratesMoments = useCallback(() => {
    setIsCelebratesMomentsModalVisible(true);
  }, []);

  const closeCelebratesMomentsModal = useCallback(() => {
    setIsCelebratesMomentsModalVisible(false);
  }, []);

  const handleViewAllFeaturedContent = useCallback(() => {
    setIsFeaturedContentModalVisible(true);
  }, []);

  const closeFeaturedContentModal = useCallback(() => {
    setIsFeaturedContentModalVisible(false);
  }, []);

  const handleViewAllBusinessCategories = useCallback(() => {
    // Navigate to GreetingTemplatesScreen which shows all categories
    navigation.navigate('GreetingTemplates');
  }, [navigation]);

  const handleViewAllGeneralCategories = useCallback(() => {
    // Navigate to GreetingTemplatesScreen which shows all general/greeting categories
    navigation.navigate('GreetingTemplates');
  }, [navigation]);

  // Memoized render functions to prevent unnecessary re-renders
  const renderBanner = useCallback(({ item }: { item: Banner }) => {
    // Convert featured content to Template format for navigation
    const convertFeaturedContentToTemplate = (featured: FeaturedContent): Template => ({
      id: featured.id,
      name: featured.title,
      thumbnail: featured.imageUrl,
      category: featured.type || 'Featured Content',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    });

    const handleBannerPress = () => {
      // Find the clicked featured content item
      const clickedFeaturedContent = featuredContent.find(fc => fc.id === item.id);
      
      if (!clickedFeaturedContent) {
        // Fallback if featured content not found
        const bannerTemplate: Template = {
          id: item.id || 'banner-template',
          name: item.title,
          thumbnail: item.imageUrl,
          category: 'Featured Content',
          downloads: 0,
          isDownloaded: false,
        };
        navigation.navigate('PosterPlayer', {
          selectedPoster: bannerTemplate,
          relatedPosters: [], // No related if featured content not found
        });
        return;
      }

      // Convert clicked item to template
      const selectedTemplate = convertFeaturedContentToTemplate(clickedFeaturedContent);
      
      // Get other featured content items (excluding the clicked one) and convert to templates
      const relatedTemplates = featuredContent
        .filter(fc => fc.id !== item.id)
        .map(convertFeaturedContentToTemplate);

      navigation.navigate('PosterPlayer', {
        selectedPoster: selectedTemplate,
        relatedPosters: relatedTemplates, // Show other featured content items
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bannerContainerWrapper}
        onPress={handleBannerPress}
      >
                 <View style={styles.bannerContainer}>
          <OptimizedImage 
            uri={item.imageUrl} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
           <LinearGradient
             colors={['transparent', 'rgba(0,0,0,0.7)']}
             style={styles.bannerOverlay}
           />
           <View style={styles.bannerContent}>
             {/* Banner title removed as per user request */}
             <TouchableOpacity 
               style={[styles.bannerButton, { backgroundColor: theme.colors.cardBackground }]}
               onPress={handleBannerPress}
             >
               <Text style={[styles.bannerButtonText, { color: theme.colors.primary }]}>VIEW</Text>
             </TouchableOpacity>
           </View>
         </View>
      </TouchableOpacity>
    );
  }, [theme, navigation, featuredContent]);

                                       

  const renderTemplate = useCallback(({ item }: { item: Template }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handleCardPress = () => {
      handleTemplatePress(item);
    };

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCardPress}
        style={styles.templateCardWrapper}
      >
        <Animated.View 
          style={[
            styles.templateCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={[styles.templateImageContainer, { height: cardWidth }]}>
            <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleTemplatePress, theme, cardWidth]);


  const renderVideoTemplate = useCallback(({ item }: { item: VideoContent }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handleCardPress = () => {
      setShowVideoComingSoonModal(true);
    };



    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCardPress}
        style={styles.templateCardWrapper}
      >
        <Animated.View 
          style={[
            styles.templateCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={[styles.templateImageContainer, { height: cardWidth }]}>
            <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
            <View style={styles.videoPlayOverlay}>
              <Icon name="play-arrow" size={playIconSize} color="#ffffff" />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [theme, playIconSize, cardWidth]);

  const featuredCarouselItemWidth = useMemo(() => screenWidth - moderateScale(40), [screenWidth]);
  const featuredCarouselSnapInterval = useMemo(() => featuredCarouselItemWidth + moderateScale(10), [featuredCarouselItemWidth]);

  // Memoized key extractors
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Factory function to create category-specific render functions for greeting cards
  const createGreetingCardRenderer = useCallback((categoryTemplates: any[], searchQuery?: string, onCardPress?: (template: any) => void) => {
    return ({ item }: { item: any }) => {
      if (!item || !item.thumbnail) {
        if (__DEV__) {
          console.error('❌ [RENDER GREETING CARD] Invalid item:', item);
        }
        return null;
      }

      return (
        <TouchableOpacity
          activeOpacity={0.7}
        onPress={() => {
          if (onCardPress) {
            onCardPress(item);
          }
            // Navigate to PosterPlayer with category-specific templates
            const relatedTemplates = categoryTemplates.filter(template => template.id !== item.id);
            navigation.navigate('PosterPlayer', {
              selectedPoster: item,
              relatedPosters: relatedTemplates,
              searchQuery: searchQuery,
              templateSource: 'greeting',
            });
          }}
          style={styles.templateCardWrapper}
        >
          <View
            style={[
              styles.templateCard,
              {
                backgroundColor: theme.colors.cardBackground,
              }
            ]}
          >
            <View style={[styles.templateImageContainer, { height: cardWidth }]}>
              <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>
      );
    };
  }, [navigation, theme, cardWidth]);



  const renderBrowseAllButton = useCallback((onPress: () => void) => (
    <TouchableOpacity
      style={styles.viewAllButton}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.viewAllButtonGradient}
      >
        <Text style={styles.viewAllButtonText}>View More</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), [theme.colors.primary, theme.colors.secondary]);

  const featuredCarouselRef = useRef<FlatList<FeaturedContent>>(null);
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);

  useEffect(() => {
    if (!featuredContent.length) return;

    const interval = setInterval(() => {
      setFeaturedCarouselIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % featuredContent.length;
        featuredCarouselRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredContent]);

  const handleFeaturedCarouselPress = useCallback((item: FeaturedContent) => {
    const selectedTemplate: Template = {
      id: item.id,
      name: item.title,
      thumbnail: item.imageUrl,
      category: item.type || 'Featured Content',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    };

    const relatedTemplates = featuredContent
      .filter(fc => fc.id !== item.id)
      .map(fc => ({
        id: fc.id,
        name: fc.title,
        thumbnail: fc.imageUrl,
        category: fc.type || 'Featured Content',
        downloads: 0,
        isDownloaded: false,
        tags: [],
      }));

    navigation.navigate('PosterPlayer', {
      selectedPoster: selectedTemplate,
      relatedPosters: relatedTemplates,
    });
  }, [featuredContent, navigation]);

  const handleFeaturedCarouselScrollFailure = useCallback((info: { index: number }) => {
    requestAnimationFrame(() => {
      featuredCarouselRef.current?.scrollToOffset({
        offset: info.index * featuredCarouselSnapInterval,
        animated: true,
      });
    });
  }, [featuredCarouselSnapInterval]);

  const getFeaturedCarouselItemLayout = useCallback((_: any, index: number) => ({
    length: featuredCarouselSnapInterval,
    offset: featuredCarouselSnapInterval * index,
    index,
  }), [featuredCarouselSnapInterval]);

  const renderFeaturedCarouselItem = useCallback(({ item }: { item: FeaturedContent }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.85}
      style={[styles.featuredCarouselCard, { width: featuredCarouselItemWidth }]}
      onPress={() => handleFeaturedCarouselPress(item)}
    >
      <OptimizedImage uri={item.imageUrl} style={styles.featuredCarouselImage} resizeMode="cover" />
    </TouchableOpacity>
  ), [handleFeaturedCarouselPress, featuredCarouselItemWidth]);

  // Handler for business category press - navigate to PosterPlayerScreen with selected category
  const handleBusinessCategoryPress = useCallback((category: BusinessCategory) => {
    navigation.navigate('PosterPlayer', {
      selectedPoster: {
        id: 'loading',
        name: category.name,
        thumbnail: '',
        category: category.name,
        downloads: 0,
        isDownloaded: false,
      },
      relatedPosters: [],
      searchQuery: '',
      templateSource: 'professional',
      businessCategory: category.name, // Pass the selected business category
    });
  }, [navigation]);

  // Handler for greeting category press - navigate to PosterPlayerScreen with selected greeting category
  const handleGreetingCategoryPress = useCallback((category: { id: string; name: string }) => {
    navigation.navigate('PosterPlayer', {
      selectedPoster: {
        id: 'loading',
        name: category.name,
        thumbnail: '',
        category: category.name,
        downloads: 0,
        isDownloaded: false,
      },
      relatedPosters: [],
      searchQuery: '',
      templateSource: 'greeting',
      greetingCategory: category.name, // Pass the selected greeting category
    });
  }, [navigation]);

  // Render business category card
  const renderBusinessCategoryCard = useCallback(({ item }: { item: BusinessCategory }) => {
    const categoryImage =
      businessCategoryImages[item.id] ||
      item.imageUrl ||
      item.image ||
      null;
    
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.businessCategoryCard, { width: cardWidth }]}
        onPress={() => handleBusinessCategoryPress(item)}
      >
        <View style={[
          styles.businessCategoryCardContent, 
          { 
            backgroundColor: theme.colors.cardBackground,
            height: cardWidth, // Make cards square
          }
        ]}>
          <View style={styles.businessCategoryImageSection}>
            {categoryImage ? (
              <View style={styles.businessCategoryImageContainer}>
                <OptimizedImage 
                  uri={categoryImage} 
                  style={styles.businessCategoryImage}
                  resizeMode="cover"
                />
              </View>
            ) : item.icon ? (
              <Text style={styles.businessCategoryIcon}>
                {item.icon}
              </Text>
            ) : null}
          </View>
          <Text 
            style={[styles.businessCategoryName, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleBusinessCategoryPress, cardWidth, theme, businessCategoryImages]);

  // Render greeting category card
  const renderGreetingCategoryCard = useCallback(({ item }: { item: { id: string; name: string; icon: string; color?: string } }) => {
    const categoryImage = greetingCategoryImages[item.id] || null;
    
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.businessCategoryCard, { width: cardWidth }]}
        onPress={() => handleGreetingCategoryPress(item)}
      >
        <View style={[
          styles.businessCategoryCardContent, 
          { 
            backgroundColor: theme.colors.cardBackground,
            height: cardWidth, // Make cards square
          }
        ]}>
          <View style={styles.businessCategoryImageSection}>
            {categoryImage ? (
              <View style={styles.businessCategoryImageContainer}>
                <OptimizedImage 
                  uri={categoryImage} 
                  style={styles.businessCategoryImage}
                  resizeMode="cover"
                />
              </View>
            ) : item.icon ? (
              <Text style={styles.businessCategoryIcon}>
                {item.icon}
              </Text>
            ) : null}
          </View>
          <Text 
            style={[styles.businessCategoryName, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleGreetingCategoryPress, cardWidth, theme, greetingCategoryImages]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gradient[0] || '#e8e8e8' }]}>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="transparent" 
          translucent={true}
        />
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Getting things ready...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.gradient[0] || '#e8e8e8' }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greeting}>
              {/* <Text style={styles.userName}>Event Management</Text> */}
              {apiError && (
                <View style={styles.apiStatusIndicator}>
                  <Icon name="wifi-off" size={statusIconSize} color="#ff9800" />
                  <Text style={styles.apiStatusText}>Offline Mode</Text>
                </View>
              )}
            </View>
            {apiLoading && (
              <View style={styles.apiLoadingIndicator}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.apiLoadingText}>Loading...</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          removeClippedSubviews={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          bounces={true}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.colors.cardBackground }]}>
              <Icon name="search" size={searchIconSize} color={theme.colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search templates..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={searchIconSize} color={theme.colors.textSecondary} style={styles.clearIcon} />
                </TouchableOpacity>
              )}
            </View>
            
          {/* Category Buttons */}
          <View style={styles.categoryButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  styles.categoryButtonBusiness,
                  selectedCategory === 'business' && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory('business')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={selectedCategory === 'business' 
                    ? ['#667eea', '#764ba2']
                    : ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryButtonGradient}
                >
                  <View style={styles.categoryButtonContent}>
                    <Icon 
                      name="business" 
                      size={moderateScale(14)} 
                      color={selectedCategory === 'business' ? '#ffffff' : '#667eea'} 
                      style={styles.categoryButtonIcon}
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      styles.categoryButtonTextBusiness,
                      { color: selectedCategory === 'business' ? '#ffffff' : '#667eea' }
                    ]}>
                      Business
                    </Text>
          </View>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  styles.categoryButtonRotating,
                  selectedCategory === 'general' && styles.categoryButtonActive,
                ]}
                onPress={() => navigation.navigate('GreetingTemplates')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryButtonGradient}
                >
                  <View style={styles.categoryButtonContent}>
                    <Icon 
                      name="auto-awesome" 
                      size={moderateScale(14)} 
                      color="#ffffff" 
                      style={styles.categoryButtonIcon}
                    />
                    <Animated.Text style={[
                      styles.categoryButtonText,
                      styles.categoryButtonRotatingText,
                      { 
                        color: '#ffffff',
                        opacity: categoryFadeAnim,
                      }
                    ]}>
                      {greetingCategories.length > 0 
                        ? greetingCategories[currentCategoryIndex]?.name || 'General'
                        : 'General'}
                    </Animated.Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {featuredContent.length > 0 && (
            <View style={styles.featuredCarouselContainer}>
              <FlatList
                ref={featuredCarouselRef}
                data={featuredContent}
                renderItem={renderFeaturedCarouselItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToAlignment="center"
                snapToInterval={featuredCarouselSnapInterval}
                decelerationRate="fast"
                getItemLayout={getFeaturedCarouselItemLayout}
                onScrollToIndexFailed={handleFeaturedCarouselScrollFailure}
                contentContainerStyle={styles.featuredCarouselList}
              />
              <View style={styles.featuredCarouselIndicators}>
                {featuredContent.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.featuredCarouselDot,
                      index === featuredCarouselIndex && styles.featuredCarouselDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Business Categories Section */}
          {!isSearching && searchQuery.trim() === '' && businessCategories.length > 0 && (
            <View style={styles.businessCategoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Business Categories</Text>
                {renderBrowseAllButton(handleViewAllBusinessCategories)}
              </View>
              <FlatList
                data={businessCategories}
                renderItem={renderBusinessCategoryCard}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* General Categories Section */}
          {!isSearching && searchQuery.trim() === '' && greetingCategoriesList.length > 0 && (
            <View style={styles.businessCategoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>General Categories</Text>
                {renderBrowseAllButton(handleViewAllGeneralCategories)}
              </View>
              <FlatList
                data={greetingCategoriesList}
                renderItem={renderGreetingCategoryCard}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Festival Calendar - Commented out for now */}
          {/* <View style={styles.calendarSection}>
            <SimpleFestivalCalendar />
          </View> */}

          {/* Tabs - All tabs commented out */}
          {/* <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: activeTab === 'trending' ? theme.colors.cardBackground : 'rgba(255,255,255,0.2)' }
              ]}
              onPress={() => handleTabChange('trending')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'trending' ? theme.colors.primary : '#ffffff' }
              ]}>
                TRENDING
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: activeTab === 'festival' ? theme.colors.cardBackground : 'rgba(255,255,255,0.2)' }
              ]}
              onPress={() => handleTabChange('festival')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'festival' ? theme.colors.primary : '#ffffff' }
              ]}>
                FESTIVAL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: activeTab === 'video' ? theme.colors.cardBackground : 'rgba(255,255,255,0.2)' }
              ]}
              onPress={() => handleTabChange('video')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'video' ? theme.colors.primary : '#ffffff' }
              ]}>
                VIDEO
              </Text>
            </TouchableOpacity>
          </View> */}


          {/* Upcoming Festivals - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && upcomingEvents.length > 0 && (
            <View style={styles.upcomingEventsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Upcoming Festivals</Text>
                {renderBrowseAllButton(handleViewAllUpcomingEvents)}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upcomingEventsList}
                nestedScrollEnabled={true}
              >
                {upcomingEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    activeOpacity={0.8}
                    style={styles.upcomingEventCard}
                    onPress={() => {
                      // Convert upcoming event to template format for navigation
                      const eventTemplate: Template = {
                        id: `event-${event.id}`,
                        name: event.title,
                        thumbnail: event.imageUrl,
                        category: `${event.category} • ${event.date} • ${event.location}`,
                        downloads: 0,
                        isDownloaded: false,
                      };
                      navigation.navigate('PosterPlayer', {
                        selectedPoster: eventTemplate,
                        relatedPosters: professionalTemplates.slice(0, 6),
                      });
                    }}
                  >
                    <View style={styles.upcomingEventImageContainer}>
                      <OptimizedImage 
                        uri={event.imageUrl} 
                        style={styles.upcomingEventImage}
                        resizeMode="cover"
                        fallbackSource={require('../assets/MainLogo/MB.png')}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.upcomingEventOverlay}
                      />
                      {/* <View style={styles.upcomingEventBadge}>
                        <Text style={styles.upcomingEventBadgeText}>{event.category}</Text>
                      </View> */}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Templates Grid - Hidden when searching, only show if data exists */}
          {!isSearching && searchQuery.trim() === '' && professionalTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Business Events</Text>
                {renderBrowseAllButton(handleViewAllTemplates)}
              </View>
              <FlatList
                key={`templates-${templates.length}`}
                data={templates.length > 0 ? templates : professionalTemplates}
                renderItem={renderTemplate}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}
          
          {/* Search Results - Shown only when searching */}
          {isSearching && searchQuery.trim() !== '' && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Search Results</Text>
              </View>
              {templates.length > 0 ? (
                <FlatList
                  key={`search-results-${templates.length}`}
                  data={templates}
                  renderItem={renderTemplate}
                  keyExtractor={keyExtractor}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  getItemLayout={getItemLayout}
                  contentContainerStyle={styles.horizontalList}
                />
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                    No results found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Video Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && videoContent.length > 0 && (
            <View style={styles.videoSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Video Content</Text>
                {renderBrowseAllButton(handleViewAllVideos)}
              </View>
              <FlatList
                key={`video-content-${videoContent.length}`}
                data={videoContent}
                renderItem={renderVideoTemplate}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Motivation Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && motivationTemplates.length > 0 && (
            <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Motivation</Text>
              {renderBrowseAllButton(handleViewAllMotivation)}
            </View>
              <FlatList
                data={motivationTemplates}
                renderItem={createGreetingCardRenderer(
                  motivationTemplatesRaw.length > 0 ? motivationTemplatesRaw : motivationTemplates,
                  'motivational'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Good Morning Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && goodMorningTemplates.length > 0 && (
            <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Good Morning</Text>
              {renderBrowseAllButton(handleViewAllGoodMorning)}
            </View>
              <FlatList
                data={goodMorningTemplates}
                renderItem={createGreetingCardRenderer(
                  goodMorningTemplatesRaw.length > 0 ? goodMorningTemplatesRaw : goodMorningTemplates,
                  'good morning',
                  () => {
                    console.log(
                      '📦 [GOOD MORNING] API Response:',
                      JSON.stringify(goodMorningTemplatesRaw, null, 2)
                    );
                  }
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
              />
            </View>
          )}

          {/* Business Ethics Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && businessEthicsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Business Ethics</Text>
              {renderBrowseAllButton(handleViewAllBusinessEthics)}
            </View>
              <FlatList
                data={businessEthicsTemplates}
                renderItem={createGreetingCardRenderer(
                  businessEthicsTemplatesRaw.length > 0 ? businessEthicsTemplatesRaw : businessEthicsTemplates,
                  'business ethics'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Devotional Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && devotionalTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Devotional</Text>
                {renderBrowseAllButton(handleViewAllDevotional)}
              </View>
              <FlatList
                data={devotionalTemplates}
                renderItem={createGreetingCardRenderer(
                  devotionalTemplatesRaw.length > 0 ? devotionalTemplatesRaw : devotionalTemplates,
                  'devotional'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Leader Quotes Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && leaderQuotesTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Leader Quotes</Text>
                {renderBrowseAllButton(handleViewAllLeaderQuotes)}
              </View>
              <FlatList
                data={leaderQuotesTemplates}
                renderItem={createGreetingCardRenderer(
                  leaderQuotesTemplatesRaw.length > 0 ? leaderQuotesTemplatesRaw : leaderQuotesTemplates,
                  'leader quotes'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Atmanirbhar Bharat Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && atmanirbharBharatTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Atmanirbhar Bharat</Text>
                {renderBrowseAllButton(handleViewAllAtmanirbharBharat)}
              </View>
              <FlatList
                data={atmanirbharBharatTemplates}
                renderItem={createGreetingCardRenderer(
                  atmanirbharBharatTemplatesRaw.length > 0 ? atmanirbharBharatTemplatesRaw : atmanirbharBharatTemplates,
                  'atmanirbhar bharat'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Good Thoughts Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && goodThoughtsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Good Thoughts</Text>
                {renderBrowseAllButton(handleViewAllGoodThoughts)}
              </View>
              <FlatList
                data={goodThoughtsTemplates}
                renderItem={createGreetingCardRenderer(
                  goodThoughtsTemplatesRaw.length > 0 ? goodThoughtsTemplatesRaw : goodThoughtsTemplates,
                  'good thoughts'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Trending Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && trendingTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Trending</Text>
                {renderBrowseAllButton(handleViewAllTrending)}
              </View>
              <FlatList
                data={trendingTemplates}
                renderItem={createGreetingCardRenderer(
                  trendingTemplatesRaw.length > 0 ? trendingTemplatesRaw : trendingTemplates,
                  'trending'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Bhagvat Gita Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && bhagvatGitaTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Bhagvat Gita</Text>
                {renderBrowseAllButton(handleViewAllBhagvatGita)}
              </View>
              <FlatList
                data={bhagvatGitaTemplates}
                renderItem={createGreetingCardRenderer(
                  bhagvatGitaTemplatesRaw.length > 0 ? bhagvatGitaTemplatesRaw : bhagvatGitaTemplates,
                  'bhagvat gita'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Books Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && booksTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Books</Text>
                {renderBrowseAllButton(handleViewAllBooks)}
              </View>
              <FlatList
                data={booksTemplates}
                renderItem={createGreetingCardRenderer(
                  booksTemplatesRaw.length > 0 ? booksTemplatesRaw : booksTemplates,
                  'books'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}

          {/* Celebrates the Moments Section - Hidden when searching */}
          {!isSearching && searchQuery.trim() === '' && celebratesMomentsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: theme.colors.text }]}>Celebrates the Moments</Text>
                {renderBrowseAllButton(handleViewAllCelebratesMoments)}
              </View>
              <FlatList
                data={celebratesMomentsTemplates}
                renderItem={createGreetingCardRenderer(
                  celebratesMomentsTemplatesRaw.length > 0 ? celebratesMomentsTemplatesRaw : celebratesMomentsTemplates,
                  'celebrates the moments'
                )}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
              />
            </View>
          )}
                 </ScrollView>
       </LinearGradient>

       {/* Template Preview Modal */}
       <Modal
         visible={isModalVisible}
         transparent={true}
         animationType="fade"
         onRequestClose={closeModal}
       >
         <View style={styles.modalOverlay}>
           <TouchableOpacity 
             style={styles.modalBackground} 
             activeOpacity={1} 
             onPress={closeModal}
           >
             <View style={styles.modalContent}>
               <TouchableOpacity 
                 style={styles.closeButton}
                 onPress={closeModal}
               >
                 <Text style={styles.closeButtonText}>✕</Text>
               </TouchableOpacity>
               {selectedTemplate && (
                 <>
                   <View style={styles.modalImageContainer}>
                     <OptimizedImage 
                       uri={selectedTemplate.thumbnail} 
                       style={styles.modalImage}
                       resizeMode="cover"
                     />
                     <LinearGradient
                       colors={['transparent', 'rgba(0,0,0,0.3)']}
                       style={styles.modalImageOverlay}
                     />
                   </View>
                   <View style={styles.modalInfoContainer}>
                     <View style={styles.modalHeader}>
                       <Text style={styles.modalTitle}>{selectedTemplate.name}</Text>
                       <Text style={styles.modalCategory}>{selectedTemplate.category}</Text>
                     </View>
                    <View style={styles.modalStats}>
                      <View style={styles.modalStat}>
                        <Text style={styles.modalStatLabel}>Downloads</Text>
                        <Text style={styles.modalStatValue}>{selectedTemplate.downloads}</Text>
                      </View>
                    </View>
                   </View>
                 </>
               )}
             </View>
           </TouchableOpacity>
         </View>
               </Modal>

        {/* Upcoming Festivals Modal */}
        <Modal
          visible={isUpcomingEventsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeUpcomingEventsModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Upcoming Festivals</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeUpcomingEventsModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`upcoming-events-modal-${upcomingEvents.length}`}
                  data={upcomingEvents}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: event }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        // Convert upcoming event to template format for navigation
                        const eventTemplate: Template = {
                          id: `event-${event.id}`,
                          name: event.title,
                          thumbnail: event.imageUrl,
                          category: `${event.category} • ${event.date} • ${event.location}`,
                          downloads: 0,
                          isDownloaded: false,
                        };
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: eventTemplate,
                          relatedPosters: professionalTemplates.slice(0, 6),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage 
                          uri={event.imageUrl} 
                          style={styles.upcomingEventModalImage}
                          resizeMode="cover"
                          fallbackSource={require('../assets/MainLogo/MB.png')}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* {event.isFree ? (
                          <LinearGradient
                            colors={['#4ecdc4', '#44a08d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upcomingEventModalBadge}
                          >
                            <Icon name="star" size={moderateScale(9)} color="#ffffff" />
                            <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[styles.upcomingEventModalBadge, styles.premiumEventBadge]}>
                            <Icon name="star" size={moderateScale(9)} color="#FFD700" />
                            <Text style={[styles.upcomingEventModalBadgeText, styles.premiumEventBadgeText]}>Premium</Text>
                          </View>
                        )} */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Business Events Modal */}
        <Modal
          visible={isTemplatesModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeTemplatesModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Business Events</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeTemplatesModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`templates-modal-${professionalTemplates.length}`}
                  data={professionalTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeTemplatesModal();
                        const templateData: Template = {
                          id: template.id,
                          name: template.name,
                          thumbnail: template.thumbnail,
                          category: template.category,
                          downloads: 0,
                          isDownloaded: false,
                        };
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: templateData,
                          relatedPosters: professionalTemplates.slice(0, 6),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* {template.isPremium ? (
                          <View style={[styles.upcomingEventModalBadge, styles.premiumEventBadge]}>
                            <Icon name="star" size={moderateScale(9)} color="#FFD700" />
                            <Text style={[styles.upcomingEventModalBadgeText, styles.premiumEventBadgeText]}>Premium</Text>
                          </View>
                        ) : (
                          <LinearGradient
                            colors={['#4ecdc4', '#44a08d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upcomingEventModalBadge}
                          >
                            <Icon name="star" size={moderateScale(9)} color="#ffffff" />
                            <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                          </LinearGradient>
                        )} */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Video Content Modal */}
        <Modal
          visible={isVideosModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeVideosModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Video Content</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeVideosModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`videos-modal-${videoContent.length}`}
                  data={videoContent}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: video }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeVideosModal();
                        const videoData: Template = {
                          id: video.id,
                          name: video.title,
                          thumbnail: video.thumbnail,
                          category: video.category,
                          downloads: 0,
                          isDownloaded: false,
                        };
                        navigation.navigate('VideoPlayer', {
                          selectedVideo: videoData,
                          relatedVideos: videoContent.slice(0, 6),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={video.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* {video.isPremium ? (
                          <View style={[styles.upcomingEventModalBadge, styles.premiumEventBadge]}>
                            <Icon name="star" size={moderateScale(9)} color="#FFD700" />
                            <Text style={[styles.upcomingEventModalBadgeText, styles.premiumEventBadgeText]}>Premium</Text>
                          </View>
                        ) : (
                          <LinearGradient
                            colors={['#4ecdc4', '#44a08d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upcomingEventModalBadge}
                          >
                            <Icon name="star" size={moderateScale(9)} color="#ffffff" />
                            <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                          </LinearGradient>
                        )} */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        <ComingSoonModal
          visible={showVideoComingSoonModal}
          onClose={() => setShowVideoComingSoonModal(false)}
          title="Video Editor Coming Soon"
          subtitle="We are polishing the video creation experience. Stay tuned for the next update!"
        />

        {/* Motivation Modal */}
        <Modal
          visible={isMotivationModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeMotivationModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Motivation</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeMotivationModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`motivation-modal-${motivationTemplatesRaw.length > 0 ? motivationTemplatesRaw.length : motivationTemplates.length}`}
                  data={motivationTemplatesRaw.length > 0 ? motivationTemplatesRaw : motivationTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeMotivationModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: (motivationTemplatesRaw.length > 0 ? motivationTemplatesRaw : motivationTemplates).filter(
                            t => t.id !== template.id
                          ),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient> */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Good Morning Modal */}
        <Modal
          visible={isGoodMorningModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeGoodMorningModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Good Morning</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeGoodMorningModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`goodmorning-modal-${goodMorningTemplatesRaw.length > 0 ? goodMorningTemplatesRaw.length : goodMorningTemplates.length}`}
                  data={goodMorningTemplatesRaw.length > 0 ? goodMorningTemplatesRaw : goodMorningTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeGoodMorningModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: (goodMorningTemplatesRaw.length > 0 ? goodMorningTemplatesRaw : goodMorningTemplates).filter(
                            t => t.id !== template.id
                          ),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient> */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Business Ethics Modal */}
        <Modal
          visible={isBusinessEthicsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeBusinessEthicsModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Business Ethics</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeBusinessEthicsModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`businessethics-modal-${businessEthicsTemplatesRaw.length > 0 ? businessEthicsTemplatesRaw.length : businessEthicsTemplates.length}`}
                  data={businessEthicsTemplatesRaw.length > 0 ? businessEthicsTemplatesRaw : businessEthicsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeBusinessEthicsModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: (businessEthicsTemplatesRaw.length > 0 ? businessEthicsTemplatesRaw : businessEthicsTemplates).filter(
                            t => t.id !== template.id
                          ),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient> */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Devotional Modal */}
        <Modal
          visible={isDevotionalModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDevotionalModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Devotional</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeDevotionalModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`devotional-modal-${devotionalTemplatesRaw.length > 0 ? devotionalTemplatesRaw.length : devotionalTemplates.length}`}
                  data={devotionalTemplatesRaw.length > 0 ? devotionalTemplatesRaw : devotionalTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeDevotionalModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: (devotionalTemplatesRaw.length > 0 ? devotionalTemplatesRaw : devotionalTemplates).filter(
                            t => t.id !== template.id
                          ),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient> */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Leader Quotes Modal */}
        <Modal
          visible={isLeaderQuotesModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeLeaderQuotesModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.upcomingEventsModalGradient}
              >
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Leader Quotes</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upcomingEventsCloseButton}
                    onPress={closeLeaderQuotesModal}
                  >
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`leaderquotes-modal-${leaderQuotesTemplatesRaw.length > 0 ? leaderQuotesTemplatesRaw.length : leaderQuotesTemplates.length}`}
                  data={leaderQuotesTemplatesRaw.length > 0 ? leaderQuotesTemplatesRaw : leaderQuotesTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeLeaderQuotesModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: (leaderQuotesTemplatesRaw.length > 0 ? leaderQuotesTemplatesRaw : leaderQuotesTemplates).filter(
                            t => t.id !== template.id
                          ),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {/* <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient> */}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Atmanirbhar Bharat Modal */}
        <Modal visible={isAtmanirbharBharatModalVisible} transparent={true} animationType="slide" onRequestClose={closeAtmanirbharBharatModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Atmanirbhar Bharat</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeAtmanirbharBharatModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`atmanirbhar-modal-${atmanirbharBharatTemplatesRaw.length > 0 ? atmanirbharBharatTemplatesRaw.length : atmanirbharBharatTemplates.length}`}
                  data={atmanirbharBharatTemplatesRaw.length > 0 ? atmanirbharBharatTemplatesRaw : atmanirbharBharatTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeAtmanirbharBharatModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (atmanirbharBharatTemplatesRaw.length > 0 ? atmanirbharBharatTemplatesRaw : atmanirbharBharatTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Good Thoughts Modal */}
        <Modal visible={isGoodThoughtsModalVisible} transparent={true} animationType="slide" onRequestClose={closeGoodThoughtsModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Good Thoughts</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeGoodThoughtsModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`goodthoughts-modal-${goodThoughtsTemplatesRaw.length > 0 ? goodThoughtsTemplatesRaw.length : goodThoughtsTemplates.length}`}
                  data={goodThoughtsTemplatesRaw.length > 0 ? goodThoughtsTemplatesRaw : goodThoughtsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeGoodThoughtsModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (goodThoughtsTemplatesRaw.length > 0 ? goodThoughtsTemplatesRaw : goodThoughtsTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Trending Modal */}
        <Modal visible={isTrendingModalVisible} transparent={true} animationType="slide" onRequestClose={closeTrendingModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Trending</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeTrendingModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`trending-modal-${trendingTemplatesRaw.length > 0 ? trendingTemplatesRaw.length : trendingTemplates.length}`}
                  data={trendingTemplatesRaw.length > 0 ? trendingTemplatesRaw : trendingTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeTrendingModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (trendingTemplatesRaw.length > 0 ? trendingTemplatesRaw : trendingTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Bhagvat Gita Modal */}
        <Modal visible={isBhagvatGitaModalVisible} transparent={true} animationType="slide" onRequestClose={closeBhagvatGitaModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Bhagvat Gita</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeBhagvatGitaModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`bhagvatgita-modal-${bhagvatGitaTemplatesRaw.length > 0 ? bhagvatGitaTemplatesRaw.length : bhagvatGitaTemplates.length}`}
                  data={bhagvatGitaTemplatesRaw.length > 0 ? bhagvatGitaTemplatesRaw : bhagvatGitaTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeBhagvatGitaModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (bhagvatGitaTemplatesRaw.length > 0 ? bhagvatGitaTemplatesRaw : bhagvatGitaTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Books Modal */}
        <Modal visible={isBooksModalVisible} transparent={true} animationType="slide" onRequestClose={closeBooksModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Books</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeBooksModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`books-modal-${booksTemplatesRaw.length > 0 ? booksTemplatesRaw.length : booksTemplates.length}`}
                  data={booksTemplatesRaw.length > 0 ? booksTemplatesRaw : booksTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeBooksModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (booksTemplatesRaw.length > 0 ? booksTemplatesRaw : booksTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Celebrates the Moments Modal */}
        <Modal visible={isCelebratesMomentsModalVisible} transparent={true} animationType="slide" onRequestClose={closeCelebratesMomentsModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Celebrates the Moments</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeCelebratesMomentsModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`celebrates-modal-${celebratesMomentsTemplatesRaw.length > 0 ? celebratesMomentsTemplatesRaw.length : celebratesMomentsTemplates.length}`}
                  data={celebratesMomentsTemplatesRaw.length > 0 ? celebratesMomentsTemplatesRaw : celebratesMomentsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={10}
                  updateCellsBatchingPeriod={50}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeCelebratesMomentsModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: (celebratesMomentsTemplatesRaw.length > 0 ? celebratesMomentsTemplatesRaw : celebratesMomentsTemplates).filter(t => t.id !== template.id) });
                    }}>
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                        <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                          <Icon name="star" size={12} color="#ffffff" />
                          <Text style={styles.upcomingEventModalBadgeText}>Free</Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Featured Content Modal */}
        <Modal visible={isFeaturedContentModalVisible} transparent={true} animationType="slide" onRequestClose={closeFeaturedContentModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#f5f5f5', '#ffffff']} style={styles.upcomingEventsModalGradient}>
                <View style={styles.upcomingEventsModalHeader}>
                  <View style={styles.upcomingEventsModalTitleContainer}>
                    <Text style={styles.upcomingEventsModalTitle}>Featured Content</Text>
                  </View>
                  <TouchableOpacity style={styles.upcomingEventsCloseButton} onPress={closeFeaturedContentModal}>
                    <Text style={styles.upcomingEventsCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.upcomingEventsModalBody}>
                <FlatList
                  key={`featured-content-modal-${featuredContent.length}`}
                  data={featuredContent}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: featured }) => {
                    // Convert featured content to Template format for navigation
                    const convertFeaturedContentToTemplate = (fc: FeaturedContent): Template => ({
                      id: fc.id,
                      name: fc.title,
                      thumbnail: fc.imageUrl,
                      category: fc.type || 'Featured Content',
                      downloads: 0,
                      isDownloaded: false,
                      tags: [],
                    });

                    const selectedTemplate = convertFeaturedContentToTemplate(featured);
                    const relatedTemplates = featuredContent
                      .filter(fc => fc.id !== featured.id)
                      .map(convertFeaturedContentToTemplate);

                    return (
                      <TouchableOpacity 
                        activeOpacity={0.8} 
                        style={styles.upcomingEventModalCard} 
                        onPress={() => {
                          closeFeaturedContentModal();
                          navigation.navigate('PosterPlayer', {
                            selectedPoster: selectedTemplate,
                            relatedPosters: relatedTemplates,
                          });
                        }}
                      >
                        <View style={styles.upcomingEventModalImageContainer}>
                          <OptimizedImage uri={featured.imageUrl} style={styles.upcomingEventModalImage} resizeMode="cover" />
                          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.upcomingEventModalOverlay} />
                          {/* <LinearGradient colors={['#4ecdc4', '#44a08d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upcomingEventModalBadge}>
                            <Icon name="star" size={12} color="#ffffff" />
                            <Text style={styles.upcomingEventModalBadgeText}>Featured</Text>
                          </LinearGradient> */}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    );
  });

HomeScreen.displayName = 'HomeScreen';

// Get dynamic screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive values
const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (SCREEN_WIDTH < 400) return small;
  if (SCREEN_WIDTH < 768) return medium;
  return large;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: moderateScale(4),
    paddingBottom: moderateScale(3),
  },
  headerTop: {
    flexDirection: 'row',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: moderateScale(8),
    color: 'rgba(51,51,51,0.7)',
    marginBottom: moderateScale(1.5),
  },
  userName: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  apiStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(1),
    borderRadius: moderateScale(6),
    marginTop: moderateScale(2),
    gap: moderateScale(2),
  },
  apiStatusText: {
    fontSize: moderateScale(7),
    color: '#ff9800',
    fontWeight: '500',
  },
  apiLoadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
    gap: moderateScale(3),
  },
  apiLoadingText: {
    fontSize: moderateScale(7),
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Fixed padding for tab bar
  },
  searchContainer: {
    paddingHorizontal: moderateScale(8),
    marginBottom: moderateScale(3),
  },
  calendarSection: {
    marginHorizontal: moderateScale(8),
    marginBottom: moderateScale(6),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(0),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginLeft: moderateScale(2),
    marginRight: moderateScale(4),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(10), // Reduced from 11
    fontWeight: '500',
  },
  clearIcon: {
    marginLeft: moderateScale(4),
    marginRight: moderateScale(4),
    padding: moderateScale(2),
  },
  featuredCarouselContainer: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(6),
  },
  featuredCarouselList: {
    paddingHorizontal: moderateScale(12),
  },
  featuredCarouselCard: {
    height: verticalScale(110),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginRight: moderateScale(10),
    backgroundColor: '#f2f2f2',
  },
  featuredCarouselImage: {
    width: '100%',
    height: '100%',
  },
  featuredCarouselOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  featuredCarouselContent: {
    position: 'absolute',
    bottom: moderateScale(10),
    left: moderateScale(12),
    right: moderateScale(12),
  },
  featuredCarouselTitle: {
    color: '#ffffff',
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: moderateScale(4),
  },
  featuredCarouselBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(6),
  },
  featuredCarouselBadgeText: {
    color: '#ffffff',
    fontSize: moderateScale(9),
    fontWeight: '600',
  },
  featuredCarouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: moderateScale(6),
    gap: moderateScale(4),
  },
  featuredCarouselDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  featuredCarouselDotActive: {
    width: moderateScale(16),
    backgroundColor: '#667eea',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    marginTop: moderateScale(8),
    gap: moderateScale(8),
  },
  categoryButton: {
    flex: 1,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  categoryButtonBusiness: {
    borderColor: 'rgba(102, 126, 234, 0.4)',
  },
  categoryButtonRotating: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  categoryButtonGradient: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(42),
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  categoryButtonIcon: {
    marginRight: moderateScale(2),
  },
  categoryButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryButtonTextBusiness: {
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryButtonRotatingText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(18),
    marginBottom: verticalScale(12),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(4),
    marginHorizontal: moderateScale(2),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(30),
  },
  tabText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: moderateScale(14),
  },
  bannerSection: {
    marginBottom: verticalScale(10),
    paddingHorizontal: moderateScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    marginBottom: verticalScale(4),
    paddingHorizontal: moderateScale(10),
  },
  bannerList: {
    paddingHorizontal: moderateScale(3),
  },
  bannerContainerWrapper: {
    width: getResponsiveValue(SCREEN_WIDTH * 0.70, SCREEN_WIDTH * 0.65, SCREEN_WIDTH * 0.55),
    marginRight: moderateScale(4),
  },
  bannerContainer: {
    width: '100%',
    height: verticalScale(80),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  bannerContent: {
    position: 'absolute',
    bottom: moderateScale(5),
    left: moderateScale(5),
    right: moderateScale(5),
  },
  bannerTitle: {
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: moderateScale(3),
  },
  bannerButton: {
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: moderateScale(8),
    fontWeight: '600',
  },
     upcomingEventsSection: {
     marginBottom: verticalScale(10),
     paddingHorizontal: moderateScale(8),
   },
   sectionHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: moderateScale(10),
     marginBottom: verticalScale(4),
   },
 viewAllButton: {
   paddingHorizontal: moderateScale(1),
   paddingVertical: moderateScale(1),
   borderRadius: moderateScale(6),
   overflow: 'hidden',
 },
 viewAllButtonGradient: {
   paddingHorizontal: moderateScale(6),
   paddingVertical: moderateScale(3),
   borderRadius: moderateScale(6),
   justifyContent: 'center',
   alignItems: 'center',
   flexDirection: 'row',
   gap: moderateScale(2),
 },
 viewAllButtonText: {
   fontSize: moderateScale(8),
   fontWeight: '600',
   color: '#ffffff',
 },
       upcomingEventsList: {
      paddingHorizontal: moderateScale(3),
    },
                   upcomingEventCard: {
        width: getResponsiveValue(SCREEN_WIDTH * 0.32, SCREEN_WIDTH * 0.28, SCREEN_WIDTH * 0.18),
        marginRight: moderateScale(3),
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: moderateScale(10),
        overflow: 'hidden',
        ...responsiveShadow.small,
      },
   upcomingEventImageContainer: {
     height: verticalScale(60),
     position: 'relative',
   },
   upcomingEventImage: {
     width: '100%',
     height: '100%',
   },
   upcomingEventOverlay: {
     position: 'absolute',
     bottom: 0,
     left: 0,
     right: 0,
     height: 40,
   },
   upcomingEventBadge: {
     position: 'absolute',
     top: moderateScale(4),
     left: moderateScale(4),
     backgroundColor: 'rgba(0,0,0,0.7)',
     paddingHorizontal: moderateScale(4),
     paddingVertical: moderateScale(2),
     borderRadius: moderateScale(6),
   },
   upcomingEventBadgeText: {
     fontSize: moderateScale(7),
     color: '#ffffff',
     fontWeight: '600',
   },
  templatesSection: {
    paddingBottom: verticalScale(15),
    paddingHorizontal: moderateScale(8),
  },
  businessCategoriesSection: {
    paddingBottom: verticalScale(15),
    paddingHorizontal: moderateScale(8),
  },
  businessCategoryCard: {
    marginRight: moderateScale(3),
  },
  businessCategoryCardContent: {
    width: '100%',
    borderRadius: moderateScale(8),
    padding: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...responsiveShadow.small,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  businessCategoryImageSection: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(8),
    paddingBottom: moderateScale(4),
  },
  businessCategoryImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(6),
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  businessCategoryImage: {
    width: '100%',
    height: '100%',
  },
  businessCategoryIcon: {
    fontSize: moderateScale(32),
  },
  businessCategoryName: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: moderateScale(8),
    paddingBottom: moderateScale(8),
  },
  videoSection: {
    paddingBottom: verticalScale(15),
    paddingHorizontal: moderateScale(8),
  },
  templateRow: {
    justifyContent: 'flex-start',
    paddingHorizontal: moderateScale(4),
    gap: moderateScale(2),
  },
  horizontalList: {
    paddingHorizontal: moderateScale(3),
  },
  templateCardWrapper: {
    width: getResponsiveValue(SCREEN_WIDTH * 0.32, SCREEN_WIDTH * 0.28, SCREEN_WIDTH * 0.18),
    marginRight: moderateScale(3),
  },
  templateCard: {
    width: '100%',
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    ...responsiveShadow.small,
  },
    templateImageContainer: {
      height: verticalScale(60),
      position: 'relative',
      overflow: 'hidden',
    },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoPlayOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  templateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  templateInfo: {
    padding: moderateScale(12),
  },
  templateName: {
    fontSize: responsiveFontSize.sm,
    fontWeight: 'bold',
    marginBottom: responsiveSpacing.xs,
  },
  templateCategory: {
    fontSize: responsiveFontSize.xs,
    marginBottom: responsiveSpacing.xs,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: responsiveFontSize.xs,
    fontWeight: '500',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionLoadingIndicator: {
    marginLeft: 8,
  },
     templateStat: {
     fontSize: responsiveFontSize.xs,
   },
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.8)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalBackground: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalContent: {
     width: SCREEN_WIDTH * 0.92, // Slightly wider
     height: SCREEN_HEIGHT * 0.75, // Reduced from 0.8
     backgroundColor: '#ffffff',
     borderRadius: moderateScale(16), // Reduced from 20
     overflow: 'hidden',
     position: 'relative',
   },
   closeButton: {
     position: 'absolute',
     top: moderateScale(10), // Reduced from 15
     right: moderateScale(10),
     width: moderateScale(26), // Reduced from 30
     height: moderateScale(26),
     borderRadius: moderateScale(13),
     backgroundColor: 'rgba(0, 0, 0, 0.4)', // Lighter
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 10,
   },
   closeButtonText: {
     color: '#ffffff',
     fontSize: moderateScale(14), // Reduced from 16
     fontWeight: 'bold',
   },
   modalImageContainer: {
     height: SCREEN_HEIGHT * 0.35, // Reduced from 0.4
     position: 'relative',
   },
   modalImage: {
     width: '100%',
     height: '100%',
   },
   modalImageOverlay: {
     position: 'absolute',
     bottom: 0,
     left: 0,
     right: 0,
     height: moderateScale(40), // Reduced from 60
   },
   modalInfoContainer: {
     flex: 1,
     padding: moderateScale(12), // Reduced from 18
   },
   modalHeader: {
     marginBottom: verticalScale(8), // Reduced from 12
   },
   modalTitle: {
     fontSize: moderateScale(15), // Reduced from 18
     fontWeight: 'bold',
     color: '#333333',
     marginBottom: moderateScale(3), // Reduced from 4
   },
   modalCategory: {
     fontSize: moderateScale(11), // Reduced from 14
     color: '#666666',
     fontWeight: '500',
   },
   modalStats: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     marginBottom: verticalScale(12), // Reduced from 20
     paddingVertical: verticalScale(6), // Reduced from 10
     backgroundColor: '#f8f9fa',
     borderRadius: moderateScale(10), // Reduced from 15
   },
   modalStat: {
     alignItems: 'center',
   },
   modalStatLabel: {
     fontSize: moderateScale(9), // Reduced from 12
     color: '#666666',
     fontWeight: '500',
     marginBottom: moderateScale(2), // Reduced from 4
   },
   modalStatValue: {
     fontSize: moderateScale(13), // Reduced from 16
     fontWeight: 'bold',
     color: '#333333',
   },
   // Upcoming Festivals Modal Styles - Compact & Responsive
   upcomingEventsModalContent: {
     width: SCREEN_WIDTH >= 768 ? SCREEN_WIDTH * 0.90 : SCREEN_WIDTH * 0.96,
     maxWidth: SCREEN_WIDTH >= 768 ? 900 : SCREEN_WIDTH * 0.96,
      height: SCREEN_HEIGHT * 0.85, // Reduced from 0.9
      backgroundColor: '#ffffff',
     borderRadius: SCREEN_WIDTH >= 768 ? moderateScale(20) : moderateScale(16), // Reduced from 30/25
      overflow: 'hidden',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: moderateScale(8), // Reduced from 20
      },
      shadowOpacity: 0.2, // Reduced from 0.3
      shadowRadius: moderateScale(12), // Reduced from 25
      elevation: 10, // Reduced from 15
    },
    upcomingEventsModalGradient: {
      paddingTop: verticalScale(8), // Further reduced from 15
      paddingBottom: verticalScale(4), // Further reduced from 6
    },
    upcomingEventsModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center', // Changed from flex-start to center
      paddingHorizontal: moderateScale(12),
    },
    upcomingEventsModalTitleContainer: {
      flex: 1,
      marginRight: moderateScale(6), // Reduced from 8
    },
    upcomingEventsModalTitle: {
      fontSize: SCREEN_WIDTH >= 768 ? moderateScale(15) : moderateScale(13), // Further reduced from 18/16
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 0, // No margin needed without subtitle
      textShadowColor: 'rgba(255,255,255,0.5)',
      textShadowOffset: { width: 0, height: 0.5 },
      textShadowRadius: 2,
    },
    upcomingEventsModalSubtitle: {
      fontSize: 0, // Hidden
      color: 'rgba(255,255,255,0)',
      fontWeight: '500',
      display: 'none',
    },
    upcomingEventsCloseButton: {
      width: SCREEN_WIDTH >= 768 ? moderateScale(28) : moderateScale(26), // Further reduced from 36/32
      height: SCREEN_WIDTH >= 768 ? moderateScale(28) : moderateScale(26),
      borderRadius: SCREEN_WIDTH >= 768 ? moderateScale(14) : moderateScale(13),
      backgroundColor: 'rgba(0,0,0,0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.3,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    upcomingEventsCloseButtonText: {
      fontSize: SCREEN_WIDTH >= 768 ? moderateScale(15) : moderateScale(14), // Further reduced from 18/16
      color: '#333333',
      fontWeight: 'bold',
    },
    upcomingEventsModalBody: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    upcomingEventsModalScroll: {
      paddingHorizontal: moderateScale(8), // Further reduced for symmetry
      paddingTop: moderateScale(12),
      paddingBottom: moderateScale(12),
    },
    upcomingEventModalRow: {
      justifyContent: 'flex-start', // Changed from space-between to align items from left
      marginBottom: moderateScale(6),
      paddingHorizontal: 0,
    },
    upcomingEventModalCard: {
      width: SCREEN_WIDTH >= 768
        ? (SCREEN_WIDTH * 0.90 - moderateScale(16) - moderateScale(9)) / 4 // Account for spacing between items (3 gaps * 3 = 9)
        : (SCREEN_WIDTH * 0.96 - moderateScale(16) - moderateScale(9)) / 4, // Account for spacing between items (3 gaps * 3 = 9)
      marginRight: moderateScale(3), // Add spacing between items
      backgroundColor: '#ffffff',
      borderRadius: moderateScale(8),
      ...responsiveShadow.small,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.03)',
    },
      upcomingEventModalImageContainer: {
        width: '100%',
        aspectRatio: SCREEN_WIDTH >= 768 ? 1 : 0.9, // More square for compact layout
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: moderateScale(8),
        borderTopRightRadius: moderateScale(8),
      },
    upcomingEventModalImage: {
      width: '100%',
      height: '100%',
    },
    upcomingEventModalOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SCREEN_WIDTH >= 768 ? moderateScale(50) : moderateScale(40), // Reduced from 80/60
    },
    upcomingEventModalBadge: {
      position: 'absolute',
      top: moderateScale(6), // Reduced from 12
      left: moderateScale(6),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(6), // Reduced from 10
      paddingVertical: moderateScale(3), // Reduced from 6
      borderRadius: moderateScale(10), // Reduced from 16
      gap: moderateScale(2), // Reduced from 4
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: moderateScale(1), // Reduced from 2
      },
      shadowOpacity: 0.15, // Reduced from 0.2
      shadowRadius: moderateScale(3), // Reduced from 4
      elevation: 2, // Reduced from 3
    },
    upcomingEventModalBadgeText: {
      fontSize: moderateScale(7), // Reduced from 10
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 0.3, // Reduced from 0.5
    },
    premiumEventBadge: {
      backgroundColor: 'rgba(0,0,0,0.8)',
    },
    premiumEventBadgeText: {
      color: '#FFD700',
    },
    upcomingEventModalContent: {
      padding: moderateScale(6), // Reduced from responsiveSpacing.sm
    },
    upcomingEventModalTitle: {
      fontSize: SCREEN_WIDTH >= 768 ? moderateScale(13) : moderateScale(12), // Reduced from 16/14
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: moderateScale(2), // Reduced from responsiveSpacing.xs
    },
    upcomingEventModalDetails: {
      gap: moderateScale(2), // Reduced from responsiveSpacing.xs
    },
    upcomingEventModalDetail: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    upcomingEventModalDetailLabel: {
      fontSize: SCREEN_WIDTH >= 768 ? moderateScale(11) : moderateScale(10), // Reduced from 14/13
      color: '#666666',
      fontWeight: '500',
    },

  });

export default HomeScreen; 