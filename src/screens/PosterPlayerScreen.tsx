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
  const [languageMenuVisible, setLanguageMenuVisible] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Console log initial data on screen mount
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📺 [POSTER PLAYER SCREEN] INITIAL DATA LOADED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 Selected Poster:', JSON.stringify(initialPoster, null, 2));
    console.log('📚 Related Posters Count:', initialRelatedPosters.length);
    console.log('📚 Related Posters:', JSON.stringify(initialRelatedPosters, null, 2));
    console.log('═══════════════════════════════════════════════════════');
  }, []);

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
    const filtered = currentRelatedPosters.filter(poster => {
      // If poster doesn't have languages property, show it for all languages
      if (!poster.languages || poster.languages.length === 0) {
        return true;
      }
      // Otherwise, filter based on poster's supported languages
      return poster.languages.includes(selectedLanguage);
    });
    
    console.log('🔍 [POSTER PLAYER] FILTERED POSTERS');
    console.log('🌐 Selected Language:', selectedLanguage);
    console.log('📊 Total Related Posters:', currentRelatedPosters.length);
    console.log('📊 Filtered Posters Count:', filtered.length);
    console.log('📊 Filtered Poster IDs:', filtered.map(p => ({ id: p.id, name: p.name })));
    
    return filtered;
  }, [currentRelatedPosters, selectedLanguage]);

  const handlePosterSelect = useCallback((poster: Template) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🖱️ [POSTER PLAYER] POSTER CLICKED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📌 Clicked Poster:', JSON.stringify(poster, null, 2));
    console.log('📌 Poster ID:', poster.id);
    console.log('📌 Poster Name:', poster.name);
    console.log('📌 Poster Thumbnail:', poster.thumbnail);
    console.log('🔗 Endpoint (download):', `/api/mobile/home/templates/${poster.id}/download`);
    console.log('📌 Previous Current Poster:', JSON.stringify(currentPoster, null, 2));
    
    // Update state instead of navigating to prevent full page refresh
    setCurrentPoster(poster);
    // Update related posters to exclude the newly selected one and include the previous one
    setCurrentRelatedPosters(prev => {
      const withoutNew = prev.filter(p => p.id !== poster.id);
      const updatedPosters = [currentPoster, ...withoutNew];
      console.log('📚 Updated Related Posters Count:', updatedPosters.length);
      console.log('═══════════════════════════════════════════════════════');
      return updatedPosters;
    });
  }, [currentPoster]);

  const handleLanguageChange = useCallback((languageId: string) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🌐 [POSTER PLAYER] LANGUAGE CHANGED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🌐 Previous Language:', selectedLanguage);
    console.log('🌐 New Language:', languageId);
    console.log('═══════════════════════════════════════════════════════');
    setSelectedLanguage(languageId);
  }, [selectedLanguage]);

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
      return screenHeight * 0.30; // Tablet (reduced)
    } else if (screenWidth >= 600) {
      return screenHeight * 0.26; // Large phone (reduced)
    } else if (screenWidth >= 400) {
      return screenHeight * 0.24; // Medium phone (reduced)
    } else {
      return screenHeight * 0.20; // Small phone (reduced)
    }
  }, [screenWidth, screenHeight]);

  // Derive height from image aspect ratio to fit width without stretching
  const computedPreviewHeight = useMemo(() => {
    if (imageDimensions && imageDimensions.width > 0 && imageDimensions.height > 0) {
      const aspectHeight = screenWidth * (imageDimensions.height / imageDimensions.width);
      return aspectHeight; // exact fit by aspect ratio
    }
    return posterHeight;
  }, [imageDimensions, screenWidth, posterHeight]);

  // Load intrinsic image size when poster changes
  useEffect(() => {
    const uri = currentPoster?.thumbnail;
    if (!uri) {
      setImageDimensions(null);
      return;
    }
    Image.getSize(
      uri,
      (width, height) => setImageDimensions({ width, height }),
      () => setImageDimensions(null)
    );
  }, [currentPoster?.thumbnail]);

  const handleNextPress = useCallback(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('➡️ [POSTER PLAYER] NEXT BUTTON CLICKED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 Navigation to PosterEditor with params:');
    console.log('🖼️ Selected Image URI:', currentPoster.thumbnail);
    console.log('📝 Title:', currentPoster.name);
    console.log('📋 Description:', currentPoster.category);
    console.log('🌐 Selected Language:', selectedLanguage);
    console.log('🆔 Template ID:', currentPoster.id);
    console.log('🔗 Endpoint (download):', `/api/mobile/home/templates/${currentPoster.id}/download`);
    console.log('📦 Full Poster Data:', JSON.stringify(currentPoster, null, 2));
    console.log('═══════════════════════════════════════════════════════');
    
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

        {/* Header with Back, Language Dropdown, Next */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={getIconSize(14)} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLanguageMenuVisible(v => !v)}
            style={styles.languageDropdownButton}
            activeOpacity={0.8}
          >
            <Text style={styles.languageDropdownText}>
              {languages.find(l => l.id === selectedLanguage)?.name || 'Select Language'}
            </Text>
            <Icon name={languageMenuVisible ? 'expand-less' : 'expand-more'} size={getIconSize(14)} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPress}
            style={styles.headerIconButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-forward" size={getIconSize(14)} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Dropdown will render over the preview instead of full-width */}

         {/* Compact Poster Section */}
         <View style={[styles.posterContainer, { height: computedPreviewHeight, width: '100%' }]}>
         <OptimizedImage
           uri={currentPoster.thumbnail}
           style={styles.posterImage}
           resizeMode="contain"
           showLoader={false}
         />
         <View style={styles.posterOverlay}>
           {languageMenuVisible && (
             <View style={styles.languageDropdownMenuSmall}>
               {languages.map((lang) => (
                 <TouchableOpacity
                   key={lang.id}
                   style={[styles.languageDropdownItem, selectedLanguage === lang.id && styles.languageDropdownItemSelected]}
                   onPress={() => {
                     handleLanguageChange(lang.id);
                     setLanguageMenuVisible(false);
                   }}
                   activeOpacity={0.8}
                 >
                   <Text style={[styles.languageDropdownItemText, selectedLanguage === lang.id && styles.languageDropdownItemTextSelected]}>
                     {lang.name}
                   </Text>
                   {selectedLanguage === lang.id && (
                     <Icon name="check" size={getIconSize(12)} color="#ffffff" />
                   )}
                 </TouchableOpacity>
               ))}
             </View>
           )}
         </View>
         </View>

         {/* Language selection moved to header */}

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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(8),
    paddingBottom: moderateScale(6),
  },
  headerIconButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLanguageScroll: {
    paddingHorizontal: moderateScale(6),
    alignItems: 'center',
    gap: moderateScale(6),
  },
  languageDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  languageDropdownText: {
    color: '#000000',
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  languageDropdownMenu: {
    marginHorizontal: moderateScale(8),
    marginBottom: moderateScale(6),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: moderateScale(4),
    overflow: 'hidden',
  },
  languageDropdownMenuSmall: {
    position: 'absolute',
    top: moderateScale(8),
    alignSelf: 'center',
    minWidth: moderateScale(140),
    maxWidth: '80%',
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  languageDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
  },
  languageDropdownItemSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.35)',
  },
  languageDropdownItemText: {
    color: '#ffffff',
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  languageDropdownItemTextSelected: {
    fontWeight: '700',
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
  nextButton: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(3),
    elevation: 4,
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: moderateScale(6), // Reduced margin
    borderRadius: 0,
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
    backgroundColor: 'transparent',
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
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
    includeFontPadding: false,
    textDecorationLine: 'none',
    textAlignVertical: 'center',
  },
  languageButtonTextSelected: {
    fontWeight: '700',
  },
});

export default PosterPlayerScreen;
