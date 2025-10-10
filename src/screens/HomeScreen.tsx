// HomeScreen comprehensively optimized for all device sizes with ultra-compact header, search bar, and content sizing
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design helpers - using imported utilities

const HomeScreen: React.FC = React.memo(() => {
  const { isDarkMode, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();


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



  // Load data from APIs only - no mock data fallback
  const loadApiData = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    
    try {
      console.log('Loading home screen data from APIs...');
      
      // Load all 4 APIs in parallel
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
        greetingTemplatesService.searchTemplates('motivation'),
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
      // Refresh API data only
      await loadApiData();
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
            likes: 0,
            downloads: 0,
            isLiked: false,
            isDownloaded: false,
          };
          navigation.navigate('PosterPlayer', {
            selectedPoster: bannerTemplate,
            relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
          });
        }}
      >
                 <View style={styles.bannerContainer}>
           <Image 
             source={{ uri: item.imageUrl }} 
             style={styles.bannerImage}
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
                   likes: 0,
                   downloads: 0,
                   isLiked: false,
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
            <Image source={{ uri: item.thumbnail }} style={styles.templateImage} />
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
            <Image source={{ uri: item.thumbnail }} style={styles.templateImage} />
            <View style={styles.videoPlayOverlay}>
              <Icon name="play-arrow" size={32} color="#ffffff" />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleTemplatePress, theme]);

  // Memoized key extractors
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Render greeting card (used for all 11 greeting sections) - Poster only, no text
  const renderGreetingCard = useCallback(({ item }: { item: any }) => {
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

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          navigation.navigate('GreetingEditor', { template: item });
        }}
        style={{ marginRight: responsiveSpacing.sm }}
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
            <Image source={{ uri: item.thumbnail }} style={styles.templateImage} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [navigation, theme, responsiveSpacing]);



  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
        <View style={[styles.header, { paddingTop: insets.top + responsiveSpacing.sm }]}>
          <View style={styles.headerTop}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Dashboard</Text>
              <Text style={styles.userName}>Event Management</Text>
              {apiError && (
                <View style={styles.apiStatusIndicator}>
                  <Icon name="wifi-off" size={12} color="#ff9800" />
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
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
              <Icon name="search" size={screenWidth < 480 ? 18 : screenWidth < 768 ? 20 : 22} color={theme.colors.primary} style={styles.searchIcon} />
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
                  <Icon name="close" size={screenWidth < 480 ? 18 : screenWidth < 768 ? 20 : 22} color={theme.colors.textSecondary} style={styles.clearIcon} />
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
                        likes: 0,
                        downloads: 0,
                        isLiked: false,
                        isDownloaded: false,
                      };
                      navigation.navigate('PosterPlayer', {
                        selectedPoster: eventTemplate,
                        relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
                      });
                    }}
                  >
                    <View style={styles.upcomingEventImageContainer}>
                      <Image 
                        source={{ uri: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop' }} 
                        style={styles.upcomingEventImage}
                        defaultSource={require('../assets/MainLogo/MB.png')}
                        onError={(error) => {
                          console.log('Event image load error:', event.id, event.imageUrl);
                        }}
                        onLoad={() => {
                          console.log('Event image loaded successfully:', event.id);
                        }}
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
              numColumns={3}
              columnWrapperStyle={styles.templateRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={6}
              windowSize={10}
              contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
            />
          </View>

          {/* Video Section */}
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
              numColumns={3}
              columnWrapperStyle={styles.templateRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={6}
              windowSize={10}
              contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
            />
          </View>

          {/* Motivation Section */}
          {motivationTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Motivation</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={motivationTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Good Morning Section */}
          {goodMorningTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Good Morning</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={goodMorningTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Business Ethics Section */}
          {businessEthicsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Business Ethics</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={businessEthicsTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Devotional Section */}
          {devotionalTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Devotional</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={devotionalTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Leader Quotes Section */}
          {leaderQuotesTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Leader Quotes</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={leaderQuotesTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Atmanirbhar Bharat Section */}
          {atmanirbharBharatTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Atmanirbhar Bharat</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={atmanirbharBharatTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Good Thoughts Section */}
          {goodThoughtsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Good Thoughts</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={goodThoughtsTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Trending Section */}
          {trendingTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Trending</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={trendingTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Bhagvat Gita Section */}
          {bhagvatGitaTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Bhagvat Gita</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={bhagvatGitaTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Books Section */}
          {booksTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Books</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={booksTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
              />
            </View>
          )}

          {/* Celebrates the Moments Section */}
          {celebratesMomentsTemplates.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Celebrates the Moments</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GreetingTemplates')}>
                  <Text style={styles.viewAllButtonText}>Browse All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={celebratesMomentsTemplates}
                renderItem={renderGreetingCard}
                keyExtractor={keyExtractor}
                numColumns={3}
                columnWrapperStyle={styles.templateRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: responsiveSpacing.xl }}
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
                     <Image 
                       source={{ uri: selectedTemplate.thumbnail }} 
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
                         <Text style={styles.modalStatLabel}>Likes</Text>
                         <Text style={styles.modalStatValue}>{selectedTemplate.likes}</Text>
                       </View>
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
                    <Text style={styles.upcomingEventsModalSubtitle}>Browse upcoming festivals and events</Text>
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
                  numColumns={3}
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
                          likes: 0,
                          downloads: 0,
                          isLiked: false,
                          isDownloaded: false,
                        };
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: eventTemplate,
                          relatedPosters: professionalTemplates.slice(0, 6), // Show first 6 templates as related
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <Image 
                          source={{ uri: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop' }} 
                          style={styles.upcomingEventModalImage}
                          defaultSource={require('../assets/MainLogo/MB.png')}
                          onError={(error) => {
                            console.log('Event modal image load error:', event.id, event.imageUrl);
                          }}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <View style={styles.upcomingEventModalBadge}>
                          <Text style={styles.upcomingEventModalBadgeText}>{event.category}</Text>
                        </View>
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
                    <Text style={styles.upcomingEventsModalSubtitle}>Browse all available business events</Text>
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
                  numColumns={3}
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
                          likes: 0,
                          downloads: 0,
                          isLiked: false,
                          isDownloaded: false,
                        };
                        navigation.navigate('PosterPlayer', {
                          selectedPoster: templateData,
                          relatedPosters: professionalTemplates.slice(0, 6),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <Image source={{ uri: template.thumbnail }} style={styles.upcomingEventModalImage} />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <View style={styles.upcomingEventModalBadge}>
                          <Text style={styles.upcomingEventModalBadgeText}>{template.category}</Text>
                        </View>
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
                    <Text style={styles.upcomingEventsModalSubtitle}>Browse all available videos</Text>
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
                  numColumns={3}
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
                          likes: 0,
                          downloads: 0,
                          isLiked: false,
                          isDownloaded: false,
                        };
                        navigation.navigate('VideoPlayer', {
                          selectedVideo: videoData,
                          relatedVideos: videoContent.slice(0, 6),
                        });
                      }}
                    >
                      <View style={styles.upcomingEventModalImageContainer}>
                        <Image source={{ uri: video.thumbnail }} style={styles.upcomingEventModalImage} />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.upcomingEventModalOverlay}
                        />
                        <View style={styles.upcomingEventModalBadge}>
                          <Text style={styles.upcomingEventModalBadgeText}>{video.category}</Text>
                        </View>
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
    paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : responsiveSpacing.md,
    paddingBottom: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : responsiveSpacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: screenWidth < 480 ? 10 : screenWidth < 768 ? 12 : responsiveFontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: screenWidth < 480 ? 2 : screenWidth < 768 ? 4 : responsiveSpacing.xs,
  },
  userName: {
    fontSize: screenWidth < 480 ? 16 : screenWidth < 768 ? 18 : responsiveFontSize.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  apiStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    gap: 4,
  },
  apiStatusText: {
    fontSize: 10,
    color: '#ff9800',
    fontWeight: '500',
  },
  apiLoadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  apiLoadingText: {
    fontSize: 10,
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
    paddingHorizontal: 16,
    marginBottom: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : responsiveSpacing.sm,
  },
  calendarSection: {
    marginHorizontal: 16,
    marginBottom: screenWidth < 480 ? 12 : screenWidth < 768 ? 16 : responsiveSpacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: screenWidth < 480 ? 16 : screenWidth < 768 ? 20 : 25,
    paddingHorizontal: screenWidth < 480 ? 10 : screenWidth < 768 ? 12 : screenWidth * 0.05,
    paddingVertical: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenHeight * 0.015,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginLeft: screenWidth < 480 ? 4 : screenWidth < 768 ? 6 : 8,
    marginRight: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth < 480 ? 12 : screenWidth < 768 ? 14 : Math.min(screenWidth * 0.04, 16),
    fontWeight: '500',
  },
  clearIcon: {
    marginLeft: screenWidth < 480 ? 4 : screenWidth < 768 ? 6 : 8,
    marginRight: screenWidth < 480 ? 4 : screenWidth < 768 ? 6 : 8,
    padding: screenWidth < 480 ? 2 : screenWidth < 768 ? 3 : 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
  },
  tab: {
    flex: 1,
    paddingVertical: screenHeight * 0.012,
    paddingHorizontal: screenWidth * 0.01,
    marginHorizontal: screenWidth * 0.005,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight * 0.045,
  },
  tabText: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.035, 14),
  },
  bannerSection: {
    marginBottom: screenHeight * 0.03,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: screenWidth < 480 ? 14 : screenWidth < 768 ? 16 : Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenHeight * 0.015,
    paddingHorizontal: screenWidth < 480 ? 16 : screenWidth < 768 ? 20 : 24,
  },
  bannerList: {
    paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : screenWidth * 0.05,
  },
  bannerContainerWrapper: {
    width: screenWidth < 480 ? screenWidth * 0.80 : screenWidth < 768 ? screenWidth * 0.75 : screenWidth * 0.70,
    marginRight: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenWidth * 0.03,
  },
  bannerContainer: {
    width: '100%',
    height: screenWidth < 480 ? screenHeight * 0.14 : screenWidth < 768 ? screenHeight * 0.16 : screenHeight * 0.18,
    borderRadius: screenWidth < 480 ? 14 : screenWidth < 768 ? 16 : 20,
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
    bottom: screenWidth < 480 ? 8 : screenWidth < 768 ? 10 : 15,
    left: screenWidth < 480 ? 8 : screenWidth < 768 ? 10 : 15,
    right: screenWidth < 480 ? 8 : screenWidth < 768 ? 10 : 15,
  },
  bannerTitle: {
    fontSize: screenWidth < 480 ? 12 : screenWidth < 768 ? 14 : Math.min(screenWidth * 0.04, 16),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: screenWidth < 480 ? 4 : screenWidth < 768 ? 6 : 8,
  },
  bannerButton: {
    paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 10 : screenWidth * 0.04,
    paddingVertical: screenWidth < 480 ? 3 : screenWidth < 768 ? 4 : screenHeight * 0.006,
    borderRadius: screenWidth < 480 ? 10 : screenWidth < 768 ? 12 : 15,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: screenWidth < 480 ? 9 : screenWidth < 768 ? 10 : Math.min(screenWidth * 0.03, 12),
    fontWeight: '600',
  },
     upcomingEventsSection: {
     marginBottom: screenHeight * 0.03,
     paddingHorizontal: 16,
   },
   sectionHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: screenWidth < 480 ? 16 : screenWidth < 768 ? 20 : 24,
     marginBottom: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenHeight * 0.015,
   },
   viewAllButton: {
     paddingHorizontal: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenWidth * 0.04,
     paddingVertical: screenWidth < 480 ? 3 : screenWidth < 768 ? 4 : screenHeight * 0.006,
     backgroundColor: 'rgba(255,255,255,0.2)',
     borderRadius: screenWidth < 480 ? 10 : screenWidth < 768 ? 12 : 15,
   },
   viewAllButtonText: {
     fontSize: screenWidth < 480 ? 9 : screenWidth < 768 ? 10 : Math.min(screenWidth * 0.03, 12),
     color: '#ffffff',
     fontWeight: '600',
   },
       upcomingEventsList: {
      paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : screenWidth * 0.05,
    },
                   upcomingEventCard: {
        width: (screenWidth - responsiveSpacing.lg * 2 - responsiveSpacing.sm * 2) / 3, // Always 3 columns
        marginRight: responsiveSpacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: responsiveSize.cardBorderRadius,
        overflow: 'hidden',
        ...responsiveShadow.medium,
      },
   upcomingEventImageContainer: {
     height: isTablet 
       ? screenHeight * 0.15  // Taller on tablet for better proportions
       : isLandscape 
         ? screenHeight * 0.18  // Taller in landscape
         : screenHeight * 0.12, // Default height on phone
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
     top: 8,
     left: 8,
     backgroundColor: 'rgba(0,0,0,0.7)',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 12,
   },
   upcomingEventBadgeText: {
     fontSize: Math.min(screenWidth * 0.025, 10),
     color: '#ffffff',
     fontWeight: '600',
   },
  templatesSection: {
    paddingBottom: screenWidth < 480 ? screenHeight * 0.02 : screenWidth < 768 ? screenHeight * 0.03 : screenHeight * 0.05,
    paddingHorizontal: 16,
  },
  videoSection: {
    paddingBottom: screenWidth < 480 ? screenHeight * 0.02 : screenWidth < 768 ? screenHeight * 0.03 : screenHeight * 0.05,
    paddingHorizontal: 16,
  },
  templateRow: {
    justifyContent: 'flex-start',
    paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : responsiveSpacing.md,
    gap: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : responsiveSpacing.sm,
  },
  templateCardWrapper: {
    width: (screenWidth - responsiveSpacing.lg * 2 - responsiveSpacing.sm * 2) / 3, // Always 3 columns
    marginBottom: responsiveSpacing.md,
  },
  templateCard: {
    width: '100%',
    borderRadius: responsiveSize.cardBorderRadius,
    overflow: 'hidden',
    ...responsiveShadow.medium,
  },
  templateImageContainer: {
    height: isTablet 
      ? screenHeight * 0.18  // Taller on tablet for better proportions
      : isLandscape 
        ? screenHeight * 0.20  // Taller in landscape
        : screenHeight * 0.15, // Default height on phone
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
    padding: screenWidth * 0.03,
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
     width: screenWidth * 0.9,
     height: screenHeight * 0.8,
     backgroundColor: '#ffffff',
     borderRadius: 20,
     overflow: 'hidden',
     position: 'relative',
   },
   closeButton: {
     position: 'absolute',
     top: 15,
     right: 15,
     width: 30,
     height: 30,
     borderRadius: 15,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 10,
   },
   closeButtonText: {
     color: '#ffffff',
     fontSize: 16,
     fontWeight: 'bold',
   },
   modalImageContainer: {
     height: screenHeight * 0.4,
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
     height: 60,
   },
   modalInfoContainer: {
     flex: 1,
     padding: screenWidth * 0.05,
   },
   modalHeader: {
     marginBottom: screenHeight * 0.02,
   },
   modalTitle: {
     fontSize: Math.min(screenWidth * 0.05, 20),
     fontWeight: 'bold',
     color: '#333333',
     marginBottom: 4,
   },
   modalCategory: {
     fontSize: Math.min(screenWidth * 0.035, 14),
     color: '#666666',
     fontWeight: '500',
   },
   modalStats: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     marginBottom: screenHeight * 0.03,
     paddingVertical: screenHeight * 0.015,
     backgroundColor: '#f8f9fa',
     borderRadius: 15,
   },
   modalStat: {
     alignItems: 'center',
   },
   modalStatLabel: {
     fontSize: Math.min(screenWidth * 0.03, 12),
     color: '#666666',
     fontWeight: '500',
     marginBottom: 4,
   },
   modalStatValue: {
     fontSize: Math.min(screenWidth * 0.04, 16),
     fontWeight: 'bold',
     color: '#333333',
   },
   // Upcoming Festivals Modal Styles
   upcomingEventsModalContent: {
      width: screenWidth * 0.95,
      height: screenHeight * 0.9,
      backgroundColor: '#ffffff',
      borderRadius: 25,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.3,
      shadowRadius: 25,
      elevation: 15,
    },
    upcomingEventsModalGradient: {
      paddingTop: screenHeight * 0.05,
      paddingBottom: screenHeight * 0.02,
    },
    upcomingEventsModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: screenWidth * 0.05,
    },
    upcomingEventsModalTitleContainer: {
      flex: 1,
      marginRight: screenWidth * 0.03,
    },
    upcomingEventsModalTitle: {
      fontSize: Math.min(screenWidth * 0.055, 22),
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: screenHeight * 0.005,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    upcomingEventsModalSubtitle: {
      fontSize: Math.min(screenWidth * 0.035, 14),
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
    },
    upcomingEventsCloseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    upcomingEventsCloseButtonText: {
      fontSize: 18,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    upcomingEventsModalBody: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    upcomingEventsModalScroll: {
      paddingHorizontal: screenWidth * 0.05,
      paddingTop: screenHeight * 0.03,
      paddingBottom: screenHeight * 0.05,
    },
    upcomingEventModalRow: {
      justifyContent: 'flex-start',
      marginBottom: responsiveSpacing.md,
      gap: responsiveSpacing.sm,
    },
    upcomingEventModalCard: {
      width: (screenWidth * 0.85 - responsiveSpacing.lg * 2 - responsiveSpacing.sm * 2) / 3, // Always 3 columns
      backgroundColor: '#ffffff',
      borderRadius: responsiveSize.cardBorderRadius,
      ...responsiveShadow.medium,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    upcomingEventModalImageContainer: {
      height: isTablet 
        ? screenHeight * 0.15  // Taller on tablet for better proportions
        : isLandscape 
          ? screenHeight * 0.18  // Taller in landscape
          : screenHeight * 0.12, // Default height on phone
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
      height: 60,
    },
    upcomingEventModalBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'rgba(0,0,0,0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    upcomingEventModalBadgeText: {
      fontSize: Math.min(screenWidth * 0.025, 10),
      color: '#ffffff',
      fontWeight: '600',
    },
    upcomingEventModalContent: {
      padding: screenWidth * 0.04,
    },
    upcomingEventModalTitle: {
      fontSize: Math.min(screenWidth * 0.04, 16),
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: screenHeight * 0.01,
    },
    upcomingEventModalDetails: {
      gap: screenHeight * 0.005,
    },
    upcomingEventModalDetail: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    upcomingEventModalDetailLabel: {
      fontSize: Math.min(screenWidth * 0.035, 14),
      color: '#666666',
      fontWeight: '500',
    },

  });

export default HomeScreen; 