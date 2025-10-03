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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MyBusinessScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Business category posters state
  const [businessCategoryPosters, setBusinessCategoryPosters] = useState<BusinessCategoryPoster[]>([]);
  const [postersLoading, setPostersLoading] = useState(false);
  const [userBusinessCategory, setUserBusinessCategory] = useState<string>('General');
  const [refreshing, setRefreshing] = useState(false);

  // Load business category posters
  const loadBusinessCategoryPosters = useCallback(async () => {
    setPostersLoading(true);
    try {
      console.log('🎯 Loading business category posters...');
      const response = await businessCategoryPostersApi.getUserCategoryPosters();
      
      if (response.success) {
        setBusinessCategoryPosters(response.data.posters);
        setUserBusinessCategory(response.data.category);
        console.log('✅ Business category posters loaded:', response.data.posters.length, 'posters for category:', response.data.category);
      } else {
        console.log('⚠️ Failed to load business category posters');
        setBusinessCategoryPosters([]);
      }
    } catch (error) {
      console.error('❌ Error loading business category posters:', error);
      setBusinessCategoryPosters([]);
    } finally {
      setPostersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinessCategoryPosters();
  }, [loadBusinessCategoryPosters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBusinessCategoryPosters();
    } catch (error) {
      console.log('Error refreshing posters:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadBusinessCategoryPosters]);

  const handlePosterPress = (poster: BusinessCategoryPoster) => {
    // Navigate to poster editor with the selected poster
    navigation.navigate('PosterEditor', {
      selectedImage: {
        uri: poster.thumbnail,
        title: poster.title,
        description: poster.description
      },
      selectedLanguage: 'en',
      selectedTemplateId: poster.id,
    });
  };

  const handleLikePoster = async (posterId: string) => {
    try {
      const result = await businessCategoryPostersApi.likePoster(posterId);
      if (result.success) {
        // Update local state to reflect the like
        setBusinessCategoryPosters(prev => 
          prev.map(poster => 
            poster.id === posterId 
              ? { ...poster, likes: poster.likes + 1 }
              : poster
          )
        );
      }
    } catch (error) {
      console.error('Error liking poster:', error);
    }
  };

  const renderPoster = useCallback(({ item }: { item: BusinessCategoryPoster }) => {
    return (
      <TouchableOpacity
        style={styles.posterCard}
        onPress={() => handlePosterPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.posterImage} />
        <View style={styles.posterOverlay}>
          <TouchableOpacity
            style={styles.posterLikeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLikePoster(item.id);
            }}
          >
            <Icon name="favorite-border" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [theme, navigation]);

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
              <Icon name="arrow-back" size={24} color="#ffffff" />
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
              <Icon name="image" size={48} color="rgba(255,255,255,0.7)" />
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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
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
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  postersList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  posterRow: {
    justifyContent: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  posterCard: {
    width: (screenWidth - 32 - 16) / 3, // 3 columns with proper spacing
    height: screenHeight * 0.15, // Match HomeScreen proportions
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
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
  posterOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  posterLikeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyPostersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostersText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyBusinessScreen;