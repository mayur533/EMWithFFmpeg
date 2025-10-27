import React, { useState, useCallback, useMemo } from 'react';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive design helpers
const isUltraSmallScreen = screenWidth < 360;
const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414 && screenWidth < 768;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;

// Responsive spacing and sizing
const responsiveSpacing = {
  xs: isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isTablet ? 16 : 12,
  sm: isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 12 : isTablet ? 20 : 16,
  md: isUltraSmallScreen ? 8 : isSmallScreen ? 12 : isMediumScreen ? 16 : isTablet ? 24 : 20,
  lg: isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isMediumScreen ? 20 : isTablet ? 32 : 24,
  xl: isUltraSmallScreen ? 16 : isSmallScreen ? 20 : isMediumScreen ? 24 : isTablet ? 40 : 32,
  xxl: isUltraSmallScreen ? 20 : isSmallScreen ? 24 : isMediumScreen ? 32 : isTablet ? 48 : 40,
};

const responsiveFontSize = {
  xs: isUltraSmallScreen ? 8 : isSmallScreen ? 9 : isMediumScreen ? 10 : isTablet ? 14 : 12,
  sm: isUltraSmallScreen ? 10 : isSmallScreen ? 11 : isMediumScreen ? 12 : isTablet ? 16 : 14,
  md: isUltraSmallScreen ? 12 : isSmallScreen ? 13 : isMediumScreen ? 14 : isTablet ? 18 : 16,
  lg: isUltraSmallScreen ? 14 : isSmallScreen ? 15 : isMediumScreen ? 16 : isTablet ? 20 : 18,
  xl: isUltraSmallScreen ? 16 : isSmallScreen ? 17 : isMediumScreen ? 18 : isTablet ? 24 : 20,
  xxl: isUltraSmallScreen ? 18 : isSmallScreen ? 19 : isMediumScreen ? 20 : isTablet ? 26 : 22,
  xxxl: isUltraSmallScreen ? 20 : isSmallScreen ? 21 : isMediumScreen ? 22 : isTablet ? 28 : 24,
};

// Responsive poster container height
const getPosterContainerHeight = () => {
  if (isTablet && isLandscape) return screenHeight * 0.5;
  if (isTablet) return screenHeight * 0.4;
  if (isLandscape) return screenHeight * 0.45;
  if (isUltraSmallScreen) return screenHeight * 0.22;
  if (isSmallScreen) return screenHeight * 0.25;
  if (isMediumScreen) return screenHeight * 0.28;
  return screenHeight * 0.3;
};

// Get number of columns for related posters grid
const getGridColumns = () => {
  if (isTablet) return 3;
  return 2;
};

// Get responsive card width
const getCardWidth = () => {
  const columns = getGridColumns();
  const totalHorizontalPadding = responsiveSpacing.md * 2; // Left and right padding
  const cardMargin = isUltraSmallScreen ? responsiveSpacing.sm : isTablet ? responsiveSpacing.lg : responsiveSpacing.md;
  const totalMargins = columns * cardMargin; // Right margin for each card
  return (screenWidth - totalHorizontalPadding - totalMargins) / columns;
};

type PosterPlayerScreenRouteProp = RouteProp<MainStackParamList, 'PosterPlayer'>;
type PosterPlayerScreenNavigationProp = StackNavigationProp<MainStackParamList, 'PosterPlayer'>;

const PosterPlayerScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<PosterPlayerScreenNavigationProp>();
  const route = useRoute<PosterPlayerScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
  const { selectedPoster, relatedPosters } = route.params;
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');

  // Language options
  const languages = useMemo(() => [
    { id: 'english', name: 'English', code: 'EN' },
    { id: 'marathi', name: 'Marathi', code: 'MR' },
    { id: 'hindi', name: 'Hindi', code: 'HI' },
  ], []);

  // Filter posters by selected language
  const filteredPosters = useMemo(() => {
    return relatedPosters.filter(poster => {
      // If poster doesn't have languages property, show it for all languages
      if (!poster.languages || poster.languages.length === 0) {
        return true;
      }
      // Otherwise, filter based on poster's supported languages
      return poster.languages.includes(selectedLanguage);
    });
  }, [relatedPosters, selectedLanguage]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePosterSelect = useCallback((poster: Template) => {
    navigation.replace('PosterPlayer', {
      selectedPoster: poster,
      relatedPosters: relatedPosters.filter(p => p.id !== poster.id),
    });
  }, [navigation, relatedPosters]);

  const handleLanguageChange = useCallback((languageId: string) => {
    setSelectedLanguage(languageId);
  }, []);

  const handleNextPress = useCallback(() => {
    navigation.navigate('PosterEditor', {
      selectedImage: {
        uri: selectedPoster.thumbnail,
        title: selectedPoster.name,
        description: selectedPoster.category,
      },
      selectedLanguage: selectedLanguage,
      selectedTemplateId: selectedPoster.id,
    });
  }, [navigation, selectedPoster, selectedLanguage]);

  const renderRelatedPoster = useCallback(({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.relatedPosterCard}
      onPress={() => handlePosterSelect(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.relatedPosterImage}
        resizeMode="cover"
      />
      
      
      <View style={styles.relatedPosterLanguageBadge}>
        <Text style={styles.relatedPosterLanguageText}>
          {languages.find(lang => lang.id === selectedLanguage)?.code || 'EN'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handlePosterSelect, selectedLanguage, languages]);

  const renderLanguageButton = useCallback((language: typeof languages[0]) => (
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
          <Icon name="check-circle" size={isUltraSmallScreen ? 12 : isSmallScreen ? 14 : isTablet ? 20 : 16} color="#ffffff" />
        )}
      </View>
    </TouchableOpacity>
  ), [selectedLanguage, handleLanguageChange]);

     return (
     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
       <StatusBar 
         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
         <View style={{ height: insets.top }} />
         
         {/* Enhanced Header */}
         <View style={styles.header}>
           <TouchableOpacity
             style={styles.backButton}
             onPress={handleBackPress}
             activeOpacity={0.7}
           >
             <Icon name="arrow-back" size={isUltraSmallScreen ? 18 : isSmallScreen ? 20 : isTablet ? 28 : 24} color="#ffffff" />
           </TouchableOpacity>
           <View style={styles.headerContent}>
             <Text style={styles.headerTitle}>{selectedPoster.name}</Text>
             <Text style={styles.headerSubtitle}>{selectedPoster.category}</Text>
             <View style={styles.headerMeta}>
               <View style={styles.headerMetaItem}>
                 <Icon name="high-quality" size={isUltraSmallScreen ? 11 : isSmallScreen ? 12 : isTablet ? 16 : 14} color="rgba(255,255,255,0.7)" />
                 <Text style={styles.headerMetaText}>High Resolution</Text>
               </View>
               <View style={styles.headerMetaItem}>
                 <Icon name="format-paint" size={isUltraSmallScreen ? 11 : isSmallScreen ? 12 : isTablet ? 16 : 14} color="rgba(255,255,255,0.7)" />
                 <Text style={styles.headerMetaText}>Customizable</Text>
               </View>
             </View>
           </View>
         </View>

         {/* Enhanced Poster Section */}
         <View style={styles.posterContainer}>
           <Image
             source={{ uri: selectedPoster.thumbnail }}
             style={styles.posterImage}
             resizeMode="contain"
           />
                        <View style={styles.posterOverlay}>
               <View style={styles.languageBadge}>
                 <Text style={styles.languageBadgeText}>
                   {selectedLanguage.toUpperCase()}
                 </Text>
               </View>
             </View>
         </View>

         {/* Enhanced Language Selection Section */}
         <View style={styles.languageSection}>
           <View style={styles.languageSectionHeader}>
             <Text style={styles.languageTitle}>
               Select Language
             </Text>
             <Text style={styles.languageSubtitle}>
               Select language variant for poster content
             </Text>
           </View>

           <ScrollView 
             horizontal 
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.languageButtonsContainer}
           >
             {languages.map(renderLanguageButton)}
           </ScrollView>
         </View>

         {/* Next Button Section */}
         <View style={styles.nextButtonSection}>
           <TouchableOpacity
             style={styles.nextButton}
             onPress={handleNextPress}
             activeOpacity={0.8}
           >
             <View style={styles.nextButtonContent}>
               <Text style={styles.nextButtonText}>Continue to Editor</Text>
               <Icon name="arrow-forward" size={isUltraSmallScreen ? 16 : isSmallScreen ? 18 : isTablet ? 24 : 20} color="#ffffff" />
             </View>
           </TouchableOpacity>
         </View>

         {/* Enhanced Related Posters Section - Using FlatList as main scrollable container */}
         <View style={styles.relatedSection}>
           <View style={styles.relatedHeader}>
             <View style={styles.relatedHeaderLeft}>
               <Text style={styles.relatedTitle}>
                 Related Templates
               </Text>
               <Text style={styles.relatedSubtitle}>
                 In {languages.find(lang => lang.id === selectedLanguage)?.name}
               </Text>
             </View>
             <View style={styles.relatedCountBadge}>
               <Text style={styles.relatedCountText}>
                 {filteredPosters.length} ITEMS
               </Text>
             </View>
           </View>
           
           {filteredPosters.length > 0 ? (
             <FlatList
               data={filteredPosters}
               renderItem={renderRelatedPoster}
               keyExtractor={(item) => item.id}
               numColumns={getGridColumns()}
               key={getGridColumns()} // Force re-render when columns change
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: responsiveSpacing.md,
    paddingTop: responsiveSpacing.xs,
    paddingBottom: responsiveSpacing.sm,
  },
  backButton: {
    width: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isTablet ? 52 : 44,
    height: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isTablet ? 52 : 44,
    borderRadius: isUltraSmallScreen ? 18 : isSmallScreen ? 20 : isTablet ? 26 : 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFontSize.xl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
    letterSpacing: 0.5,
    lineHeight: responsiveFontSize.xl * 1.2,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: responsiveSpacing.md,
  },
  headerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerMetaText: {
    fontSize: responsiveFontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  posterContainer: {
    position: 'relative',
    height: getPosterContainerHeight(),
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: responsiveSpacing.md,
    marginBottom: responsiveSpacing.sm,
    borderRadius: isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isTablet ? 24 : 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isTablet ? 12 : 8,
    },
    shadowOpacity: isTablet ? 0.4 : 0.3,
    shadowRadius: isTablet ? 20 : 16,
    elevation: isTablet ? 16 : 12,
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
    top: responsiveSpacing.md,
    left: responsiveSpacing.md,
  },
  zoomButton: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    borderRadius: isSmallScreen ? 20 : 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  languageBadge: {
    position: 'absolute',
    top: responsiveSpacing.md,
    right: responsiveSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: isUltraSmallScreen ? 4 : isTablet ? 8 : 6,
    borderRadius: isUltraSmallScreen ? 16 : isTablet ? 24 : 20,
    borderWidth: isTablet ? 2 : 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageBadgeText: {
    color: '#ffffff',
    fontSize: responsiveFontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  relatedSection: {
    flex: 1,
    paddingHorizontal: responsiveSpacing.md,
    paddingTop: responsiveSpacing.xs,
    paddingBottom: 0,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isUltraSmallScreen ? responsiveSpacing.xs : isTablet ? responsiveSpacing.sm : responsiveSpacing.sm,
  },
  relatedHeaderLeft: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: responsiveFontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  relatedSubtitle: {
    fontSize: responsiveFontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  relatedCountBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: isUltraSmallScreen ? 4 : isTablet ? 8 : 6,
    borderRadius: isUltraSmallScreen ? 12 : isTablet ? 20 : 16,
  },
  relatedCountText: {
    color: '#ffffff',
    fontSize: responsiveFontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  relatedList: {
    paddingBottom: isTablet ? responsiveSpacing.xl + 20 : responsiveSpacing.lg + 30,
    paddingTop: responsiveSpacing.xs,
  },
  relatedFlatList: {
    flex: 1,
  },
  relatedGrid: {
    justifyContent: 'flex-start',
  },
  relatedPosterCard: {
    width: getCardWidth(),
    height: isTablet 
      ? screenHeight * 0.18  // Same as HomeScreen - Taller on tablet
      : isLandscape 
        ? screenHeight * 0.20  // Same as HomeScreen - Taller in landscape
        : screenHeight * 0.15, // Same as HomeScreen - Default height on phone
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: isUltraSmallScreen ? 12 : isSmallScreen ? 14 : isTablet ? 20 : 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isTablet ? 6 : 4,
    },
    shadowOpacity: isTablet ? 0.2 : 0.15,
    shadowRadius: isTablet ? 10 : 8,
    elevation: isTablet ? 8 : 6,
    borderWidth: isTablet ? 2 : 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: isUltraSmallScreen ? responsiveSpacing.sm : isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
    marginRight: isUltraSmallScreen ? responsiveSpacing.sm : isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
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
    width: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isTablet ? 56 : 48,
    height: isUltraSmallScreen ? 36 : isSmallScreen ? 40 : isTablet ? 56 : 48,
    borderRadius: isUltraSmallScreen ? 18 : isSmallScreen ? 20 : isTablet ? 28 : 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isTablet ? 3 : 2,
    },
    shadowOpacity: isTablet ? 0.25 : 0.2,
    shadowRadius: isTablet ? 6 : 4,
    elevation: isTablet ? 4 : 3,
  },
  relatedPosterTitleContainer: {
    position: 'absolute',
    bottom: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    left: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    right: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    paddingVertical: isUltraSmallScreen ? 4 : isTablet ? 8 : 6,
    borderRadius: isUltraSmallScreen ? 8 : isTablet ? 12 : 10,
  },
  relatedPosterTitle: {
    color: '#ffffff',
    fontSize: responsiveFontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  relatedPosterLanguageBadge: {
    position: 'absolute',
    top: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    right: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: isUltraSmallScreen ? 4 : isTablet ? 10 : 6,
    paddingVertical: isUltraSmallScreen ? 2 : isTablet ? 4 : 2,
    borderRadius: isUltraSmallScreen ? 6 : isTablet ? 10 : 8,
  },
  relatedPosterLanguageText: {
    color: '#ffffff',
    fontSize: responsiveFontSize.xs - 2,
    fontWeight: '600',
  },
  noPostersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
    minHeight: isUltraSmallScreen ? 100 : isTablet ? 150 : 120,
  },
  noPostersText: {
    fontSize: responsiveFontSize.md,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.xs,
  },
  noPostersSubtext: {
    fontSize: responsiveFontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  languageSection: {
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: isUltraSmallScreen ? responsiveSpacing.xs : isTablet ? responsiveSpacing.md : responsiveSpacing.sm,
  },
  languageSectionHeader: {
    marginBottom: responsiveSpacing.xs,
  },
  languageTitle: {
    fontSize: responsiveFontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  languageSubtitle: {
    fontSize: responsiveFontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  languageButtonsContainer: {
    paddingHorizontal: responsiveSpacing.sm,
    gap: isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isTablet ? 12 : 10,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing.sm,
  },
  languageButton: {
    paddingVertical: isUltraSmallScreen ? 8 : isSmallScreen ? 10 : isTablet ? 16 : 12,
    paddingHorizontal: isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isTablet ? 24 : 20,
    borderRadius: isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isTablet ? 22 : 18,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: isTablet ? 4 : isUltraSmallScreen ? 2 : 3,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isTablet ? 6 : 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: isTablet ? 10 : 8,
    elevation: isTablet ? 10 : 8,
    marginHorizontal: isUltraSmallScreen ? 4 : responsiveSpacing.xs,
    flex: 1, // Make buttons take equal width
    maxWidth: isTablet ? 200 : 140,
  },
  languageButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowOpacity: isTablet ? 0.3 : 0.2,
    shadowRadius: isTablet ? 8 : 6,
    elevation: isTablet ? 6 : 4,
    transform: [{ scale: isTablet ? 1.02 : 1.01 }],
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isUltraSmallScreen ? 4 : isTablet ? 10 : 6,
  },
  languageButtonText: {
    fontSize: responsiveFontSize.md,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  languageButtonTextSelected: {
    fontWeight: '700',
  },
  nextButtonSection: {
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm,
    paddingBottom: isUltraSmallScreen ? responsiveSpacing.md : isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
  },
  nextButton: {
    backgroundColor: '#667eea',
    borderRadius: isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isTablet ? 24 : 20,
    paddingVertical: isUltraSmallScreen ? 12 : isSmallScreen ? 14 : isTablet ? 20 : 16,
    paddingHorizontal: isUltraSmallScreen ? 16 : isSmallScreen ? 20 : isTablet ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isTablet ? 8 : 6,
    },
    shadowOpacity: isTablet ? 0.5 : 0.4,
    shadowRadius: isTablet ? 16 : 12,
    elevation: isTablet ? 16 : 12,
    minHeight: isUltraSmallScreen ? 52 : isSmallScreen ? 56 : isTablet ? 72 : 60,
    borderWidth: isTablet ? 4 : isUltraSmallScreen ? 2 : 3,
    borderColor: '#5a67d8',
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isUltraSmallScreen ? 6 : isTablet ? 12 : 8,
  },
  nextButtonText: {
    fontSize: responsiveFontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default PosterPlayerScreen;
