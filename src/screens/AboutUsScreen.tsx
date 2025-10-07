import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import {
  responsiveSpacing,
  responsiveFontSize,
  responsiveText,
  responsiveSize,
  responsiveLayout,
  responsiveShadow,
  responsiveCard,
  isTablet,
  isSmallScreen,
  screenWidth,
  screenHeight,
} from '../utils/responsiveUtils';

type RootStackParamList = {
  AboutUs: undefined;
};

type AboutUsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AboutUs'>;

const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation<AboutUsScreenNavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: responsiveLayout.containerPaddingHorizontal,
      paddingTop: insets.top + responsiveSpacing.sm,
      paddingBottom: responsiveSpacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...responsiveShadow.medium,
    },
    backButton: {
      width: isTablet ? 48 : 40,
      height: isTablet ? 48 : 40,
      borderRadius: isTablet ? 24 : 20,
      backgroundColor: theme.colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: responsiveSpacing.md,
      ...responsiveShadow.small,
    },
    headerTitle: {
      fontSize: responsiveText.subheading,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      paddingHorizontal: responsiveLayout.containerPaddingHorizontal,
      paddingVertical: responsiveLayout.containerPaddingVertical,
      backgroundColor: 'transparent',
      maxWidth: isTablet ? 900 : screenWidth,
      alignSelf: 'center',
      width: '100%',
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: responsiveLayout.sectionMarginBottom,
      paddingVertical: responsiveSpacing.xl,
      paddingHorizontal: responsiveSpacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: responsiveSize.cardBorderRadius,
      marginHorizontal: responsiveSpacing.xs,
      ...responsiveShadow.medium,
    },
    logoContainer: {
      width: isTablet ? 120 : isSmallScreen ? 70 : 90,
      height: isTablet ? 120 : isSmallScreen ? 70 : 90,
      borderRadius: isTablet ? 60 : isSmallScreen ? 35 : 45,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: responsiveSpacing.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      overflow: 'hidden',
    },
    logo: {
      width: '100%',
      height: '100%',
    },
    heroTitle: {
      fontSize: responsiveText.title,
      fontWeight: '900',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: responsiveSpacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    heroSubtitle: {
      fontSize: responsiveText.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: responsiveText.body * responsiveText.lineHeightRelaxed,
      fontWeight: '500',
      paddingHorizontal: responsiveSpacing.md,
      maxWidth: isTablet ? 600 : screenWidth - 80,
    },
    statsSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: responsiveSize.cardBorderRadius,
      padding: responsiveSpacing.xl,
      marginBottom: responsiveLayout.sectionMarginBottom,
      marginHorizontal: responsiveSpacing.xs,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}10`,
      ...responsiveShadow.large,
    },
    statsTitle: {
      fontSize: responsiveText.heading,
      fontWeight: '800',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: responsiveSpacing.xl,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: isTablet ? responsiveSpacing.md : responsiveSpacing.sm,
    },
    statItem: {
      width: isTablet ? '48%' : '47%',
      alignItems: 'center',
      paddingVertical: responsiveSpacing.md,
      paddingHorizontal: responsiveSpacing.sm,
      backgroundColor: `${theme.colors.primary}08`,
      borderRadius: responsiveSize.cardBorderRadius,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}15`,
      minHeight: isTablet ? 120 : 100,
      justifyContent: 'center',
    },
    statNumber: {
      fontSize: isTablet ? 32 : isSmallScreen ? 22 : 28,
      fontWeight: '900',
      color: theme.colors.primary,
      marginBottom: responsiveSpacing.xs,
      textShadowColor: `${theme.colors.primary}30`,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    statLabel: {
      fontSize: responsiveText.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: responsiveText.caption * responsiveText.lineHeightNormal,
      fontWeight: '600',
    },
    section: {
      marginBottom: responsiveLayout.sectionMarginBottom,
      backgroundColor: theme.colors.surface,
      borderRadius: responsiveSize.cardBorderRadius,
      padding: responsiveSpacing.xl,
      marginHorizontal: responsiveSpacing.xs,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}08`,
      ...responsiveShadow.medium,
    },
    sectionTitle: {
      fontSize: responsiveText.heading,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: responsiveSpacing.md,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    sectionText: {
      fontSize: responsiveText.body,
      color: theme.colors.textSecondary,
      lineHeight: responsiveText.body * responsiveText.lineHeightRelaxed,
      marginBottom: responsiveSpacing.md,
      fontWeight: '400',
    },
    featureList: {
      marginTop: responsiveSpacing.sm,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: responsiveSpacing.md,
      paddingVertical: responsiveSpacing.sm,
      paddingHorizontal: responsiveSpacing.md,
      backgroundColor: `${theme.colors.primary}05`,
      borderRadius: responsiveSize.cardBorderRadius * 0.6,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    featureIcon: {
      marginRight: responsiveSpacing.md,
      marginTop: responsiveSpacing.xs,
    },
    featureText: {
      fontSize: responsiveText.body,
      color: theme.colors.textSecondary,
      lineHeight: responsiveText.body * responsiveText.lineHeightRelaxed,
      flex: 1,
      fontWeight: '500',
    },
    trialSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: responsiveSize.cardBorderRadius,
      padding: responsiveSpacing.xl,
      marginBottom: responsiveLayout.sectionMarginBottom,
      marginHorizontal: responsiveSpacing.xs,
      borderWidth: 2,
      borderColor: `${theme.colors.primary}40`,
      ...responsiveShadow.large,
    },
    trialTitle: {
      fontSize: responsiveText.heading,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: responsiveSpacing.lg,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    trialFeatures: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: responsiveSpacing.sm,
    },
    trialFeature: {
      width: isTablet ? '48%' : '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: responsiveSpacing.md,
      paddingHorizontal: responsiveSpacing.md,
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: responsiveSize.cardBorderRadius * 0.6,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
      minHeight: isTablet ? 50 : 44,
    },
    trialFeatureText: {
      fontSize: responsiveText.body,
      color: theme.colors.textSecondary,
      marginLeft: responsiveSpacing.sm,
      fontWeight: '600',
      flex: 1,
    },
    versionSection: {
      alignItems: 'center',
      paddingVertical: responsiveSpacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: responsiveSpacing.lg,
    },
    versionText: {
      fontSize: responsiveText.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradient}
        style={dynamicStyles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={responsiveSize.iconLarge} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>About Us</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={dynamicStyles.scrollContainer}
        contentContainerStyle={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          <View style={dynamicStyles.logoContainer}>
            <Image
              source={require('../assets/MainLogo/MB.png')}
              style={dynamicStyles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={dynamicStyles.heroTitle}>MarketBrand.ai</Text>
          <Text style={dynamicStyles.heroSubtitle}>
            Empowering businesses with professional marketing materials in minutes, not days
          </Text>
        </View>

        {/* Stats Section */}
        <View style={dynamicStyles.statsSection}>
          <Text style={dynamicStyles.statsTitle}>Our Impact</Text>
          <View style={dynamicStyles.statsGrid}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>50,000+</Text>
              <Text style={dynamicStyles.statLabel}>Happy Businesses</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>1,000+</Text>
              <Text style={dynamicStyles.statLabel}>Professional Templates</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>6</Text>
              <Text style={dynamicStyles.statLabel}>Business Categories</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>1-Min</Text>
              <Text style={dynamicStyles.statLabel}>Creation Time</Text>
            </View>
          </View>
        </View>

        {/* Mission Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Our Mission</Text>
          <Text style={dynamicStyles.sectionText}>
            To democratize professional marketing design by making it accessible, affordable, and effortless for every business, regardless of size or design expertise.
          </Text>
          <Text style={dynamicStyles.sectionText}>
            We believe every business deserves access to professional marketing materials that can compete with the biggest brands. Our platform removes the barriers of cost, time, and design skills.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Our Vision</Text>
          <Text style={dynamicStyles.sectionText}>
            To become the world's leading platform for business marketing materials, empowering 1 million businesses to create professional designs effortlessly.
          </Text>
          <Text style={dynamicStyles.sectionText}>
            We envision a world where every business, from local shops to global enterprises, has access to the same level of professional marketing materials that drive real business growth.
          </Text>
        </View>

        {/* Why We Built This Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Why We Built This</Text>
          <Text style={dynamicStyles.sectionText}>
            Traditional marketing agencies charge thousands of dollars for designs that take weeks to deliver. We saw an opportunity to provide the same quality results in minutes, at a fraction of the cost.
          </Text>
          <Text style={dynamicStyles.sectionText}>
            Our founders experienced firsthand the frustration of needing professional marketing materials but lacking the budget or design skills to create them. This personal pain point became our driving force.
          </Text>
        </View>

        {/* Key Features Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>What Makes Us Different</Text>
          <View style={dynamicStyles.featureList}>
            <View style={dynamicStyles.featureItem}>
              <Icon name="check-circle" size={responsiveSize.iconMedium} color={theme.colors.primary} style={dynamicStyles.featureIcon} />
              <Text style={dynamicStyles.featureText}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>No Design Skills Required</Text> - Our intuitive platform makes professional design accessible to everyone
              </Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Icon name="check-circle" size={responsiveSize.iconMedium} color={theme.colors.primary} style={dynamicStyles.featureIcon} />
              <Text style={dynamicStyles.featureText}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>Affordable for Every Business</Text> - Professional results at a fraction of traditional agency costs
              </Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Icon name="check-circle" size={responsiveSize.iconMedium} color={theme.colors.primary} style={dynamicStyles.featureIcon} />
              <Text style={dynamicStyles.featureText}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>Results in Minutes, Not Days</Text> - From concept to finished design in under 60 seconds
              </Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Icon name="check-circle" size={responsiveSize.iconMedium} color={theme.colors.primary} style={dynamicStyles.featureIcon} />
              <Text style={dynamicStyles.featureText}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>Industry-Specific Templates</Text> - Tailored designs for 6 major business categories
              </Text>
            </View>
          </View>
        </View>

        {/* Trial Section */}
        <View style={dynamicStyles.trialSection}>
          <Text style={dynamicStyles.trialTitle}>Start Your Journey Today</Text>
          <View style={dynamicStyles.trialFeatures}>
            <View style={dynamicStyles.trialFeature}>
              <Icon name="check-circle" size={responsiveSize.iconSmall} color={theme.colors.primary} />
              <Text style={dynamicStyles.trialFeatureText}>7-Day Free Trial</Text>
            </View>
            <View style={dynamicStyles.trialFeature}>
              <Icon name="check-circle" size={responsiveSize.iconSmall} color={theme.colors.primary} />
              <Text style={dynamicStyles.trialFeatureText}>No Credit Card Required</Text>
            </View>
            <View style={dynamicStyles.trialFeature}>
              <Icon name="check-circle" size={responsiveSize.iconSmall} color={theme.colors.primary} />
              <Text style={dynamicStyles.trialFeatureText}>Cancel Anytime</Text>
            </View>
            <View style={dynamicStyles.trialFeature}>
              <Icon name="check-circle" size={responsiveSize.iconSmall} color={theme.colors.primary} />
              <Text style={dynamicStyles.trialFeatureText}>Instant Access</Text>
            </View>
          </View>
        </View>

        {/* Version Info */}
        <View style={dynamicStyles.versionSection}>
          <Text style={dynamicStyles.versionText}>
            Version 1.0.0 • Founded 2024
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsScreen;
