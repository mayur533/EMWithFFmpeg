// HomeScreen comprehensively optimized for all device sizes with ultra-compact header, search bar, and content sizing
// Performance optimizations: FastImage for better image loading and caching, lazy loading for lists
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth';
// import SimpleFestivalCalendar from '../components/SimpleFestivalCalendar';
import ComingSoonModal from '../components/ComingSoonModal';
import OptimizedImage from '../components/OptimizedImage';
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
  responsiveCard,
  isTablet,
  isLandscape 
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
  
  // Responsive icon sizes
  const getIconSize = useCallback((baseSize: number) => {
    const scale = screenWidth / 375; // Base on iPhone 8 width
    return Math.round(baseSize * scale);
  }, [screenWidth]);
  
  // Responsive card calculations
  const getCardWidth = useCallback(() => {
    if (isTablet) {
      return screenWidth * 0.15; // 6-7 cards visible on tablet
    } else if (screenWidth >= 768) {
      return screenWidth * 0.18; // 5 cards on large phones
    } else if (screenWidth >= 600) {
      return screenWidth * 0.22; // 4 cards on medium phones
    } else if (screenWidth >= 400) {
      return screenWidth * 0.28; // 3 cards on regular phones
    } else {
      return screenWidth * 0.32; // 3 cards on small phones with more spacing
    }
  }, [screenWidth]);

  const cardWidth = getCardWidth();
  
  // Responsive icon sizes for different UI elements
  const searchIconSize = getIconSize(14);
  const statusIconSize = getIconSize(8);
  const playIconSize = getIconSize(16);


  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // New API data states
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [professionalTemplates, setProfessionalTemplates] = useState<ProfessionalTemplate[]>([]);
  const [videoContent, setVideoContent] = useState<VideoContent[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Greeting sections data states
  const [motivationTemplates, setMotivationTemplates] = useState<any[]>([]);
  const [goodMorningTemplates, setGoodMorningTemplates] = useState<any[]>([]);
  const [businessEthicsTemplates, setBusinessEthicsTemplates] = useState<any[]>([]);
  const [devotionalTemplates, setDevotionalTemplates] = useState<any[]>([]);
  const [leaderQuotesTemplates, setLeaderQuotesTemplates] = useState<any[]>([]);
  const [atmanirbharBharatTemplates, setAtmanirbharBharatTemplates] = useState<any[]>([]);
  const [goodThoughtsTemplates, setGoodThoughtsTemplates] = useState<any[]>([]);
  const [trendingTemplates, setTrendingTemplates] = useState<any[]>([]);
  const [bhagvatGitaTemplates, setBhagvatGitaTemplates] = useState<any[]>([]);
  const [booksTemplates, setBooksTemplates] = useState<any[]>([]);
  const [celebratesMomentsTemplates, setCelebratesMomentsTemplates] = useState<any[]>([]);
  
  // Coming Soon Modal state
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);



  // Mock data removed - using only API data

  // Mock video templates removed - using only API data
  // const mockVideoTemplates: Template[] = useMemo(() => [
  // All mock video template data removed

  // Mock templates removed - using only API data
  // const mockTemplates: Template[] = useMemo(() => [
  //   {
  //     id: '1',
  //     name: 'Wedding Planning',
  //     thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop',
  //     category: 'Event Planners',
  //     likes: 156,
  //     downloads: 89,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '2',
  //     name: 'Corporate Event Setup',
  //     thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop',
  //     category: 'Event Planners',
  //     likes: 234,
  //     downloads: 167,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '3',
  //     name: 'Birthday Celebration',
  //     thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=200&fit=crop',
  //     category: 'Event Planners',
  //     likes: 89,
  //     downloads: 45,
  //     isLiked: false,
  //     isDownloaded: true,
  //   },
  //   {
  //     id: '4',
  //     name: 'Floral Decorations',
  //     thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
  //     category: 'Decorators',
  //     likes: 312,
  //     downloads: 198,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '5',
  //     name: 'Balloon Arrangements',
  //     thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop',
  //     category: 'Decorators',
  //     likes: 178,
  //     downloads: 123,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '6',
  //     name: 'Table Settings',
  //     thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop',
  //     category: 'Decorators',
  //     likes: 145,
  //     downloads: 87,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '7',
  //     name: 'Stage Lighting',
  //     thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
  //     category: 'Light Suppliers',
  //     likes: 203,
  //     downloads: 134,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '8',
  //     name: 'Sound System Setup',
  //     thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop',
  //     category: 'Sound Suppliers',
  //     likes: 167,
  //     downloads: 98,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '9',
  //     name: 'DJ Equipment',
  //     thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
  //     category: 'Sound Suppliers',
  //     likes: 145,
  //     downloads: 76,
  //     isLiked: false,
  //     isDownloaded: true,
  //   },
  //   {
  //     id: '10',
  //     name: 'LED Displays',
  //     thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop',
  //     category: 'Light Suppliers',
  //     likes: 189,
  //     downloads: 112,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '11',
  //     name: 'Conference Setup',
  //     thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop',
  //     category: 'Event Planners',
  //     likes: 234,
  //     downloads: 156,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  //   {
  //     id: '12',
  //     name: 'Wedding Decor',
  //     thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
  //     category: 'Decorators',
  //     likes: 178,
  //     downloads: 89,
  //     isLiked: false,
  //     isDownloaded: false,
  //   },
  // ], []);

  // Mock categories removed - using only API data
  // const mockCategories: Category[] = useMemo(() => [
  //   { id: 'all', name: 'All' },
  //   { id: 'event-planners', name: 'Event Planners' },
  //   { id: 'decorators', name: 'Decorators' },
  //   { id: 'sound-suppliers', name: 'Sound Suppliers' },
  //   { id: 'light-suppliers', name: 'Light Suppliers' },
  // ], []);



  // Mock upcoming festivals removed - using only API data
  // const mockUpcomingEvents = useMemo(() => [
  //   {
  //     id: '1',
  //     title: 'Tech Conference 2024',
  //     date: 'Dec 15, 2024',
  //     time: '9:00 AM',
  //     location: 'Convention Center',
  //     imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=150&fit=crop',
  //     attendees: 250,
  //     category: 'Conference',
  //   },
  //   {
  //     id: '2',
  //     title: 'Wedding Expo',
  //     date: 'Dec 20, 2024',
  //     time: '2:00 PM',
  //     location: 'Grand Hotel',
  //     imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=150&fit=crop',
  //     attendees: 180,
  //     category: 'Wedding',
  //   },
  //   {
  //     id: '3',
  //     title: 'Corporate Gala',
  //     date: 'Dec 25, 2024',
  //     time: '7:00 PM',
  //     location: 'Business Center',
  //     imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=150&fit=crop',
  //     attendees: 120,
  //     category: 'Corporate',
  //   },
  //   {
  //     id: '4',
  //     title: 'Music Festival',
  //     date: 'Dec 30, 2024',
  //     time: '6:00 PM',
  //     location: 'City Park',
  //     imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=150&fit=crop',
  //     attendees: 500,
  //     category: 'Festival',
  //   },
  // ], []);



  // Load data from APIs with caching for instant loads
  const loadApiData = useCallback(async (isRefresh: boolean = false) => {
    setApiLoading(true);
    setApiError(null);
    
    try {
      console.log(isRefresh ? '🔄 Refreshing home screen data...' : '📡 Loading home screen data...');
      
      // Load all 4 APIs in parallel (cache will make this instant on repeat loads)
      const [featuredResponse, eventsResponse, templatesResponse, videosResponse] = await Promise.allSettled([
        homeApi.getFeaturedContent({ limit: 10 }),
        homeApi.getUpcomingEvents({ limit: 20 }),
        homeApi.getProfessionalTemplates({ limit: 20 }),
        homeApi.getVideoContent({ limit: 20 })
      ]);

      // Handle featured content
      if (featuredResponse.status === 'fulfilled' && featuredResponse.value.success) {
        const featured = featuredResponse.value.data;
        setFeaturedContent(featured);
        
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
      }

      // Handle upcoming festivals
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.success) {
        const events = eventsResponse.value.data;
        setUpcomingEvents(events);
      } else {
        setUpcomingEvents([]);
      }

      // Handle business events
      if (templatesResponse.status === 'fulfilled' && templatesResponse.value.success) {
        setProfessionalTemplates(templatesResponse.value.data);
        console.log('✅ Business events loaded:', templatesResponse.value.data.length, 'items');
      } else {
        console.log('⚠️ Business events API failed');
        setProfessionalTemplates([]);
      }

      // Handle video content
      if (videosResponse.status === 'fulfilled' && videosResponse.value.success) {
        setVideoContent(videosResponse.value.data);
        console.log('✅ Video content loaded:', videosResponse.value.data.length, 'items');
      } else {
        console.log('⚠️ Video content API failed');
        setVideoContent([]);
      }

      // Load greeting sections in parallel
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
        greetingTemplatesService.searchTemplates('motivational'),
        greetingTemplatesService.searchTemplates('good morning'),
        greetingTemplatesService.searchTemplates('business ethics'),
        greetingTemplatesService.searchTemplates('devotional'),
        greetingTemplatesService.searchTemplates('leader quotes'),
        greetingTemplatesService.searchTemplates('atmanirbhar bharat'),
        greetingTemplatesService.searchTemplates('good thoughts'),
        greetingTemplatesService.searchTemplates('trending'),
        greetingTemplatesService.searchTemplates('bhagvat gita'),
        greetingTemplatesService.searchTemplates('books'),
        greetingTemplatesService.searchTemplates('celebrates the moments')
      ]);

      // Handle greeting sections responses - Only set data if array has items
      if (motivationResponse.status === 'fulfilled' && motivationResponse.value.length > 0) {
        console.log('✅ [MOTIVATION] Setting templates:', motivationResponse.value.length);
        setMotivationTemplates(motivationResponse.value.slice(0, 10));
      } else {
        console.log('⚠️ [MOTIVATION] No data available or API failed');
        setMotivationTemplates([]);
      }
      if (goodMorningResponse.status === 'fulfilled' && goodMorningResponse.value.length > 0) {
        console.log('✅ [GOOD MORNING] Setting templates:', goodMorningResponse.value.length);
        setGoodMorningTemplates(goodMorningResponse.value.slice(0, 10));
      } else {
        console.log('⚠️ [GOOD MORNING] No data available or API failed');
        setGoodMorningTemplates([]);
      }
      if (businessEthicsResponse.status === 'fulfilled' && businessEthicsResponse.value.length > 0) {
        setBusinessEthicsTemplates(businessEthicsResponse.value.slice(0, 10));
      } else {
        setBusinessEthicsTemplates([]);
      }
      if (devotionalResponse.status === 'fulfilled' && devotionalResponse.value.length > 0) {
        setDevotionalTemplates(devotionalResponse.value.slice(0, 10));
      } else {
        setDevotionalTemplates([]);
      }
      if (leaderQuotesResponse.status === 'fulfilled' && leaderQuotesResponse.value.length > 0) {
        setLeaderQuotesTemplates(leaderQuotesResponse.value.slice(0, 10));
      } else {
        setLeaderQuotesTemplates([]);
      }
      if (atmanirbharResponse.status === 'fulfilled' && atmanirbharResponse.value.length > 0) {
        setAtmanirbharBharatTemplates(atmanirbharResponse.value.slice(0, 10));
      } else {
        setAtmanirbharBharatTemplates([]);
      }
      if (goodThoughtsResponse.status === 'fulfilled' && goodThoughtsResponse.value.length > 0) {
        setGoodThoughtsTemplates(goodThoughtsResponse.value.slice(0, 10));
      } else {
        setGoodThoughtsTemplates([]);
      }
      if (trendingResponse.status === 'fulfilled' && trendingResponse.value.length > 0) {
        setTrendingTemplates(trendingResponse.value.slice(0, 10));
      } else {
        setTrendingTemplates([]);
      }
      if (bhagvatGitaResponse.status === 'fulfilled' && bhagvatGitaResponse.value.length > 0) {
        setBhagvatGitaTemplates(bhagvatGitaResponse.value.slice(0, 10));
      } else {
        setBhagvatGitaTemplates([]);
      }
      if (booksResponse.status === 'fulfilled' && booksResponse.value.length > 0) {
        setBooksTemplates(booksResponse.value.slice(0, 10));
      } else {
        setBooksTemplates([]);
      }
      if (celebratesResponse.status === 'fulfilled' && celebratesResponse.value.length > 0) {
        setCelebratesMomentsTemplates(celebratesResponse.value.slice(0, 10));
      } else {
        setCelebratesMomentsTemplates([]);
      }

    } catch (error) {
      console.error('Error loading API data:', error);
      setApiError('Failed to load some content. Using offline data.');
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
        console.log('Error loading API data:', error);
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

  // Handle search query changes - using API data only
  useEffect(() => {
    const handleSearchQueryChange = async () => {
      if (searchQuery.trim() === '') {
        // Reset to show all business events from API
        setTemplates(professionalTemplates);
      }
    };

    handleSearchQueryChange();
  }, [searchQuery, professionalTemplates]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Clear all caches before refreshing
      homeApi.clearCache();
      
      // Refresh API data
      await loadApiData(true);
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadApiData]);

  const handleTabChange = useCallback(async (tab: string) => {
    setActiveTab(tab);
    setSelectedCategory('all'); // Reset category when changing tabs
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
      console.log('Error filtering templates for tab:', tab, error);
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
        console.error('Error downloading template:', error);
      }
    }, 100);
  }, []);

  const handleSearch = useCallback(async () => {
    const requestId = currentRequestId + 1;
    setCurrentRequestId(requestId);
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setDisableBackgroundUpdates(false); // Re-enable background updates when clearing search
      // Reset to current tab and category state using API data
      if (selectedCategory === 'all') {
        setTemplates(professionalTemplates);
      } else {
        const filtered = professionalTemplates.filter(template => {
          const categoryMap: { [key: string]: string } = {
            'event-planners': 'Event Planners',
            'decorators': 'Decorators',
            'sound-suppliers': 'Sound Suppliers',
            'light-suppliers': 'Light Suppliers'
          };
          return template.category === categoryMap[selectedCategory];
        });
        setTemplates(filtered);
      }
      
      // Try API call in background
      setTimeout(async () => {
        // Check if this is still the current request
        if (currentRequestId !== requestId) return;
        
        try {
          if (selectedCategory === 'all') {
            const templatesData = await dashboardService.getTemplatesByTab(activeTab);
            // Only update if this is still the current request
            if (currentRequestId === requestId) {
              setTemplates(templatesData);
            }
          } else {
            const results = await dashboardService.getTemplatesByCategory(selectedCategory);
            // Only update if this is still the current request
            if (currentRequestId === requestId) {
              setTemplates(results);
            }
          }
        } catch (error) {
          console.error('Search reset error:', error);
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
  }, [searchQuery, selectedCategory, activeTab, professionalTemplates, currentRequestId, isSearching]);

  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsSearching(false); // Reset search state when selecting category
    setDisableBackgroundUpdates(true); // Disable background updates when user selects category
    
    const requestId = currentRequestId + 1;
    setCurrentRequestId(requestId);
    
    if (categoryId === 'all') {
      // Use API data immediately for better performance
      setTemplates(professionalTemplates);
      
      // Try API call in background
      setTimeout(async () => {
        // Check if this is still the current request
        if (currentRequestId !== requestId) return;
        
        try {
          const templatesData = await dashboardService.getTemplatesByTab(activeTab);
          // Only update if this is still the current request and we're on 'all' category
          if (currentRequestId === requestId && selectedCategory === 'all') {
            setTemplates(templatesData);
          }
        } catch (error) {
          console.log('Using API data for all category:', error);
        }
      }, 100);
      return;
    }
    
    // Use local filtering immediately for better performance with API data
    const filtered = professionalTemplates.filter(template => {
      const categoryMap: { [key: string]: string } = {
        'event-planners': 'Event Planners',
        'decorators': 'Decorators',
        'sound-suppliers': 'Sound Suppliers',
        'light-suppliers': 'Light Suppliers'
      };
      return template.category === categoryMap[categoryId];
    });
    setTemplates(filtered);
    
    // Try API call in background
    setTimeout(async () => {
      // Check if this is still the current request
      if (currentRequestId !== requestId) return;
      
      try {
        const results = await dashboardService.getTemplatesByCategory(categoryId);
        // Only update if this is still the current request and we're on the same category
        if (currentRequestId === requestId && selectedCategory === categoryId) {
          setTemplates(results);
        }
      } catch (error) {
        console.error('Category filter error:', error);
      }
    }, 100);
  }, [activeTab, professionalTemplates, currentRequestId, selectedCategory]);



  const handleTemplatePress = useCallback((template: Template) => {
    // Check if this is a video template
    const isVideoTemplate = template.id.startsWith('video-');
    
    if (isVideoTemplate) {
      // Navigate to VideoPlayer screen for video templates
      const related = videoContent.filter(video => video.id !== template.id);
      navigation.navigate('VideoPlayer', {
        selectedVideo: template,
        relatedVideos: related,
      });
    } else {
      // Navigate to PosterPlayer screen for regular templates
      const related = professionalTemplates.filter(poster => poster.id !== template.id);
      navigation.navigate('PosterPlayer', {
        selectedPoster: template,
        relatedPosters: related,
      });
    }
  }, [videoContent, professionalTemplates, navigation]);

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


  // Memoized render functions to prevent unnecessary re-renders
  const renderBanner = useCallback(({ item }: { item: Banner }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bannerContainerWrapper}
        onPress={() => {
          // Create a mock template for the banner
          const bannerTemplate: Template = {
            id: 'banner-template',
            name: item.title,
            thumbnail: item.imageUrl,
            category: 'Featured Banner',
            downloads: 0,
            isDownloaded: false,
          };
          navigation.navigate('PosterPlayer', {
            selectedPoster: bannerTemplate,
            relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
          });
        }}
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
             <Text style={styles.bannerTitle}>{item.title}</Text>
             <TouchableOpacity 
               style={[styles.bannerButton, { backgroundColor: theme.colors.cardBackground }]}
               onPress={() => {
                 // Create a mock template for the banner
                 const bannerTemplate: Template = {
                   id: 'banner-template',
                   name: item.title,
                   thumbnail: item.imageUrl,
                   category: 'Featured Banner',
                   downloads: 0,
                   isDownloaded: false,
                 };
                 navigation.navigate('PosterPlayer', {
                   selectedPoster: bannerTemplate,
                   relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
                 });
               }}
             >
               <Text style={[styles.bannerButtonText, { color: theme.colors.primary }]}>VIEW</Text>
             </TouchableOpacity>
           </View>
         </View>
      </TouchableOpacity>
    );
  }, [theme, navigation, professionalTemplates]);

                                       

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
          <View style={styles.templateImageContainer}>
            <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleTemplatePress, theme]);


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
      // Show Coming Soon modal for video content
      setShowComingSoonModal(true);
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
          <View style={styles.templateImageContainer}>
            <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
            <View style={styles.videoPlayOverlay}>
              <Icon name="play-arrow" size={playIconSize} color="#ffffff" />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleTemplatePress, theme, playIconSize]);

  // Memoized key extractors
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Factory function to create category-specific render functions for greeting cards
  const createGreetingCardRenderer = useCallback((categoryTemplates: any[]) => {
    return ({ item }: { item: any }) => {
      if (!item || !item.thumbnail) {
        console.error('❌ [RENDER GREETING CARD] Invalid item:', item);
        return null;
      }

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to PosterPlayer with category-specific templates
            const relatedTemplates = categoryTemplates.filter(template => template.id !== item.id);
            navigation.navigate('PosterPlayer', {
              selectedPoster: item,
              relatedPosters: relatedTemplates,
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
            <View style={styles.templateImageContainer}>
              <OptimizedImage uri={item.thumbnail} style={styles.templateImage} resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>
      );
    };
  }, [navigation, theme]);



  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gradient[0] || '#667eea' }]}>
        <StatusBar 
          barStyle="light-content"
          backgroundColor="transparent" 
          translucent={true}
        />
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.gradient[0] || '#667eea' }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content"
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
        <View style={[styles.header, { paddingTop: insets.top + responsiveSpacing.xs * COMPACT_MULTIPLIER }]}>
          <View style={styles.headerTop}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Dashboard</Text>
              <Text style={styles.userName}>Event Management</Text>
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
                placeholder="Search templates and services..."
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
          </View>

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

          {/* Banner Carousel */}
          <View style={styles.bannerSection}>
            <Text style={styles.sectionTitle}>Featured Content</Text>
            <FlatList
              data={banners}
              renderItem={renderBanner}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              windowSize={5}
              nestedScrollEnabled={true}
              scrollEnabled={true}
            />
          </View>

          {/* Upcoming Festivals */}
          {upcomingEvents.length > 0 && (
            <View style={styles.upcomingEventsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Upcoming Festivals</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllUpcomingEvents}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
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
                      // Create a mock template for the upcoming event
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
                        relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
                      });
                    }}
                  >
                    <View style={styles.upcomingEventImageContainer}>
                      <OptimizedImage 
                        uri={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'} 
                        style={styles.upcomingEventImage}
                        resizeMode="cover"
                        fallbackSource={require('../assets/MainLogo/MB.png')}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.upcomingEventOverlay}
                      />
                      <View style={styles.upcomingEventBadge}>
                        <Text style={styles.upcomingEventBadgeText}>{event.category}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Templates Grid */}
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Business Events</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllTemplates}>
                <Text style={styles.viewAllButtonText}>Browse All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              key={`templates-${templates.length}-${selectedCategory}`}
              data={templates}
              renderItem={renderTemplate}
              keyExtractor={keyExtractor}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={12}
              windowSize={10}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Video Section */}
          {videoContent.length > 0 && (
            <View style={styles.videoSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Video Content</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllVideos}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
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
                maxToRenderPerBatch={12}
                windowSize={10}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Motivation Section */}
          {motivationTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Motivation</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllMotivation}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={motivationTemplates}
                renderItem={createGreetingCardRenderer(motivationTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Good Morning Section */}
          {goodMorningTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Good Morning</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllGoodMorning}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={goodMorningTemplates}
                renderItem={createGreetingCardRenderer(goodMorningTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Business Ethics Section */}
          {businessEthicsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Business Ethics</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllBusinessEthics}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={businessEthicsTemplates}
                renderItem={createGreetingCardRenderer(businessEthicsTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Devotional Section */}
          {devotionalTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Devotional</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllDevotional}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={devotionalTemplates}
                renderItem={createGreetingCardRenderer(devotionalTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Leader Quotes Section */}
          {leaderQuotesTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Leader Quotes</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllLeaderQuotes}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={leaderQuotesTemplates}
                renderItem={createGreetingCardRenderer(leaderQuotesTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Atmanirbhar Bharat Section */}
          {atmanirbharBharatTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Atmanirbhar Bharat</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllAtmanirbharBharat}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={atmanirbharBharatTemplates}
                renderItem={createGreetingCardRenderer(atmanirbharBharatTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Good Thoughts Section */}
          {goodThoughtsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Good Thoughts</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllGoodThoughts}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={goodThoughtsTemplates}
                renderItem={createGreetingCardRenderer(goodThoughtsTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Trending Section */}
          {trendingTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Trending</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllTrending}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={trendingTemplates}
                renderItem={createGreetingCardRenderer(trendingTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Bhagvat Gita Section */}
          {bhagvatGitaTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Bhagvat Gita</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllBhagvatGita}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={bhagvatGitaTemplates}
                renderItem={createGreetingCardRenderer(bhagvatGitaTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Books Section */}
          {booksTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Books</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllBooks}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={booksTemplates}
                renderItem={createGreetingCardRenderer(booksTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Celebrates the Moments Section */}
          {celebratesMomentsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Celebrates the Moments</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllCelebratesMoments}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={celebratesMomentsTemplates}
                renderItem={createGreetingCardRenderer(celebratesMomentsTemplates)}
                keyExtractor={keyExtractor}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalList}
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
                colors={['#667eea', '#764ba2']}
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
                  renderItem={({ item: event }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        // Create a mock template for the upcoming event
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
                          relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage 
                          uri={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'} 
                          style={styles.upcomingEventModalImage}
                          resizeMode="cover"
                          fallbackSource={require('../assets/MainLogo/MB.png')}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        {event.isFree ? (
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
                        )}
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
                colors={['#667eea', '#764ba2']}
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
                        {template.isPremium ? (
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
                        )}
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
                colors={['#667eea', '#764ba2']}
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
                        {video.isPremium ? (
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
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

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
                colors={['#667eea', '#764ba2']}
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
                  key={`motivation-modal-${motivationTemplates.length}`}
                  data={motivationTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeMotivationModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: motivationTemplates.filter(t => t.id !== template.id),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
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
                colors={['#667eea', '#764ba2']}
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
                  key={`goodmorning-modal-${goodMorningTemplates.length}`}
                  data={goodMorningTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeGoodMorningModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: goodMorningTemplates.filter(t => t.id !== template.id),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
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
                colors={['#667eea', '#764ba2']}
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
                  key={`businessethics-modal-${businessEthicsTemplates.length}`}
                  data={businessEthicsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeBusinessEthicsModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: businessEthicsTemplates.filter(t => t.id !== template.id),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
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
                colors={['#667eea', '#764ba2']}
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
                  key={`devotional-modal-${devotionalTemplates.length}`}
                  data={devotionalTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeDevotionalModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: devotionalTemplates.filter(t => t.id !== template.id),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
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
                colors={['#667eea', '#764ba2']}
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
                  key={`leaderquotes-modal-${leaderQuotesTemplates.length}`}
                  data={leaderQuotesTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.upcomingEventModalCard}
                      onPress={() => {
                        closeLeaderQuotesModal();
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: template,
                          relatedPosters: leaderQuotesTemplates.filter(t => t.id !== template.id),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <OptimizedImage uri={template.thumbnail} style={styles.upcomingEventModalImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <LinearGradient
                          colors={['#4ecdc4', '#44a08d']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upcomingEventModalBadge}
                        >
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

        {/* Atmanirbhar Bharat Modal */}
        <Modal visible={isAtmanirbharBharatModalVisible} transparent={true} animationType="slide" onRequestClose={closeAtmanirbharBharatModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.upcomingEventsModalContent}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`atmanirbhar-modal-${atmanirbharBharatTemplates.length}`}
                  data={atmanirbharBharatTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeAtmanirbharBharatModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: atmanirbharBharatTemplates.filter(t => t.id !== template.id) });
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
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`goodthoughts-modal-${goodThoughtsTemplates.length}`}
                  data={goodThoughtsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeGoodThoughtsModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: goodThoughtsTemplates.filter(t => t.id !== template.id) });
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
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`trending-modal-${trendingTemplates.length}`}
                  data={trendingTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeTrendingModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: trendingTemplates.filter(t => t.id !== template.id) });
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
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`bhagvatgita-modal-${bhagvatGitaTemplates.length}`}
                  data={bhagvatGitaTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeBhagvatGitaModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: bhagvatGitaTemplates.filter(t => t.id !== template.id) });
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
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`books-modal-${booksTemplates.length}`}
                  data={booksTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeBooksModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: booksTemplates.filter(t => t.id !== template.id) });
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
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.upcomingEventsModalGradient}>
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
                  key={`celebrates-modal-${celebratesMomentsTemplates.length}`}
                  data={celebratesMomentsTemplates}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.upcomingEventModalRow}
                  contentContainerStyle={styles.upcomingEventsModalScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: template }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.upcomingEventModalCard} onPress={() => {
                      closeCelebratesMomentsModal();
                      navigation.navigate('PosterPlayer', { selectedPoster: template, relatedPosters: celebratesMomentsTemplates.filter(t => t.id !== template.id) });
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

        {/* Coming Soon Modal for Video Content */}
        <ComingSoonModal
          visible={showComingSoonModal}
          onClose={() => setShowComingSoonModal(false)}
          title="Video Editor Coming Soon!"
          subtitle="We're working hard to bring you an amazing video editing experience. Stay tuned for updates!"
        />

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
    color: '#ffffff',
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
    color: 'rgba(255,255,255,0.8)',
    marginBottom: moderateScale(1.5),
  },
  userName: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: '#ffffff',
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
    paddingVertical: verticalScale(5),
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
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  clearIcon: {
    marginLeft: moderateScale(4),
    marginRight: moderateScale(4),
    padding: moderateScale(2),
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
    color: '#ffffff',
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
     paddingHorizontal: moderateScale(5),
     paddingVertical: moderateScale(2),
     backgroundColor: 'rgba(255,255,255,0.2)',
     borderRadius: moderateScale(8),
   },
   viewAllButtonText: {
     fontSize: moderateScale(8),
     color: '#ffffff',
     fontWeight: '600',
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
      width: isTablet ? SCREEN_WIDTH * 0.90 : SCREEN_WIDTH * 0.96,
      maxWidth: isTablet ? 900 : SCREEN_WIDTH * 0.96,
      height: SCREEN_HEIGHT * 0.85, // Reduced from 0.9
      backgroundColor: '#ffffff',
      borderRadius: isTablet ? moderateScale(20) : moderateScale(16), // Reduced from 30/25
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
      fontSize: isTablet ? moderateScale(15) : moderateScale(13), // Further reduced from 18/16
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 0, // No margin needed without subtitle
      textShadowColor: 'rgba(0,0,0,0.15)',
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
      width: isTablet ? moderateScale(28) : moderateScale(26), // Further reduced from 36/32
      height: isTablet ? moderateScale(28) : moderateScale(26),
      borderRadius: isTablet ? moderateScale(14) : moderateScale(13),
      backgroundColor: 'rgba(255,255,255,0.12)', // Further reduced opacity
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.3, // Further reduced from 0.5
      borderColor: 'rgba(255,255,255,0.15)',
    },
    upcomingEventsCloseButtonText: {
      fontSize: isTablet ? moderateScale(15) : moderateScale(14), // Further reduced from 18/16
      color: '#ffffff',
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
      justifyContent: 'space-between', // Changed from flex-start for equal spacing
      marginBottom: moderateScale(6),
      paddingHorizontal: 0,
    },
    upcomingEventModalCard: {
      width: isTablet 
        ? (SCREEN_WIDTH * 0.90 - moderateScale(16)) / 4 - moderateScale(3)
        : (SCREEN_WIDTH * 0.96 - moderateScale(16)) / 4 - moderateScale(3), // Equal spacing calculation
      backgroundColor: '#ffffff',
      borderRadius: moderateScale(8),
      ...responsiveShadow.small,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.03)',
    },
    upcomingEventModalImageContainer: {
      width: '100%',
      aspectRatio: isTablet ? 1 : 0.9, // More square for compact layout
      position: 'relative',
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
      height: isTablet ? moderateScale(50) : moderateScale(40), // Reduced from 80/60
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
      fontSize: isTablet ? moderateScale(13) : moderateScale(12), // Reduced from 16/14
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
      fontSize: isTablet ? moderateScale(11) : moderateScale(10), // Reduced from 14/13
      color: '#666666',
      fontWeight: '500',
    },

  });

export default HomeScreen; 