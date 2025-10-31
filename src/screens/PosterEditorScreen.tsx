import React, { useState, useRef, useCallback, useEffect } from 'react';
// Optimized for all screen devices with responsive design improvements
// Canvas height: 38-45% on portrait mode, 65% on landscape (prevents toolbar overlap)
// Toolbar is fixed on screen (no vertical scroll) with horizontal scroll for buttons
// All sections (toolbar, toggle fields, templates) have fixed heights and are fully responsive
// Layout ensures no overlapping between canvas and controls across all screen sizes
// 
// FRAME POSITION LOGIC:
// - Original layer positions are stored ONCE when first frame is applied
// - Original layers are preserved when frame is removed (not cleared)
// - When applying another frame, same original positions are used
// - Original layers are only cleared when: template changes OR business profile changes
// This ensures consistent element positions across multiple frame applications
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  
  Image,
  FlatList,
  Animated,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import PosterCanvas from '../components/PosterCanvas';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';
import businessProfileService, { BusinessProfile } from '../services/businessProfile';
import authService from '../services/auth';
import { frames, Frame, getFramesByCategory } from '../data/frames';
import { mapBusinessProfileToFrameContent, generateLayersFromFrame, getFrameBackgroundSource } from '../utils/frameUtils';
import FrameSelector from '../components/FrameSelector';
import { GOOGLE_FONTS, getFontsByCategory, SYSTEM_FONTS, getFontFamily } from '../services/fontService';
import { useSubscription } from '../contexts/SubscriptionContext';
import Watermark from '../components/Watermark';
import { useTheme } from '../context/ThemeContext';
import PremiumTemplateModal from '../components/PremiumTemplateModal';



