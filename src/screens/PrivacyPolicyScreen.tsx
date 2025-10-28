import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

// Compact spacing multiplier to reduce all spacing (matching HomeScreen)
const COMPACT_MULTIPLIER = 0.5;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive helper functions (matching HomeScreen)
const scale = (size: number) => (screenWidth / 375) * size;
const verticalScale = (size: number) => (screenHeight / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive design helpers
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414 && screenWidth < 768;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;

// Responsive spacing (Compact - reduced by 50%)
const responsiveSpacing = {
  xs: moderateScale(isSmallScreen ? 2 : isMediumScreen ? 3 : isLargeScreen ? 4 : isTablet ? 5 : 6),
  sm: moderateScale(isSmallScreen ? 4 : isMediumScreen ? 5 : isLargeScreen ? 6 : isTablet ? 7 : 8),
  md: moderateScale(isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 9 : isTablet ? 10 : 12),
  lg: moderateScale(isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : isTablet ? 14 : 16),
  xl: moderateScale(isSmallScreen ? 10 : isMediumScreen ? 12 : isLargeScreen ? 14 : isTablet ? 16 : 20),
  xxl: moderateScale(isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : isTablet ? 18 : 24),
  xxxl: moderateScale(isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 18 : isTablet ? 20 : 28),
};

// Responsive font sizes (Compact - reduced by 30-50%)
const responsiveFontSize = {
  xs: moderateScale(isSmallScreen ? 7 : isMediumScreen ? 7.5 : isLargeScreen ? 8 : isTablet ? 8.5 : 9),
  sm: moderateScale(isSmallScreen ? 8 : isMediumScreen ? 8.5 : isLargeScreen ? 9 : isTablet ? 9.5 : 10),
  md: moderateScale(isSmallScreen ? 9 : isMediumScreen ? 9.5 : isLargeScreen ? 10 : isTablet ? 10.5 : 11),
  lg: moderateScale(isSmallScreen ? 10 : isMediumScreen ? 10.5 : isLargeScreen ? 11 : isTablet ? 11.5 : 12),
  xl: moderateScale(isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : isTablet ? 14 : 15),
  xxl: moderateScale(isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 15 : isTablet ? 16 : 18),
  xxxl: moderateScale(isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 17 : isTablet ? 18 : 20),
};

// Responsive sizes
const responsiveSize = {
  sm: moderateScale(isTablet ? 8 : 6),
  md: moderateScale(isTablet ? 12 : 8),
  lg: moderateScale(isTablet ? 16 : 12),
  iconSmall: moderateScale(isTablet ? 16 : 12),
  iconMedium: moderateScale(isTablet ? 20 : 16),
  iconLarge: moderateScale(isTablet ? 24 : 18),
  iconXLarge: moderateScale(isTablet ? 32 : 24),
};

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Dynamic dimensions for responsive layout (matching HomeScreen)
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  // Update dimensions on screen rotation/resize
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const currentScreenWidth = dimensions.width;
  const currentScreenHeight = dimensions.height;
  
  // Dynamic responsive scaling functions
  const dynamicScale = (size: number) => (currentScreenWidth / 375) * size;
  const dynamicVerticalScale = (size: number) => (currentScreenHeight / 667) * size;
  const dynamicModerateScale = (size: number, factor = 0.5) => size + (dynamicScale(size) - size) * factor;
  
  // Responsive icon sizes (compact - 60% of original)
  const getIconSize = (baseSize: number) => {
    return Math.max(10, Math.round(baseSize * (currentScreenWidth / 375) * 0.6));
  };
  
  // Device size detection
  const isTabletDevice = currentScreenWidth >= 768;
  const isSmallScreenDevice = currentScreenWidth < 375;

  const goBack = () => {
    navigation.goBack();
  };

  // Helper function for consistent dynamic styles
  const getSectionHeaderStyle = () => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: dynamicModerateScale(6),
  });

  const getIconStyle = () => ({
    marginRight: dynamicModerateScale(6),
  });

  const getContentStyle = () => ({
    marginBottom: dynamicModerateScale(6),
  });

  const getBulletPointStyle = () => ({
    marginBottom: dynamicModerateScale(4),
    paddingVertical: dynamicModerateScale(4),
    paddingHorizontal: dynamicModerateScale(6),
    borderRadius: dynamicModerateScale(6),
  });

  const getBulletStyle = () => ({
    marginRight: dynamicModerateScale(4),
  });

  // Hoverable Card Component with professional smooth animations and gradient border
  const HoverableCard = ({ 
    children, 
    style 
  }: { 
    children: React.ReactNode; 
    style?: any;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const scaleAnim = useState(new Animated.Value(1))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];
    const borderOpacityAnim = useState(new Animated.Value(0))[0];

    const handlePressIn = () => {
      setIsHovered(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.015,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(borderOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      setIsHovered(false);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(borderOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: Animated.add(0.95, Animated.multiply(opacityAnim, 0.05)),
          }
        ]}
      >
        {/* Gradient Border Container */}
        <View style={[styles.cardWrapper, {
          marginBottom: isTabletDevice ? dynamicModerateScale(8) : dynamicModerateScale(6),
        }]}>
          {/* Animated Gradient Border */}
          <Animated.View
            style={[
              styles.gradientBorderWrapper,
              {
                opacity: borderOpacityAnim,
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: dynamicModerateScale(12),
              }
            ]}
          >
            <LinearGradient
              colors={['#00D4FF', '#FFD700', '#FF6B6B', '#8B5CF6', '#00D4FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientBorder, {
                borderRadius: dynamicModerateScale(12),
              }]}
            />
          </Animated.View>
          
          {/* Card Content */}
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[
              styles.section,
              {
                borderRadius: dynamicModerateScale(12),
                padding: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
              },
              isHovered && styles.sectionHovered,
              style
            ]}
          >
            {children}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
    },
    backButton: {
      marginRight: moderateScale(8),
      borderRadius: moderateScale(8),
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerTitle: {
      fontWeight: '600',
      color: '#333333',
      flex: 1,
      textShadowColor: 'rgba(255, 255, 255, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    scrollContainer: {
      flex: 1,
      alignSelf: 'center',
      width: '100%',
    },
    content: {
      // Inline styles used
    },
    lastUpdated: {
      color: 'rgba(102, 102, 102, 0.8)',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    cardWrapper: {
      position: 'relative',
      // Inline styles used
    },
    gradientBorderWrapper: {
      position: 'absolute',
      overflow: 'hidden',
    },
    gradientBorder: {
      flex: 1,
    },
    section: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 2,
    },
    sectionHovered: {
      backgroundColor: '#ffffff',
      borderColor: 'transparent',
      borderWidth: 0,
      shadowOpacity: 0.15,
      shadowRadius: moderateScale(6),
      elevation: 3,
    },
    sectionTitle: {
      fontSize: moderateScale(isTablet ? 11 : 10), // Fixed text size
      fontWeight: '700',
      color: '#667eea',
      letterSpacing: 0.5,
      flex: 1,
    },
    sectionContent: {
      fontSize: moderateScale(isTablet ? 8 : 7.5), // Fixed text size
      lineHeight: moderateScale(isTablet ? 12 : 11),
      color: '#555555',
      // marginBottom uses dynamic scaling in inline styles
    },
    bulletPoint: {
      flexDirection: 'row',
      backgroundColor: 'rgba(102, 126, 234, 0.08)',
      borderLeftWidth: 2,
      borderLeftColor: '#667eea',
      // Dynamic spacing applied inline
    },
    bullet: {
      fontSize: moderateScale(isTablet ? 9 : 8), // Fixed text size
      color: '#667eea',
      marginTop: 1,
      fontWeight: '600',
      // Dynamic spacing applied inline
    },
    bulletText: {
      fontSize: moderateScale(isTablet ? 8 : 7.5), // Fixed text size
      lineHeight: moderateScale(isTablet ? 12 : 11),
      color: '#555555',
      flex: 1,
    },
    highlight: {
      fontWeight: '600',
      color: '#333333',
    },
    contactSection: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: moderateScale(3) },
      shadowOpacity: 0.15,
      shadowRadius: moderateScale(6),
      elevation: 3,
      // Dynamic spacing applied inline
    },
    contactTitle: {
      fontSize: moderateScale(isTablet ? 14 : 12), // Fixed text size
      fontWeight: '700',
      color: '#667eea',
      textAlign: 'center',
      letterSpacing: 0.5,
      // Dynamic spacing applied inline
    },
    contactText: {
      fontSize: moderateScale(isTablet ? 8 : 7.5), // Fixed text size
      color: '#555555',
      textAlign: 'center',
      lineHeight: moderateScale(isTablet ? 12 : 11),
      // Dynamic spacing applied inline
    },
    emailLink: {
      color: '#667eea',
      textDecorationLine: 'underline',
      fontWeight: '700',
      fontSize: moderateScale(isTablet ? 10 : 9), // Fixed text size
    },
    heroSection: {
      alignItems: 'center',
      // Inline styles used
    },
    heroTitle: {
      fontWeight: '800',
      color: '#333333',
      textAlign: 'center',
      textShadowColor: 'rgba(255, 255, 255, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      letterSpacing: isTablet ? 1 : 0.5,
    },
    heroSubtitle: {
      color: 'rgba(102, 102, 102, 0.9)',
      textAlign: 'center',
      maxWidth: isTablet ? 700 : '100%',
    },
    divider: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 1,
    },
    sectionIcon: {
      // Inline styles used
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionHeaderIcon: {
      // Inline styles used
    },
  });

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, {
          paddingHorizontal: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(8),
          paddingTop: insets.top + dynamicModerateScale(4),
          paddingBottom: dynamicModerateScale(6),
        }]}>
          <TouchableOpacity onPress={goBack} style={[styles.backButton, {
            width: isTabletDevice ? dynamicModerateScale(32) : dynamicModerateScale(28),
            height: isTabletDevice ? dynamicModerateScale(32) : dynamicModerateScale(28),
            justifyContent: 'center',
            alignItems: 'center',
          }]}>
            <Icon 
              name="arrow-back" 
              size={isTabletDevice ? getIconSize(20) : getIconSize(18)} 
              color="#333333" 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {
            fontSize: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
          }]}>Privacy Policy</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={[styles.scrollContainer, {
            paddingHorizontal: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(8),
            maxWidth: isTabletDevice ? 900 : '100%',
          }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, {
            paddingVertical: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(8),
            paddingBottom: dynamicModerateScale(20),
          }]}
        >
          {/* Hero Section */}
          <View style={[styles.heroSection, {
            paddingVertical: dynamicModerateScale(12),
            paddingHorizontal: dynamicModerateScale(8),
            marginBottom: dynamicModerateScale(8),
          }]}>
            <Icon name="security" size={isTabletDevice ? getIconSize(32) : getIconSize(24)} color="#667eea" style={[styles.sectionIcon, {
              marginBottom: dynamicModerateScale(6),
            }]} />
            <Text style={[styles.heroTitle, {
              fontSize: isTabletDevice ? dynamicModerateScale(16) : dynamicModerateScale(14),
              marginBottom: dynamicModerateScale(6),
            }]}>Your Privacy Matters</Text>
            <Text style={[styles.heroSubtitle, {
              fontSize: isTabletDevice ? dynamicModerateScale(8) : dynamicModerateScale(7.5),
              lineHeight: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              paddingHorizontal: dynamicModerateScale(8),
            }]}>
              We're committed to protecting your personal information and being transparent about our data practices
            </Text>
          </View>

          <View style={[styles.divider, {
            height: 1,
            marginVertical: dynamicModerateScale(4),
          }]} />

          <Text style={[styles.lastUpdated, {
            fontSize: isTabletDevice ? dynamicModerateScale(7) : dynamicModerateScale(6.5),
            marginBottom: dynamicModerateScale(8),
          }]}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          {/* Introduction */}
          <HoverableCard>
            <View style={[styles.sectionHeader, {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: dynamicModerateScale(6),
            }]}>
              <Icon name="info" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={{
                marginRight: dynamicModerateScale(6),
              }} />
              <Text style={[styles.sectionTitle, {
                fontSize: isTabletDevice ? dynamicModerateScale(11) : dynamicModerateScale(10),
              }]}>Introduction</Text>
            </View>
            <Text style={[styles.sectionContent, {
              fontSize: isTabletDevice ? dynamicModerateScale(8) : dynamicModerateScale(7.5),
              lineHeight: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              marginBottom: dynamicModerateScale(6),
            }]}>
              Welcome to MarketBrand.ai ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our mobile application and related services 
              (collectively, the "Service").
            </Text>
            <Text style={[styles.sectionContent, {
              fontSize: isTabletDevice ? dynamicModerateScale(8) : dynamicModerateScale(7.5),
              lineHeight: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              marginBottom: dynamicModerateScale(6),
            }]}>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </Text>
          </HoverableCard>

          {/* Information We Collect */}
          <HoverableCard>
            <View style={[styles.sectionHeader, {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: dynamicModerateScale(6),
            }]}>
              <Icon name="folder-open" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={{
                marginRight: dynamicModerateScale(6),
              }} />
              <Text style={styles.sectionTitle}>Information We Collect</Text>
            </View>
            
            <Text style={[styles.sectionContent, styles.highlight, {
              marginBottom: dynamicModerateScale(4),
            }]}>Personal Information:</Text>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Name and email address</Text>
            </View>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Profile information and preferences</Text>
            </View>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Payment and billing information (processed securely through Razorpay)</Text>
            </View>

            <Text style={[styles.sectionContent, styles.highlight, { 
              marginTop: dynamicModerateScale(8),
              marginBottom: dynamicModerateScale(4),
            }]}>
              Usage Information:
            </Text>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>App usage patterns and features accessed</Text>
            </View>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Device information (model, operating system, unique identifiers)</Text>
            </View>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Crash reports and performance data</Text>
            </View>

            <Text style={[styles.sectionContent, styles.highlight, { 
              marginTop: dynamicModerateScale(8),
              marginBottom: dynamicModerateScale(4),
            }]}>
              Content Information:
            </Text>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Business profiles and marketing content you create</Text>
            </View>
            <View style={[styles.bulletPoint, {
              marginBottom: dynamicModerateScale(4),
              paddingVertical: dynamicModerateScale(4),
              paddingHorizontal: dynamicModerateScale(6),
              borderRadius: dynamicModerateScale(6),
            }]}>
              <Text style={[styles.bullet, { marginRight: dynamicModerateScale(4) }]}>•</Text>
              <Text style={styles.bulletText}>Images, videos, and other media you upload</Text>
            </View>
          </HoverableCard>

          {/* How We Use Information */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="settings" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              We use the information we collect to:
            </Text>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Provide, maintain, and improve our Service</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Process payments and manage subscriptions</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Send you important updates and notifications</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Provide customer support and respond to inquiries</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Analyze usage patterns to enhance user experience</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Ensure security and prevent fraud</Text>
            </View>
          </HoverableCard>

          {/* Information Sharing */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="share" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Information Sharing</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              We do not sell, trade, or otherwise transfer your personal information to third parties, except:
            </Text>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>With payment processors (Razorpay) for transaction processing</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>With cloud service providers for data storage and processing</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>When required by law or to protect our rights and safety</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>With your explicit consent</Text>
            </View>
          </HoverableCard>

          {/* Data Security */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="verified-user" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Data Security</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction. This includes:
            </Text>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Encryption of sensitive data in transit and at rest</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Secure authentication and authorization systems</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Regular security audits and updates</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Access controls and monitoring</Text>
            </View>
          </HoverableCard>

          {/* Your Rights */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="account-circle" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Your Rights and Choices</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              You have the right to:
            </Text>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Access and update your personal information</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Delete your account and associated data</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Opt-out of marketing communications</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Request a copy of your data</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Withdraw consent for data processing</Text>
            </View>
          </HoverableCard>

          {/* Cookies and Tracking */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="cookie" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Cookies and Tracking</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              We may use cookies and similar tracking technologies to enhance your experience, 
              analyze usage patterns, and provide personalized content. You can control these 
              through your device settings.
            </Text>
          </HoverableCard>

          {/* Third-Party Services */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="extension" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Third-Party Services</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              Our Service integrates with third-party services including:
            </Text>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Razorpay for payment processing</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Google Fonts for typography</Text>
            </View>
            <View style={[styles.bulletPoint, getBulletPointStyle()]}>
              <Text style={[styles.bullet, getBulletStyle()]}>•</Text>
              <Text style={styles.bulletText}>Cloud storage providers</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              These services have their own privacy policies, which we encourage you to review.
            </Text>
          </HoverableCard>

          {/* Children's Privacy */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="child-care" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Children's Privacy</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              Our Service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected personal information from a child under 13, we will take steps to delete such information.
            </Text>
          </HoverableCard>

          {/* Changes to Privacy Policy */}
          <HoverableCard>
            <View style={[styles.sectionHeader, getSectionHeaderStyle()]}>
              <Icon name="update" size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color="#667eea" style={getIconStyle()} />
              <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
            </View>
            <Text style={[styles.sectionContent, getContentStyle()]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy in the app and updating the "Last updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </Text>
          </HoverableCard>

          {/* Contact Information */}
          <View style={[styles.contactSection, {
            padding: isTabletDevice ? dynamicModerateScale(16) : dynamicModerateScale(12),
            borderRadius: dynamicModerateScale(12),
            marginTop: dynamicModerateScale(12),
            marginBottom: dynamicModerateScale(16),
          }]}>
            <Icon name="contact-support" size={isTabletDevice ? getIconSize(28) : getIconSize(24)} color="#667eea" style={{ 
              alignSelf: 'center', 
              marginBottom: dynamicModerateScale(6)
            }} />
            <Text style={[styles.contactTitle, {
              marginBottom: dynamicModerateScale(6),
            }]}>Contact Us</Text>
            <Text style={[styles.contactText, {
              marginBottom: dynamicModerateScale(4),
            }]}>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us at:
            </Text>
            <Text style={[styles.contactText, styles.emailLink, {
              marginBottom: dynamicModerateScale(4),
            }]}>
              support@marketbrand.ai
            </Text>
            <Text style={[styles.contactText, {
              marginBottom: dynamicModerateScale(4),
            }]}>
              We will respond to your inquiry within 48 hours.
            </Text>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default PrivacyPolicyScreen;
