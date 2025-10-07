import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ComingSoonModal from '../components/ComingSoonModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design helpers
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414 && screenWidth < 768;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;

// Responsive spacing
const responsiveSpacing = {
  xs: isSmallScreen ? 4 : isMediumScreen ? 6 : isLargeScreen ? 8 : isTablet ? 10 : 12,
  sm: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : isTablet ? 14 : 16,
  md: isSmallScreen ? 12 : isMediumScreen ? 16 : isLargeScreen ? 18 : isTablet ? 20 : 24,
  lg: isSmallScreen ? 16 : isMediumScreen ? 20 : isLargeScreen ? 24 : isTablet ? 28 : 32,
  xl: isSmallScreen ? 20 : isMediumScreen ? 24 : isLargeScreen ? 28 : isTablet ? 32 : 40,
  xxl: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : isTablet ? 36 : 48,
};

// Responsive font sizes
const responsiveFontSize = {
  xs: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : isTablet ? 13 : 14,
  sm: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : isTablet ? 15 : 16,
  md: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : isTablet ? 17 : 18,
  lg: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : isTablet ? 19 : 20,
  xl: isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 22 : isTablet ? 24 : 26,
  xxl: isSmallScreen ? 22 : isMediumScreen ? 24 : isLargeScreen ? 26 : isTablet ? 28 : 32,
  xxxl: isSmallScreen ? 26 : isMediumScreen ? 28 : isLargeScreen ? 30 : isTablet ? 34 : 38,
};

