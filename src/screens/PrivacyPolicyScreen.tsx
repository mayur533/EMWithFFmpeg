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
import { 
  responsiveSpacing, 
  responsiveFontSize, 
  responsiveSize,
  isTablet,
  isSmallScreen,
  responsiveLayout
} from '../utils/responsiveUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const goBack = () => {
    navigation.goBack();
  };

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
        <View style={styles.cardWrapper}>
          {/* Animated Gradient Border */}
          <Animated.View
            style={[
              styles.gradientBorderWrapper,
              {
                opacity: borderOpacityAnim,
              }
            ]}
          >
            <LinearGradient
              colors={['#00D4FF', '#FFD700', '#FF6B6B', '#8B5CF6', '#00D4FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            />
          </Animated.View>
          
          {/* Card Content */}
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[
              styles.section,
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
      paddingHorizontal: responsiveSpacing.md,
      paddingTop: insets.top + responsiveSpacing.sm,
      paddingBottom: responsiveSpacing.md,
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
    },
    backButton: {
      marginRight: responsiveSpacing.md,
      padding: isSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm,
      borderRadius: responsiveSize.md,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
      fontSize: isTablet ? responsiveFontSize.xxl : responsiveFontSize.xl,
      fontWeight: '600',
      color: '#ffffff',
      flex: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: isTablet ? responsiveSpacing.xxl : responsiveSpacing.md,
      maxWidth: isTablet ? 900 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    content: {
      paddingVertical: isTablet ? responsiveSpacing.xxl : responsiveSpacing.lg,
      paddingBottom: responsiveSpacing.xxxl,
    },
    lastUpdated: {
      fontSize: responsiveFontSize.sm,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      marginBottom: responsiveSpacing.lg,
      fontStyle: 'italic',
    },
    cardWrapper: {
      position: 'relative',
      marginBottom: responsiveSpacing.lg,
    },
    gradientBorderWrapper: {
      position: 'absolute',
      top: -3,
      left: -3,
      right: -3,
      bottom: -3,
      borderRadius: isTablet ? 19 : 15,
      overflow: 'hidden',
    },
    gradientBorder: {
      flex: 1,
      borderRadius: isTablet ? 19 : 15,
    },
    section: {
      backgroundColor: '#ffffff',
      borderRadius: isTablet ? 16 : 12,
      padding: isTablet ? responsiveSpacing.xxl : (isSmallScreen ? responsiveSpacing.md : responsiveSpacing.lg),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: isTablet ? 10 : 8,
      elevation: isTablet ? 6 : 4,
    },
    sectionHovered: {
      backgroundColor: '#ffffff',
      borderColor: 'transparent',
      borderWidth: 0,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    sectionTitle: {
      fontSize: isTablet ? responsiveFontSize.xxl : responsiveFontSize.xl,
      fontWeight: '700',
      color: '#667eea',
      letterSpacing: 0.5,
      flex: 1,
    },
    sectionContent: {
      fontSize: isTablet ? responsiveFontSize.lg : (isSmallScreen ? responsiveFontSize.sm : responsiveFontSize.md),
      lineHeight: isTablet ? responsiveFontSize.lg * 1.6 : (isSmallScreen ? responsiveFontSize.sm * 1.5 : responsiveFontSize.md * 1.5),
      color: '#555555',
      marginBottom: responsiveSpacing.sm,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: responsiveSpacing.sm,
      paddingVertical: isSmallScreen ? responsiveSpacing.xs : responsiveSpacing.sm,
      paddingHorizontal: isTablet ? responsiveSpacing.md : responsiveSpacing.sm,
      backgroundColor: 'rgba(102, 126, 234, 0.08)',
      borderRadius: responsiveSize.sm,
      borderLeftWidth: isTablet ? 4 : 3,
      borderLeftColor: '#667eea',
    },
    bullet: {
      fontSize: isTablet ? responsiveFontSize.xl : responsiveFontSize.lg,
      color: '#667eea',
      marginRight: responsiveSpacing.sm,
      marginTop: 2,
      fontWeight: '600',
    },
    bulletText: {
      fontSize: isTablet ? responsiveFontSize.lg : (isSmallScreen ? responsiveFontSize.sm : responsiveFontSize.md),
      lineHeight: isTablet ? responsiveFontSize.lg * 1.6 : (isSmallScreen ? responsiveFontSize.sm * 1.6 : responsiveFontSize.md * 1.6),
      color: '#555555',
      flex: 1,
    },
    highlight: {
      fontWeight: '600',
      color: '#333333',
    },
    contactSection: {
      backgroundColor: '#ffffff',
      padding: isTablet ? responsiveSpacing.xxxl : responsiveSpacing.xl,
      borderRadius: isTablet ? 20 : responsiveSize.lg,
      marginTop: isTablet ? responsiveSpacing.xl : responsiveSpacing.lg,
      marginBottom: isTablet ? responsiveSpacing.xxxl : responsiveSpacing.xl,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: isTablet ? 12 : 10,
      elevation: isTablet ? 8 : 6,
    },
    contactTitle: {
      fontSize: isTablet ? responsiveFontSize.xxxl : responsiveFontSize.xxl,
      fontWeight: '700',
      color: '#667eea',
      marginBottom: isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    contactText: {
      fontSize: isTablet ? responsiveFontSize.lg : (isSmallScreen ? responsiveFontSize.sm : responsiveFontSize.md),
      color: '#555555',
      textAlign: 'center',
      lineHeight: isTablet ? responsiveFontSize.lg * 1.6 : (isSmallScreen ? responsiveFontSize.sm * 1.6 : responsiveFontSize.md * 1.6),
      marginBottom: responsiveSpacing.sm,
    },
    emailLink: {
      color: '#667eea',
      textDecorationLine: 'underline',
      fontWeight: '700',
      fontSize: isTablet ? responsiveFontSize.xl : responsiveFontSize.lg,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: isTablet ? responsiveSpacing.xxxl : responsiveSpacing.xl,
      paddingHorizontal: isTablet ? responsiveSpacing.xxl : responsiveSpacing.md,
      marginBottom: isTablet ? responsiveSpacing.xxl : responsiveSpacing.lg,
    },
    heroTitle: {
      fontSize: isTablet ? 42 : (isSmallScreen ? responsiveFontSize.xxl : responsiveFontSize.xxxl),
      fontWeight: '800',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: responsiveSpacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
      letterSpacing: isTablet ? 1.5 : 1,
    },
    heroSubtitle: {
      fontSize: isTablet ? responsiveFontSize.lg : (isSmallScreen ? responsiveFontSize.sm : responsiveFontSize.md),
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      lineHeight: isTablet ? responsiveFontSize.lg * 1.6 : (isSmallScreen ? responsiveFontSize.sm * 1.5 : responsiveFontSize.md * 1.5),
      paddingHorizontal: isTablet ? responsiveSpacing.xxxl : responsiveSpacing.lg,
      maxWidth: isTablet ? 700 : '100%',
    },
    divider: {
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginVertical: responsiveSpacing.md,
      borderRadius: 1,
    },
    sectionIcon: {
      marginBottom: responsiveSpacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
    },
    sectionHeaderIcon: {
      marginRight: responsiveSpacing.sm,
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
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon 
              name="arrow-back" 
              size={responsiveFontSize.lg} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Icon name="security" size={responsiveSize.iconXLarge * 1.5} color="#ffffff" style={styles.sectionIcon} />
            <Text style={styles.heroTitle}>Your Privacy Matters</Text>
            <Text style={styles.heroSubtitle}>
              We're committed to protecting your personal information and being transparent about our data practices
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          {/* Introduction */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="info" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Introduction</Text>
            </View>
            <Text style={styles.sectionContent}>
              Welcome to MarketBrand.ai ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our mobile application and related services 
              (collectively, the "Service").
            </Text>
            <Text style={styles.sectionContent}>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </Text>
          </HoverableCard>

          {/* Information We Collect */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="folder-open" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Information We Collect</Text>
            </View>
            
            <Text style={[styles.sectionContent, styles.highlight]}>Personal Information:</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Name and email address</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Profile information and preferences</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Payment and billing information (processed securely through Razorpay)</Text>
            </View>

            <Text style={[styles.sectionContent, styles.highlight, { marginTop: responsiveSpacing.md }]}>
              Usage Information:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>App usage patterns and features accessed</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Device information (model, operating system, unique identifiers)</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Crash reports and performance data</Text>
            </View>

            <Text style={[styles.sectionContent, styles.highlight, { marginTop: responsiveSpacing.md }]}>
              Content Information:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Business profiles and marketing content you create</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Images, videos, and other media you upload</Text>
            </View>
          </HoverableCard>

          {/* How We Use Information */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="settings" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            </View>
            <Text style={styles.sectionContent}>
              We use the information we collect to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Provide, maintain, and improve our Service</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Process payments and manage subscriptions</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Send you important updates and notifications</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Provide customer support and respond to inquiries</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Analyze usage patterns to enhance user experience</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Ensure security and prevent fraud</Text>
            </View>
          </HoverableCard>

          {/* Information Sharing */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="share" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Information Sharing</Text>
            </View>
            <Text style={styles.sectionContent}>
              We do not sell, trade, or otherwise transfer your personal information to third parties, except:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>With payment processors (Razorpay) for transaction processing</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>With cloud service providers for data storage and processing</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>When required by law or to protect our rights and safety</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>With your explicit consent</Text>
            </View>
          </HoverableCard>

          {/* Data Security */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="verified-user" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Data Security</Text>
            </View>
            <Text style={styles.sectionContent}>
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction. This includes:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Encryption of sensitive data in transit and at rest</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Secure authentication and authorization systems</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Regular security audits and updates</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Access controls and monitoring</Text>
            </View>
          </HoverableCard>

          {/* Your Rights */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="account-circle" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Your Rights and Choices</Text>
            </View>
            <Text style={styles.sectionContent}>
              You have the right to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Access and update your personal information</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Delete your account and associated data</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Opt-out of marketing communications</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Request a copy of your data</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Withdraw consent for data processing</Text>
            </View>
          </HoverableCard>

          {/* Cookies and Tracking */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="cookie" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Cookies and Tracking</Text>
            </View>
            <Text style={styles.sectionContent}>
              We may use cookies and similar tracking technologies to enhance your experience, 
              analyze usage patterns, and provide personalized content. You can control these 
              through your device settings.
            </Text>
          </HoverableCard>

          {/* Third-Party Services */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="extension" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Third-Party Services</Text>
            </View>
            <Text style={styles.sectionContent}>
              Our Service integrates with third-party services including:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Razorpay for payment processing</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Google Fonts for typography</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Cloud storage providers</Text>
            </View>
            <Text style={styles.sectionContent}>
              These services have their own privacy policies, which we encourage you to review.
            </Text>
          </HoverableCard>

          {/* Children's Privacy */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="child-care" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Children's Privacy</Text>
            </View>
            <Text style={styles.sectionContent}>
              Our Service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected personal information from a child under 13, we will take steps to delete such information.
            </Text>
          </HoverableCard>

          {/* Changes to Privacy Policy */}
          <HoverableCard>
            <View style={styles.sectionHeader}>
              <Icon name="update" size={responsiveSize.iconLarge} color="#667eea" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
            </View>
            <Text style={styles.sectionContent}>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy in the app and updating the "Last updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </Text>
          </HoverableCard>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Icon name="contact-support" size={responsiveSize.iconXLarge} color="#667eea" style={{ alignSelf: 'center', marginBottom: responsiveSpacing.sm }} />
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us at:
            </Text>
            <Text style={[styles.contactText, styles.emailLink]}>
              support@marketbrand.ai
            </Text>
            <Text style={styles.contactText}>
              We will respond to your inquiry within 48 hours.
            </Text>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default PrivacyPolicyScreen;