const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Utility: convert color to rgba with custom alpha (supports rgba(), rgb(), #RRGGBB)
const toRgba = (color: string, alpha: number): string => {
  if (!color) return `rgba(0,0,0,${alpha})`;
  const trimmed = color.trim();
  if (trimmed.startsWith('rgba')) {
    const parts = trimmed.replace(/rgba\(|\)/g, '').split(',').map(p => p.trim());
    const r = Number(parts[0]) || 0;
    const g = Number(parts[1]) || 0;
    const b = Number(parts[2]) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (trimmed.startsWith('rgb')) {
    const parts = trimmed.replace(/rgb\(|\)/g, '').split(',').map(p => p.trim());
    const r = Number(parts[0]) || 0;
    const g = Number(parts[1]) || 0;
    const b = Number(parts[2]) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (trimmed.startsWith('#')) {
    const hex = trimmed.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
};

const getOmbreColors = (base: string | undefined) => {
  const baseColor = base || 'rgba(0,0,0,1)';
  return [toRgba(baseColor, 0.6), toRgba(baseColor, 0.3), toRgba(baseColor, 0.0)];
};

// Compact spacing multiplier to reduce all spacing (50% reduction)
const COMPACT_MULTIPLIER = 0.5;

// Responsive scaling functions for static styles
const scale = (size: number) => (screenWidth / 375) * size;
const verticalScale = (size: number) => (screenHeight / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

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

// Enhanced responsive spacing and sizing system (with COMPACT_MULTIPLIER applied)
const responsiveSpacing = {
  xs: Math.max(1, (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : isMediumScreen ? 6 : isLargeScreen ? 8 : 10) * COMPACT_MULTIPLIER),
  sm: Math.max(2, (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 10 : 12) * COMPACT_MULTIPLIER),
  md: Math.max(3, (isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : 14) * COMPACT_MULTIPLIER),
  lg: Math.max(4, (isUltraSmallScreen ? 8 : isSmallScreen ? 10 : isMediumScreen ? 12 : isLargeScreen ? 14 : 16) * COMPACT_MULTIPLIER),
  xl: Math.max(5, (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : 18) * COMPACT_MULTIPLIER),
  xxl: Math.max(6, (isUltraSmallScreen ? 12 : isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 18 : 20) * COMPACT_MULTIPLIER),
  xxxl: Math.max(7, (isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 24) * COMPACT_MULTIPLIER),
};

const responsiveFontSize = {
  xs: Math.max(7, (isUltraSmallScreen ? 8 : isSmallScreen ? 9 : isMediumScreen ? 10 : isLargeScreen ? 11 : 12) * 0.85),
  sm: Math.max(8, (isUltraSmallScreen ? 9 : isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : 13) * 0.85),
  md: Math.max(9, (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : 14) * 0.85),
  lg: Math.max(10, (isUltraSmallScreen ? 11 : isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : 15) * 0.85),
  xl: Math.max(11, (isUltraSmallScreen ? 12 : isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 15 : 16) * 0.85),
  xxl: Math.max(12, (isUltraSmallScreen ? 13 : isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : 17) * 0.85),
  xxxl: Math.max(13, (isUltraSmallScreen ? 14 : isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 17 : 18) * 0.85),
  xxxxl: Math.max(14, (isUltraSmallScreen ? 15 : isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : 20) * 0.85),
  xxxxxl: Math.max(15, (isUltraSmallScreen ? 16 : isSmallScreen ? 17 : isMediumScreen ? 18 : isLargeScreen ? 19 : 22) * 0.85),
};

// Enhanced responsive dimensions calculation with orientation support
// Canvas is square (1:1 ratio) to match 1024x1024 image ratio
const getResponsiveDimensions = (insets: any) => {
  const availableWidth = screenWidth - (insets.left + insets.right);
  const availableHeight = screenHeight - (insets.top + insets.bottom);
  
  // Calculate square canvas dimensions based on screen size
  let canvasWidthRatio = 0.95;
  
  if (isLandscape) {
    // Landscape mode - smaller square canvas
    canvasWidthRatio = isTablet ? 0.5 : 0.6;
  } else {
    // Portrait mode - square canvas that fits the screen
    if (isTablet) {
      canvasWidthRatio = 0.7;
    } else if (isUltraSmallScreen) {
      canvasWidthRatio = 0.95;
    } else if (isSmallScreen) {
      canvasWidthRatio = 0.93;
    } else if (isMediumScreen) {
      canvasWidthRatio = 0.92;
    } else if (isLargeScreen) {
      canvasWidthRatio = 0.90;
    } else {
      canvasWidthRatio = 0.88;
    }
  }
  
  // Make canvas square: width = height (1:1 aspect ratio for 1024x1024 images)
  const canvasWidth = Math.min(availableWidth * canvasWidthRatio, screenWidth * canvasWidthRatio);
  const canvasHeight = canvasWidth; // Square canvas!
  
  return {
    canvasWidth,
    canvasHeight,
    availableWidth,
    availableHeight,
    canvasWidthRatio,
    canvasHeightRatio: canvasWidthRatio // Same as width ratio for square
  };
};

// Enhanced responsive helpers with orientation and device type support (compact versions)
const getResponsiveSectionHeight = () => {
  if (isLandscape) {
    return (isTablet ? 100 : 80) * COMPACT_MULTIPLIER;
  }
  return (isUltraSmallScreen ? 50 : isSmallScreen ? 65 : isMediumScreen ? 80 : isLargeScreen ? 100 : 120) * COMPACT_MULTIPLIER;
};

const getResponsiveButtonSize = () => {
  if (isLandscape) {
    return (isTablet ? 60 : 45) * 0.7;
  }
  return (isUltraSmallScreen ? 40 : isSmallScreen ? 50 : isMediumScreen ? 60 : isLargeScreen ? 70 : 80) * 0.7;
};

const getResponsiveIconSize = () => {
  if (isLandscape) {
    return Math.max(12, (isTablet ? 20 : 16) * 0.8);
  }
  return Math.max(11, (isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 22) * 0.8);
};

const getResponsiveSectionPadding = () => {
  if (isLandscape) {
    return Math.max(4, (isTablet ? 16 : 8) * COMPACT_MULTIPLIER);
  }
  return Math.max(2, (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 10 : 12) * COMPACT_MULTIPLIER);
};

const getResponsiveSectionMargin = () => {
  if (isLandscape) {
    return Math.max(5, (isTablet ? 20 : 10) * COMPACT_MULTIPLIER);
  }
  return Math.max(2, (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 12 : 15) * COMPACT_MULTIPLIER);
};

// Enhanced compact mode helpers (with compact multiplier)
const getUltraCompactSpacing = () => {
  if (isLandscape) {
    return Math.max(3, (isTablet ? 12 : 6) * COMPACT_MULTIPLIER);
  }
  return Math.max(1, (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : getResponsiveSectionPadding()) * COMPACT_MULTIPLIER);
};

const getUltraCompactMargin = () => {
  if (isLandscape) {
    return Math.max(4, (isTablet ? 16 : 8) * COMPACT_MULTIPLIER);
  }
  return Math.max(1, (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : getResponsiveSectionMargin()) * COMPACT_MULTIPLIER);
};

// Enhanced header-specific responsive helpers (compact versions)
const getHeaderButtonSize = () => {
  if (isLandscape) {
    return Math.max(24, (isTablet ? 44 : 32) * 0.7);
  }
  return Math.max(20, (isUltraSmallScreen ? 28 : isSmallScreen ? 32 : isMediumScreen ? 36 : isLargeScreen ? 40 : 44) * 0.7);
};

const getHeaderPadding = () => {
  if (isLandscape) {
    return Math.max(3, (isTablet ? 12 : 6) * 0.6);
  }
  return Math.max(1, (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : isMediumScreen ? 6 : isLargeScreen ? 8 : 10) * 0.6);
};

const getHeaderTitleSize = () => {
  if (isLandscape) {
    return Math.max(14, (isTablet ? 20 : 16) * 0.85);
  }
  return Math.max(12, (isUltraSmallScreen ? 14 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 22) * 0.85);
};

const getHeaderSubtitleSize = () => {
  if (isLandscape) {
    return Math.max(10, (isTablet ? 14 : 12) * 0.85);
  }
  return Math.max(9, (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : 14) * 0.85);
};

// Enhanced toolbar-specific responsive helpers (for bottom toolbar - compact versions)
const getToolbarButtonSize = () => {
  if (isLandscape) {
    return Math.max(49, (isTablet ? 80 : 70) * 0.7);
  }
  return Math.max(42, (isUltraSmallScreen ? 60 : isSmallScreen ? 65 : isMediumScreen ? 70 : isLargeScreen ? 75 : 80) * 0.7);
};

const getToolbarButtonTextSize = () => {
  if (isLandscape) {
    return Math.max(8, (isTablet ? 12 : 10) * 0.85);
  }
  return Math.max(7, (isUltraSmallScreen ? 8 : isSmallScreen ? 9 : isMediumScreen ? 10 : isLargeScreen ? 11 : 12) * 0.85);
};

interface Layer {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  fieldType?: string; // Add field type identifier
  style?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    backgroundColor?: string;
  };
}

interface PosterEditorScreenProps {
  route: {
    params: {
      selectedImage: {
        uri: string;
        title?: string;
        description?: string;
      };
      selectedLanguage: string;
      selectedTemplateId: string;
    };
  };
}

const PosterEditorScreen: React.FC<PosterEditorScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { selectedImage, selectedLanguage, selectedTemplateId } = route.params;
  const { isSubscribed, checkPremiumAccess, refreshSubscription } = useSubscription();
  const { isDarkMode, theme } = useTheme();
  
  // Get high quality image URL for editor (replace thumbnail params with high quality)
  const getHighQualityImageUrl = (imageUri: string): string => {
    let url = imageUri;
    
    // Remove any existing quality/size parameters
    url = url.replace(/[?&](quality|width|height|w|h|size)=[^&]*/gi, '');
    
    // Add high quality parameters for editor
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}quality=high&width=2400`;
  };
  
  // State for dynamic dimensions to handle orientation changes
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });
  
  // Listen for orientation changes and update dimensions
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    
    return () => subscription?.remove();
  }, []);
  
  const currentScreenWidth = dimensions.width;
  const currentScreenHeight = dimensions.height;
  
  // Dynamic responsive scaling functions (for theme styles that need to update on orientation change)
  const dynamicScale = (size: number) => (currentScreenWidth / 375) * size;
  const dynamicVerticalScale = (size: number) => (currentScreenHeight / 667) * size;
  const dynamicModerateScale = (size: number, factor = 0.5) => size + (dynamicScale(size) - size) * factor;
  
  // Get responsive dimensions
  const { canvasWidth, canvasHeight, availableWidth, availableHeight } = getResponsiveDimensions(insets);

  // Create theme-aware styles (with dynamic responsive scaling)
  const getThemeStyles = () => ({
    container: {
      flex: 1,
      backgroundColor: theme?.colors?.background || '#f8f9fa',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    modalContent: {
      backgroundColor: theme?.colors?.surface || '#ffffff',
      borderRadius: dynamicModerateScale(14),
      padding: dynamicModerateScale(12),
      width: currentScreenWidth * 0.92,
      maxHeight: currentScreenHeight * 0.7,
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(4),
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: dynamicModerateScale(10),
      elevation: dynamicModerateScale(8),
    },
    fontModalContent: {
      backgroundColor: theme?.colors?.surface || '#ffffff',
      borderRadius: dynamicModerateScale(14),
      padding: dynamicModerateScale(12),
      width: currentScreenWidth * 0.92,
      height: currentScreenHeight * 0.50,
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(4),
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: dynamicModerateScale(10),
      elevation: dynamicModerateScale(8),
    },
    modalTitle: {
      fontSize: dynamicModerateScale(12),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      marginBottom: dynamicModerateScale(8),
    },
    modalSubtitle: {
      fontSize: dynamicModerateScale(12),
      color: theme?.colors?.textSecondary || '#666666',
      marginBottom: dynamicModerateScale(12),
      fontWeight: '500' as const,
    },
    textInput: {
      borderWidth: 1.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      borderRadius: dynamicModerateScale(8),
      padding: dynamicModerateScale(10),
      fontSize: dynamicModerateScale(13),
      marginBottom: dynamicModerateScale(12),
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      color: theme?.colors?.text || '#333333',
    },
    cancelButton: {
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      borderWidth: 1.5,
      borderColor: theme?.colors?.border || '#e9ecef',
    },
    cancelButtonText: {
      color: theme?.colors?.textSecondary || '#666666',
      fontSize: dynamicModerateScale(12),
      fontWeight: '600' as const,
    },
    profileItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: dynamicModerateScale(8),
      paddingHorizontal: dynamicModerateScale(10),
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      borderRadius: dynamicModerateScale(8),
      marginBottom: dynamicModerateScale(6),
    },
    profileLogo: {
      width: dynamicModerateScale(35),
      height: dynamicModerateScale(35),
      borderRadius: dynamicModerateScale(17.5),
      marginRight: dynamicModerateScale(8),
    },
    profileLogoPlaceholder: {
      width: dynamicModerateScale(35),
      height: dynamicModerateScale(35),
      borderRadius: dynamicModerateScale(17.5),
      backgroundColor: theme?.colors?.border || '#e9ecef',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: dynamicModerateScale(8),
    },
    profileName: {
      fontSize: dynamicModerateScale(10),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      marginBottom: dynamicModerateScale(1.5),
    },
    profileDescription: {
      fontSize: dynamicModerateScale(8.5),
      color: theme?.colors?.textSecondary || '#666666',
      lineHeight: dynamicModerateScale(11),
    },
    profileCategory: {
      fontSize: dynamicModerateScale(8.5),
      color: '#667eea',
      marginBottom: dynamicModerateScale(1.5),
      fontWeight: '600' as const,
    },
    styleOption: {
      width: dynamicModerateScale(36),
      height: dynamicModerateScale(36),
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      borderRadius: dynamicModerateScale(8),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      margin: dynamicModerateScale(2),
      borderWidth: 1.5,
      borderColor: theme?.colors?.border || '#e9ecef',
    },
    styleOptionText: {
      fontSize: dynamicModerateScale(11),
      color: theme?.colors?.text || '#333333',
      fontWeight: '600' as const,
    },
    styleSectionTitle: {
      fontSize: dynamicModerateScale(13),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      marginBottom: dynamicModerateScale(8),
    },
    fieldToggleSection: {
      width: '100%',
      backgroundColor: theme?.colors?.surface || 'rgba(255, 255, 255, 0.95)',
      borderRadius: dynamicModerateScale(10),
      padding: dynamicModerateScale(6),
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(2),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: dynamicModerateScale(6),
      elevation: dynamicModerateScale(4),
      borderWidth: 0.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      marginBottom: dynamicModerateScale(8),
      marginHorizontal: dynamicModerateScale(6),
    },
    fieldToggleTitle: {
      fontSize: dynamicModerateScale(11),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
    },
    fieldToggleSubtitle: {
      fontSize: dynamicModerateScale(8),
      color: theme?.colors?.textSecondary || '#666666',
      marginTop: dynamicModerateScale(0.5),
    },
    fieldToggleButton: {
      alignItems: 'center' as const,
      paddingVertical: dynamicModerateScale(6),
      paddingHorizontal: dynamicModerateScale(8),
      borderRadius: dynamicModerateScale(10),
      backgroundColor: theme?.colors?.border || '#e9ecef',
      marginHorizontal: dynamicModerateScale(2),
      flexDirection: 'row' as const,
      minWidth: dynamicModerateScale(60),
      justifyContent: 'center' as const,
    },
    fieldToggleButtonText: {
      fontSize: dynamicModerateScale(9),
      color: theme?.colors?.textSecondary || '#666666',
      marginLeft: dynamicModerateScale(3),
      fontWeight: '500' as const,
    },
    footerStylesSection: {
      width: '100%',
      backgroundColor: theme?.colors?.surface || 'rgba(255, 255, 255, 0.95)',
      borderRadius: dynamicModerateScale(10),
      padding: dynamicModerateScale(6),
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(2),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: dynamicModerateScale(6),
      elevation: dynamicModerateScale(4),
      borderWidth: 0.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      marginBottom: dynamicModerateScale(8),
      marginHorizontal: dynamicModerateScale(6),
    },
    footerStylesTitle: {
      fontSize: dynamicModerateScale(11),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
    },
    footerStylesSubtitle: {
      fontSize: dynamicModerateScale(8),
      color: theme?.colors?.textSecondary || '#666666',
      marginTop: dynamicModerateScale(0.5),
    },
    footerStyleModalButton: {
      width: (currentScreenWidth * 0.85 - dynamicModerateScale(64)) / 3 - dynamicModerateScale(12),
      backgroundColor: theme?.colors?.surface || '#ffffff',
      borderRadius: dynamicModerateScale(8),
      padding: dynamicModerateScale(10),
      marginBottom: dynamicModerateScale(12),
      marginHorizontal: dynamicModerateScale(4),
      alignItems: 'center' as const,
      borderWidth: 0.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(1),
      },
      shadowOpacity: isDarkMode ? 0.1 : 0.08,
      shadowRadius: dynamicModerateScale(2),
      elevation: dynamicModerateScale(1),
    },
    footerStyleModalPreview: {
      width: dynamicModerateScale(45),
      height: dynamicModerateScale(45),
      borderRadius: dynamicModerateScale(6),
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: dynamicModerateScale(5),
      borderWidth: 1.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      overflow: 'hidden',
    },
    footerStyleModalText: {
      fontSize: dynamicModerateScale(14),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      textAlign: 'center' as const,
      marginBottom: dynamicModerateScale(5),
    },
    footerStyleModalDescription: {
      fontSize: dynamicModerateScale(9),
      fontWeight: '600' as const,
      color: theme?.colors?.textSecondary || '#666666',
      textAlign: 'center' as const,
      lineHeight: dynamicModerateScale(11),
      marginTop: dynamicModerateScale(2),
    },
    footerStylePreview: {
      width: dynamicModerateScale(50),
      height: dynamicModerateScale(50),
      borderRadius: dynamicModerateScale(6),
      backgroundColor: theme?.colors?.surface || '#f8f9fa',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: dynamicModerateScale(5),
      borderWidth: 1.5,
      borderColor: theme?.colors?.border || '#e9ecef',
      overflow: 'hidden',
    },
    footerStyleText: {
      fontSize: dynamicModerateScale(8),
      color: theme?.colors?.textSecondary || '#666666',
      fontWeight: '600' as const,
      textAlign: 'center' as const,
      lineHeight: dynamicModerateScale(10),
    },
    fontStyleModalTitle: {
      fontSize: dynamicModerateScale(10),
      fontWeight: '600' as const,
      color: theme?.colors?.text || '#333333',
      textAlign: 'center' as const,
      marginTop: dynamicModerateScale(2),
    },
    fontStyleSectionTitle: {
      fontSize: dynamicModerateScale(14),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      marginLeft: dynamicModerateScale(8),
    },
    fontStyleSectionSubtitle: {
      fontSize: dynamicModerateScale(11),
      color: theme?.colors?.textSecondary || '#666666',
      marginBottom: dynamicModerateScale(10),
      marginLeft: dynamicModerateScale(20),
      lineHeight: dynamicModerateScale(16),
    },
    logoModalContent: {
      backgroundColor: theme?.colors?.surface || '#ffffff',
      borderRadius: dynamicModerateScale(14),
      padding: dynamicModerateScale(12),
      width: currentScreenWidth * 0.92,
      maxHeight: currentScreenHeight * 0.7,
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(4),
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: dynamicModerateScale(10),
      elevation: dynamicModerateScale(8),
    },
    logoModalTitle: {
      fontSize: dynamicModerateScale(16),
      fontWeight: '700' as const,
      color: theme?.colors?.text || '#333333',
      marginBottom: dynamicModerateScale(5),
    },
    logoModalSubtitle: {
      fontSize: dynamicModerateScale(12),
      color: theme?.colors?.textSecondary || '#666666',
      marginBottom: dynamicModerateScale(12),
      fontWeight: '500' as const,
    },
    logoModalCloseText: {
      color: theme?.colors?.textSecondary || '#666666',
      fontSize: dynamicModerateScale(13),
      fontWeight: '600' as const,
    },
    instructionsContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -dynamicModerateScale(80) }, { translateY: -dynamicModerateScale(15) }],
      alignItems: 'center' as const,
      backgroundColor: theme?.colors?.surface || 'rgba(255, 255, 255, 0.95)',
      padding: dynamicModerateScale(12),
      borderRadius: dynamicModerateScale(10),
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(2),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: dynamicModerateScale(5),
      elevation: dynamicModerateScale(4),
    },
    instructionsText: {
      fontSize: dynamicModerateScale(11),
      color: theme?.colors?.textSecondary || '#666666',
      textAlign: 'center' as const,
      marginTop: dynamicModerateScale(5),
      maxWidth: dynamicModerateScale(160),
      lineHeight: dynamicModerateScale(16),
    },
    loadingContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -dynamicModerateScale(40) }, { translateY: -dynamicModerateScale(15) }],
      alignItems: 'center' as const,
      backgroundColor: theme?.colors?.surface || 'rgba(255, 255, 255, 0.95)',
      padding: dynamicModerateScale(12),
      borderRadius: dynamicModerateScale(10),
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(2),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: dynamicModerateScale(5),
      elevation: dynamicModerateScale(4),
    },
    loadingText: {
      fontSize: dynamicModerateScale(11),
      color: theme?.colors?.textSecondary || '#666666',
      textAlign: 'center' as const,
      marginTop: dynamicModerateScale(5),
    },
    toolbar: {
      position: 'absolute',
      right: dynamicModerateScale(12),
      top: '50%',
      transform: [{ translateY: -dynamicModerateScale(70) }],
      backgroundColor: theme?.colors?.surface || 'rgba(255, 255, 255, 0.95)',
      borderRadius: dynamicModerateScale(10),
      padding: dynamicModerateScale(6),
      shadowColor: theme?.colors?.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(2),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.1,
      shadowRadius: dynamicModerateScale(6),
      elevation: dynamicModerateScale(4),
      zIndex: 100,
    },
    // Delete Modal Styles - Fully responsive
    deleteModalContainer: {
      borderRadius: dynamicModerateScale(14),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(4),
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: dynamicModerateScale(10),
      elevation: dynamicModerateScale(8),
    },
    deleteModalHeader: {
      alignItems: 'center' as const,
      position: 'relative' as const,
    },
    deleteIconContainer: {
      width: dynamicModerateScale(50),
      height: dynamicModerateScale(50),
      borderRadius: dynamicModerateScale(25),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    deleteModalTitle: {
      fontSize: dynamicModerateScale(16),
      fontWeight: '700' as const,
      textAlign: 'center' as const,
    },
    closeModalButton: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      width: dynamicModerateScale(26),
      height: dynamicModerateScale(26),
      borderRadius: dynamicModerateScale(13),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    deleteModalContent: {
      // Dynamic marginBottom handled inline
    },
    deleteModalMessage: {
      textAlign: 'center' as const,
      // Dynamic fontSize and lineHeight handled inline
    },
    deleteModalButtons: {
      flexDirection: 'row' as const,
      gap: dynamicModerateScale(8),
    },
    deleteModalCancelButton: {
      flex: 1,
      alignItems: 'center' as const,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(1.5),
      },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: dynamicModerateScale(3),
      elevation: dynamicModerateScale(2),
      paddingVertical: dynamicModerateScale(10),
      borderRadius: dynamicModerateScale(8),
    },
    deleteModalCancelText: {
      fontWeight: '600' as const,
      fontSize: dynamicModerateScale(13),
    },
    deleteModalDeleteButton: {
      flex: 1,
      alignItems: 'center' as const,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: dynamicModerateScale(1.5),
      },
      shadowOpacity: 0.15,
      shadowRadius: dynamicModerateScale(3),
      elevation: dynamicModerateScale(2),
      paddingVertical: dynamicModerateScale(10),
      borderRadius: dynamicModerateScale(8),
    },
    deleteModalDeleteText: {
      fontWeight: '600' as const,
      color: '#ffffff',
      fontSize: dynamicModerateScale(13),
    },
  });

  const themeStyles = getThemeStyles();

  
      // Ref for capturing the poster as image
    const posterRef = useRef<ViewShot>(null);
    const visibleCanvasRef = useRef<ViewShot>(null);
  

  

  


  // State for layers
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showFontStyleModal, setShowFontStyleModal] = useState(false);
  const [showLogoSelectionModal, setShowLogoSelectionModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false);
  
  // State for dragging
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  
  // Animated values for each layer's position (not just translation)
  const layerAnimations = useRef<{ [key: string]: { x: Animated.Value; y: Animated.Value } }>({}).current;
  
  // Translation values for dragging
  const translationValues = useRef<{ [key: string]: { x: Animated.Value; y: Animated.Value } }>({}).current;
  
  // Scale values for zooming
  const scaleValues = useRef<{ [key: string]: Animated.Value }>({}).current;
  
  // State for field visibility
  const [visibleFields, setVisibleFields] = useState<{[key: string]: boolean}>({
    logo: true,
    companyName: true,
    footerBackground: true,
    phone: true,
    email: true,
    website: true,
    category: true,
    address: true,
  });
  
  // Store original layers for frame removal
  const [originalLayers, setOriginalLayers] = useState<Layer[]>([]);
  const [originalTemplate, setOriginalTemplate] = useState<string>('business');

  // State for templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>('business');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // State for business profiles
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedBusinessProfile, setSelectedBusinessProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelectionModal, setShowProfileSelectionModal] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);



  // State for frames
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [frameContent, setFrameContent] = useState<{[key: string]: string}>({});
  const [applyingFrame, setApplyingFrame] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showRemoveFrameWarningModal, setShowRemoveFrameWarningModal] = useState(false);
  const [currentPositions, setCurrentPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const currentPositionsRef = useRef<{ [key: string]: { x: number; y: number } }>({});
  const [showRemoveFrameModal, setShowRemoveFrameModal] = useState(false);
  const [showDeleteElementModal, setShowDeleteElementModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Canvas dimensions - using responsive dimensions from getResponsiveDimensions

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Fetch business profiles on component mount
  useEffect(() => {
    fetchBusinessProfiles();
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch business profiles - now user-specific
  const fetchBusinessProfiles = async () => {
    try {
      setLoadingProfiles(true);
      
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available');
        setShowConnectionErrorModal(true);
        return;
      }
      
      console.log('🔍 Fetching user-specific business profiles for user:', userId);
      
      // Fetch user-specific business profiles
      const profiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      if (profiles.length > 0) {
        setBusinessProfiles(profiles);
        console.log('✅ Loaded user-specific business profiles:', profiles.length);
        
        if (profiles.length === 1) {
          // If only one profile, auto-select it
          setSelectedBusinessProfile(profiles[0]);
          applyBusinessProfileToPoster(profiles[0]);
        } else if (profiles.length > 1) {
          // If multiple profiles, show selection modal
          setShowProfileSelectionModal(true);
        }
      } else {
        console.log('⚠️ No user-specific business profiles found');
        setShowConnectionErrorModal(true);
      }
    } catch (error) {
      console.error('Error fetching user-specific business profiles:', error);
      setShowConnectionErrorModal(true);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Apply business profile data to poster
  const applyBusinessProfileToPoster = (profile: BusinessProfile) => {
    setSelectedBusinessProfile(profile);
    setShowProfileSelectionModal(false);
    
    // Clear original layers when changing business profile so new positions become the baseline
    setOriginalLayers([]);
    console.log('🔄 [APPLY BUSINESS PROFILE] Cleared original layers for new profile:', profile.name);
    
    // Auto-set template based on business profile category
    if (profile.category) {
      const categoryToTemplate: { [key: string]: string } = {
        'Restaurant': 'restaurant',
        'Food & Beverage': 'restaurant',
        'Cafe': 'restaurant',
        'Bar': 'restaurant',
        'Hotel': 'business',
        'Event Planning': 'event',
        'Wedding': 'wedding',
        'Fashion': 'fashion',
        'Real Estate': 'real-estate',
        'Education': 'education',
        'Healthcare': 'healthcare',
        'Fitness': 'fitness',
        'Technology': 'tech',
        'Creative': 'creative',
        'Corporate': 'corporate',
        'Luxury': 'luxury',
        'Modern': 'modern',
        'Vintage': 'vintage',
        'Retro': 'retro',
        'Elegant': 'elegant',
        'Bold': 'bold',
        'Nature': 'nature',
        'Ocean': 'ocean',
        'Sunset': 'sunset',
        'Cosmic': 'cosmic',
        'Artistic': 'artistic',
        'Sport': 'sport',
        'Warm': 'warm',
        'Cool': 'cool',
      };
      
      const template = categoryToTemplate[profile.category] || 'business';
      setSelectedTemplate(template);
      console.log(`Auto-setting template to '${template}' based on business category '${profile.category}'`);
    }
    
    // Generate content from business profile
    const content = mapBusinessProfileToFrameContent(profile);
    setFrameContent(content);
    
    // If a frame is selected, apply it with the new content
    if (selectedFrame) {
      const frameLayers = generateLayersFromFrame(selectedFrame, content, canvasWidth, canvasHeight);
      setLayers(frameLayers);
    } else {
      // Create default layers from business profile
      const newLayers: Layer[] = [];

      // Add company logo on top right with responsive sizing
      if (profile.companyLogo || profile.logo) {
        const logoSize = Math.max(40, Math.min(80, canvasWidth * 0.15)); // Responsive logo size
        const logoLayer: Layer = {
          id: generateId(),
          type: 'logo',
          content: profile.companyLogo || profile.logo || 'https://via.placeholder.com/80x80/667eea/ffffff?text=LOGO',
          position: { x: canvasWidth - 100, y: 20 }, // Keep same position
          size: { width: logoSize, height: logoSize }, // Responsive size
          rotation: 0,
          zIndex: 10,
          fieldType: 'logo',
        };
        newLayers.push(logoLayer);
      }

    // Add company name on top left with responsive font size
    if (profile.name) {
      const companyNameSize = Math.max(16, Math.min(24, canvasWidth * 0.06)); // Responsive font size
      const companyNameLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: profile.name,
        position: { x: 20, y: 30 }, // Keep same position
        size: { width: canvasWidth - 140, height: 60 }, // Keep same size
        rotation: 0,
        zIndex: 10,
        fieldType: 'companyName',
        style: {
          fontSize: companyNameSize, // Responsive font size
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '600',
        },
      };
      newLayers.push(companyNameLayer);
    }

    // Create professional footer with contact information (3 lines)
    const contactLineHeight = isTablet ? 20 : 16;
    const footerPadding = 10; // Top and bottom padding
    const footerHeight = (contactLineHeight * 3) + (footerPadding * 2); // 3 lines + padding
    const footerY = canvasHeight - footerHeight;
    
    // Responsive font sizes for footer elements
    const getResponsiveFooterFontSize = (baseSize: number) => {
      const scaleFactor = Math.min(canvasWidth / 400, canvasHeight / 600); // Scale based on canvas size
      return Math.max(baseSize * scaleFactor, baseSize * 0.8); // Minimum 80% of base size
    };
    
    const footerTextSize = getResponsiveFooterFontSize(isTablet ? 14 : 11);
    
    // Footer background overlay for better readability
    const footerBackgroundLayer: Layer = {
      id: generateId(),
      type: 'text',
      content: '',
      position: { x: 0, y: footerY },
      size: { width: canvasWidth, height: footerHeight },
      rotation: 0,
      zIndex: 5,
      fieldType: 'footerBackground',
      style: {
        fontSize: 0,
        color: 'transparent',
        fontFamily: 'System',
        fontWeight: '400',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      },
    };
    newLayers.push(footerBackgroundLayer);

    // Contact information in two columns (positions based on user's manual placement)
    // For 720x487 canvas: scaled positions
    const scaleX = canvasWidth / 720;
    const scaleY = canvasHeight / 487.2;
    
    const leftColumnX = Math.round(20 * scaleX);
    const rightColumnX = Math.round(370 * scaleX);

    // Left column - Phone and Email
    if (profile.phone) {
      const phoneLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `📞 ${profile.phone}`,
        position: { x: Math.round(219 * scaleX), y: Math.round(425 * scaleY) },
        size: { width: (canvasWidth - 40) / 2, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'phone',
        style: {
          fontSize: footerTextSize,
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(phoneLayer);
    }

    if (profile.email) {
      const emailLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `✉️ ${profile.email}`,
        position: { x: leftColumnX, y: Math.round(443 * scaleY) },
        size: { width: (canvasWidth - 40) / 2, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'email',
        style: {
          fontSize: footerTextSize,
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(emailLayer);
    }

    // Right column - Website and Category
    if (profile.website) {
      const websiteLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `🌐 ${profile.website}`,
        position: { x: Math.round(12 * scaleX), y: Math.round(423 * scaleY) },
        size: { width: (canvasWidth - 40) / 2, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'website',
        style: {
          fontSize: footerTextSize,
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(websiteLayer);
    }

    if (profile.category) {
      const categoryLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `🏢 ${profile.category}`,
        position: { x: Math.round(225 * scaleX), y: Math.round(446 * scaleY) },
        size: { width: (canvasWidth - 40) / 2, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'category',
        style: {
          fontSize: footerTextSize,
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(categoryLayer);
    }

    // Address on line 3
    if (profile.address) {
      const addressLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `📍 ${profile.address}`,
        position: { x: Math.round(434 * scaleX), y: Math.round(426 * scaleY) },
        size: { width: (canvasWidth - 40) / 2, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'address',
        style: {
          fontSize: footerTextSize,
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(addressLayer);
    }

    // Services - positioned below the 3-line footer if needed
    if (profile.services && profile.services.length > 0) {
      const servicesText = profile.services.slice(0, 3).join(' • ');
      const servicesLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: `🛠️ ${servicesText}${profile.services.length > 3 ? '...' : ''}`,
        position: { x: leftColumnX, y: Math.round(464 * scaleY) },
        size: { width: canvasWidth - 40, height: contactLineHeight },
        rotation: 0,
        zIndex: 10,
        fieldType: 'services',
        style: {
          fontSize: Math.max(isTablet ? 12 : 9, footerTextSize),
          color: '#ffffff',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      newLayers.push(servicesLayer);
    }

    setLayers(newLayers);
    
    // Initialize animated values for new layers
    newLayers.forEach(layer => {
      if (!layerAnimations[layer.id]) {
        layerAnimations[layer.id] = {
          x: new Animated.Value(layer.position.x),
          y: new Animated.Value(layer.position.y)
        };
      }
      if (!translationValues[layer.id]) {
        translationValues[layer.id] = {
          x: new Animated.Value(0),
          y: new Animated.Value(0)
        };
      }
    });
    }
  };

  // Handle business profile selection
  const handleProfileSelection = (profile: BusinessProfile) => {
    setSelectedBusinessProfile(profile);
    setShowProfileSelectionModal(false);
    applyBusinessProfileToPoster(profile);
  };

  // Toggle field visibility
  const toggleFieldVisibility = (fieldType: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldType]: !prev[fieldType]
    }));
  };

  // Handle pan gesture for dragging layers
  const onPanGestureEvent = useCallback((layerId: string) => {
    // Ensure translation values exist for this layer
    if (!translationValues[layerId]) {
      translationValues[layerId] = {
        x: new Animated.Value(0),
        y: new Animated.Value(0)
      };
    }
    
    return Animated.event(
      [{ nativeEvent: { translationX: translationValues[layerId].x, translationY: translationValues[layerId].y } }],
      { useNativeDriver: true }
    );
  }, [translationValues]);

  // Handle pan gesture state changes
  const onHandlerStateChange = useCallback((layerId: string) => {
    return (event: any) => {
      if (event.nativeEvent.state === State.BEGAN) {
        setDraggedLayer(layerId);
        setSelectedLayer(layerId);
        // Reset translation values when drag begins
        if (translationValues[layerId]) {
          translationValues[layerId].x.setValue(0);
          translationValues[layerId].y.setValue(0);
        }
      } else if (event.nativeEvent.state === State.END) {
        const { translationX, translationY } = event.nativeEvent;
        
        // Get current layer
        const currentLayer = layers.find(layer => layer.id === layerId);
        if (!currentLayer) return;
        
        // Calculate new position with boundaries
        // For text layers, don't constrain based on size since they shrink-wrap
        let newX, newY;
        if (currentLayer.type === 'text') {
          // Text layers can move freely within canvas
          newX = Math.max(0, Math.min(canvasWidth, currentLayer.position.x + translationX));
          newY = Math.max(0, Math.min(canvasHeight, currentLayer.position.y + translationY));
        } else {
          // Image layers need size-based constraints
          newX = Math.max(0, Math.min(canvasWidth - currentLayer.size.width, currentLayer.position.x + translationX));
          newY = Math.max(0, Math.min(canvasHeight - currentLayer.size.height, currentLayer.position.y + translationY));
        }
        
        // Debug: Log the current position and field type
        const frameFileName = selectedFrame?.background ? 
          (typeof selectedFrame.background === 'number' ? selectedFrame.id : selectedFrame.background.toString()) : 
          'unknown';
        console.log(`🎯 DEBUG: ${currentLayer.fieldType || 'Unknown Field'} moved to position:`);
        console.log(`   📍 X: ${newX.toFixed(1)}, Y: ${newY.toFixed(1)}`);
        console.log(`   📏 Canvas Size: ${canvasWidth}x${canvasHeight}`);
        console.log(`   🏷️ Field Type: ${currentLayer.fieldType || 'Unknown'}`);
        console.log(`   📝 Content: ${currentLayer.content || 'No content'}`);
        console.log(`   🔧 For ${frameFileName}.png, use: x: ${newX.toFixed(0)}, y: ${newY.toFixed(0)}`);
        
        // Update the animated position values directly
        if (layerAnimations[layerId]) {
          layerAnimations[layerId].x.setValue(newX);
          layerAnimations[layerId].y.setValue(newY);
        }
        
        // Update layer position in state
        setLayers(prev => prev.map(layer => {
          if (layer.id === layerId) {
            return {
              ...layer,
              position: { x: newX, y: newY }
            };
          }
          return layer;
        }));
        
        // Reset translation values to 0 for next drag
        if (translationValues[layerId]) {
          translationValues[layerId].x.setValue(0);
          translationValues[layerId].y.setValue(0);
        }
        
        setDraggedLayer(null);
      }
    };
  }, [layers, canvasWidth, canvasHeight, layerAnimations, translationValues]);

  // Handle pinch gesture for zooming
  const onPinchGestureEvent = useCallback((layerId: string) => {
    // Ensure scale values exist for this layer
    if (!scaleValues[layerId]) {
      scaleValues[layerId] = new Animated.Value(1);
    }
    
    return Animated.event(
      [{ nativeEvent: { scale: scaleValues[layerId] } }],
      { useNativeDriver: true }
    );
  }, [scaleValues]);

  // Handle pinch gesture state changes
  const onPinchHandlerStateChange = useCallback((layerId: string) => {
    return (event: any) => {
      if (event.nativeEvent.state === State.BEGAN) {
        setSelectedLayer(layerId);
        // Reset scale value when pinch begins
        if (scaleValues[layerId]) {
          scaleValues[layerId].setValue(1);
        }
      } else if (event.nativeEvent.state === State.ACTIVE) {
        // Real-time scaling during pinch
        const { scale } = event.nativeEvent;
        
        // Get current layer
        const currentLayer = layers.find(layer => layer.id === layerId);
        if (!currentLayer) return;
        
        // Calculate new size with constraints
        const minScale = 0.2;
        const maxScale = 5.0;
        const constrainedScale = Math.max(minScale, Math.min(maxScale, scale));
        
        const newWidth = currentLayer.size.width * constrainedScale;
        const newHeight = currentLayer.size.height * constrainedScale;
        
        // Check boundaries
        const maxWidth = canvasWidth - currentLayer.position.x;
        const maxHeight = canvasHeight - currentLayer.position.y;
        const finalWidth = Math.min(newWidth, maxWidth);
        const finalHeight = Math.min(newHeight, maxHeight);
        
        // Update layer size in state for real-time feedback
        setLayers(prev => prev.map(layer => {
          if (layer.id === layerId) {
            return {
              ...layer,
              size: { width: finalWidth, height: finalHeight }
            };
          }
          return layer;
        }));
      } else if (event.nativeEvent.state === State.END) {
        // Finalize the scaling
        const { scale } = event.nativeEvent;
        
        // Get current layer
        const currentLayer = layers.find(layer => layer.id === layerId);
        if (!currentLayer) return;
        
        // Calculate new size with constraints
        const minScale = 0.2;
        const maxScale = 5.0;
        const constrainedScale = Math.max(minScale, Math.min(maxScale, scale));
        
        const newWidth = currentLayer.size.width * constrainedScale;
        const newHeight = currentLayer.size.height * constrainedScale;
        
        // Check boundaries
        const maxWidth = canvasWidth - currentLayer.position.x;
        const maxHeight = canvasHeight - currentLayer.position.y;
        const finalWidth = Math.min(newWidth, maxWidth);
        const finalHeight = Math.min(newHeight, maxHeight);
        
        // Update layer size in state
        setLayers(prev => prev.map(layer => {
          if (layer.id === layerId) {
            return {
              ...layer,
              size: { width: finalWidth, height: finalHeight }
            };
          }
          return layer;
        }));
        
        // Reset scale value to 1 for next pinch
        if (scaleValues[layerId]) {
          scaleValues[layerId].setValue(1);
        }
      }
    };
  }, [layers, canvasWidth, canvasHeight, scaleValues]);



  // Add text layer
  const addTextLayer = useCallback(() => {
    if (newText.trim()) {
      const newLayer: Layer = {
        id: generateId(),
        type: 'text',
        content: newText,
        position: { x: canvasWidth / 2 - 50, y: canvasHeight / 2 - 20 },
        size: { width: 100, height: 40 },
        rotation: 0,
        zIndex: layers.length,
        style: {
          fontSize: 16,
          color: '#FFFFFF',
          fontFamily: 'System',
          fontWeight: '400',
        },
      };
      setLayers(prev => [...prev, newLayer]);
      setNewText('');
      setShowTextModal(false);
    }
  }, [newText, canvasWidth, canvasHeight, layers.length]);

  // Add image layer
  const addImageLayer = useCallback(() => {
    if (newImageUrl.trim()) {
      const newLayer: Layer = {
        id: generateId(),
        type: 'image',
        content: newImageUrl,
        position: { x: canvasWidth / 2 - 50, y: canvasHeight / 2 - 50 },
        size: { width: 100, height: 100 },
        rotation: 0,
        zIndex: layers.length,
      };
      setLayers(prev => [...prev, newLayer]);
      setNewImageUrl('');
      setShowImageModal(false);
    }
  }, [newImageUrl, canvasWidth, canvasHeight, layers.length]);

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Handle camera access
  const handleCameraAccess = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const options = {
        mediaType: 'photo' as const,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as const,
        saveToPhotos: false,
      };

      const result = await launchCamera(options);
      
      // User cancelled
      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      
      // Error occurred
      if (result.errorCode) {
        console.error('Camera error code:', result.errorCode);
        Alert.alert('Camera Error', result.errorMessage || 'Failed to access camera');
        return;
      }
      
      // Success - process image
      if (result.assets && result.assets[0] && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Camera image captured:', imageUri);
        addLogoLayerFromImage(imageUri);
      } else {
        console.warn('No image URI in camera result');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  // Handle gallery access
  const handleGalleryAccess = async () => {
    try {
      const options = {
        mediaType: 'photo' as const,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as const,
        selectionLimit: 1,
      };

      const result = await launchImageLibrary(options);
      
      // User cancelled
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      // Error occurred
      if (result.errorCode) {
        console.error('Gallery error code:', result.errorCode);
        Alert.alert('Gallery Error', result.errorMessage || 'Failed to access gallery');
        return;
      }
      
      // Success - process image
      if (result.assets && result.assets[0] && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Gallery image selected:', imageUri);
        addLogoLayerFromImage(imageUri);
      } else {
        console.warn('No image URI in gallery result');
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };

  // Add logo layer from image
  const addLogoLayerFromImage = useCallback((imageUri: string) => {
    try {
      const layerId = generateId();
      const newLayer: Layer = {
        id: layerId,
        type: 'logo',
        content: imageUri,
        position: { x: 20, y: 20 },
        size: { width: 80, height: 80 },
        rotation: 0,
        zIndex: layers.length,
        fieldType: 'logo',
      };
      
      // Initialize animated values for the new layer
      if (!layerAnimations[layerId]) {
        layerAnimations[layerId] = {
          x: new Animated.Value(20),
          y: new Animated.Value(20)
        };
      }
      
      if (!translationValues[layerId]) {
        translationValues[layerId] = {
          x: new Animated.Value(0),
          y: new Animated.Value(0)
        };
      }
      
      if (!scaleValues[layerId]) {
        scaleValues[layerId] = new Animated.Value(1);
      }
      
      setLayers(prev => [...prev, newLayer]);
      setShowLogoModal(false);
      console.log('✅ Logo layer added from image:', imageUri);
    } catch (error) {
      console.error('❌ Error adding logo layer:', error);
      Alert.alert('Error', 'Failed to add logo. Please try again.');
    }
  }, [layers.length, layerAnimations, translationValues, scaleValues]);

  // Add logo layer (fallback)
  const addLogoLayer = useCallback(() => {
    const newLayer: Layer = {
      id: generateId(),
      type: 'logo',
      content: 'https://via.placeholder.com/80x80/667eea/ffffff?text=LOGO',
      position: { x: 20, y: 20 },
      size: { width: 80, height: 80 },
      rotation: 0,
      zIndex: layers.length,
    };
    setLayers(prev => [...prev, newLayer]);
  }, [layers.length]);

  // Apply template to poster
  const applyTemplate = useCallback((templateType: string) => {
    // Check if a frame is already selected
    if (selectedFrame) {
      setShowRemoveFrameWarningModal(true);
      return; // Don't apply template if frame is selected
    }
    
    setSelectedTemplate(templateType);
    setShowTemplatesModal(false);
    
    // Clear original layers when changing templates so new positions can be stored
    setOriginalLayers([]);
    console.log('🔄 [APPLY TEMPLATE] Cleared original layers for new template:', templateType);
    
    // Apply different poster layouts and styles based on template
    setLayers(prev => prev.map(layer => {
      if (layer.fieldType === 'footerBackground') {
        // Template-based footer styles
        const templateStyles = {
          'business': { backgroundColor: 'rgba(102, 126, 234, 0.9)' },
          'event': { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
          'restaurant': { backgroundColor: 'rgba(34, 197, 94, 0.9)' },
          'fashion': { backgroundColor: 'rgba(236, 72, 153, 0.9)' },
          'real-estate': { backgroundColor: 'rgba(245, 158, 11, 0.9)' },
          'education': { backgroundColor: 'rgba(59, 130, 246, 0.9)' },
          'healthcare': { backgroundColor: 'rgba(6, 182, 212, 0.9)' },
          'fitness': { backgroundColor: 'rgba(168, 85, 247, 0.9)' },
          'wedding': { backgroundColor: 'rgba(212, 175, 55, 0.9)' },
          'birthday': { backgroundColor: 'rgba(251, 146, 60, 0.9)' },
          'corporate': { backgroundColor: 'rgba(30, 41, 59, 0.95)' },
          'creative': { backgroundColor: 'rgba(147, 51, 234, 0.9)' },
          'minimal': { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
          'luxury': { backgroundColor: 'rgba(212, 175, 55, 0.95)' },
          'modern': { backgroundColor: 'rgba(102, 126, 234, 0.8)' },
          'vintage': { backgroundColor: 'rgba(120, 113, 108, 0.9)' },
          'retro': { backgroundColor: 'rgba(251, 146, 60, 0.9)' },
          'elegant': { backgroundColor: 'rgba(139, 69, 19, 0.9)' },
          'bold': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
          'tech': { backgroundColor: 'rgba(30, 41, 59, 0.95)' },
          'nature': { backgroundColor: 'rgba(34, 197, 94, 0.8)' },
          'ocean': { backgroundColor: 'rgba(6, 182, 212, 0.9)' },
          'sunset': { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
          'cosmic': { backgroundColor: 'rgba(30, 41, 59, 0.95)' },
          'artistic': { backgroundColor: 'rgba(168, 85, 247, 0.9)' },
          'sport': { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
          'warm': { backgroundColor: 'rgba(245, 158, 11, 0.9)' },
          'cool': { backgroundColor: 'rgba(59, 130, 246, 0.9)' },
        };
        
        return {
          ...layer,
          style: {
            ...layer.style,
            ...templateStyles[templateType as keyof typeof templateStyles] || templateStyles['business']
          }
        };
      }
      
      // Update text colors for footer elements based on template
      if (['footerCompanyName', 'phone', 'email', 'website', 'category', 'address', 'services'].includes(layer.fieldType || '')) {
        const textColors = {
          'business': '#ffffff',
          'event': '#ffffff',
          'restaurant': '#ffffff',
          'fashion': '#ffffff',
          'real-estate': '#ffffff',
          'education': '#ffffff',
          'healthcare': '#ffffff',
          'fitness': '#ffffff',
          'wedding': '#000000',
          'birthday': '#ffffff',
          'corporate': '#ffffff',
          'creative': '#ffffff',
          'minimal': '#1f2937',
          'luxury': '#000000',
          'modern': '#ffffff',
          'vintage': '#ffffff',
          'retro': '#ffffff',
          'elegant': '#ffffff',
          'bold': '#ffffff',
          'tech': '#00ff00',
          'nature': '#ffffff',
          'ocean': '#ffffff',
          'sunset': '#ffffff',
          'cosmic': '#ffffff',
          'artistic': '#ffffff',
          'sport': '#ffffff',
          'warm': '#ffffff',
          'cool': '#ffffff',
        };
        
        return {
          ...layer,
          style: {
            ...layer.style,
            color: textColors[templateType as keyof typeof textColors] || textColors['business']
          }
        };
      }
      
      return layer;
    }));
  }, [selectedFrame]);

  // Update layer position
  const updateLayerPosition = useCallback((layerId: string, position: { x: number; y: number }) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, position } : layer
    ));
  }, []);

  // Update layer style
  const updateLayerStyle = useCallback((layerId: string, style: Partial<NonNullable<Layer['style']>>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, style: { ...layer.style, ...style } } : layer
    ));
  }, []);

  // Delete layer
  const deleteLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    setSelectedLayer(null);
  }, []);

  // Confirm delete element
  const confirmDeleteElement = useCallback(() => {
    if (selectedLayer) {
      deleteLayer(selectedLayer);
      setShowDeleteElementModal(false);
    }
  }, [selectedLayer, deleteLayer]);

  // Apply frame
  const applyFrame = useCallback((frame: Frame) => {
    setApplyingFrame(true);
    
    // ONLY store original layers if they haven't been stored yet
    // This ensures we always return to the TRUE original template positions
    if (originalLayers.length === 0) {
      const clonedLayers = layers.map(layer => ({
        ...layer,
        position: { ...layer.position },
        size: { ...layer.size },
        style: { ...layer.style }
      }));
      setOriginalLayers(clonedLayers);
      setOriginalTemplate(selectedTemplate);
      console.log('📦 [FIRST TIME] Stored original layers for restoration:', clonedLayers.length, 'layers');
    } else {
      console.log('✅ [ALREADY STORED] Using existing original layers, not overwriting');
    }
    
    setSelectedFrame(frame);
    setShowFrameSelector(false);
    
    // Generate content from business profile
    if (selectedBusinessProfile) {
      const content = mapBusinessProfileToFrameContent(selectedBusinessProfile);
      setFrameContent(content);
      
      // Generate layers from frame
      const frameLayers = generateLayersFromFrame(frame, content, canvasWidth, canvasHeight);
      
      console.log('🎨 Applying frame with', frameLayers.length, 'layers');
      
      // Initialize animated values for all new frame layers to make them moveable
      frameLayers.forEach(layer => {
        // Initialize position animation values
        if (!layerAnimations[layer.id]) {
          layerAnimations[layer.id] = {
            x: new Animated.Value(layer.position.x),
            y: new Animated.Value(layer.position.y)
          };
          console.log(`✅ Initialized position animations for layer ${layer.id}`);
        } else {
          // Update existing animation values
          layerAnimations[layer.id].x.setValue(layer.position.x);
          layerAnimations[layer.id].y.setValue(layer.position.y);
          console.log(`♻️ Updated position animations for layer ${layer.id}`);
        }
        
        // Initialize translation values for dragging
        if (!translationValues[layer.id]) {
          translationValues[layer.id] = {
            x: new Animated.Value(0),
            y: new Animated.Value(0)
          };
          console.log(`✅ Initialized translation values for layer ${layer.id}`);
        } else {
          // Reset translation values
          translationValues[layer.id].x.setValue(0);
          translationValues[layer.id].y.setValue(0);
        }
        
        // Initialize scale values for pinch gestures
        if (!scaleValues[layer.id]) {
          scaleValues[layer.id] = new Animated.Value(1);
          console.log(`✅ Initialized scale values for layer ${layer.id}`);
        } else {
          scaleValues[layer.id].setValue(1);
        }
      });
      
      // Replace existing layers with frame layers
      setLayers(frameLayers);
      
      // Make all frame-generated content visible
      const frameFieldTypes = frame.placeholders.map(p => p.key);
      setVisibleFields(prev => {
        const newVisibleFields = { ...prev };
        frameFieldTypes.forEach(fieldType => {
          newVisibleFields[fieldType] = true;
        });
        return newVisibleFields;
      });
      
      console.log('✨ Frame applied successfully with moveable layers');
    }
    
    // Hide loading after a short delay
    setTimeout(() => {
      setApplyingFrame(false);
    }, 500);
  }, [selectedBusinessProfile, canvasWidth, canvasHeight, layers, layerAnimations, translationValues, scaleValues, selectedTemplate]);

  // Apply font style
  const applyFontStyle = useCallback((fontFamily: string) => {
    const actualFontFamily = getFontFamily(fontFamily);
    setLayers(prev => prev.map(layer => 
      layer.type === 'text' 
        ? { ...layer, style: { ...layer.style, fontFamily: actualFontFamily } }
        : layer
    ));
    setShowFontStyleModal(false);
  }, []);

  // Render layer
  const renderLayer = useCallback((layer: Layer) => {
    const isSelected = selectedLayer === layer.id;
    
    // Check if layer should be visible based on field type
    if (layer.fieldType && !visibleFields[layer.fieldType]) {
      return null;
    }
    
    // Initialize animated values for this layer if they don't exist
    if (!layerAnimations[layer.id]) {
      layerAnimations[layer.id] = {
        x: new Animated.Value(layer.position.x),
        y: new Animated.Value(layer.position.y)
      };
    }
    
    // Initialize translation values for this layer if they don't exist
    if (!translationValues[layer.id]) {
      translationValues[layer.id] = {
        x: new Animated.Value(0),
        y: new Animated.Value(0)
      };
    }

    const layerStyle = {
      position: 'absolute' as const,
      width: layer.size.width,
      height: layer.size.height,
      zIndex: layer.zIndex,
      transform: [
        { translateX: layerAnimations[layer.id].x },
        { translateY: layerAnimations[layer.id].y },
        { rotate: `${layer.rotation}deg` }
      ],
    };

    // Text layer style without fixed dimensions
    const textLayerStyle = {
      position: 'absolute' as const,
      zIndex: layer.zIndex,
      transform: [
        { translateX: layerAnimations[layer.id].x },
        { translateY: layerAnimations[layer.id].y },
        { rotate: `${layer.rotation}deg` }
      ],
    };

    const handleLayerPress = () => {
      setSelectedLayer(layer.id);
    };

    switch (layer.type) {
      case 'text':
        // Special handling for footer background
        if (layer.content === '' && layer.fieldType === 'footerBackground') {
          const gradientColors = getOmbreColors(layer.style?.backgroundColor as string | undefined);
          return (
            <Animated.View
              key={layer.id}
              style={[
                styles.layer,
                {
                  position: 'absolute',
                  width: layer.size.width,
                  height: layer.size.height,
                  zIndex: layer.zIndex,
                  borderRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  transform: [
                    { translateX: layerAnimations[layer.id].x },
                    { translateY: layerAnimations[layer.id].y }
                  ],
                }
              ]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              />
            </Animated.View>
          );
        }
        
        return (
          <Animated.View
            key={layer.id}
            style={[
              textLayerStyle,
              isSelected && styles.selectedLayer,
              draggedLayer === layer.id && styles.draggedLayer,
              draggedLayer === layer.id && {
                transform: [
                  { translateX: Animated.add(layerAnimations[layer.id].x, translationValues[layer.id].x) },
                  { translateY: Animated.add(layerAnimations[layer.id].y, translationValues[layer.id].y) },
                  { rotate: `${layer.rotation}deg` }
                ]
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleLayerPress}
              style={{ alignSelf: 'flex-start' }}
            >
              <Text style={{
                fontSize: layer.style?.fontSize,
                color: layer.style?.color,
                fontFamily: layer.style?.fontFamily,
                fontWeight: layer.style?.fontWeight as any,
                padding: 0,
                margin: 0,
              }}>
                {layer.content}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 'image':
      case 'logo':
        return (
          <Animated.View
            style={[
              styles.layer,
              layerStyle,
              isSelected && styles.selectedLayer,
              isSelected && layer.type === 'logo' && styles.selectedLayerImage,
              draggedLayer === layer.id && styles.draggedLayer,
              draggedLayer === layer.id && {
                transform: [
                  { translateX: Animated.add(layerAnimations[layer.id].x, translationValues[layer.id].x) },
                  { translateY: Animated.add(layerAnimations[layer.id].y, translationValues[layer.id].y) },
                  { rotate: `${layer.rotation}deg` }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.layerTouchable}
              onPress={handleLayerPress}
            >
              <Image
                source={{ uri: layer.content }}
                style={styles.layerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  }, [selectedLayer, visibleFields, draggedLayer, layerAnimations, translationValues]);

  // Render business profile selection item
  const renderProfileItem = ({ item }: { item: BusinessProfile }) => (
    <TouchableOpacity
      style={themeStyles.profileItem}
      onPress={() => handleProfileSelection(item)}
    >
      <View style={styles.profileItemContent}>
        {item.companyLogo || item.logo ? (
          <Image
            source={{ uri: item.companyLogo || item.logo }}
            style={themeStyles.profileLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={themeStyles.profileLogoPlaceholder}>
            <Icon name="business" size={dynamicModerateScale(16)} color="#667eea" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={themeStyles.profileName}>{item.name}</Text>
          <Text style={themeStyles.profileCategory}>{item.category}</Text>
          <Text style={themeStyles.profileDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={dynamicModerateScale(16)} color="#666666" />
    </TouchableOpacity>
  );

  return (
    <Animated.View 
      style={[
        themeStyles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Professional Header */}
      <View
        style={[styles.header, { 
          paddingTop: insets.top + (isUltraSmallScreen ? 2 : isSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm),
          backgroundColor: theme?.colors?.surface || '#ffffff'
        }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={getResponsiveIconSize()} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
        </View>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={async () => {
            // Check subscription status first
            if (!isSubscribed) {
              console.log('User is not subscribed - showing premium modal');
              setShowPremiumModal(true);
              return;
            }

            // Deselect any selected or dragged layers so borders don't appear in preview
            setSelectedLayer(null);
            setDraggedLayer(null);
            // Allow a brief tick for UI to update before capture
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Test capture first
            console.log('=== TESTING VIEWSHOT CAPTURE ===');
            console.log('Canvas dimensions - Hidden:', { width: screenWidth * 0.98, height: screenHeight * 0.65 });
            console.log('Canvas dimensions - Visible:', { width: screenWidth * 0.98, height: screenHeight * 0.65 });
            console.log('Layers count:', layers.length);
            console.log('Selected frame:', selectedFrame?.id);
            console.log('Selected template:', selectedTemplate);
            try {
              if (posterRef.current && posterRef.current.capture) {
                console.log('Testing capture...');
                const testUri = await posterRef.current.capture();
                console.log('Test capture result:', testUri);
                console.log('Test URI type:', typeof testUri);
                console.log('Test URI length:', testUri?.length);
              } else {
                console.log('ViewShot not available for testing');
              }
            } catch (testError) {
              console.error('Test capture failed:', testError);
            }
            console.log('=== END TEST ===');
            
            // Original capture logic
            console.log('Next button pressed - starting capture process');
            console.log('Poster ref available:', !!posterRef.current);
            console.log('Poster ref capture method available:', !!posterRef.current?.capture);
            console.log('Current layers state:', layers.length);
            console.log('Visible fields:', visibleFields);
            
            // Capture current animated positions before taking ViewShot
            const newCurrentPositions: { [key: string]: { x: number; y: number } } = {};
            layers.forEach(layer => {
              if (layerAnimations[layer.id] && translationValues[layer.id]) {
                const baseX = (layerAnimations[layer.id].x as any)._value || 0;
                const translationX = (translationValues[layer.id].x as any)._value || 0;
                const baseY = (layerAnimations[layer.id].y as any)._value || 0;
                const translationY = (translationValues[layer.id].y as any)._value || 0;
                
                newCurrentPositions[layer.id] = {
                  x: baseX + translationX,
                  y: baseY + translationY
                };
                
                console.log(`Layer ${layer.id} current position:`, newCurrentPositions[layer.id]);
              }
            });
            
            // Update both state and ref with current positions
            setCurrentPositions(newCurrentPositions);
            currentPositionsRef.current = newCurrentPositions;
            
            // Log current layer positions for debugging
            console.log('Current layer positions:', newCurrentPositions);
            
            try {
              if (visibleCanvasRef.current && visibleCanvasRef.current.capture) {
                console.log('Attempting to capture visible canvas...');
                
                // Set capturing state to true to show watermark during capture
                setIsCapturing(true);
                
                // Add a delay to ensure the canvas is fully rendered with watermark
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Capture the visible canvas as an image
                const uri = await visibleCanvasRef.current.capture();
                console.log('Visible canvas captured successfully!');
                console.log('Captured URI length:', uri?.length);
                console.log('Captured URI starts with:', uri?.substring(0, 50));
                
                // Set capturing state back to false
                setIsCapturing(false);
                
                // Navigate to preview with the captured image and subscription status
                (navigation as any).navigate('PosterPreview', {
                  capturedImageUri: uri,
                  selectedImage: selectedImage,
                  selectedLanguage: selectedLanguage,
                  selectedTemplateId: selectedTemplateId,
                  selectedBusinessProfile: selectedBusinessProfile,
                  isSubscribed: isSubscribed, // Pass subscription status to preview
                });
              } else {
                console.log('Poster ref not available, using fallback');
                // Set capturing state back to false
                setIsCapturing(false);
                // Fallback to original image if capture fails
                (navigation as any).navigate('PosterPreview', {
                  capturedImageUri: selectedImage.uri,
                  selectedImage: selectedImage,
                  selectedLanguage: selectedLanguage,
                  selectedTemplateId: selectedTemplateId,
                  selectedBusinessProfile: selectedBusinessProfile,
                  isSubscribed: isSubscribed, // Pass subscription status to preview
                });
              }
            } catch (error) {
              console.error('Error capturing poster:', error);
              console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
              // Set capturing state back to false
              setIsCapturing(false);
              // Fallback to original image if capture fails
              (navigation as any).navigate('PosterPreview', {
                capturedImageUri: selectedImage.uri,
                selectedImage: selectedImage,
                selectedLanguage: selectedLanguage,
                selectedTemplateId: selectedTemplateId,
                selectedBusinessProfile: selectedBusinessProfile,
                isSubscribed: isSubscribed, // Pass subscription status to preview
              });
            }
          }}
        >
          <Icon name="arrow-forward" size={getResponsiveIconSize()} color="#333333" />
        </TouchableOpacity>
      </View>

                        {/* Canvas Container */}
          <View style={styles.canvasContainer}>
            {/* ViewShot wrapper for capturing the visible canvas */}
            <ViewShot
              ref={visibleCanvasRef}
              style={[styles.viewShotContainer, { width: canvasWidth, height: canvasHeight, backgroundColor: 'transparent' }]}
              options={{
                format: 'png',
                quality: 1.0,
                result: 'tmpfile'
              }}
            >
              {/* Visible Canvas for editing */}
              <TouchableWithoutFeedback onPress={() => setSelectedLayer(null)}>
              <View style={[
                styles.canvas,
                !selectedFrame && selectedTemplate !== 'business' && styles.canvasWithFrame,
                !selectedFrame && selectedTemplate === 'business' && styles.businessFrame,
                !selectedFrame && selectedTemplate === 'event' && styles.eventFrame,
                !selectedFrame && selectedTemplate === 'restaurant' && styles.restaurantFrame,
                !selectedFrame && selectedTemplate === 'fashion' && styles.fashionFrame,
                !selectedFrame && selectedTemplate === 'real-estate' && styles.realEstateFrame,
                !selectedFrame && selectedTemplate === 'education' && styles.educationFrame,
                !selectedFrame && selectedTemplate === 'healthcare' && styles.healthcareFrame,
                !selectedFrame && selectedTemplate === 'fitness' && styles.fitnessFrame,
                !selectedFrame && selectedTemplate === 'wedding' && styles.weddingFrame,
                !selectedFrame && selectedTemplate === 'birthday' && styles.birthdayFrame,
                !selectedFrame && selectedTemplate === 'corporate' && styles.corporateFrame,
                !selectedFrame && selectedTemplate === 'creative' && styles.creativeFrame,
                !selectedFrame && selectedTemplate === 'minimal' && styles.minimalFrame,
                !selectedFrame && selectedTemplate === 'luxury' && styles.luxuryFrame,
                !selectedFrame && selectedTemplate === 'modern' && styles.modernFrame,
                !selectedFrame && selectedTemplate === 'vintage' && styles.vintageFrame,
                !selectedFrame && selectedTemplate === 'retro' && styles.retroFrame,
                !selectedFrame && selectedTemplate === 'elegant' && styles.elegantFrame,
                !selectedFrame && selectedTemplate === 'bold' && styles.boldFrame,
                !selectedFrame && selectedTemplate === 'tech' && styles.techFrame,
                !selectedFrame && selectedTemplate === 'nature' && styles.natureFrame,
                !selectedFrame && selectedTemplate === 'ocean' && styles.oceanFrame,
                !selectedFrame && selectedTemplate === 'sunset' && styles.sunsetFrame,
                !selectedFrame && selectedTemplate === 'cosmic' && styles.cosmicFrame,
                !selectedFrame && selectedTemplate === 'artistic' && styles.artisticFrame,
                !selectedFrame && selectedTemplate === 'sport' && styles.sportFrame,
                !selectedFrame && selectedTemplate === 'warm' && styles.warmFrame,
                !selectedFrame && selectedTemplate === 'cool' && styles.coolFrame,
                { 
                  width: canvasWidth, 
                  height: canvasHeight,
                  backgroundColor: selectedFrame ? 'transparent' : '#ffffff' // MUST BE LAST: Make transparent when frame is applied!
                },
              ]}
>
          {/* Background Image (always show the poster image) */}
          <View style={styles.backgroundImageContainer}>
            <Image
              source={{ uri: getHighQualityImageUrl(selectedImage.uri), cache: 'force-cache' }}
              style={styles.backgroundImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Frame Overlay (when frame is selected) - rendered FIRST so layers appear on top */}
          {selectedFrame && (
            <View 
              style={styles.frameOverlayContainer} 
              pointerEvents="none"
            >
              <Image
                source={getFrameBackgroundSource(selectedFrame)}
                style={styles.frameOverlayImage}
                resizeMode="stretch"
              />
            </View>
          )}
          
          {/* Frame Application Indicator */}
          {applyingFrame && (
            <View style={styles.frameApplicationOverlay}>
              <View style={styles.frameApplicationIndicator}>
                <Text style={styles.frameApplicationText}>Applying Frame...</Text>
              </View>
            </View>
          )}
          
          {/* Layers - rendered AFTER frame so they appear on top */}
          {layers.map((layer) => (
            <PinchGestureHandler
              key={layer.id}
              onGestureEvent={onPinchGestureEvent(layer.id)}
              onHandlerStateChange={onPinchHandlerStateChange(layer.id)}
            >
              <Animated.View>
                <PanGestureHandler
                  onGestureEvent={onPanGestureEvent(layer.id)}
                  onHandlerStateChange={onHandlerStateChange(layer.id)}
                >
                  <Animated.View>
                    {renderLayer(layer)}
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          ))}
          
          {/* Watermark - Only shown during capture if user is not subscribed */}
          {isCapturing && <Watermark isSubscribed={checkPremiumAccess('poster_export')} />}
        </View>
              </TouchableWithoutFeedback>
            </ViewShot>
          
          
          {/* Instructions */}
          {layers.length === 0 && !loadingProfiles && (
            <View style={styles.instructionsContainer}>
              <Icon name="info" size={24} color="#667eea" />
              <Text style={styles.instructionsText}>
                {businessProfiles.length === 0 
                  ? 'No business profiles found. Please create a business profile first.'
                  : 'Business profile data has been applied to your poster'
                }
              </Text>
            </View>
          )}

          {/* Loading indicator */}
          {loadingProfiles && (
            <View style={styles.loadingContainer}>
              <Icon name="hourglass-empty" size={24} color="#667eea" />
              <Text style={styles.loadingText}>Loading business profiles...</Text>
            </View>
          )}
        </View>
        
        {/* Frame Selector */}
        {showFrameSelector && (
          <FrameSelector
            frames={frames}
            selectedFrameId={selectedFrame?.id || ''}
            onFrameSelect={applyFrame}
            onClose={() => setShowFrameSelector(false)}
          />
        )}
        
        {/* Controls Container - Fixed layout with responsive heights */}
        <View 
          style={[
            styles.controlsContainer, 
            { 
              paddingBottom: Math.max(insets.bottom + responsiveSpacing.md, responsiveSpacing.lg)
            }
          ]}
        >
        
        {/* Toolbar Below Canvas */}
        <View style={styles.bottomToolbar}>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarScrollContent}
          >
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setShowTextModal(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.toolbarButtonGradient}
              >
                <Icon name="text-fields" size={getResponsiveIconSize()} color="#ffffff" />
                <Text style={styles.toolbarButtonText}>Text</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setShowFontStyleModal(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.toolbarButtonGradient}
              >
                <Icon name="format-size" size={getResponsiveIconSize()} color="#ffffff" />
                <Text style={styles.toolbarButtonText}>Font</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {selectedFrame && (
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => {
                  // Remove frame directly without confirmation modal
                  console.log('🗑️ [REMOVE FRAME] Starting frame removal...');
                  
                  setSelectedFrame(null);
                  setFrameContent({});
                  
                  // Restore original layers and their positions
                  if (originalLayers.length > 0) {
                    console.log('🔄 [REMOVE FRAME] Restoring', originalLayers.length, 'layers to original positions');
                    
                    // Update animation values for all original layers
                    originalLayers.forEach(layer => {
                      // Update position animations
                      if (layerAnimations[layer.id]) {
                        layerAnimations[layer.id].x.setValue(layer.position.x);
                        layerAnimations[layer.id].y.setValue(layer.position.y);
                      } else {
                        layerAnimations[layer.id] = {
                          x: new Animated.Value(layer.position.x),
                          y: new Animated.Value(layer.position.y)
                        };
                      }
                      
                      // Reset translation values
                      if (translationValues[layer.id]) {
                        translationValues[layer.id].x.setValue(0);
                        translationValues[layer.id].y.setValue(0);
                      } else {
                        translationValues[layer.id] = {
                          x: new Animated.Value(0),
                          y: new Animated.Value(0)
                        };
                      }
                      
                      // Reset scale values
                      if (scaleValues[layer.id]) {
                        scaleValues[layer.id].setValue(1);
                      } else {
                        scaleValues[layer.id] = new Animated.Value(1);
                      }
                    });
                    
                    // Restore layers with their original positions
                    setLayers(originalLayers);
                    
                    // Restore original template
                    setSelectedTemplate(originalTemplate);
                    
                    console.log('✅ [REMOVE FRAME] Frame removed and original positions restored');
                  } else {
                    console.log('⚠️ [REMOVE FRAME] No original layers found');
                  }
                }}
              >
                <LinearGradient
                  colors={['#dc3545', '#c82333']}
                  style={styles.toolbarButtonGradient}
                >
                  <Icon name="delete" size={getResponsiveIconSize()} color="#ffffff" />
                  <Text style={styles.toolbarButtonText}>Remove Frame</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {selectedLayer && (
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => setShowDeleteElementModal(true)}
              >
                <LinearGradient
                  colors={['#ff4757', '#ff3742']}
                  style={styles.toolbarButtonGradient}
                >
                  <Icon name="delete" size={getResponsiveIconSize()} color="#ffffff" />
                  <Text style={styles.toolbarButtonText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
          </View>
        
        {/* Field Toggle Buttons */}
        <View style={styles.fieldToggleSection}>
          <View style={styles.fieldToggleHeader}>
            <Text style={styles.fieldToggleTitle}>Toggle Fields</Text>
            <Text style={styles.fieldToggleSubtitle}>Click to show/hide elements</Text>
          </View>
          <ScrollView 
            style={styles.fieldToggleContent} 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fieldToggleScrollContent}
          >
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.logo && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('logo')}
            >
              <Icon name="account-balance" size={getResponsiveIconSize()} color={visibleFields.logo ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.logo && styles.fieldToggleButtonTextActive]}>
                Logo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.companyName && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('companyName')}
            >
              <Icon name="title" size={getResponsiveIconSize()} color={visibleFields.companyName ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.companyName && styles.fieldToggleButtonTextActive]}>
                Company Name
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.footerBackground && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('footerBackground')}
            >
              <Icon name="format-color-fill" size={getResponsiveIconSize()} color={visibleFields.footerBackground ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.footerBackground && styles.fieldToggleButtonTextActive]}>
                Footer BG
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.phone && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('phone')}
            >
              <Icon name="call" size={getResponsiveIconSize()} color={visibleFields.phone ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.phone && styles.fieldToggleButtonTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.email && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('email')}
            >
              <Icon name="mail" size={getResponsiveIconSize()} color={visibleFields.email ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.email && styles.fieldToggleButtonTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.website && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('website')}
            >
              <Icon name="public" size={getResponsiveIconSize()} color={visibleFields.website ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.website && styles.fieldToggleButtonTextActive]}>
                Website
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.category && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('category')}
            >
              <Icon name="business-center" size={getResponsiveIconSize()} color={visibleFields.category ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.category && styles.fieldToggleButtonTextActive]}>
                Category
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.address && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('address')}
            >
              <Icon name="place" size={getResponsiveIconSize()} color={visibleFields.address ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.address && styles.fieldToggleButtonTextActive]}>
                Address
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldToggleButton, visibleFields.services && styles.fieldToggleButtonActive]}
              onPress={() => toggleFieldVisibility('services')}
            >
              <Icon name="handyman" size={getResponsiveIconSize()} color={visibleFields.services ? "#ffffff" : "#667eea"} />
              <Text style={[styles.fieldToggleButtonText, visibleFields.services && styles.fieldToggleButtonTextActive]}>
                Services
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Templates Section */}
        <View style={styles.templatesSection}>
          <View style={styles.templatesHeader}>
            <Text style={styles.templatesTitle}>Templates</Text>
            <Text style={styles.templatesSubtitle}>Choose a poster template design</Text>
          </View>
          <ScrollView 
            style={styles.templatesContent} 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.templatesScrollContent}
          >
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'business' && styles.templateButtonActive]}
              onPress={() => applyTemplate('business')}
            >
              <View style={[styles.templatePreview, styles.businessTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.businessTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'business' && styles.templateTextActive]}>
                Business
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'event' && styles.templateButtonActive]}
              onPress={() => applyTemplate('event')}
            >
              <View style={[styles.templatePreview, styles.eventTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.eventTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'event' && styles.templateTextActive]}>
                Event
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'restaurant' && styles.templateButtonActive]}
              onPress={() => applyTemplate('restaurant')}
            >
              <View style={[styles.templatePreview, styles.restaurantTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.restaurantTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'restaurant' && styles.templateTextActive]}>
                Restaurant
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'fashion' && styles.templateButtonActive]}
              onPress={() => applyTemplate('fashion')}
            >
              <View style={[styles.templatePreview, styles.fashionTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.fashionTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'fashion' && styles.templateTextActive]}>
                Fashion
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'real-estate' && styles.templateButtonActive]}
              onPress={() => applyTemplate('real-estate')}
            >
              <View style={[styles.templatePreview, styles.realEstateTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.realEstateTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'real-estate' && styles.templateTextActive]}>
                Real Estate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'education' && styles.templateButtonActive]}
              onPress={() => applyTemplate('education')}
            >
              <View style={[styles.templatePreview, styles.educationTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.educationTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'education' && styles.templateTextActive]}>
                Education
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'healthcare' && styles.templateButtonActive]}
              onPress={() => applyTemplate('healthcare')}
            >
              <View style={[styles.templatePreview, styles.healthcareTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.healthcareTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'healthcare' && styles.templateTextActive]}>
                Healthcare
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'fitness' && styles.templateButtonActive]}
              onPress={() => applyTemplate('fitness')}
            >
              <View style={[styles.templatePreview, styles.fitnessTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.fitnessTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'fitness' && styles.templateTextActive]}>
                Fitness
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'wedding' && styles.templateButtonActive]}
              onPress={() => applyTemplate('wedding')}
            >
              <View style={[styles.templatePreview, styles.weddingTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.weddingTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'wedding' && styles.templateTextActive]}>
                Wedding
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'birthday' && styles.templateButtonActive]}
              onPress={() => applyTemplate('birthday')}
            >
              <View style={[styles.templatePreview, styles.birthdayTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.birthdayTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'birthday' && styles.templateTextActive]}>
                Birthday
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'corporate' && styles.templateButtonActive]}
              onPress={() => applyTemplate('corporate')}
            >
              <View style={[styles.templatePreview, styles.corporateTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.corporateTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'corporate' && styles.templateTextActive]}>
                Corporate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'creative' && styles.templateButtonActive]}
              onPress={() => applyTemplate('creative')}
            >
              <View style={[styles.templatePreview, styles.creativeTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.creativeTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'creative' && styles.templateTextActive]}>
                Creative
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'minimal' && styles.templateButtonActive]}
              onPress={() => applyTemplate('minimal')}
            >
              <View style={[styles.templatePreview, styles.minimalTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.minimalTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'minimal' && styles.templateTextActive]}>
                Minimal
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'luxury' && styles.templateButtonActive]}
              onPress={() => applyTemplate('luxury')}
            >
              <View style={[styles.templatePreview, styles.luxuryTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.luxuryTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'luxury' && styles.templateTextActive]}>
                Luxury
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'modern' && styles.templateButtonActive]}
              onPress={() => applyTemplate('modern')}
            >
              <View style={[styles.templatePreview, styles.modernTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.modernTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'modern' && styles.templateTextActive]}>
                Modern
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'vintage' && styles.templateButtonActive]}
              onPress={() => applyTemplate('vintage')}
            >
              <View style={[styles.templatePreview, styles.vintageTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.vintageTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'vintage' && styles.templateTextActive]}>
                Vintage
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'retro' && styles.templateButtonActive]}
              onPress={() => applyTemplate('retro')}
            >
              <View style={[styles.templatePreview, styles.retroTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.retroTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'retro' && styles.templateTextActive]}>
                Retro
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'elegant' && styles.templateButtonActive]}
              onPress={() => applyTemplate('elegant')}
            >
              <View style={[styles.templatePreview, styles.elegantTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.elegantTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'elegant' && styles.templateTextActive]}>
                Elegant
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'bold' && styles.templateButtonActive]}
              onPress={() => applyTemplate('bold')}
            >
              <View style={[styles.templatePreview, styles.boldTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.boldTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'bold' && styles.templateTextActive]}>
                Bold
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'tech' && styles.templateButtonActive]}
              onPress={() => applyTemplate('tech')}
            >
              <View style={[styles.templatePreview, styles.techTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.techTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'tech' && styles.templateTextActive]}>
                Tech
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'nature' && styles.templateButtonActive]}
              onPress={() => applyTemplate('nature')}
            >
              <View style={[styles.templatePreview, styles.natureTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.natureTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'nature' && styles.templateTextActive]}>
                Nature
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'ocean' && styles.templateButtonActive]}
              onPress={() => applyTemplate('ocean')}
            >
              <View style={[styles.templatePreview, styles.oceanTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.oceanTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'ocean' && styles.templateTextActive]}>
                Ocean
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'sunset' && styles.templateButtonActive]}
              onPress={() => applyTemplate('sunset')}
            >
              <View style={[styles.templatePreview, styles.sunsetTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.sunsetTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'sunset' && styles.templateTextActive]}>
                Sunset
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'cosmic' && styles.templateButtonActive]}
              onPress={() => applyTemplate('cosmic')}
            >
              <View style={[styles.templatePreview, styles.cosmicTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.cosmicTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'cosmic' && styles.templateTextActive]}>
                Cosmic
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'artistic' && styles.templateButtonActive]}
              onPress={() => applyTemplate('artistic')}
            >
              <View style={[styles.templatePreview, styles.artisticTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.artisticTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'artistic' && styles.templateTextActive]}>
                Artistic
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'sport' && styles.templateButtonActive]}
              onPress={() => applyTemplate('sport')}
            >
              <View style={[styles.templatePreview, styles.sportTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.sportTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'sport' && styles.templateTextActive]}>
                Sport
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'warm' && styles.templateButtonActive]}
              onPress={() => applyTemplate('warm')}
            >
              <View style={[styles.templatePreview, styles.warmTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.warmTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'warm' && styles.templateTextActive]}>
                Warm
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, selectedTemplate === 'cool' && styles.templateButtonActive]}
              onPress={() => applyTemplate('cool')}
            >
              <View style={[styles.templatePreview, styles.coolTemplatePreview]}>
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewFooter, styles.coolTemplateStyle]} />
                </View>
              </View>
              <Text style={[styles.templateText, selectedTemplate === 'cool' && styles.templateTextActive]}>
                Cool
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Frames Section */}
        <View style={styles.templatesSection}>
          <View style={styles.templatesHeader}>
            <Text style={styles.templatesTitle}>Frames</Text>
          </View>
          <ScrollView 
            style={styles.templatesContent} 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.templatesScrollContent}
          >
            {frames.map((frame) => (
              <TouchableOpacity
                key={frame.id}
                style={[styles.templateButton, selectedFrame?.id === frame.id && styles.templateButtonActive]}
                onPress={() => applyFrame(frame)}
              >
                <View style={styles.templatePreview}>
                  <Image
                    source={frame.background}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        </View>

      {/* Business Profile Selection Modal */}
      <Modal
        visible={showProfileSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          // Prevent closing without selection - user must select a profile or go back
          Alert.alert(
            'Selection Required',
            'You must select a business profile to continue. If you want to go back, use the Cancel button.',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={themeStyles.modalOverlay}>
          <View style={themeStyles.modalContent}>
            <Text style={themeStyles.modalTitle}>Select Business Profile</Text>
            <FlatList
              data={businessProfiles}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item.id}
              style={styles.profileList}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, themeStyles.cancelButton]}
                onPress={() => {
                  setShowProfileSelectionModal(false);
                  navigation.goBack(); // Go back to previous screen if user cancels
                }}
              >
                <Text style={themeStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Text Modal */}
      <Modal
        visible={showTextModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTextModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Text</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter text..."
              placeholderTextColor="#999999"
              value={newText}
              onChangeText={setNewText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTextModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addTextLayer}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Image</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter image URL..."
              placeholderTextColor="#999999"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addImageLayer}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Logo Modal */}
      <Modal
        visible={showLogoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoModalContent}>
            <View style={styles.logoModalHeader}>
              <Text style={styles.logoModalTitle}>Add Your Logo</Text>
              <Text style={styles.logoModalSubtitle}>Choose how you'd like to add your logo to the poster</Text>
            </View>
            
            <View style={styles.logoOptionsContainer}>
              <TouchableOpacity
                style={styles.logoOption}
                onPress={() => {
                  setShowLogoModal(false);
                  handleCameraAccess();
                }}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.logoOptionGradient}
                >
                  <Icon name="camera-alt" size={32} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.logoOptionTitle}>Take Photo</Text>

              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.logoOption}
                onPress={() => {
                  setShowLogoModal(false);
                  handleGalleryAccess();
                }}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.logoOptionGradient}
                >
                  <Icon name="photo-library" size={32} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.logoOptionTitle}>Choose from Gallery</Text>
                
              </TouchableOpacity>
              

            </View>
            
            <TouchableOpacity
              style={styles.logoModalCloseButton}
              onPress={() => setShowLogoModal(false)}
            >
              <Text style={styles.logoModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      {/* Font Style Modal */}
      <Modal
        visible={showFontStyleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFontStyleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fontModalContent}>
            <Text style={styles.modalTitle}>Choose Font Style</Text>
            <Text style={styles.modalSubtitle}>Select a font style for your text</Text>
            
            <ScrollView 
              style={styles.fontStyleModalContent} 
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.footerStylesModalGrid}>
                {/* System Fonts */}
                <TouchableOpacity
                  style={styles.footerStyleModalButton}
                  onPress={() => applyFontStyle(SYSTEM_FONTS.default)}
                >
                  <Text style={[styles.footerStyleModalText, { fontFamily: SYSTEM_FONTS.default }]}>Aa</Text>
                  <Text style={styles.fontStyleModalTitle}>System</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.footerStyleModalButton}
                  onPress={() => applyFontStyle(SYSTEM_FONTS.serif)}
                >
                  <Text style={[styles.footerStyleModalText, { fontFamily: SYSTEM_FONTS.serif }]}>Aa</Text>
                  <Text style={styles.fontStyleModalTitle}>Serif</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.footerStyleModalButton}
                  onPress={() => applyFontStyle(SYSTEM_FONTS.monospace)}
                >
                  <Text style={[styles.footerStyleModalText, { fontFamily: SYSTEM_FONTS.monospace }]}>Aa</Text>
                  <Text style={styles.fontStyleModalTitle}>Monospace</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.footerStyleModalButton}
                  onPress={() => applyFontStyle(SYSTEM_FONTS.cursive)}
                >
                  <Text style={[styles.footerStyleModalText, { fontFamily: SYSTEM_FONTS.cursive }]}>Aa</Text>
                  <Text style={styles.fontStyleModalTitle}>Cursive</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.footerStyleModalButton}
                  onPress={() => applyFontStyle(SYSTEM_FONTS.fantasy)}
                >
                  <Text style={[styles.footerStyleModalText, { fontFamily: SYSTEM_FONTS.fantasy }]}>Aa</Text>
                  <Text style={styles.fontStyleModalTitle}>Fantasy</Text>
                </TouchableOpacity>
                
                {/* Google Fonts - Sans-serif */}
                {getFontsByCategory('sans-serif').slice(0, 5).map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={styles.footerStyleModalButton}
                    onPress={() => applyFontStyle(font.name)}
                  >
                    <Text style={[styles.footerStyleModalText, { fontFamily: getFontFamily(font.name) }]}>Aa</Text>
                    <Text style={styles.fontStyleModalTitle}>{font.displayName}</Text>
                  </TouchableOpacity>
                ))}
                
                {/* Google Fonts - Serif */}
                {getFontsByCategory('serif').slice(0, 3).map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={styles.footerStyleModalButton}
                    onPress={() => applyFontStyle(font.name)}
                  >
                    <Text style={[styles.footerStyleModalText, { fontFamily: getFontFamily(font.name) }]}>Aa</Text>
                    <Text style={styles.fontStyleModalTitle}>{font.displayName}</Text>
                  </TouchableOpacity>
                ))}
                
                {/* Google Fonts - Display */}
                {getFontsByCategory('display').slice(0, 3).map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={styles.footerStyleModalButton}
                    onPress={() => applyFontStyle(font.name)}
                  >
                    <Text style={[styles.footerStyleModalText, { fontFamily: getFontFamily(font.name) }]}>Aa</Text>
                    <Text style={styles.fontStyleModalTitle}>{font.displayName}</Text>
                  </TouchableOpacity>
                ))}
                
                {/* Google Fonts - Handwriting */}
                {getFontsByCategory('handwriting').slice(0, 3).map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={styles.footerStyleModalButton}
                    onPress={() => applyFontStyle(font.name)}
                  >
                    <Text style={[styles.footerStyleModalText, { fontFamily: getFontFamily(font.name) }]}>Aa</Text>
                    <Text style={styles.fontStyleModalTitle}>{font.displayName}</Text>
                  </TouchableOpacity>
                ))}
                
                {/* Google Fonts - Monospace */}
                {getFontsByCategory('monospace').slice(0, 2).map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={styles.footerStyleModalButton}
                    onPress={() => applyFontStyle(font.name)}
                  >
                    <Text style={[styles.footerStyleModalText, { fontFamily: getFontFamily(font.name) }]}>Aa</Text>
                    <Text style={styles.fontStyleModalTitle}>{font.displayName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFontStyleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Frame Confirmation Modal - DISABLED: Direct removal without confirmation */}
      {/* 
      <Modal
        visible={showRemoveFrameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveFrameModal(false)}
      >
        <View style={[styles.modalOverlay, { paddingHorizontal: isLandscape ? (isTablet ? responsiveSpacing.lg : responsiveSpacing.md) : (isUltraSmallScreen ? responsiveSpacing.sm : responsiveSpacing.md) }]}>
          ... modal content ...
        </View>
      </Modal>
      */}

      {/* Frame Warning Modal - Responsive across all screen sizes */}
      <Modal
        visible={showRemoveFrameWarningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveFrameWarningModal(false)}
      >
        <View style={[styles.modalOverlay, { paddingHorizontal: isTablet ? responsiveSpacing.xl : isLandscape ? responsiveSpacing.lg : responsiveSpacing.md }]}>
          <View style={[
            themeStyles.modalContent,
            {
              width: isTablet 
                ? screenWidth * 0.5 
                : isLandscape 
                  ? screenWidth * 0.6 
                  : isUltraSmallScreen 
                    ? screenWidth * 0.92 
                    : isSmallScreen 
                      ? screenWidth * 0.9 
                      : screenWidth * 0.85,
              maxHeight: isTablet 
                ? screenHeight * 0.5 
                : isLandscape 
                  ? screenHeight * 0.5 
                  : screenHeight * 0.4,
            }
          ]}>
            <View style={{ alignItems: 'center', marginBottom: isTablet ? responsiveSpacing.lg : responsiveSpacing.md }}>
              <View style={{ 
                width: isTablet ? 70 : isLandscape ? 60 : isUltraSmallScreen ? 50 : 60, 
                height: isTablet ? 70 : isLandscape ? 60 : isUltraSmallScreen ? 50 : 60, 
                borderRadius: isTablet ? 35 : isLandscape ? 30 : isUltraSmallScreen ? 25 : 30, 
                backgroundColor: '#fff8f0', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: isTablet ? responsiveSpacing.md : responsiveSpacing.sm
              }}>
                <Icon 
                  name="warning" 
                  size={isTablet ? 36 : isLandscape ? 32 : isUltraSmallScreen ? 24 : 32} 
                  color="#ff9800" 
                />
              </View>
              <Text style={[
                themeStyles.modalTitle, 
                { 
                  fontSize: isTablet ? 24 : isLandscape ? 20 : isUltraSmallScreen ? 18 : 20,
                  marginBottom: responsiveSpacing.sm,
                  textAlign: 'center'
                }
              ]}>
                Remove Frame First
              </Text>
              <Text style={[
                themeStyles.modalSubtitle, 
                { 
                  fontSize: isTablet ? 15 : isLandscape ? 13 : isUltraSmallScreen ? 12 : 14,
                  textAlign: 'center',
                  lineHeight: isTablet ? 22 : isLandscape ? 18 : isUltraSmallScreen ? 16 : 20,
                  paddingHorizontal: isTablet ? responsiveSpacing.md : responsiveSpacing.sm
                }
              ]}>
                Please remove the current frame before applying a new template. You can remove the frame by clicking the "Remove Frame" button.
              </Text>
            </View>
            <View style={[
              styles.modalButtons,
              {
                flexDirection: 'row',
                gap: isTablet ? responsiveSpacing.md : responsiveSpacing.sm
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: '#ff9800',
                    paddingVertical: isTablet ? 16 : isLandscape ? 14 : isUltraSmallScreen ? 12 : 14,
                    borderRadius: isTablet ? 12 : isLandscape ? 10 : isUltraSmallScreen ? 8 : 10,
                    marginHorizontal: 0
                  }
                ]}
                onPress={() => setShowRemoveFrameWarningModal(false)}
              >
                <Text style={[
                  styles.addButtonText,
                  {
                    fontSize: isTablet ? 16 : isLandscape ? 14 : isUltraSmallScreen ? 13 : 15
                  }
                ]}>
                  Got it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Element Confirmation Modal - Responsive across all screen sizes */}
      <Modal
        visible={showDeleteElementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteElementModal(false)}
        statusBarTranslucent={true}
      >
        <View style={[styles.modalOverlay, { paddingHorizontal: isTablet ? responsiveSpacing.xl : isLandscape ? responsiveSpacing.lg : responsiveSpacing.md }]}>
          <View style={[
            themeStyles.deleteModalContainer,
            {
              backgroundColor: theme.colors.surface,
              width: isTablet 
                ? screenWidth * 0.5 
                : isLandscape 
                  ? screenWidth * 0.6 
                  : isUltraSmallScreen 
                    ? screenWidth * 0.92 
                    : isSmallScreen 
                      ? screenWidth * 0.9 
                      : screenWidth * 0.85,
              maxWidth: isTablet ? 500 : 450,
              paddingHorizontal: isTablet ? responsiveSpacing.xl : isLandscape ? responsiveSpacing.lg : isUltraSmallScreen ? responsiveSpacing.md : responsiveSpacing.lg,
              paddingVertical: isTablet ? responsiveSpacing.xl : isLandscape ? responsiveSpacing.lg : isUltraSmallScreen ? responsiveSpacing.md : responsiveSpacing.lg,
            }
          ]}>
            <View style={themeStyles.deleteModalHeader}>
              <View style={[
                themeStyles.deleteIconContainer, 
                { 
                  backgroundColor: '#ff444420',
                  marginBottom: isTablet ? responsiveSpacing.md : responsiveSpacing.sm
                }
              ]}>
                <Icon 
                  name="warning" 
                  size={isTablet ? 36 : isLandscape ? 32 : isUltraSmallScreen ? 24 : 32} 
                  color="#ff4444" 
                />
              </View>
              <Text 
                style={[
                  themeStyles.deleteModalTitle, 
                  { 
                    color: theme.colors.text,
                    marginBottom: isTablet ? responsiveSpacing.sm : responsiveSpacing.xs
                  }
                ]}
              >
                Delete Element
              </Text>
              <TouchableOpacity 
                style={[
                  themeStyles.closeModalButton, 
                  { backgroundColor: theme.colors.inputBackground }
                ]}
                onPress={() => setShowDeleteElementModal(false)}
                activeOpacity={0.7}
              >
                <Icon 
                  name="close" 
                  size={isTablet ? 24 : isLandscape ? 22 : isUltraSmallScreen ? 18 : 20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={[
              themeStyles.deleteModalContent,
              {
                marginBottom: isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
                paddingHorizontal: isTablet ? responsiveSpacing.md : isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm
              }
            ]}>
              <Text style={[
                themeStyles.deleteModalMessage, 
                { 
                  color: theme.colors.text,
                  fontSize: isTablet ? 16 : isLandscape ? 15 : isUltraSmallScreen ? 13 : 15,
                  lineHeight: isTablet ? 24 : isLandscape ? 22 : isUltraSmallScreen ? 18 : 22,
                }
              ]}>
                Are you sure you want to delete this element? This action cannot be undone.
              </Text>
            </View>
            
            <View style={[
              themeStyles.deleteModalButtons,
              {
                gap: isTablet ? responsiveSpacing.md : isLandscape ? responsiveSpacing.sm : isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm
              }
            ]}>
              <TouchableOpacity 
                style={[
                  themeStyles.deleteModalCancelButton, 
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    paddingVertical: isTablet ? 16 : isLandscape ? 14 : isUltraSmallScreen ? 12 : 14,
                    borderRadius: isTablet ? 12 : isLandscape ? 10 : isUltraSmallScreen ? 8 : 10,
                  }
                ]}
                onPress={() => setShowDeleteElementModal(false)}
              >
                <Text style={[
                  themeStyles.deleteModalCancelText, 
                  { 
                    color: theme.colors.text,
                    fontSize: isTablet ? 17 : isLandscape ? 16 : isUltraSmallScreen ? 14 : 16,
                  }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  themeStyles.deleteModalDeleteButton, 
                  { 
                    backgroundColor: '#ff4444',
                    paddingVertical: isTablet ? 16 : isLandscape ? 14 : isUltraSmallScreen ? 12 : 14,
                    borderRadius: isTablet ? 12 : isLandscape ? 10 : isUltraSmallScreen ? 8 : 10,
                  }
                ]}
                onPress={confirmDeleteElement}
              >
                <Text style={[
                  themeStyles.deleteModalDeleteText,
                  {
                    fontSize: isTablet ? 17 : isLandscape ? 16 : isUltraSmallScreen ? 14 : 16,
                  }
                ]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Premium Template Modal */}
      <PremiumTemplateModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={async () => {
          setShowPremiumModal(false);
          await refreshSubscription();
          (navigation as any).navigate('Subscription');
        }}
        selectedTemplate={null}
      />

      {/* Connection Error Modal */}
      <Modal
        visible={showConnectionErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConnectionErrorModal(false);
          navigation.goBack();
        }}
      >
        <View style={[styles.modalOverlay, { paddingHorizontal: responsiveSpacing.md }]}>
          <View style={[
            themeStyles.modalContent,
            {
              width: isTablet 
                ? screenWidth * 0.5 
                : isLandscape 
                  ? screenWidth * 0.6 
                  : isUltraSmallScreen 
                    ? screenWidth * 0.92 
                    : isSmallScreen 
                      ? screenWidth * 0.9 
                      : screenWidth * 0.85,
              maxHeight: screenHeight * 0.4,
            }
          ]}>
            <View style={{ alignItems: 'center', marginBottom: responsiveSpacing.lg }}>
              <View style={{ 
                width: isTablet ? 70 : isUltraSmallScreen ? 50 : 60, 
                height: isTablet ? 70 : isUltraSmallScreen ? 50 : 60, 
                borderRadius: isTablet ? 35 : isUltraSmallScreen ? 25 : 30, 
                backgroundColor: '#fff0f0', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: responsiveSpacing.md
              }}>
                <Icon 
                  name="wifi-off" 
                  size={isTablet ? 36 : isUltraSmallScreen ? 24 : 32} 
                  color="#ff4444" 
                />
              </View>
              <Text style={[
                themeStyles.modalTitle, 
                { 
                  fontSize: isTablet ? 24 : isUltraSmallScreen ? 18 : 20,
                  marginBottom: responsiveSpacing.sm,
                  textAlign: 'center'
                }
              ]}>
                Connection Error
              </Text>
              <Text style={[
                themeStyles.modalSubtitle, 
                { 
                  fontSize: isTablet ? 15 : isUltraSmallScreen ? 12 : 14,
                  textAlign: 'center',
                  lineHeight: isTablet ? 22 : isUltraSmallScreen ? 16 : 20,
                  paddingHorizontal: responsiveSpacing.sm
                }
              ]}>
                Please check your internet connection and try again.
              </Text>
            </View>
            <View style={[
              styles.modalButtons,
              {
                flexDirection: 'row',
                gap: responsiveSpacing.sm
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: '#667eea',
                    paddingVertical: isTablet ? 16 : isUltraSmallScreen ? 12 : 14,
                    borderRadius: isTablet ? 12 : isUltraSmallScreen ? 8 : 10,
                    marginHorizontal: 0
                  }
                ]}
                onPress={() => {
                  setShowConnectionErrorModal(false);
                  fetchBusinessProfiles();
                }}
              >
                <Text style={[
                  styles.addButtonText,
                  {
                    fontSize: isTablet ? 16 : isUltraSmallScreen ? 13 : 15
                  }
                ]}>
                  Retry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  themeStyles.cancelButton,
                  {
                    flex: 1,
                    paddingVertical: isTablet ? 16 : isUltraSmallScreen ? 12 : 14,
                    borderRadius: isTablet ? 12 : isUltraSmallScreen ? 8 : 10,
                    marginHorizontal: 0
                  }
                ]}
                onPress={() => {
                  setShowConnectionErrorModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={[
                  themeStyles.cancelButtonText,
                  {
                    fontSize: isTablet ? 16 : isUltraSmallScreen ? 13 : 15
                  }
                ]}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isLandscape ? (isTablet ? responsiveSpacing.lg : responsiveSpacing.md) : (isUltraSmallScreen ? responsiveSpacing.xs : isSmallScreen ? responsiveSpacing.sm : responsiveSpacing.md),
    paddingVertical: isLandscape ? (isTablet ? responsiveSpacing.md : responsiveSpacing.sm) : (isUltraSmallScreen ? responsiveSpacing.xs : isSmallScreen ? responsiveSpacing.sm : responsiveSpacing.md),
    borderBottomWidth: 0,
    minHeight: isLandscape ? (isTablet ? 60 : 50) : (isUltraSmallScreen ? 44 : isSmallScreen ? 50 : isMediumScreen ? 55 : isLargeScreen ? 60 : 65),
  },
  backButton: {
    padding: getHeaderPadding(),
    borderRadius: isLandscape ? (isTablet ? 12 : 8) : (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : 8),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: getHeaderButtonSize(),
    minHeight: getHeaderButtonSize(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: isLandscape ? (isTablet ? 16 : 8) : (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 12 : 16),
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: getHeaderTitleSize(),
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: isLandscape ? (isTablet ? 2 : 1) : (isUltraSmallScreen ? 0 : isSmallScreen ? 1 : 2),
  },
  headerSubtitle: {
    fontSize: getHeaderSubtitleSize(),
    color: 'rgba(102, 102, 102, 0.8)',
    marginTop: isLandscape ? (isTablet ? 2 : 1) : (isUltraSmallScreen ? 0 : isSmallScreen ? 1 : 2),
    textAlign: 'center',
    lineHeight: isLandscape ? (isTablet ? 16 : 14) : (isUltraSmallScreen ? 12 : isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 15 : 16),
    includeFontPadding: false,
  },
  nextButton: {
    padding: getHeaderPadding(),
    borderRadius: isLandscape ? (isTablet ? 12 : 8) : (isUltraSmallScreen ? 4 : isSmallScreen ? 6 : 8),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: getHeaderButtonSize(),
    minHeight: getHeaderButtonSize(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: isLandscape ? (isTablet ? responsiveSpacing.md : responsiveSpacing.sm) : (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.sm),
    paddingBottom: isLandscape ? (isTablet ? responsiveSpacing.md : responsiveSpacing.sm) : (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.sm),
    marginBottom: isLandscape ? (isTablet ? responsiveSpacing.sm : responsiveSpacing.xs) : responsiveSpacing.xs,
    maxHeight: isLandscape 
      ? screenHeight * 0.65 
      : isTablet 
        ? screenHeight * 0.50
        : isUltraSmallScreen 
          ? screenHeight * 0.42 
          : isSmallScreen 
            ? screenHeight * 0.44 
            : screenHeight * 0.45,
  },
  controlsContainer: {
    flex: 0, // Don't use flex to prevent expansion
    paddingHorizontal: isLandscape ? (isTablet ? responsiveSpacing.lg : responsiveSpacing.md) : (isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.sm),
    paddingTop: responsiveSpacing.xs,
  },
  viewShotContainer: {
    // These will be set dynamically based on responsive dimensions
  },
  hiddenCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    // These will be set dynamically based on responsive dimensions
    opacity: 0.01, // Very low opacity but not completely invisible
    zIndex: -1,
    pointerEvents: 'none', // Don't interfere with user interactions
    backgroundColor: 'transparent',
  },
  canvas: {
    // These will be set dynamically based on responsive dimensions
    // backgroundColor set inline based on selectedFrame state
    borderRadius: 0,
    shadowColor: '#000',
    borderWidth:1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: isSmallScreen ? 6 : 15,
  },
  instructionsContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -moderateScale(80) }, { translateY: -moderateScale(15) }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(5),
    elevation: moderateScale(4),
  },
  instructionsText: {
    fontSize: moderateScale(11),
    color: '#666666',
    textAlign: 'center',
    marginTop: moderateScale(5),
    maxWidth: moderateScale(160),
    lineHeight: moderateScale(16),
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -moderateScale(40) }, { translateY: -moderateScale(15) }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(5),
    elevation: moderateScale(4),
  },
  loadingText: {
    fontSize: moderateScale(11),
    color: '#666666',
    textAlign: 'center',
    marginTop: moderateScale(5),
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  layer: {
    position: 'absolute',
  },
  layerText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'left',
    flexWrap: 'wrap', // Allow text to wrap
    textAlignVertical: 'top', // Align text to top
    padding: 0,
    margin: 0,
  },
  layerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  selectedLayerImage: {
    borderWidth: 3,
    borderColor: '#667eea',
    borderRadius: 12,
  },
  selectedLayer: {
    borderWidth: 3,
    borderColor: '#667eea',
    borderRadius: 8,
  },
  // Bottom toolbar styles (replacing floating toolbar) - Fully responsive
  bottomToolbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isTablet ? 16 : isLandscape ? 12 : isUltraSmallScreen ? 6 : isSmallScreen ? 8 : 12,
    padding: isTablet ? 12 : isLandscape ? 8 : isUltraSmallScreen ? 4 : isSmallScreen ? 6 : 8,
    marginTop: isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm,
    marginBottom: isLandscape ? responsiveSpacing.sm : isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.md,
    marginHorizontal: isTablet ? responsiveSpacing.lg : isLandscape ? responsiveSpacing.md : isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toolbarScrollContent: {
    paddingHorizontal: isLandscape ? (isTablet ? responsiveSpacing.sm : responsiveSpacing.xs) : (isUltraSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm),
    alignItems: 'center',
  },
  toolbarButton: {
    marginHorizontal: isLandscape ? (isTablet ? 6 : 4) : (isUltraSmallScreen ? 2 : isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 5 : 6),
    marginVertical: isLandscape ? (isTablet ? 2 : 1) : (isUltraSmallScreen ? 1 : isSmallScreen ? 2 : isMediumScreen ? 3 : isLargeScreen ? 4 : 5),
  },
  toolbarButtonGradient: {
    alignItems: 'center',
    paddingVertical: isLandscape ? (isTablet ? 12 : 10) : (isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : 14),
    paddingHorizontal: isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 8 : isSmallScreen ? 10 : isMediumScreen ? 12 : isLargeScreen ? 14 : 16),
    borderRadius: isLandscape ? (isTablet ? 12 : 10) : (isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : 14),
    minWidth: isLandscape ? (isTablet ? 80 : 70) : (isUltraSmallScreen ? 55 : isSmallScreen ? 60 : isMediumScreen ? 65 : isLargeScreen ? 70 : 75),
    minHeight: isLandscape ? (isTablet ? 50 : 45) : (isUltraSmallScreen ? 36 : isSmallScreen ? 38 : isMediumScreen ? 42 : isLargeScreen ? 45 : 48),
  },
  toolbarButtonText: {
    fontSize: getToolbarButtonTextSize(),
    color: '#ffffff',
    marginTop: isLandscape ? (isTablet ? 2 : 1) : (isUltraSmallScreen ? 1 : isSmallScreen ? 2 : isMediumScreen ? 3 : isLargeScreen ? 4 : 5),
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isLandscape ? (isTablet ? responsiveSpacing.lg : responsiveSpacing.md) : (isUltraSmallScreen ? responsiveSpacing.sm : responsiveSpacing.md),
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: isLandscape ? (isTablet ? 24 : 20) : (isUltraSmallScreen ? 16 : isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 22 : 24),
    padding: isLandscape ? (isTablet ? 24 : 20) : (isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 22),
    width: isLandscape ? (isTablet ? screenWidth * 0.7 : screenWidth * 0.8) : (isUltraSmallScreen ? screenWidth * 0.95 : isSmallScreen ? screenWidth * 0.92 : isMediumScreen ? screenWidth * 0.9 : isLargeScreen ? screenWidth * 0.88 : screenWidth * 0.85),
    maxHeight: isLandscape ? (isTablet ? screenHeight * 0.8 : screenHeight * 0.7) : (isUltraSmallScreen ? screenHeight * 0.8 : isSmallScreen ? screenHeight * 0.75 : isMediumScreen ? screenHeight * 0.7 : isLargeScreen ? screenHeight * 0.65 : screenHeight * 0.6),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  fontModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: isLandscape ? (isTablet ? 24 : 20) : (isUltraSmallScreen ? 16 : isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 22 : 24),
    padding: isLandscape ? (isTablet ? 24 : 20) : (isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : 22),
    width: isLandscape ? (isTablet ? screenWidth * 0.7 : screenWidth * 0.8) : (isUltraSmallScreen ? screenWidth * 0.95 : isSmallScreen ? screenWidth * 0.92 : isMediumScreen ? screenWidth * 0.9 : isLargeScreen ? screenWidth * 0.88 : screenWidth * 0.85),
    height: isLandscape ? (isTablet ? screenHeight * 0.6 : screenHeight * 0.5) : (isUltraSmallScreen ? screenHeight * 0.6 : isSmallScreen ? screenHeight * 0.55 : isMediumScreen ? screenHeight * 0.5 : isLargeScreen ? screenHeight * 0.45 : screenHeight * 0.4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#333333',
    marginBottom: moderateScale(8),
  },
  modalSubtitle: {
    fontSize: moderateScale(10),
    color: '#666666',
    marginBottom: moderateScale(8),
    fontWeight: '500',
  },
  profileList: {
    maxHeight: verticalScale(320),
    marginBottom: moderateScale(10),
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(6),
  },
  profileItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileLogo: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(17.5),
    marginRight: moderateScale(8),
  },
  profileLogoPlaceholder: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(17.5),
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(8),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#333333',
    marginBottom: moderateScale(1.5),
  },
  profileCategory: {
    fontSize: moderateScale(8.5),
    color: '#667eea',
    marginBottom: moderateScale(1.5),
    fontWeight: '600',
  },
  profileDescription: {
    fontSize: moderateScale(8.5),
    color: '#666666',
    lineHeight: moderateScale(11),
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: moderateScale(13),
    marginBottom: moderateScale(12),
    backgroundColor: '#f8f9fa',
    color: '#333333', // Dark text color for visibility on white background
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  modalButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginHorizontal: moderateScale(4),
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  addButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: moderateScale(12),
  },
  styleOption: {
    width: moderateScale(36),
    height: moderateScale(36),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    margin: moderateScale(2),
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  styleOptionText: {
    fontSize: moderateScale(11),
    color: '#333333',
    fontWeight: '600',
  },
  colorOption: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    margin: moderateScale(2),
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
    elevation: moderateScale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionText: {
    fontSize: moderateScale(8),
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
  styleSection: {
    marginBottom: moderateScale(12),
  },
  styleSectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#333333',
    marginBottom: moderateScale(8),
  },
  layerTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  draggedLayer: {
    zIndex: 100, // Ensure dragged layer is on top
  },
  fieldToggleSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isTablet ? 16 : isLandscape ? 14 : isUltraSmallScreen ? 6 : isSmallScreen ? 8 : 12,
    padding: isTablet ? responsiveSpacing.md : isLandscape ? responsiveSpacing.sm : isUltraSmallScreen ? 4 : isSmallScreen ? 6 : responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: isTablet ? responsiveSpacing.md : isLandscape ? responsiveSpacing.sm : isUltraSmallScreen ? 4 : isSmallScreen ? 6 : responsiveSpacing.sm,
    marginHorizontal: isTablet ? responsiveSpacing.lg : isLandscape ? responsiveSpacing.md : isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.md,
  },
  fieldToggleHeader: {
    alignItems: 'center',
    marginBottom: isLandscape ? (isTablet ? responsiveSpacing.md : responsiveSpacing.sm) : (isUltraSmallScreen ? responsiveSpacing.xs : isSmallScreen ? responsiveSpacing.sm : responsiveSpacing.md),
  },
  fieldToggleTitle: {
    fontSize: isLandscape ? (isTablet ? responsiveFontSize.lg : responsiveFontSize.md) : (isUltraSmallScreen ? responsiveFontSize.sm : isSmallScreen ? responsiveFontSize.md : responsiveFontSize.lg),
    fontWeight: '700',
    color: '#333333',
  },
  fieldToggleSubtitle: {
    fontSize: isLandscape ? (isTablet ? responsiveFontSize.sm : responsiveFontSize.xs) : (isUltraSmallScreen ? responsiveFontSize.xs : isSmallScreen ? responsiveFontSize.sm : responsiveFontSize.md),
    color: '#666666',
    marginTop: isLandscape ? (isTablet ? responsiveSpacing.xs : 1) : (isUltraSmallScreen ? 1 : isSmallScreen ? 2 : responsiveSpacing.xs),
  },
  fieldToggleContent: {
    height: isTablet ? 80 : isLandscape ? 70 : isUltraSmallScreen ? 60 : isSmallScreen ? 65 : 70,
  },
  fieldToggleScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  fieldToggleButton: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 6 : 10,
    paddingHorizontal: isSmallScreen ? 8 : 14,
    borderRadius: isSmallScreen ? 8 : 16,
    backgroundColor: '#e9ecef',
    marginHorizontal: isSmallScreen ? 2 : 4,
    flexDirection: 'row',
    minWidth: isSmallScreen ? 60 : 85,
    justifyContent: 'center',
  },
  fieldToggleButtonActive: {
    backgroundColor: '#667eea',
  },
  fieldToggleButtonText: {
    fontSize: isSmallScreen ? 9 : 12,
    color: '#666666',
    marginLeft: isSmallScreen ? 3 : 6,
    fontWeight: '500',
  },
  fieldToggleButtonTextActive: {
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  closeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  // Enhanced Font Style Modal Styles (compact & responsive)
  fontStyleModalContent: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(10),
    minHeight: verticalScale(250),
    maxHeight: verticalScale(350),
  },
  fontStyleModalHeader: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontStyleModalHeaderContent: {
    flex: 1,
  },
  fontStyleModalTitle: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: moderateScale(2),
  },
  fontStyleModalSubtitle: {
    fontSize: moderateScale(11),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  fontStyleCloseButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyleModalBody: {
    flex: 1,
    marginBottom: moderateScale(12),
    maxHeight: verticalScale(300),
  },
  fontStyleSection: {
    marginBottom: moderateScale(14),
  },
  fontStyleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(5),
  },
  fontStyleSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#333333',
    marginLeft: moderateScale(8),
  },
  fontStyleSectionSubtitle: {
    fontSize: moderateScale(11),
    color: '#666666',
    marginBottom: moderateScale(10),
    marginLeft: moderateScale(20),
    lineHeight: moderateScale(16),
  },
  fontStyleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(5),
  },
  fontStyleOption: {
    width: (screenWidth * 0.9 - moderateScale(80)) / 2 - moderateScale(6),
    marginBottom: moderateScale(8),
  },
  fontStyleOptionGradient: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  fontStyleOptionText: {
    fontSize: moderateScale(11),
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
  fontStyleOptionIcon: {
    width: moderateScale(12),
    height: moderateScale(12),
  },
  fontStyleModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    borderTopWidth: 0.5,
    borderTopColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  fontStyleCancelButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginRight: moderateScale(8),
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  fontStyleCancelButtonText: {
    color: '#666666',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  fontStyleApplyButton: {
    flex: 1,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  fontStyleApplyButtonGradient: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontStyleApplyButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginLeft: moderateScale(5),
  },
  // Logo Selection Modal Styles (compact & responsive)
  logoSelectionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: moderateScale(12),
  },
  logoSelectionOption: {
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    minWidth: moderateScale(85),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
  },
  // Professional Logo Modal Styles (compact & responsive)
  logoModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    width: screenWidth * 0.92,
    maxHeight: screenHeight * 0.75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(6),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(14),
    elevation: moderateScale(10),
  },
  logoModalHeader: {
    alignItems: 'center',
    marginBottom: moderateScale(18),
  },
  logoModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#333333',
    marginBottom: moderateScale(5),
    textAlign: 'center',
  },
  logoModalSubtitle: {
    fontSize: moderateScale(12),
    color: '#666666',
    textAlign: 'center',
    lineHeight: moderateScale(16),
    paddingHorizontal: moderateScale(12),
  },
  logoOptionsContainer: {
    marginBottom: moderateScale(18),
  },
  logoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: moderateScale(10),
    borderWidth: 0.5,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
    elevation: moderateScale(1),
  },
  logoOptionGradient: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(22.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  logoOptionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#333333',
    marginBottom: moderateScale(2),
  },
  logoOptionDescription: {
    fontSize: moderateScale(11),
    color: '#666666',
    lineHeight: moderateScale(14),
  },
  logoModalCloseButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(10),
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e9ecef',
  },
  logoModalCloseText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#666666',
  },
  // Logo URL Modal Styles (compact & responsive)
  logoUrlModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    width: screenWidth * 0.92,
    maxHeight: screenHeight * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(6),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(14),
    elevation: moderateScale(10),
  },
  logoUrlInput: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: moderateScale(13),
    marginBottom: moderateScale(14),
    backgroundColor: '#f8f9fa',
    color: '#333333',
  },
  logoUrlModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  logoUrlCancelButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginRight: moderateScale(4),
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  logoUrlCancelText: {
    color: '#666666',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  logoUrlAddButton: {
    flex: 1,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  logoUrlAddText: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  logoSelectionOptionIcon: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(22.5),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
    elevation: moderateScale(1),
  },
  logoSelectionOptionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#333333',
    marginBottom: moderateScale(2),
    textAlign: 'center',
  },
  logoSelectionOptionSubtitle: {
    fontSize: moderateScale(10),
    color: '#666666',
    textAlign: 'center',
    lineHeight: moderateScale(13),
  },
  // Animation Layers Section Styles
  animationLayersSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
    marginHorizontal: 12,
  },
  animationLayersHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  animationLayersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  animationLayersSubtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 1,
  },
  animationLayersContent: {
    maxHeight: 120,
  },
  animationLayersScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  animationLayerButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 80,
  },
  animationLayerPreview: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animationLayerText: {
    fontSize: 10,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  cornerAccentPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  sideBorderPreview: {
    width: 8,
    height: 70,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  centerAccentPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cornerLogoFramePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Animation Layers Modal Styles
  animationLayersModalContent: {
    maxHeight: 400,
    marginBottom: 16,
  },
  animationLayersModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  animationLayerModalButton: {
    width: (screenWidth * 0.9 - 80) / 2 - 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  animationLayerModalPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  animationLayerModalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  animationLayerModalDescription: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
  },
  cornerAccentModalPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  sideBorderModalPreview: {
    width: 6,
    height: 60,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  centerAccentModalPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cornerLogoFrameModalPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Frame Styles
  canvasWithFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  classicFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  modernFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  elegantFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  boldFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  minimalFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  ornateFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  cornerFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  borderFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  // Additional Frame Styles
  businessFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  eventFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  restaurantFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  fashionFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  realEstateFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  educationFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  healthcareFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  fitnessFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  weddingFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  birthdayFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  corporateFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  creativeFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  luxuryFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  vintageFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  retroFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  techFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  natureFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  oceanFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  sunsetFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  cosmicFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  artisticFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  sportFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  warmFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  coolFrame: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  // Frames Section Styles
  framesSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isSmallScreen ? 8 : 16,
    padding: getResponsiveSectionPadding(),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: getResponsiveSectionMargin(),
    marginHorizontal: getResponsiveSectionPadding(),
  },
  framesHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 4 : 8,
  },
  framesTitle: {
    fontSize: isSmallScreen ? 11 : 14,
    fontWeight: '700',
    color: '#333333',
  },
  framesSubtitle: {
    fontSize: isSmallScreen ? 8 : 10,
    color: '#666666',
    marginTop: 1,
  },
  framesContent: {
    maxHeight: getResponsiveSectionHeight(),
  },
  framesScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  frameButton: {
    alignItems: 'center',
    marginHorizontal: isSmallScreen ? 4 : 8,
    minWidth: isSmallScreen ? 55 : 80,
  },
  frameButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: isSmallScreen ? 6 : 12,
    padding: isSmallScreen ? 4 : 8,
  },
  framePreview: {
    width: getResponsiveButtonSize(),
    height: getResponsiveButtonSize(),
    borderRadius: isSmallScreen ? 6 : 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 4 : 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  framePreviewInner: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  frameText: {
    fontSize: isSmallScreen ? 8 : 10,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 9 : 12,
  },
  frameTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  // Frame Preview Styles
  classicFramePreview: {
    borderWidth: 8,
    borderColor: '#8B4513',
  },
  modernFramePreview: {
    borderWidth: 4,
    borderColor: '#667eea',
  },
  elegantFramePreview: {
    borderWidth: 6,
    borderColor: '#D4AF37',
  },
  boldFramePreview: {
    borderWidth: 10,
    borderColor: '#000000',
  },
  minimalFramePreview: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  ornateFramePreview: {
    borderWidth: 8,
    borderColor: '#8B4513',
  },
  cornerFramePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  borderFramePreview: {
    borderWidth: 3,
    borderColor: '#333333',
  },
  // Frames Modal Styles
  framesModalContent: {
    maxHeight: 400,
    marginBottom: 16,
  },
  framesModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  frameModalButton: {
    width: (screenWidth * 0.9 - 80) / 2 - 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  frameModalPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  frameModalPreviewInner: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  frameModalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  frameModalDescription: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
  },
  // Frame Modal Preview Styles
  classicFrameModalPreview: {
    borderWidth: 6,
    borderColor: '#8B4513',
  },
  modernFrameModalPreview: {
    borderWidth: 3,
    borderColor: '#667eea',
  },
  elegantFrameModalPreview: {
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  boldFrameModalPreview: {
    borderWidth: 8,
    borderColor: '#000000',
  },
  minimalFrameModalPreview: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  ornateFrameModalPreview: {
    borderWidth: 6,
    borderColor: '#8B4513',
  },
  cornerFrameModalPreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  borderFrameModalPreview: {
    borderWidth: 2,
    borderColor: '#333333',
  },
  // Templates Section Styles - Fixed height, fully responsive
  templatesSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isTablet ? 16 : isLandscape ? 12 : isUltraSmallScreen ? 6 : isSmallScreen ? 8 : 12,
    padding: isTablet ? responsiveSpacing.md : isLandscape ? responsiveSpacing.sm : isUltraSmallScreen ? 4 : isSmallScreen ? 6 : responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 0, // No bottom margin - last section
    marginHorizontal: isTablet ? responsiveSpacing.lg : isLandscape ? responsiveSpacing.md : isUltraSmallScreen ? 2 : isSmallScreen ? 4 : responsiveSpacing.md,
  },
  templatesHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 4 : 8,
  },
  templatesTitle: {
    fontSize: isSmallScreen ? 11 : 14,
    fontWeight: '700',
    color: '#333333',
  },
  templatesSubtitle: {
    fontSize: isSmallScreen ? 8 : 10,
    color: '#666666',
    marginTop: 1,
  },
  templatesContent: {
    height: isTablet ? 100 : isLandscape ? 90 : isUltraSmallScreen ? 80 : isSmallScreen ? 85 : 90,
  },
  templatesScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  templateButton: {
    alignItems: 'center',
    marginHorizontal: isUltraSmallScreen ? 2 : isSmallScreen ? 4 : 8,
    minWidth: isUltraSmallScreen ? 50 : isSmallScreen ? 55 : 80,
  },
  templateButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: isUltraSmallScreen ? 4 : isSmallScreen ? 6 : 12,
    padding: isUltraSmallScreen ? 2 : isSmallScreen ? 4 : 8,
  },
  templatePreview: {
    width: isUltraSmallScreen ? 36 : getResponsiveButtonSize(),
    height: isUltraSmallScreen ? 36 : getResponsiveButtonSize(),
    borderRadius: isUltraSmallScreen ? 4 : isSmallScreen ? 6 : 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isUltraSmallScreen ? 2 : isSmallScreen ? 4 : 8,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  templatePreviewContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  templatePreviewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  templateText: {
    fontSize: isUltraSmallScreen ? 7 : isSmallScreen ? 8 : 10,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: isUltraSmallScreen ? 8 : isSmallScreen ? 9 : 12,
  },
  templateTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  // Template Preview Styles
  businessTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  businessTemplateStyle: {
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
  },
  eventTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  eventTemplateStyle: {
    backgroundColor: 'rgba(249, 115, 22, 0.8)',
  },
  restaurantTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  restaurantTemplateStyle: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  fashionTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  fashionTemplateStyle: {
    backgroundColor: 'rgba(236, 72, 153, 0.8)',
  },
  realEstateTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  realEstateTemplateStyle: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
  },
  educationTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  educationTemplateStyle: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  healthcareTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  healthcareTemplateStyle: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  fitnessTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  fitnessTemplateStyle: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  weddingTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  weddingTemplateStyle: {
    backgroundColor: 'rgba(251, 191, 36, 0.8)',
  },
  birthdayTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  birthdayTemplateStyle: {
    backgroundColor: 'rgba(244, 114, 182, 0.8)',
  },
  corporateTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  corporateTemplateStyle: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
  },
  creativeTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  creativeTemplateStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  luxuryTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  luxuryTemplateStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
  },
  vintageTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  vintageTemplateStyle: {
    backgroundColor: 'rgba(120, 113, 108, 0.8)',
  },
  retroTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  retroTemplateStyle: {
    backgroundColor: 'rgba(251, 146, 60, 0.8)',
  },
  techTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  techTemplateStyle: {
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
  },
  natureTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  natureTemplateStyle: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  oceanTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  oceanTemplateStyle: {
    backgroundColor: 'rgba(6, 182, 212, 0.8)',
  },
  sunsetTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sunsetTemplateStyle: {
    backgroundColor: 'rgba(245, 158, 11, 0.8)',
  },
  cosmicTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  cosmicTemplateStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  artisticTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  artisticTemplateStyle: {
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
  },
  sportTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sportTemplateStyle: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  warmTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  warmTemplateStyle: {
    backgroundColor: 'rgba(245, 158, 11, 0.8)',
  },
  coolTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  coolTemplateStyle: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  // Additional Template Preview Styles
  minimalTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  minimalTemplateStyle: {
    backgroundColor: 'rgba(204, 204, 204, 0.8)',
  },
  modernTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  modernTemplateStyle: {
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
  },
  elegantTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  elegantTemplateStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
  },
  boldTemplatePreview: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  boldTemplateStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  glassMorphismFooterPreview: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  glassMorphismFooterStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  neonFooterPreview: {
    borderWidth: 3,
    borderColor: '#00ff00',
  },
  neonFooterStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  luxuryFooterPreview: {
    borderWidth: 4,
    borderColor: '#d4af37',
  },
  luxuryFooterStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.95)',
  },
  techFooterPreview: {
    borderWidth: 3,
    borderColor: '#00ff00',
  },
  techFooterStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  artisticFooterPreview: {
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  artisticFooterStyle: {
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
  },
  vintageFooterPreview: {
    borderWidth: 3,
    borderColor: '#78716c',
  },
  vintageFooterStyle: {
    backgroundColor: 'rgba(120, 113, 108, 0.9)',
  },
  retroFooterPreview: {
    borderWidth: 3,
    borderColor: '#fb923c',
  },
  retroFooterStyle: {
    backgroundColor: 'rgba(251, 146, 60, 0.9)',
  },
  futuristicFooterPreview: {
    borderWidth: 3,
    borderColor: '#06b6d4',
  },
  futuristicFooterStyle: {
    backgroundColor: 'rgba(6, 182, 212, 0.9)',
  },
  cosmicFooterPreview: {
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  cosmicFooterStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  natureFooterPreview: {
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  natureFooterStyle: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  sportFooterPreview: {
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  sportFooterStyle: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  warmFooterPreview: {
    borderWidth: 3,
    borderColor: '#f59e0b',
  },
  warmFooterStyle: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  coolFooterPreview: {
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  coolFooterStyle: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },
  // Footer Styles Modal Styles
  footerStylesModalContent: {
    maxHeight: 400,
    marginBottom: 16,
  },
  footerStylesModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  footerStyleModalButton: {
    width: (screenWidth * 0.85 - 64) / 3 - 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footerStyleModalPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  footerStyleModalPreviewContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  footerStyleModalPreviewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  footerStyleModalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerStyleModalDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 4,
  },
  // Footer Modal Preview Styles
  classicFooterModalPreview: {
    borderWidth: 4,
    borderColor: '#8B4513',
  },
  classicFooterModalStyle: {
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
  },
  modernFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  modernFooterModalStyle: {
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
  },
  elegantFooterModalPreview: {
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  elegantFooterModalStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
  },
  boldFooterModalPreview: {
    borderWidth: 6,
    borderColor: '#000000',
  },
  boldFooterModalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  minimalFooterModalPreview: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  minimalFooterModalStyle: {
    backgroundColor: 'rgba(204, 204, 204, 0.6)',
  },
  premiumFooterModalPreview: {
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  premiumFooterModalStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
  },
  corporateFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  corporateFooterModalStyle: {
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
  },
  creativeFooterModalPreview: {
    borderWidth: 6,
    borderColor: '#000000',
  },
  creativeFooterModalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  // Advanced Footer Modal Preview Styles
  gradientBlueFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  gradientBlueFooterModalStyle: {
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
  },
  gradientPurpleFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  gradientPurpleFooterModalStyle: {
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
  },
  gradientGreenFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  gradientGreenFooterModalStyle: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  gradientOrangeFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#f97316',
  },
  gradientOrangeFooterModalStyle: {
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
  },
  gradientPinkFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  gradientPinkFooterModalStyle: {
    backgroundColor: 'rgba(236, 72, 153, 0.9)',
  },
  glassMorphismFooterModalPreview: {
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  glassMorphismFooterModalStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  neonFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  neonFooterModalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  luxuryFooterModalPreview: {
    borderWidth: 3,
    borderColor: '#d4af37',
  },
  luxuryFooterModalStyle: {
    backgroundColor: 'rgba(212, 175, 55, 0.95)',
  },
  techFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  techFooterModalStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  artisticFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  artisticFooterModalStyle: {
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
  },
  vintageFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#78716c',
  },
  vintageFooterModalStyle: {
    backgroundColor: 'rgba(120, 113, 108, 0.9)',
  },
  retroFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#fb923c',
  },
  retroFooterModalStyle: {
    backgroundColor: 'rgba(251, 146, 60, 0.9)',
  },
  futuristicFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  futuristicFooterModalStyle: {
    backgroundColor: 'rgba(6, 182, 212, 0.9)',
  },
  cosmicFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  cosmicFooterModalStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  natureFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  natureFooterModalStyle: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  sportFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  sportFooterModalStyle: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  warmFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  warmFooterModalStyle: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  coolFooterModalPreview: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  coolFooterModalStyle: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },
  // Footer Style Button Styles
  footerStyleButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 80,
  },
  footerStyleButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  footerStylePreview: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  footerStylePreviewContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  footerStylePreviewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  footerStyleText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  footerStyleTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  // Footer Styles Section Styles
  footerStylesSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isSmallScreen ? 8 : 16,
    padding: getResponsiveSectionPadding(),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: getResponsiveSectionMargin(),
    marginHorizontal: getResponsiveSectionPadding(),
  },
  footerStylesHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 4 : 8,
  },
  footerStylesTitle: {
    fontSize: isSmallScreen ? 11 : 14,
    fontWeight: '700',
    color: '#333333',
  },
  footerStylesSubtitle: {
    fontSize: isSmallScreen ? 8 : 10,
    color: '#666666',
    marginTop: 1,
  },
  footerStylesScrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  frameApplicationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  frameApplicationIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(2),
    elevation: moderateScale(3),
  },
  frameApplicationText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#333333',
  },
  frameOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  frameOverlayImage: {
    width: '100%',
    height: '100%',
  },

});

export default PosterEditorScreen; 