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
  const isLandscapeMode = currentScreenWidth > currentScreenHeight;

  const faqs: FAQItem[] = [
    {
      question: 'How do I create a custom template?',
      answer: 'Navigate to the Template screen, then upload an image or video. After uploading, you can apply templates, add text, and customize your content as needed.',
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
      answer: 'Subscriptions cannot be cancelled once activated. Your subscription will remain active for the entire billing period you selected. Please contact our support team for any concerns regarding your subscription.',
    },
    {
      question: 'How do I add my business profile?',
      answer: 'Go to Profile > Business Profiles and tap the "Add Business" button. Fill in your business details including name, logo, contact information, and category. This information will be automatically applied to your templates.',
    },
    {
      question: 'Are my designs saved automatically?',
      answer: 'No, designs are not saved automatically. Please manually save your work before closing the app or navigating away. It is recommended to download your completed designs to your device gallery to ensure they are preserved.',
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
      description: '9941041415',
      icon: 'phone',
      action: () => {
        Linking.openURL('tel:9941041415');
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
      style={[styles.contactCard, { 
        backgroundColor: theme.colors.cardBackground,
        padding: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
        borderRadius: dynamicModerateScale(10),
        marginBottom: dynamicModerateScale(6),
      }]}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIconContainer, { 
        backgroundColor: theme.colors.primary + '20',
        width: isTabletDevice ? dynamicModerateScale(44) : dynamicModerateScale(38),
        height: isTabletDevice ? dynamicModerateScale(44) : dynamicModerateScale(38),
        borderRadius: isTabletDevice ? dynamicModerateScale(22) : dynamicModerateScale(19),
        marginRight: dynamicModerateScale(10),
      }]}>
        <Icon name={option.icon} size={isTabletDevice ? getIconSize(20) : getIconSize(18)} color={theme.colors.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactTitle, { 
          color: theme.colors.text,
          fontSize: isTabletDevice ? dynamicModerateScale(11) : dynamicModerateScale(10),
          marginBottom: dynamicModerateScale(1),
        }]}>{option.title}</Text>
        <Text style={[styles.contactDescription, { 
          color: theme.colors.textSecondary,
          fontSize: isTabletDevice ? dynamicModerateScale(9) : dynamicModerateScale(8),
        }]}>
          {option.description}
        </Text>
      </View>
      <Icon name="chevron-right" size={isTabletDevice ? getIconSize(18) : getIconSize(16)} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderFAQItem = (item: FAQItem, index: number) => {
    const isExpanded = expandedFAQ === index;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.faqItem, { 
          backgroundColor: theme.colors.cardBackground,
          borderRadius: dynamicModerateScale(10),
          padding: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
          marginBottom: dynamicModerateScale(6),
        }]}
        onPress={() => toggleFAQ(index)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={[styles.faqQuestion, { 
            color: theme.colors.text,
            fontSize: isTabletDevice ? dynamicModerateScale(10) : dynamicModerateScale(9),
            marginRight: dynamicModerateScale(8),
            lineHeight: isTabletDevice ? dynamicModerateScale(14) : dynamicModerateScale(13),
          }]}>{item.question}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={isTabletDevice ? getIconSize(20) : getIconSize(18)}
            color={theme.colors.textSecondary}
          />
        </View>
        {isExpanded && (
          <Text style={[styles.faqAnswer, { 
            color: theme.colors.textSecondary,
            fontSize: isTabletDevice ? dynamicModerateScale(9) : dynamicModerateScale(8),
            marginTop: dynamicModerateScale(8),
            lineHeight: isTabletDevice ? dynamicModerateScale(14) : dynamicModerateScale(13),
          }]}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, {
          paddingHorizontal: isTabletDevice ? dynamicModerateScale(10) : dynamicModerateScale(6),
          paddingVertical: isTabletDevice ? dynamicModerateScale(5) : dynamicModerateScale(4),
        }]}>
          <TouchableOpacity
            style={[styles.backButton, {
              width: isTabletDevice ? dynamicModerateScale(26) : dynamicModerateScale(22),
              height: isTabletDevice ? dynamicModerateScale(26) : dynamicModerateScale(22),
            }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={isTabletDevice ? getIconSize(16) : getIconSize(14)} color="#333333" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {
            fontSize: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
          }]}>Help & Support</Text>
          <View style={[styles.backButton, {
            width: isTabletDevice ? dynamicModerateScale(26) : dynamicModerateScale(22),
            height: isTabletDevice ? dynamicModerateScale(26) : dynamicModerateScale(22),
          }]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, {
            paddingHorizontal: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(8),
            paddingBottom: dynamicModerateScale(20),
          }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={[styles.welcomeCard, { 
            backgroundColor: theme.colors.cardBackground,
            borderRadius: dynamicModerateScale(12),
            padding: isTabletDevice ? dynamicModerateScale(16) : dynamicModerateScale(12),
            marginBottom: dynamicModerateScale(12),
          }]}>
            <View style={[styles.welcomeIconContainer, { 
              backgroundColor: theme.colors.primary + '15',
              width: isTabletDevice ? dynamicModerateScale(60) : dynamicModerateScale(48),
              height: isTabletDevice ? dynamicModerateScale(60) : dynamicModerateScale(48),
              borderRadius: isTabletDevice ? dynamicModerateScale(30) : dynamicModerateScale(24),
              marginBottom: dynamicModerateScale(10),
            }]}>
              <Icon name="support-agent" size={isTabletDevice ? getIconSize(28) : getIconSize(24)} color={theme.colors.primary} />
            </View>
            <Text style={[styles.welcomeTitle, { 
              color: theme.colors.text,
              fontSize: isTabletDevice ? dynamicModerateScale(14) : dynamicModerateScale(12),
              marginBottom: dynamicModerateScale(6),
            }]}>
              How can we help you?
            </Text>
            <Text style={[styles.welcomeSubtitle, { 
              color: theme.colors.textSecondary,
              fontSize: isTabletDevice ? dynamicModerateScale(9) : dynamicModerateScale(8),
              lineHeight: isTabletDevice ? dynamicModerateScale(14) : dynamicModerateScale(12),
            }]}>
              We're here to assist you with any questions or issues you may have
            </Text>
          </View>

          {/* Contact Options */}
          <View style={[styles.section, {
            marginBottom: dynamicModerateScale(12),
          }]}>
            <Text style={[styles.sectionTitle, { 
              color: '#333333',
              fontSize: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              marginBottom: dynamicModerateScale(8),
            }]}>Contact Us</Text>
            <View style={[styles.contactGrid, {
              gap: dynamicModerateScale(6),
            }]}>
              {contactOptions.map(renderContactOption)}
            </View>
          </View>

          {/* FAQs */}
          <View style={[styles.section, {
            marginBottom: dynamicModerateScale(12),
          }]}>
            <Text style={[styles.sectionTitle, { 
              color: '#333333',
              fontSize: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              marginBottom: dynamicModerateScale(8),
            }]}>
              Frequently Asked Questions
            </Text>
            <View style={[styles.faqContainer, {
              gap: dynamicModerateScale(6),
            }]}>
              {faqs.map(renderFAQItem)}
            </View>
          </View>

          {/* Quick Links */}
          <View style={[styles.section, {
            marginBottom: dynamicModerateScale(12),
          }]}>
            <Text style={[styles.sectionTitle, { 
              color: '#333333',
              fontSize: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(11),
              marginBottom: dynamicModerateScale(8),
            }]}>Quick Links</Text>
            <TouchableOpacity
              style={[styles.quickLinkCard, { 
                backgroundColor: theme.colors.cardBackground,
                padding: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
                borderRadius: dynamicModerateScale(10),
                marginBottom: dynamicModerateScale(6),
              }]}
              onPress={() => navigation.navigate('PrivacyPolicy' as never)}
              activeOpacity={0.7}
            >
              <Icon name="privacy-tip" size={isTabletDevice ? getIconSize(18) : getIconSize(16)} color={theme.colors.primary} />
              <Text style={[styles.quickLinkText, { 
                color: theme.colors.text,
                fontSize: isTabletDevice ? dynamicModerateScale(10) : dynamicModerateScale(9),
                marginLeft: dynamicModerateScale(10),
              }]}>Privacy Policy</Text>
              <Icon name="chevron-right" size={isTabletDevice ? getIconSize(18) : getIconSize(16)} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickLinkCard, { 
                backgroundColor: theme.colors.cardBackground,
                padding: isTabletDevice ? dynamicModerateScale(12) : dynamicModerateScale(10),
                borderRadius: dynamicModerateScale(10),
                marginBottom: dynamicModerateScale(6),
              }]}
              onPress={() => navigation.navigate('Subscription' as never)}
              activeOpacity={0.7}
            >
              <Icon name="card-membership" size={isTabletDevice ? getIconSize(18) : getIconSize(16)} color={theme.colors.primary} />
              <Text style={[styles.quickLinkText, { 
                color: theme.colors.text,
                fontSize: isTabletDevice ? dynamicModerateScale(10) : dynamicModerateScale(9),
                marginLeft: dynamicModerateScale(10),
              }]}>Subscription Plans</Text>
              <Icon name="chevron-right" size={isTabletDevice ? getIconSize(18) : getIconSize(16)} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[styles.footer, {
            paddingVertical: dynamicModerateScale(12),
            marginTop: dynamicModerateScale(8),
          }]}>
            <Text style={[styles.footerText, { 
              color: 'rgba(51, 51, 51, 0.7)',
              fontSize: isTabletDevice ? dynamicModerateScale(9) : dynamicModerateScale(8),
              marginBottom: dynamicModerateScale(2),
            }]}>
              Powered by RSL Solution Private Limited
            </Text>
            <Text style={[styles.footerVersion, { 
              color: 'rgba(102, 102, 102, 0.8)',
              fontSize: isTabletDevice ? dynamicModerateScale(7.5) : dynamicModerateScale(7),
            }]}>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) * 0.3 : 0,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
    headerTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Inline styles used
  },
  welcomeCard: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.06,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  welcomeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    textAlign: 'center',
  },
  section: {
    // Inline styles used
  },
  sectionTitle: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contactGrid: {
    // Inline styles used
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
    elevation: 1,
  },
  contactIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontWeight: '600',
  },
  contactDescription: {
    // Inline styles used
  },
  faqContainer: {
    // Inline styles used
  },
  faqItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontWeight: '600',
  },
  faqAnswer: {
    // Inline styles used
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
    elevation: 1,
  },
  quickLinkText: {
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  footerVersion: {
    textAlign: 'center',
  },
});

export default HelpSupportScreen;

