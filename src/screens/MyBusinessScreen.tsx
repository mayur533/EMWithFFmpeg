import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BusinessInfo {
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviews: number;
  followers: number;
  posts: number;
}

const MyBusinessScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading business data
    setTimeout(() => {
      setBusinessInfo({
        name: 'My Business',
        category: 'Event Management',
        description: 'Professional event management services for all occasions',
        location: 'New York, NY',
        phone: '+1 (555) 123-4567',
        email: 'contact@mybusiness.com',
        website: 'www.mybusiness.com',
        logo: 'https://via.placeholder.com/150',
        coverImage: 'https://via.placeholder.com/400x200',
        rating: 4.8,
        reviews: 127,
        followers: 1250,
        posts: 45,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality will be implemented');
  };

  const handleViewAnalytics = () => {
    Alert.alert('Analytics', 'Analytics view will be implemented');
  };

  const handleManagePosts = () => {
    Alert.alert('Manage Posts', 'Post management will be implemented');
  };

  const handleViewReviews = () => {
    Alert.alert('Reviews', 'Reviews view will be implemented');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading business information...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Business
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Icon name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cover Image */}
      <View style={styles.coverImageContainer}>
        <Image
          source={{ uri: businessInfo?.coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
      </View>

      {/* Business Info */}
      <View style={[styles.businessInfoContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.businessHeader}>
          <Image
            source={{ uri: businessInfo?.logo }}
            style={styles.businessLogo}
            resizeMode="cover"
          />
          <View style={styles.businessDetails}>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {businessInfo?.name}
            </Text>
            <Text style={[styles.businessCategory, { color: theme.colors.primary }]}>
              {businessInfo?.category}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {businessInfo?.rating} ({businessInfo?.reviews} reviews)
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.businessDescription, { color: theme.colors.textSecondary }]}>
          {businessInfo?.description}
        </Text>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Icon name="location-on" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {businessInfo?.location}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="phone" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {businessInfo?.phone}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="email" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {businessInfo?.email}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="language" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {businessInfo?.website}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {businessInfo?.followers}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Followers
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {businessInfo?.posts}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Posts
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {businessInfo?.reviews}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Reviews
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionsContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleViewAnalytics}
        >
          <Icon name="analytics" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleManagePosts}
        >
          <Icon name="post-add" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Manage Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleViewReviews}
        >
          <Icon name="rate-review" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActionsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="add-business" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
              Add Branch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="event" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
              Create Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="campaign" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
              Marketing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="settings" size={32} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  coverImageContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  businessInfoContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  businessDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActionsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MyBusinessScreen;
