import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import businessCategoryPostersApi, { BusinessCategoryPoster } from '../services/businessCategoryPostersApi';
import ComingSoonModal from '../components/ComingSoonModal';
import OptimizedImage from '../components/OptimizedImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive design helpers with more granular breakpoints
const isUltraSmallScreen = screenWidth < 360;
const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414 && screenWidth < 480;
const isXLargeScreen = screenWidth >= 480;

// Orientation detection
const isPortrait = screenHeight > screenWidth;
const isLandscape = screenWidth > screenHeight;

// Device type detection
const isTablet = Math.min(screenWidth, screenHeight) >= 768;
const isPhone = !isTablet;

// Enhanced responsive spacing and sizing system
const responsiveSpacing = {
  xs: isUltraSmallScreen ? 2 : isSmallScreen ? 4 : isMediumScreen ? 6 : isLargeScreen ? 8 : 10,
  sm: isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 10 : 12,
  md: isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : 14,
  lg: isUltraSmallScreen ? 8 : isSmallScreen ? 10 : isMediumScreen ? 12 : isLargeScreen ? 14 : 16,
  xl: isUltraSmallScreen ? 10 : isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : 18,
  xxl: isUltraSmallScreen ? 12 : isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 18 : 20,
  xxxl: isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 24,
};

const responsiveFontSize = {
  xs: isUltraSmallScreen ? 8 : isSmallScreen ? 9 : isMediumScreen ? 10 : isLargeScreen ? 11 : 12,
  sm: isUltraSmallScreen ? 9 : isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : 13,
  md: isUltraSmallScreen ? 10 : isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : 14,
  lg: isUltraSmallScreen ? 11 : isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : 15,
  xl: isUltraSmallScreen ? 12 : isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 15 : 16,
  xxl: isUltraSmallScreen ? 13 : isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : 17,
  xxxl: isUltraSmallScreen ? 14 : isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 17 : 18,
  xxxxl: isUltraSmallScreen ? 15 : isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : 20,
  xxxxxl: isUltraSmallScreen ? 16 : isSmallScreen ? 17 : isMediumScreen ? 18 : isLargeScreen ? 19 : 22,
};

// Fixed 3 columns for all screen sizes
const getGridColumns = () => {
  return 3;
};

// Dynamic poster card dimensions for 3-column layout
const getPosterCardDimensions = (screenWidth: number) => {
  const columns = 3; // Fixed 3 columns
  const horizontalPadding = responsiveSpacing.md * 2;
  const gap = responsiveSpacing.sm;
  const totalGapWidth = gap * (columns - 1);
  const cardWidth = (screenWidth - horizontalPadding - totalGapWidth) / columns;
  
  // Dynamic height based on screen size and orientation for 3-column layout
  let heightRatio = 0.15;
  if (isTablet) {
    heightRatio = isLandscape ? 0.25 : 0.22;
  } else if (isLargeScreen) {
    heightRatio = isLandscape ? 0.22 : 0.18;
  } else if (isMediumScreen) {
    heightRatio = isLandscape ? 0.18 : 0.16;
  } else {
    heightRatio = isLandscape ? 0.16 : 0.15;
  }
  
  const cardHeight = screenHeight * heightRatio;
  
  return { cardWidth, cardHeight, columns };
};

const MyBusinessScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Business category posters state
  const [businessCategoryPosters, setBusinessCategoryPosters] = useState<BusinessCategoryPoster[]>([]);
  const [postersLoading, setPostersLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userBusinessCategory, setUserBusinessCategory] = useState<string>('General');
  const [refreshing, setRefreshing] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  // State for orientation changes
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  // Get dynamic dimensions
  const { cardWidth, cardHeight, columns } = getPosterCardDimensions(screenData.width);

  // Optimized load with cache support
  const loadBusinessCategoryPosters = useCallback(async (isRefresh: boolean = false) => {
    setPostersLoading(true);
    try {
      // Cache will make this instant on subsequent loads
      const response = await businessCategoryPostersApi.getUserCategoryPosters();
      
      if (response.success) {
        setBusinessCategoryPosters(response.data.posters);
        setUserBusinessCategory(response.data.category);
      } else {
        setBusinessCategoryPosters([]);
      }
      
      // Hide initial loading after first fetch
      if (initialLoading) {
        setInitialLoading(false);
      }
    } catch (error) {
      console.error('Error loading business category posters:', error);
      setBusinessCategoryPosters([]);
      if (initialLoading) {
        setInitialLoading(false);
      }
    } finally {
      setPostersLoading(false);
    }
  }, [initialLoading]);

  useEffect(() => {
    loadBusinessCategoryPosters();
  }, [loadBusinessCategoryPosters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear cache before refreshing
      businessCategoryPostersApi.clearCache();
      await loadBusinessCategoryPosters(true);
    } catch (error) {
      console.error('Error refreshing posters:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadBusinessCategoryPosters]);

  const handlePosterPress = (poster: BusinessCategoryPoster) => {
    navigation.navigate('MyBusinessPlayer', {
      selectedPoster: poster,
      relatedPosters: businessCategoryPosters.filter(p => p.id !== poster.id),
    });
  };

  const renderPoster = useCallback(({ item }: { item: BusinessCategoryPoster }) => {
    return (
      <TouchableOpacity
        style={[
          styles.posterCard,
          {
            width: cardWidth,
            height: cardHeight,
          }
        ]}
        onPress={() => handlePosterPress(item)}
        activeOpacity={0.8}
      >
        <OptimizedImage 
          uri={item.thumbnail} 
          style={styles.posterImage}
          resizeMode="cover"
          showLoader={true}
          loaderColor={theme.colors.primary}
          loaderSize="small"
        />
      </TouchableOpacity>
    );
  }, [theme, navigation, cardWidth, cardHeight]);

  const keyExtractor = useCallback((item: BusinessCategoryPoster) => item.id, []);

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
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon 
                name="arrow-back" 
                size={isUltraSmallScreen ? 20 : isSmallScreen ? 22 : isMediumScreen ? 24 : isLargeScreen ? 26 : 28} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              My Business Posters
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Posters Section */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          bounces={true}
        >
          <View style={styles.postersHeader}>
            <Text style={styles.sectionTitle}>
              {userBusinessCategory} Posters
            </Text>
            {postersLoading && (
              <ActivityIndicator 
                size="small" 
                color="#ffffff" 
                style={styles.loadingIndicator}
              />
            )}
          </View>
          
          {businessCategoryPosters.length > 0 ? (
            <FlatList
              key={`posters-${screenData.width}-${screenData.height}`}
              data={businessCategoryPosters}
              renderItem={renderPoster}
              keyExtractor={keyExtractor}
              numColumns={3}
              columnWrapperStyle={styles.posterRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.postersList}
            />
          ) : (
            <View style={styles.emptyPostersContainer}>
              <Icon 
                name="image" 
                size={isUltraSmallScreen ? 40 : isSmallScreen ? 44 : isMediumScreen ? 48 : isLargeScreen ? 52 : 56} 
                color="rgba(255,255,255,0.7)" 
              />
              <Text style={styles.emptyPostersText}>
                No posters available for {userBusinessCategory} category
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadBusinessCategoryPosters}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      
      {/* Coming Soon Modal for Like Feature */}
      <ComingSoonModal
        visible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title="Like Feature"
        subtitle="The like feature is under development and will be available soon!"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingBottom: responsiveSpacing.lg,
    paddingHorizontal: responsiveSpacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: responsiveSpacing.sm,
    width: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isMediumScreen ? 44 : isLargeScreen ? 48 : 52,
    height: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isMediumScreen ? 44 : isLargeScreen ? 48 : 52,
    borderRadius: isUltraSmallScreen ? 18 : isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: responsiveFontSize.xxxxl,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isMediumScreen ? 44 : isLargeScreen ? 48 : 52,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: responsiveSpacing.md,
    marginTop: responsiveSpacing.lg,
    marginBottom: responsiveSpacing.lg,
  },
  sectionTitle: {
    fontSize: responsiveFontSize.xxxl,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    marginLeft: responsiveSpacing.sm,
  },
  postersList: {
    paddingHorizontal: responsiveSpacing.md,
    paddingBottom: responsiveSpacing.xl,
  },
  posterRow: {
    justifyContent: 'flex-start',
    marginBottom: responsiveSpacing.sm,
    paddingHorizontal: 0,
    gap: responsiveSpacing.sm,
  },
  posterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isUltraSmallScreen ? 6 : isSmallScreen ? 7 : isMediumScreen ? 8 : isLargeScreen ? 9 : 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  emptyPostersContainer: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing.xxxl,
  },
  emptyPostersText: {
    fontSize: responsiveFontSize.lg,
    textAlign: 'center',
    marginTop: responsiveSpacing.lg,
    marginBottom: responsiveSpacing.xl,
    lineHeight: responsiveFontSize.lg * 1.4,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  refreshButton: {
    paddingHorizontal: responsiveSpacing.xl,
    paddingVertical: responsiveSpacing.md,
    borderRadius: isUltraSmallScreen ? 6 : isSmallScreen ? 7 : isMediumScreen ? 8 : isLargeScreen ? 9 : 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default MyBusinessScreen;