interface FAQItem {
  question: string;
  answer: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const faqs: FAQItem[] = [
    {
      question: 'How do I create a custom template?',
      answer: 'Navigate to the Templates section, select a base template, and tap on "Customize". You can then add your business details, change colors, fonts, and images to match your brand.',
    },
    {
      question: 'How do I download my created content?',
      answer: 'After creating or customizing your content, tap the "Download" button. Your content will be saved to your device gallery. You can access all your downloads from the Profile > Downloads section.',
    },
    {
      question: 'What subscription plans are available?',
      answer: 'We offer multiple subscription plans including Monthly, Quarterly, and Annual plans. Each plan provides access to premium templates, unlimited downloads, and exclusive features. Visit the Subscription section to view all available plans.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time from the Profile > Subscription section. Your access will continue until the end of your current billing period.',
    },
    {
      question: 'How do I add my business profile?',
      answer: 'Go to Profile > Business Profiles and tap the "Add Business" button. Fill in your business details including name, logo, contact information, and category. This information will be automatically applied to your templates.',
    },
    {
      question: 'Are my designs saved automatically?',
      answer: 'Yes, all your work is automatically saved to your account. You can access your drafts and completed designs from the "My Designs" section at any time.',
    },
    {
      question: 'How do I share my content?',
      answer: 'After creating your content, tap the "Share" button. You can share directly to social media platforms, send via messaging apps, or copy the link to share anywhere.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support multiple formats including JPG, PNG for images, and MP4 for videos. Premium users also get access to high-resolution exports and additional format options.',
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@marketbrand.ai',
      icon: 'email',
      action: () => {
        Linking.openURL('mailto:support@marketbrand.ai?subject=Help Request from MarketBrand App');
      },
    },
    {
      id: 'phone',
      title: 'Call Us',
      description: '+91 93709 30007',
      icon: 'phone',
      action: () => {
        Linking.openURL('tel:+919370930007');
      },
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us',
      icon: 'chat',
      action: () => {
        setShowComingSoonModal(true);
      },
    },
    {
      id: 'website',
      title: 'Visit Website',
      description: 'www.marketbrand.ai',
      icon: 'language',
      action: () => {
        Linking.openURL('https://www.marketbrand.ai');
      },
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const renderContactOption = (option: ContactOption) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.contactCard, { backgroundColor: theme.colors.cardBackground }]}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name={option.icon} size={responsiveFontSize.xl} color={theme.colors.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactTitle, { color: theme.colors.text }]}>{option.title}</Text>
        <Text style={[styles.contactDescription, { color: theme.colors.textSecondary }]}>
          {option.description}
        </Text>
      </View>
      <Icon name="chevron-right" size={responsiveFontSize.lg} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderFAQItem = (item: FAQItem, index: number) => {
    const isExpanded = expandedFAQ === index;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.faqItem, { backgroundColor: theme.colors.cardBackground }]}
        onPress={() => toggleFAQ(index)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{item.question}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={responsiveFontSize.xl}
            color={theme.colors.textSecondary}
          />
        </View>
        {isExpanded && (
          <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={responsiveFontSize.xl} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={[styles.welcomeCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={[styles.welcomeIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="support-agent" size={responsiveFontSize.xxxl} color={theme.colors.primary} />
            </View>
            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
              How can we help you?
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>
              We're here to assist you with any questions or issues you may have
            </Text>
          </View>

          {/* Contact Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ffffff' }]}>Contact Us</Text>
            <View style={styles.contactGrid}>
              {contactOptions.map(renderContactOption)}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ffffff' }]}>
              Frequently Asked Questions
            </Text>
            <View style={styles.faqContainer}>
              {faqs.map(renderFAQItem)}
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ffffff' }]}>Quick Links</Text>
            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => navigation.navigate('PrivacyPolicy' as never)}
              activeOpacity={0.7}
            >
              <Icon name="privacy-tip" size={responsiveFontSize.lg} color={theme.colors.primary} />
              <Text style={[styles.quickLinkText, { color: theme.colors.text }]}>Privacy Policy</Text>
              <Icon name="chevron-right" size={responsiveFontSize.lg} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => navigation.navigate('Subscription' as never)}
              activeOpacity={0.7}
            >
              <Icon name="card-membership" size={responsiveFontSize.lg} color={theme.colors.primary} />
              <Text style={[styles.quickLinkText, { color: theme.colors.text }]}>Subscription Plans</Text>
              <Icon name="chevron-right" size={responsiveFontSize.lg} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              Powered by RSL Solution Private Limited
            </Text>
            <Text style={[styles.footerVersion, { color: 'rgba(255, 255, 255, 0.6)' }]}>
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Coming Soon Modal for WhatsApp */}
      <ComingSoonModal
        visible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title="WhatsApp Support"
        subtitle="WhatsApp support will be available soon! For now, please use Email or Call Us for assistance."
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + responsiveSpacing.md : responsiveSpacing.md,
  },
  backButton: {
    width: responsiveSpacing.xxl,
    height: responsiveSpacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: responsiveFontSize.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing.md,
    paddingBottom: responsiveSpacing.xxl,
  },
  welcomeCard: {
    borderRadius: isTablet ? 20 : 16,
    padding: responsiveSpacing.xl,
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeIconContainer: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
  },
  welcomeTitle: {
    fontSize: responsiveFontSize.xxl,
    fontWeight: 'bold',
    marginBottom: responsiveSpacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: responsiveFontSize.md,
    textAlign: 'center',
    lineHeight: responsiveFontSize.md * 1.5,
  },
  section: {
    marginBottom: responsiveSpacing.xl,
  },
  sectionTitle: {
    fontSize: responsiveFontSize.xl,
    fontWeight: 'bold',
    marginBottom: responsiveSpacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contactGrid: {
    gap: responsiveSpacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.md,
    borderRadius: isTablet ? 16 : 12,
    marginBottom: responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: responsiveFontSize.lg,
    fontWeight: '600',
    marginBottom: responsiveSpacing.xs,
  },
  contactDescription: {
    fontSize: responsiveFontSize.sm,
  },
  faqContainer: {
    gap: responsiveSpacing.sm,
  },
  faqItem: {
    borderRadius: isTablet ? 16 : 12,
    padding: responsiveSpacing.md,
    marginBottom: responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: responsiveFontSize.md,
    fontWeight: '600',
    marginRight: responsiveSpacing.sm,
    lineHeight: responsiveFontSize.md * 1.4,
  },
  faqAnswer: {
    fontSize: responsiveFontSize.sm,
    marginTop: responsiveSpacing.md,
    lineHeight: responsiveFontSize.sm * 1.6,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.md,
    borderRadius: isTablet ? 16 : 12,
    marginBottom: responsiveSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLinkText: {
    flex: 1,
    fontSize: responsiveFontSize.md,
    fontWeight: '500',
    marginLeft: responsiveSpacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing.xl,
    marginTop: responsiveSpacing.lg,
  },
  footerText: {
    fontSize: responsiveFontSize.sm,
    textAlign: 'center',
    marginBottom: responsiveSpacing.xs,
  },
  footerVersion: {
    fontSize: responsiveFontSize.xs,
    textAlign: 'center',
  },
});

export default HelpSupportScreen;

