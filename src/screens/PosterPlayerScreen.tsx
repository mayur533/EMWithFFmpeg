import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  english: ['english', 'en'],
  marathi: ['marathi', 'mr'],
  hindi: ['hindi', 'hi'],
};

const extractLanguagesFromTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const normalizedTags = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.toLowerCase());

  const matchedLanguages = Object.entries(LANGUAGE_KEYWORDS).reduce<string[]>((acc, [language, keywords]) => {
    if (keywords.some(keyword => normalizedTags.some(tag => tag.includes(keyword)))) {
      acc.push(language);
    }
    return acc;
  }, []);

  return Array.from(new Set(matchedLanguages));
};

const mergeTemplateLanguages = (template: Template): Template => {
  const existingLanguages = Array.isArray(template.languages)
    ? template.languages
        .filter((language): language is string => typeof language === 'string' && language.trim().length > 0)
        .map(language => language.toLowerCase())
    : [];

  const tags = Array.isArray(template.tags) ? template.tags : [];
  const languagesFromTags = extractLanguagesFromTags(tags);
  const mergedLanguages = Array.from(new Set([...existingLanguages, ...languagesFromTags]));

  return {
    ...template,
    languages: mergedLanguages,
  };
};

const templateContainsLanguage = (template: Template, languageId: string): boolean => {
  if (!languageId) {
    return true;
  }

  const normalizedLanguage = languageId.toLowerCase();
  const templateLanguages = Array.isArray(template.languages)
    ? template.languages.map(language => language.toLowerCase())
    : [];

  // Extract tags once so we can reuse them
  const tags = Array.isArray(template.tags) ? template.tags : [];

  // Check if template explicitly matches the language in languages array
  if (templateLanguages.length > 0 && templateLanguages.includes(normalizedLanguage)) {
    return true;
  }

  // Check if template matches the language via tags
  if (tags.length > 0) {
    const normalizedTags = tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map(tag => tag.toLowerCase());
    const keywords = LANGUAGE_KEYWORDS[normalizedLanguage] || [normalizedLanguage];
    if (keywords.some(keyword => normalizedTags.some(tag => tag.includes(keyword)))) {
      return true;
    }
  }

  // Only treat as language-agnostic if no language info exists AND we're on default language (English)
  // This prevents templates without language info from showing for all languages
  if (templateLanguages.length === 0 && tags.length === 0) {
    // Show only for English (default language) if template has no language info
    return normalizedLanguage === 'english';
  }

  return false;
};

type PosterPlayerScreenRouteProp = RouteProp<MainStackParamList, 'PosterPlayer'>;
type PosterPlayerScreenNavigationProp = StackNavigationProp<MainStackParamList, 'PosterPlayer'>;

