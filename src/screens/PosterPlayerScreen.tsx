import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Template } from '../services/dashboard';
import { useTheme } from '../context/ThemeContext';
import OptimizedImage from '../components/OptimizedImage';

type PosterPlayerScreenRouteProp = RouteProp<MainStackParamList, 'PosterPlayer'>;
type PosterPlayerScreenNavigationProp = StackNavigationProp<MainStackParamList, 'PosterPlayer'>;

const PosterPlayerScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<PosterPlayerScreenNavigationProp>();
  const route = useRoute<PosterPlayerScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
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
  
  // Responsive scaling functions
  const scale = (size: number) => (screenWidth / 375) * size;
  const verticalScale = (size: number) => (screenHeight / 667) * size;
  const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
  
  const { selectedPoster: initialPoster, relatedPosters: initialRelatedPosters } = route.params;
  const [currentPoster, setCurrentPoster] = useState<Template>(initialPoster);
  const [currentRelatedPosters, setCurrentRelatedPosters] = useState<Template[]>(initialRelatedPosters);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');

  // Sync state when route params change
  useEffect(() => {
    setCurrentPoster(initialPoster);
    setCurrentRelatedPosters(initialRelatedPosters);
  }, [initialPoster, initialRelatedPosters]);

  // Language options
  const languages = useMemo(() => [
    { id: 'english', name: 'English', code: 'EN' },
    { id: 'marathi', name: 'Marathi', code: 'MR' },
    { id: 'hindi', name: 'Hindi', code: 'HI' },
  ], []);

  // Filter posters by selected language
  const filteredPosters = useMemo(() => {
    return currentRelatedPosters.filter(poster => {
      // If poster doesn't have languages property, show it for all languages
      if (!poster.languages || poster.languages.length === 0) {
        return true;
      }
      // Otherwise, filter based on poster's supported languages
      return poster.languages.includes(selectedLanguage);
    });
  }, [currentRelatedPosters, selectedLanguage]);

  const handlePosterSelect = useCallback((poster: Template) => {
    // Update state instead of navigating to prevent full page refresh
    setCurrentPoster(poster);
    // Update related posters to exclude the newly selected one and include the previous one
    setCurrentRelatedPosters(prev => {
      const withoutNew = prev.filter(p => p.id !== poster.id);
      return [currentPoster, ...withoutNew];
    });
  }, [currentPoster]);

  const handleLanguageChange = useCallback((languageId: string) => {
    setSelectedLanguage(languageId);
  }, []);

  // Responsive icon sizes
  const getIconSize = useCallback((baseSize: number) => {
    const scale = screenWidth / 375;
    return Math.round(baseSize * scale);
  }, [screenWidth]);
  
  // Responsive card dimensions
  const cardWidth = useMemo(() => {
    const numColumns = screenWidth >= 768 ? 4 : 3;
    const padding = moderateScale(16);
    const gaps = moderateScale(3) * (numColumns - 1);
    return (screenWidth - padding - gaps) / numColumns;
  }, [screenWidth]);
  
  const cardHeight = useMemo(() => {
    return verticalScale(80); // Consistent compact height
  }, [screenHeight]);
  
  // Responsive poster height
  const posterHeight = useMemo(() => {
    if (screenWidth >= 768) {
      return screenHeight * 0.35; // Tablet
    } else if (screenWidth >= 600) {
      return screenHeight * 0.30; // Large phone
    } else if (screenWidth >= 400) {
      return screenHeight * 0.28; // Medium phone
    } else {
      return screenHeight * 0.25; // Small phone
    }
  }, [screenWidth, screenHeight]);

  const handleNextPress = useCallback(() => {
    navigation.navigate('PosterEditor', {
      selectedImage: {
        uri: currentPoster.thumbnail,
        title: currentPoster.name,
        description: currentPoster.category,
      },
      selectedLanguage: selectedLanguage,
      selectedTemplateId: currentPoster.id,
    });
  }, [navigation, currentPoster, selectedLanguage]);

  const renderRelatedPoster = useCallback(({ item }: { item: Template }) => (
    <TouchableOpacity
      style={[styles.relatedPosterCard, { width: cardWidth, height: cardHeight }]}
      onPress={() => handlePosterSelect(item)}
      activeOpacity={0.8}
    >
      <OptimizedImage
        uri={item.thumbnail}
        style={styles.relatedPosterImage}
        resizeMode="cover"
      />
      
      
      <View style={styles.relatedPosterLanguageBadge}>
        <Text style={styles.relatedPosterLanguageText}>
          {languages.find(lang => lang.id === selectedLanguage)?.code || 'EN'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handlePosterSelect, selectedLanguage, languages, cardWidth, cardHeight]);

  const renderLanguageButton = useCallback((language: typeof languages[0]) => {
    const iconSize = getIconSize(12);
    
    return (
      <TouchableOpacity
        key={language.id}
        style={[
          styles.languageButton,
          selectedLanguage === language.id && styles.languageButtonSelected
        ]}
        onPress={() => handleLanguageChange(language.id)}
        activeOpacity={0.7}
      >
        <View style={styles.languageButtonContent}>
          <Text style={[
            styles.languageButtonText,
            selectedLanguage === language.id && styles.languageButtonTextSelected
          ]}>
            {language.name}
          </Text>
          {selectedLanguage === language.id && (
            <Icon name="check-circle" size={iconSize} color="#ffffff" />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedLanguage, handleLanguageChange, getIconSize, screenWidth]);

     return (
     <View style={[styles.container, { backgroundColor: theme.colors.gradient[0] || '#e8e8e8' }]}>
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
         {/* Safe Area Top Spacing */}
         <View style={{ height: insets.top + moderateScale(12) }} />

         {/* Compact Poster Section */}
         <View style={[styles.posterContainer, { height: posterHeight }]}>
           <OptimizedImage
             uri={currentPoster.thumbnail}
             style={styles.posterImage}
             resizeMode="contain"
           />
           <View style={styles.posterOverlay}>
             <View style={styles.languageBadge}>
               <Text style={styles.languageBadgeText}>
                 {selectedLanguage.toUpperCase()}
               </Text>
             </View>
             
             {/* Edit Button Overlay */}
             <TouchableOpacity
               style={styles.editButton}
               onPress={handleNextPress}
               activeOpacity={0.8}
             >
               <Icon name="edit" size={getIconSize(14)} color="#ffffff" />
             </TouchableOpacity>
           </View>
         </View>

         {/* Compact Language Selection Section */}
         <View style={styles.languageSection}>
           <ScrollView 
             horizontal 
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.languageButtonsContainer}
           >
             {languages.map(renderLanguageButton)}
           </ScrollView>
         </View>

         {/* Compact Related Posters Section */}
         <View style={styles.relatedSection}>
           <View style={styles.relatedHeader}>
             <Text style={styles.relatedTitle}>
               Related Templates
             </Text>
           </View>
           
           {filteredPosters.length > 0 ? (
             <FlatList
               data={filteredPosters}
               renderItem={renderRelatedPoster}
               keyExtractor={(item) => item.id}
               numColumns={screenWidth >= 768 ? 4 : 3}
               key={screenWidth >= 768 ? 'tablet-4' : 'phone-3'}
               columnWrapperStyle={styles.relatedGrid}
               showsVerticalScrollIndicator={true}
               contentContainerStyle={styles.relatedList}
               style={styles.relatedFlatList}
             />
           ) : (
             <View style={styles.noPostersContainer}>

               <Text style={styles.noPostersText}>
                 No templates available in {languages.find(lang => lang.id === selectedLanguage)?.name}
               </Text>
               <Text style={styles.noPostersSubtext}>
                 Try selecting a different language
               </Text>
             </View>
           )}
         </View>

         {/* Safe Area Bottom Spacing */}
         <View style={{ height: insets.bottom }} />
       </LinearGradient>
     </View>
   );
};

// Get dynamic screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const isTablet = SCREEN_WIDTH >= 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: moderateScale(8), // Reduced padding
    paddingTop: moderateScale(4), // Reduced padding
    paddingBottom: moderateScale(4),
  },
  backButton: {
    width: moderateScale(32), // Reduced from 36-52
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1), // Reduced from 2
    },
    shadowOpacity: 0.08, // Reduced from 0.1
    shadowRadius: moderateScale(3), // Reduced from 4
    elevation: 2, // Reduced from 3
  },
  editButton: {
    position: 'absolute',
    bottom: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(4),
    elevation: 6,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 0,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: moderateScale(11),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 0,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: moderateScale(6),
  },
  headerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(2),
  },
  headerMetaText: {
    fontSize: moderateScale(8),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  posterContainer: {
    position: 'relative',
    // Height is set dynamically via inline style based on screen dimensions
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(8), // Reduced padding
    marginBottom: moderateScale(6), // Reduced margin
    borderRadius: moderateScale(12), // Smaller border radius
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(4), // Reduced from 8-12
    },
    shadowOpacity: 0.2, // Reduced from 0.3-0.4
    shadowRadius: moderateScale(8), // Reduced from 16-20
    elevation: 6, // Reduced from 12-16
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterControls: {
    position: 'absolute',
    top: moderateScale(12),
    left: moderateScale(12),
  },
  zoomButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageBadge: {
    position: 'absolute',
    top: moderateScale(8), // Reduced
    right: moderateScale(8),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: moderateScale(6), // Reduced
    paddingVertical: moderateScale(3), // Reduced
    borderRadius: moderateScale(8), // Reduced
    borderWidth: moderateScale(0.5), // Reduced
    borderColor: 'rgba(255,255,255,0.15)',
  },
  languageBadgeText: {
    color: '#ffffff',
    fontSize: moderateScale(8), // Compact
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  relatedSection: {
    flex: 1,
    paddingHorizontal: moderateScale(8), // Compact padding
    paddingTop: moderateScale(4),
    paddingBottom: 0,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(6), // Compact margin
  },
  relatedHeaderLeft: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: moderateScale(13), // Compact font
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  relatedSubtitle: {
    fontSize: moderateScale(10),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  relatedCountBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(10),
  },
  relatedCountText: {
    color: '#ffffff',
    fontSize: moderateScale(8),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  relatedList: {
    paddingBottom: moderateScale(20), // Compact padding
    paddingTop: moderateScale(4),
  },
  relatedFlatList: {
    flex: 1,
  },
  relatedGrid: {
    justifyContent: 'flex-start', // Align to left for consistent spacing
    gap: moderateScale(3), // Equal gap between cards
  },
  relatedPosterCard: {
    // Width and height are set dynamically via inline style based on screen dimensions
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: moderateScale(8), // Smaller
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2), // Reduced
    },
    shadowOpacity: 0.12, // Reduced
    shadowRadius: moderateScale(4), // Reduced
    elevation: 3, // Reduced
    borderWidth: moderateScale(0.5), // Thinner
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: moderateScale(6), // Compact margin
  },
  relatedPosterImage: {
    width: '100%',
    height: '100%',
  },
  relatedPosterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedPosterIcon: {
    width: moderateScale(40), // Compact
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(3),
    elevation: 2,
  },
  relatedPosterTitleContainer: {
    position: 'absolute',
    bottom: moderateScale(4), // Compact
    left: moderateScale(4),
    right: moderateScale(4),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: moderateScale(6), // Compact
    paddingVertical: moderateScale(3), // Compact
    borderRadius: moderateScale(6), // Compact
  },
  relatedPosterTitle: {
    color: '#ffffff',
    fontSize: moderateScale(9), // Compact
    fontWeight: '600',
    textAlign: 'center',
  },
  relatedPosterLanguageBadge: {
    position: 'absolute',
    top: moderateScale(4), // Compact
    right: moderateScale(4),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: moderateScale(4), // Compact
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(6),
  },
  relatedPosterLanguageText: {
    color: '#ffffff',
    fontSize: moderateScale(6), // Compact
    fontWeight: '600',
  },
  noPostersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(16), // Compact
    minHeight: moderateScale(80), // Compact
  },
  noPostersText: {
    fontSize: moderateScale(12), // Compact
    color: 'rgba(51,51,51,0.8)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: moderateScale(4),
    marginBottom: moderateScale(4),
  },
  noPostersSubtext: {
    fontSize: moderateScale(10), // Compact
    color: 'rgba(102,102,102,0.8)',
    textAlign: 'center',
  },
  languageSection: {
    paddingHorizontal: moderateScale(8), // Compact
    paddingVertical: moderateScale(6), // Compact
  },
  languageSectionHeader: {
    marginBottom: moderateScale(4),
  },
  languageTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 0,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  languageSubtitle: {
    fontSize: moderateScale(9),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  languageButtonsContainer: {
    paddingHorizontal: moderateScale(4), // Compact
    gap: moderateScale(6), // Compact
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(4),
  },
  languageButton: {
    paddingVertical: moderateScale(4), // More compact
    paddingHorizontal: moderateScale(8), // More compact
    borderRadius: moderateScale(10), // Smaller
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderWidth: moderateScale(1), // Thinner
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1), // Smaller
    },
    shadowOpacity: 0.12, // Reduced
    shadowRadius: moderateScale(3), // Smaller
    elevation: 2, // Reduced
    marginHorizontal: moderateScale(2),
    minWidth: moderateScale(65), // Smaller minimum width
  },
  languageButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(4),
    elevation: 3,
    transform: [{ scale: 1.01 }],
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4), // Compact
  },
  languageButtonText: {
    fontSize: moderateScale(9), // Smaller
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.2,
  },
  languageButtonTextSelected: {
    fontWeight: '700',
  },
});

export default PosterPlayerScreen;
