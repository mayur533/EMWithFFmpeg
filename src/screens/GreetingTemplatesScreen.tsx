import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import GreetingTemplateCard, { getCardDimensions } from '../components/GreetingTemplateCard';
import greetingTemplatesService, { GreetingTemplate, GreetingCategory } from '../services/greetingTemplates';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
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

// Compact spacing multiplier to reduce all spacing (matching HomeScreen)
const COMPACT_MULTIPLIER = 0.5;

// Using centralized responsive utilities
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design helpers for modal
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

// Responsive helper functions (matching HomeScreen)
const scale = (size: number) => (screenWidth / 375) * size;
const verticalScale = (size: number) => (screenHeight / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const GreetingTemplatesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { isSubscribed, checkPremiumAccess, refreshSubscription } = useSubscription();
  const insets = useSafeAreaInsets();

  // Get responsive values - memoized to prevent unnecessary re-renders
  const { visibleCards, cardGap } = getCardDimensions();

  // State
  const [categories, setCategories] = useState<GreetingCategory[]>([]);
  const [allTemplates, setAllTemplates] = useState<GreetingTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<GreetingTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState<GreetingTemplate | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Optimized data fetching - removed dependency to prevent re-renders
  const fetchData = async (isRefresh: boolean = false) => {
    try {
      // Fetch categories and templates in parallel
      // Cache will make this instant on subsequent loads
      const [categoriesData, templatesData] = await Promise.all([
        greetingTemplatesService.getCategories(),
        greetingTemplatesService.getTemplates(),
      ]);
      
      // Only update if we got data
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      }
      
      if (templatesData.length > 0) {
        setAllTemplates(templatesData);
        setFilteredTemplates(templatesData);
      }
      
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInitialLoading(false);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load greeting templates. Please try again.');
      }
    }
  };

  // Client-side filtering for instant category switching
  const filterTemplatesByCategory = useCallback((categoryFilter: string, templates: GreetingTemplate[]) => {
    if (categoryFilter === 'all') {
      return templates;
    }
    
    // Find the category object to get its name
    const categoryObj = categories.find(cat => cat.id === categoryFilter);
    const categoryName = categoryObj?.name || categoryFilter;
    
    // Filter by category ID (preferred) or name for better matching
    const filtered = templates.filter(template => {
      const categoryIdMatch = template.categoryId === categoryFilter;
      const categoryNameMatch = 
        template.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        template.category?.toLowerCase() === categoryName.toLowerCase() ||
        template.category?.toLowerCase().includes(categoryName.toLowerCase());
      
      return categoryIdMatch || categoryNameMatch;
    });
    
    return filtered;
  }, [categories]);

  // Optimized search functionality with debouncing
  const searchTemplates = useCallback(async (query: string) => {
    if (!query.trim()) {
      // If no search query, show templates filtered by current category
      const categoryFiltered = filterTemplatesByCategory(selectedCategory, allTemplates);
      setFilteredTemplates(categoryFiltered);
      return;
    }

    try {
      const results = await greetingTemplatesService.searchTemplates(query);
      setFilteredTemplates(results);
    } catch (error) {
      console.error('Error searching templates:', error);
    }
  }, [allTemplates, selectedCategory, filterTemplatesByCategory]);

  // Effects - load data on mount only
  useEffect(() => {
    fetchData();
  }, []); // Only run once on mount



  // Optimized search effect with better debouncing
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchTemplates(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // If no search query, filter by current category
      const categoryFiltered = filterTemplatesByCategory(selectedCategory, allTemplates);
      setFilteredTemplates(categoryFiltered);
    }
  }, [searchQuery, selectedCategory, allTemplates]); // Removed function dependencies to prevent loops

  // Instant category switching - no API calls
  const handleCategorySelect = useCallback((categoryFilter: string) => {
    setSelectedCategory(categoryFilter);
    setSearchQuery('');
    
    // Instant client-side filtering
    const categoryFiltered = filterTemplatesByCategory(categoryFilter, allTemplates);
    setFilteredTemplates(categoryFiltered);
  }, [filterTemplatesByCategory, allTemplates]);

  const handleTemplatePress = useCallback((template: GreetingTemplate) => {
    if (template.isPremium && !checkPremiumAccess('premium_greetings')) {
      setSelectedPremiumTemplate(template);
      setUpgradeModalVisible(true);
      return;
    }

    navigation.navigate('PosterEditor', {
      selectedImage: {
        uri: template.thumbnail,
        title: template.name,
        description: template.category,
      },
      selectedLanguage: 'English',
      selectedTemplateId: template.id,
    });
  }, [isSubscribed, navigation]);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch fresh data
    await fetchData(true);
    setRefreshing(false);
  }, []);

  // Memoized render functions with optimized dependencies
  const renderCategoryTab = useCallback(({ item }: { item: GreetingCategory }) => {
    // Check if icon is an emoji (not a Material icon name)
    const isEmoji = item.icon && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(item.icon);
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          {
            backgroundColor: selectedCategory === item.id ? item.color : theme.colors.surface,
            borderColor: theme.colors.border,
          }
        ]}
        onPress={() => handleCategorySelect(item.id)}
        activeOpacity={0.7}
      >
        {item.icon && (
          isEmoji ? (
            <Text style={{ fontSize: moderateScale(14) }}>{item.icon}</Text>
          ) : null
        )}
        <Text
          style={[
            styles.categoryTabText,
            {
              color: selectedCategory === item.id ? '#FFFFFF' : theme.colors.text,
              fontSize: moderateScale(8),
            }
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedCategory, theme.colors.surface, theme.colors.border, theme.colors.text, handleCategorySelect]);

  // Optimized template card renderer for vertical grid
  const renderTemplateCard = useCallback(({ item, index }: { item: GreetingTemplate; index: number }) => {
    // Calculate if this card is the last in its row
    const isLastInRow = (index + 1) % visibleCards === 0;
    
    return (
      <View style={{ marginRight: isLastInRow ? 0 : cardGap }}>
        <GreetingTemplateCard
          template={item}
          onPress={handleTemplatePress}
        />
      </View>
    );
  }, [handleTemplatePress, visibleCards, cardGap]);

  const renderEmptyState = useCallback(() => (
    <View style={[styles.emptyContainer, { paddingHorizontal: moderateScale(16) }]}>
      <Icon name="sentiment-dissatisfied" size={moderateScale(48)} color={theme.colors.textSecondary} />
      <Text style={[
        styles.emptyTitle, 
        { 
          color: theme.colors.text,
          fontSize: moderateScale(12),
          marginTop: moderateScale(8),
          marginBottom: moderateScale(4),
        }
      ]}>
        No templates found
      </Text>
      <Text style={[
        styles.emptySubtitle, 
        { 
          color: theme.colors.textSecondary,
          fontSize: moderateScale(10),
          lineHeight: moderateScale(16),
        }
      ]}>
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new templates'}
      </Text>
    </View>
  ), [searchQuery, theme.colors.text, theme.colors.textSecondary]);

  // Memoized key extractors and other optimizations
  const keyExtractor = useCallback((item: GreetingTemplate) => item.id, []);
  const categoryKeyExtractor = useCallback((item: GreetingCategory) => item.id, []);

  // Memoized FlatList props for vertical scrolling with responsive columns
  const flatListProps = useMemo(() => {
    const horizontalPadding = moderateScale(8);
    const verticalGap = moderateScale(4);
    
    return {
      data: filteredTemplates,
      renderItem: renderTemplateCard,
      keyExtractor,
      numColumns: visibleCards, // Responsive columns (3-6 based on screen size)
      columnWrapperStyle: {
        paddingHorizontal: horizontalPadding,
        marginBottom: verticalGap,
      },
      contentContainerStyle: {
        paddingBottom: moderateScale(20),
        paddingTop: moderateScale(4),
      },
      showsVerticalScrollIndicator: false,
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      windowSize: 5,
      initialNumToRender: 10,
      updateCellsBatchingPeriod: 100,
      getItemLayout: (data: any, index: number) => ({
        length: cardGap + moderateScale(4),
        offset: (cardGap + moderateScale(4)) * index,
        index,
      }),
    };
  }, [filteredTemplates, visibleCards]);

  // Render upgrade modal
  const renderUpgradeModal = () => {
    return (
    <Modal
      visible={upgradeModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setUpgradeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.upgradeModalContent, { backgroundColor: '#ffffff' }]}>
            {/* Premium Badge */}
            <View style={styles.premiumBadge}>
              <Icon name="star" size={moderateScale(16)} color="#DAA520" />
              <Text style={[styles.premiumBadgeText, { color: '#B8860B' }]}>PREMIUM</Text>
            </View>

            {/* Modal Header */}
            <View style={styles.upgradeModalHeader}>
              <Text style={[styles.upgradeModalTitle, { color: '#1a1a1a' }]}>
                Unlock Premium Template
              </Text>
              <Text style={[styles.upgradeModalSubtitle, { color: '#666666' }]}>
                Get access to this exclusive template and all premium features
              </Text>
            </View>

            {/* Template Preview */}
            {selectedPremiumTemplate && (
              <View style={styles.templatePreview}>
                <Image 
                  source={{ uri: selectedPremiumTemplate.thumbnail }} 
                  style={styles.templatePreviewImage}
                  resizeMode="cover"
                />
                <View style={styles.templatePreviewOverlay}>
                  <Text style={styles.templatePreviewTitle}>{selectedPremiumTemplate.name}</Text>
                  <Text style={styles.templatePreviewDescription}>{selectedPremiumTemplate.category}</Text>
                </View>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={moderateScale(14)} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>
                  Access to all premium templates
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={moderateScale(14)} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>
                  No watermarks on final designs
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={moderateScale(14)} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>
                  Priority customer support
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={moderateScale(14)} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>
                  Advanced editing features
                </Text>
              </View>
            </View>

            {/* Modal Footer */}
            <View style={styles.upgradeModalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: '#cccccc' }]}
                onPress={() => setUpgradeModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: '#666666' }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={async () => {
                  setUpgradeModalVisible(false);
                  // Refresh subscription status before navigating
                  await refreshSubscription();
                  navigation.navigate('Subscription');
                }}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.upgradeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="star" size={moderateScale(12)} color="#ffffff" style={styles.upgradeButtonIcon} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
        <View style={[
          styles.header, 
          { 
            paddingTop: insets.top + (responsiveSpacing.xs * COMPACT_MULTIPLIER),
            paddingBottom: moderateScale(3),
            paddingHorizontal: moderateScale(4),
          }
        ]}>
          <View style={[
            styles.headerContent, 
            { paddingHorizontal: moderateScale(2) }
          ]}>
            <Text style={[
              styles.headerTitle,
              { fontSize: moderateScale(12) }
            ]}>Greeting Templates</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer, 
          { 
            marginHorizontal: moderateScale(8),
            marginVertical: moderateScale(3),
          }
        ]}>
          <View style={[
            styles.searchBar, 
            { 
              backgroundColor: theme.colors.cardBackground,
            }
          ]}>
            <Icon name="search" size={moderateScale(14)} color={theme.colors.textSecondary} style={{ marginLeft: moderateScale(2), marginRight: moderateScale(4) }} />
            <TextInput
              style={[
                styles.searchInput, 
                { 
                  color: theme.colors.text,
                }
              ]}
              placeholder="Search templates..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={moderateScale(14)} color={theme.colors.textSecondary} style={{ marginLeft: moderateScale(4), marginRight: moderateScale(4), padding: moderateScale(2) }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={[styles.categoriesContainer, { marginBottom: moderateScale(3) }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoriesScroll, 
              { paddingHorizontal: moderateScale(8), gap: moderateScale(3) }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.categoryTab,
                {
                  backgroundColor: selectedCategory === 'all' ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handleCategorySelect('all')}
              activeOpacity={0.7}
            >
              <Icon
                name="apps"
                size={moderateScale(14)}
                color={selectedCategory === 'all' ? '#FFFFFF' : theme.colors.text}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  {
                    color: selectedCategory === 'all' ? '#FFFFFF' : theme.colors.text,
                    fontSize: moderateScale(8),
                  }
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <View key={category.id}>
                {renderCategoryTab({ item: category })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Templates Grid - Optimized FlatList */}
        <FlatList
          key={`grid-${visibleCards}`} // Key to force re-render when columns change
          {...flatListProps}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            initialLoading ? (
              <View style={[styles.loadingContainer, { paddingTop: moderateScale(40) }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[
                  styles.loadingText, 
                  { 
                    color: theme.colors.text,
                    marginTop: moderateScale(8),
                    fontSize: moderateScale(10),
                  }
                ]}>
                  Loading templates...
                </Text>
              </View>
            ) : (
              renderEmptyState()
            )
          }
        />
      </LinearGradient>
      
      {/* Premium Modal */}
      {renderUpgradeModal()}
      
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
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(3),
    paddingHorizontal: moderateScale(4),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(2),
  },
  headerTitle: {
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    marginHorizontal: moderateScale(8),
    marginVertical: moderateScale(3),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(14),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(4),
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: moderateScale(3),
  },
  categoriesScroll: {
    paddingHorizontal: moderateScale(8),
    gap: moderateScale(3),
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    gap: moderateScale(3),
    minWidth: moderateScale(60),
    justifyContent: 'center',
    minHeight: moderateScale(30),
  },
  categoryTabText: {
    fontWeight: '600',
  },
  templatesContainer: {
    paddingBottom: moderateScale(20),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(50),
    paddingHorizontal: moderateScale(16),
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(4),
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: moderateScale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(40),
  },
  loadingText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Premium Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(12),
  },
  modalScrollView: {
    maxHeight: screenHeight * 0.85,
    width: '100%',
    maxWidth: isTablet ? 450 : screenWidth - 24,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  upgradeModalContent: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(6),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(12),
    elevation: moderateScale(16),
    width: '100%',
    minHeight: screenHeight * 0.3,
    maxHeight: screenHeight * 0.8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(16),
    alignSelf: 'center',
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumBadgeText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#B8860B',
    marginLeft: moderateScale(5),
    letterSpacing: 0.8,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  upgradeModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: moderateScale(6),
    paddingHorizontal: moderateScale(4),
    color: '#1a1a1a',
    lineHeight: moderateScale(24),
  },
  upgradeModalSubtitle: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: moderateScale(18),
    paddingHorizontal: moderateScale(4),
    color: '#666666',
  },
  templatePreview: {
    height: moderateScale(90),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginBottom: moderateScale(16),
    position: 'relative',
  },
  templatePreviewImage: {
    width: '100%',
    height: '100%',
  },
  templatePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: moderateScale(10),
  },
  templatePreviewTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: moderateScale(3),
  },
  templatePreviewDescription: {
    fontSize: moderateScale(10),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresList: {
    marginBottom: moderateScale(16),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  featureText: {
    fontSize: moderateScale(11),
    marginLeft: moderateScale(8),
    flex: 1,
    lineHeight: moderateScale(18),
    color: '#1a1a1a',
  },
  upgradeModalFooter: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: moderateScale(10),
    alignItems: 'stretch',
    width: '100%',
    marginTop: 0,
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(38),
    maxWidth: '100%',
    minWidth: moderateScale(120),
    borderColor: '#cccccc',
  },
  cancelButtonText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    flexShrink: 0,
  },
  upgradeButton: {
    flex: 1,
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    minHeight: moderateScale(38),
    maxWidth: '100%',
    minWidth: moderateScale(120),
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    minHeight: moderateScale(38),
  },
  upgradeButtonIcon: {
    marginRight: moderateScale(4),
  },
  upgradeButtonText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    flexShrink: 0,
  },
});

export default GreetingTemplatesScreen;