const PosterPlayerScreen: React.FC = () => {
  const { theme } = useTheme();
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
  
  const { 
    selectedPoster: initialPoster, 
    relatedPosters: initialRelatedPosters,
  } = route.params;
  const [currentPoster, setCurrentPoster] = useState<Template>(initialPoster);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [languageMenuVisible, setLanguageMenuVisible] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | null>(null);
  const preloadedImagesRef = useRef<Set<string>>(new Set());

  // Get high quality image URL for preview (replace thumbnail params with high quality)
  const getHighQualityImageUrl = (poster: Template): string => {
    // Check if poster has a previewUrl property (cast to any to access)
    const previewUrl = (poster as any).previewUrl;
    if (previewUrl) {
      return previewUrl;
    }
    
    // Check for content.background (used in greeting templates for full quality image)
    const contentBackground = (poster as any).content?.background;
    if (contentBackground) {
      return contentBackground;
    }
    
    // Otherwise, enhance the thumbnail URL for higher quality
    let url = poster.thumbnail;
    
    if (!url) {
      console.warn('⚠️ No thumbnail URL found for poster:', poster.id);
      return '';
    }
    
    // If URL already contains 'thumbnailUrl' or 'thumbnail' in path, try to get full URL
    // by replacing /thumbnailUrl/ or /thumbnail/ with /url/ or removing it
    if (url.includes('/thumbnailUrl/') || url.includes('/thumbnail/')) {
      const fullUrl = url.replace(/\/thumbnailUrl\//g, '/url/').replace(/\/thumbnail\//g, '/images/');
      url = fullUrl;
    }
    
    // Remove any existing quality/size parameters
    url = url.replace(/[?&](quality|width|height|w|h|size)=[^&]*/gi, '');
    
    // Add high quality parameters
    const separator = url.includes('?') ? '&' : '?';
    const highQualityUrl = `${url}${separator}quality=high&width=2400`;
    return highQualityUrl;
  };

  // Preload images for better scrolling performance
  const preloadImages = useCallback((posters: Template[], startIndex: number = 0, count: number = 20) => {
    const imagesToPreload = posters.slice(startIndex, startIndex + count);
    imagesToPreload.forEach(poster => {
      const imageUrl = poster.thumbnail || (poster as any).previewUrl || (poster as any).content?.background;
      if (imageUrl && !preloadedImagesRef.current.has(imageUrl)) {
        preloadedImagesRef.current.add(imageUrl);
        Image.prefetch(imageUrl).catch(() => {
          // Silently fail if prefetch fails
        });
      }
    });
  }, []);

  // Preload images when filteredPosters change
  useEffect(() => {
    if (filteredPosters.length > 0) {
      // Preload first batch immediately
      preloadImages(filteredPosters, 0, 20);
      
      // Preload next batch after a short delay
      const timeoutId = setTimeout(() => {
        preloadImages(filteredPosters, 20, 20);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filteredPosters, preloadImages]);

  // Handle viewable items change for progressive image loading
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const lastVisibleIndex = Math.max(...viewableItems.map((item: any) => item.index));
      // Preload next 20 items when user scrolls near the end
      if (lastVisibleIndex >= filteredPosters.length - 10) {
        const nextBatchStart = Math.min(lastVisibleIndex + 1, filteredPosters.length);
        preloadImages(filteredPosters, nextBatchStart, 20);
      }
    }
  }, [filteredPosters, preloadImages]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  });

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear preloaded images ref
      preloadedImagesRef.current.clear();
      // Clear image cache if available
      if (Image.clearMemoryCache) {
        Image.clearMemoryCache();
      }
    };
  }, []);

  // Watch for route param changes and update currentPoster when real data arrives
  useEffect(() => {
    // Skip if we have a loading placeholder
    if (initialPoster.id === 'loading' || !initialPoster.thumbnail) {
      return;
    }

    // If currentPoster is still the loading placeholder, update it
    if (currentPoster.id === 'loading' || !currentPoster.thumbnail) {
      const newPoster = mergeTemplateLanguages(initialPoster);
      if (newPoster.thumbnail) {
        console.log('🔄 [POSTER PLAYER] Updating currentPoster with loaded data:', newPoster.id);
        setCurrentPoster(newPoster);
      }
    }
  }, [initialPoster, currentPoster]);

  // Sync state when route params change
  useEffect(() => {
    const ensureLanguages = (template: Template): Template => mergeTemplateLanguages(template);

    // Skip if we have a loading placeholder
    if (initialPoster.id === 'loading') {
      return;
    }

    const templatesToMerge = initialRelatedPosters.find(p => p.id === initialPoster.id)
      ? initialRelatedPosters
      : [initialPoster, ...initialRelatedPosters];

    const templatesWithLanguages = templatesToMerge.map(ensureLanguages);
    const templatesMap = new Map<string, Template>();

    templatesWithLanguages.forEach(template => {
      templatesMap.set(template.id, template);
    });

    // Always include the initial poster (ensuring languages too)
    const ensuredInitialPoster = ensureLanguages(initialPoster);
    templatesMap.set(initialPoster.id, ensuredInitialPoster);

    const updatedTemplates = Array.from(templatesMap.values());
    setAllTemplates(updatedTemplates);

    // Update currentPoster when new data arrives (when initialPoster changes from loading to real data)
    // Check if currentPoster is still the loading placeholder or has no thumbnail
    setCurrentPoster(prevPoster => {
      if (prevPoster.id === 'loading' || !prevPoster.thumbnail) {
        // If we have a valid poster with thumbnail, use it
        if (ensuredInitialPoster.thumbnail) {
          return ensuredInitialPoster;
        }
      }
      // Otherwise, try to find the current poster in the updated templates
      const foundPoster = updatedTemplates.find(t => t.id === prevPoster.id);
      return foundPoster || ensuredInitialPoster;
    });
  }, [initialPoster, initialRelatedPosters, selectedLanguage]);

  // Detect language from initial poster on mount
  useEffect(() => {
    const initialPosterWithLanguages = mergeTemplateLanguages(initialPoster);
    
    // Detect the primary language from the initial poster
    const posterLanguages = Array.isArray(initialPosterWithLanguages.languages)
      ? initialPosterWithLanguages.languages.map((lang: string) => lang.toLowerCase())
      : [];
    
    const posterTags = Array.isArray(initialPosterWithLanguages.tags) ? initialPosterWithLanguages.tags : [];
    const languagesFromTags = extractLanguagesFromTags(posterTags);
    const allPosterLanguages = Array.from(new Set([...posterLanguages, ...languagesFromTags.map(l => l.toLowerCase())]));
    
    // Available language IDs that we support
    const availableLanguageIds = ['english', 'marathi', 'hindi'];
    
    // Find the first matching language from available languages
    const detectedLanguage = availableLanguageIds.find(langId => {
      const normalizedLangId = langId.toLowerCase();
      // Check if the poster's languages include this language
      if (allPosterLanguages.includes(normalizedLangId)) {
        return true;
      }
      // Check if tags contain keywords for this language
      const keywords = LANGUAGE_KEYWORDS[normalizedLangId] || [normalizedLangId];
      return keywords.some(keyword => 
        allPosterLanguages.some(posterLang => posterLang.includes(keyword)) ||
        posterTags.some((tag: unknown) => 
          typeof tag === 'string' && tag.toLowerCase().includes(keyword)
        )
      );
    });
    
    // If a language is detected, switch to it
    if (detectedLanguage) {
      setSelectedLanguage(detectedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPoster?.id]); // Run when initial poster changes

  // Ensure poster selection respects the active language filter
  useEffect(() => {
    if (!allTemplates.length) {
      return;
    }

    setCurrentPoster(previousPoster => {
      const resolvedPrevious = previousPoster
        ? allTemplates.find(template => template.id === previousPoster.id) || previousPoster
        : null;

      if (resolvedPrevious && templateContainsLanguage(resolvedPrevious, selectedLanguage)) {
        return resolvedPrevious;
      }

      const firstMatchingTemplate = allTemplates.find(template =>
        templateContainsLanguage(template, selectedLanguage),
      );

      if (firstMatchingTemplate) {
        return firstMatchingTemplate;
      }

      return resolvedPrevious || allTemplates[0];
    });
  }, [allTemplates, selectedLanguage]);

  // Language options
  const languages = useMemo(() => [
    { id: 'english', name: 'English', code: 'EN' },
    { id: 'marathi', name: 'Marathi', code: 'MR' },
    { id: 'hindi', name: 'Hindi', code: 'HI' },
  ], []);

  // Display ALL posters (filtered by language)
  const serviceFilterKeywords: Record<string, string[]> = useMemo(() => ({
    generator: ['generator'],
    decorators: ['decor', 'decorator', 'stage'],
    sound: ['sound', 'audio', 'dj'],
    mandap: ['mandap']
  }), []);

  const isEventPlannerCategory = useMemo(() => {
    const category = (currentPoster?.category || initialPoster?.category || '').trim().toLowerCase();
    if (!category) return false;
    return category.includes('event planner');
  }, [currentPoster, initialPoster]);

  useEffect(() => {
    if (!isEventPlannerCategory && selectedServiceFilter) {
      setSelectedServiceFilter(null);
    }
  }, [isEventPlannerCategory, selectedServiceFilter]);

  const templateMatchesServiceFilter = useCallback((template: Template) => {
    if (!isEventPlannerCategory || !selectedServiceFilter) return true;
    const keywords = serviceFilterKeywords[selectedServiceFilter] || [];
    const templateTags = Array.isArray(template.tags)
      ? template.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map(tag => tag.toLowerCase())
      : [];
    return keywords.some(keyword => templateTags.some(tag => tag.includes(keyword)));
  }, [isEventPlannerCategory, selectedServiceFilter, serviceFilterKeywords]);

  const filteredPosters = useMemo(() => {
    return allTemplates
      .filter(template => templateContainsLanguage(template, selectedLanguage))
      .filter(templateMatchesServiceFilter);
  }, [allTemplates, selectedLanguage, templateMatchesServiceFilter]);

  const handlePosterSelect = useCallback((poster: Template) => {
    // Merge template languages to ensure we have all language info
    const posterWithLanguages = mergeTemplateLanguages(poster);
    
    // Detect the primary language from the poster
    const posterLanguages = Array.isArray(posterWithLanguages.languages)
      ? posterWithLanguages.languages.map((lang: string) => lang.toLowerCase())
      : [];
    
    const posterTags = Array.isArray(posterWithLanguages.tags) ? posterWithLanguages.tags : [];
    const languagesFromTags = extractLanguagesFromTags(posterTags);
    const allPosterLanguages = Array.from(new Set([...posterLanguages, ...languagesFromTags.map(l => l.toLowerCase())]));
    
    // Available language IDs that we support
    const availableLanguageIds = ['english', 'marathi', 'hindi'];
    
    // Find the first matching language from available languages
    const detectedLanguage = availableLanguageIds.find(langId => {
      const normalizedLangId = langId.toLowerCase();
      // Check if the poster's languages include this language
      if (allPosterLanguages.includes(normalizedLangId)) {
        return true;
      }
      // Check if tags contain keywords for this language
      const keywords = LANGUAGE_KEYWORDS[normalizedLangId] || [normalizedLangId];
      return keywords.some(keyword => 
        allPosterLanguages.some(posterLang => posterLang.includes(keyword)) ||
        posterTags.some((tag: unknown) => 
          typeof tag === 'string' && tag.toLowerCase().includes(keyword)
        )
      );
    });
    
    // If a language is detected and it's different from current selection, switch to it
    if (detectedLanguage && detectedLanguage !== selectedLanguage) {
      setSelectedLanguage(detectedLanguage);
    }
    
    // Update the current poster
    setCurrentPoster(posterWithLanguages);
  }, [selectedLanguage]);

  const handleLanguageChange = useCallback((languageId: string) => {
    setSelectedLanguage(languageId);
    setLanguageMenuVisible(false);

    /*
     * API-based language filtering has been disabled.
     * Previously, we fetched templates via:
     *   - greetingTemplatesService.searchTemplates(...)
     *   - homeApi.getProfessionalTemplates({ language: ... })
     * Language filtering is now handled locally using template tags (see templateContainsLanguage).
     */

    const firstMatchingTemplate = allTemplates
      .map(template => mergeTemplateLanguages(template))
      .find(template => templateContainsLanguage(template, languageId));
    if (firstMatchingTemplate) {
      setCurrentPoster(firstMatchingTemplate);
    }
  }, [allTemplates]);

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
    if (!currentPoster) {
      setImageDimensions(null);
      return;
    }
    const uri = getHighQualityImageUrl(currentPoster);
    if (!uri) {
      setImageDimensions(null);
      return;
    }
    Image.getSize(
      uri,
      (width, height) => setImageDimensions({ width, height }),
      () => setImageDimensions(null)
    );
  }, [currentPoster]);

  const handleNextPress = useCallback(() => {
    navigation.navigate('PosterEditor', {
      selectedImage: {
        uri: getHighQualityImageUrl(currentPoster),
        title: currentPoster.name,
        description: currentPoster.category,
      },
      selectedLanguage: selectedLanguage,
      selectedTemplateId: currentPoster.id,
    });
  }, [navigation, currentPoster, selectedLanguage]);

  const getTemplateLanguageCode = useCallback((template: Template) => {
    const templateLanguages = Array.isArray(template.languages)
      ? template.languages
          .filter((lang): lang is string => typeof lang === 'string')
          .map(lang => lang.toLowerCase())
      : [];

    const firstMatch = templateLanguages.find(langId =>
      languages.some(lang => lang.id === langId)
    );
    if (firstMatch) {
      return languages.find(lang => lang.id === firstMatch)?.code || 'EN';
    }

    const templateTags = Array.isArray(template.tags)
      ? template.tags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const languageMatch = languages.find(lang =>
      (LANGUAGE_KEYWORDS[lang.id] || [lang.id]).some(keyword =>
        templateTags.some(tag => tag.toLowerCase().includes(keyword))
      )
    );
    return languageMatch?.code || 'EN';
  }, [languages]);

  const renderRelatedPoster = useCallback(({ item }: { item: Template }) => (
    <TouchableOpacity
      style={[styles.relatedPosterCard, { width: cardWidth, height: cardHeight }]}
      onPress={() => handlePosterSelect(item)}
      activeOpacity={0.8}
    >
      <OptimizedImage
        uri={getHighQualityImageUrl(item)}
        style={styles.relatedPosterImage}
        resizeMode="cover"
      />
      
      
      <View style={styles.relatedPosterLanguageBadge}>
        <Text style={styles.relatedPosterLanguageText}>
          {getTemplateLanguageCode(item)}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handlePosterSelect, cardWidth, cardHeight, getHighQualityImageUrl, getTemplateLanguageCode]);

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
            style={styles.headerTextButton}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLanguageMenuVisible(v => !v)}
            style={styles.languageDropdownButton}
            activeOpacity={0.8}
          >
            <Text style={styles.languageDropdownText}>
              {languages.find(l => l.id === selectedLanguage)?.name || 'Select Language'}
            </Text>
            <Icon name={languageMenuVisible ? 'expand-less' : 'expand-more'} size={getIconSize(14)} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPress}
            style={styles.headerTextButton}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown will render over the preview instead of full-width */}

         {/* Compact Poster Section */}
         <View style={[styles.posterContainer, { height: computedPreviewHeight, width: '100%' }]}>
         <OptimizedImage
           uri={getHighQualityImageUrl(currentPoster)}
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

         {/* Service filter buttons for Event Planners */}
         {isEventPlannerCategory && (
           <View style={styles.serviceFilterContainer}>
             {['generator', 'decorators', 'sound', 'mandap'].map(filterKey => {
               const isActive = selectedServiceFilter === filterKey;
               const labelMap: Record<string, string> = {
                 generator: 'Generator',
                 decorators: 'Decorators',
                 sound: 'Sound',
                 mandap: 'Mandap'
               };
               return (
                 <TouchableOpacity
                   key={filterKey}
                   style={[
                     styles.serviceFilterButton,
                     isActive && styles.serviceFilterButtonActive
                   ]}
                   onPress={() => setSelectedServiceFilter(prev => prev === filterKey ? null : filterKey)}
                   activeOpacity={0.9}
                 >
                   <LinearGradient
                     colors={[theme.colors.secondary, theme.colors.primary]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                     style={[
                       styles.serviceFilterButtonGradient,
                       !isActive && styles.serviceFilterButtonGradientInactive
                     ]}
                   >
                     <Text style={[
                       styles.serviceFilterButtonText,
                       isActive && styles.serviceFilterButtonTextActive
                     ]}>
                       {labelMap[filterKey]}
                     </Text>
                   </LinearGradient>
                 </TouchableOpacity>
               );
             })}
           </View>
         )}

         {/* Language selection moved to header */}

         {/* Compact Related Posters Section */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            {!isEventPlannerCategory && (
              <Text style={styles.relatedTitle}>
                Related Templates
              </Text>
            )}
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
               // Performance optimizations for large lists
               removeClippedSubviews={true}
               maxToRenderPerBatch={screenWidth >= 768 ? 12 : 8}
               windowSize={10}
               initialNumToRender={screenWidth >= 768 ? 12 : 8}
               updateCellsBatchingPeriod={50}
               getItemLayout={(data, index) => {
                 const numColumns = screenWidth >= 768 ? 4 : 3;
                 const gap = moderateScale(3);
                 const row = Math.floor(index / numColumns);
                 return {
                   length: cardHeight + gap,
                   offset: (cardHeight + gap) * row,
                   index,
                 };
               }}
               onViewableItemsChanged={onViewableItemsChanged}
               viewabilityConfig={viewabilityConfig.current}
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
  headerTextButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(11),
    fontWeight: '600',
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
    borderRadius: moderateScale(8),
    backgroundColor: '#667eea',
  },
  languageDropdownText: {
    color: '#ffffff',
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
  serviceFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(12),
    gap: moderateScale(6),
  },
  serviceFilterButton: {
    flex: 1,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  serviceFilterButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceFilterButtonGradient: {
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceFilterButtonGradientInactive: {
    opacity: 0.75,
  },
  serviceFilterButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: moderateScale(9),
    fontWeight: '600',
  },
  serviceFilterButtonTextActive: {
    color: '#ffffff',
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
