import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import businessProfileService from '../services/businessProfile';
import userBusinessProfilesService from '../services/userBusinessProfiles';
import authService from '../services/auth';
import BusinessProfileForm from '../components/BusinessProfileForm';
import BottomSheet from '../components/BottomSheet';
import responsiveUtils, { 
  responsiveSpacing, 
  responsiveFontSize, 
  responsiveSize, 
  responsiveLayout, 
  responsiveShadow, 
  responsiveText, 
  responsiveGrid, 
  responsiveButton, 
  responsiveInput, 
  responsiveCard,
  isTablet,
  isLandscape 
} from '../utils/responsiveUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design helpers - using imported utilities

const BusinessProfilesScreen: React.FC = () => {
  const { isDarkMode, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]); // Cache all profiles for instant filtering
  const [mainProfileId, setMainProfileId] = useState<string | null>(null); // Track the main/primary profile ID
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now()); // Key to force image refresh
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Memoized mock data for immediate loading
  const mockProfiles = useMemo(() => [
    {
      id: '1',
      name: 'Creative Events Studio',
      category: 'Event Planning',
      description: 'Professional event planning and management services for all occasions.',
      phone: '+1 (555) 123-4567',
      email: 'info@creativeevents.com',
      address: '123 Main Street, City, State 12345',
      services: ['Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Anniversary Celebrations'],
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
    },
    {
      id: '2',
      name: 'Elite Marketing Solutions',
      category: 'Marketing',
      description: 'Comprehensive marketing solutions for businesses of all sizes.',
      phone: '+1 (555) 987-6543',
      email: 'contact@elitemarketing.com',
      address: '456 Business Ave, Downtown, State 54321',
      services: ['Digital Marketing', 'Social Media Management', 'Content Creation', 'Brand Strategy'],
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
    },
    {
      id: '3',
      name: 'Premier Catering Services',
      category: 'Catering',
      description: 'Exquisite catering services for weddings, corporate events, and special occasions.',
      phone: '+1 (555) 456-7890',
      email: 'info@premiercatering.com',
      address: '789 Food Court, Culinary District, State 67890',
      services: ['Wedding Catering', 'Corporate Catering', 'Private Parties', 'Menu Planning'],
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop',
    },
  ], []);

  const loadBusinessProfiles = useCallback(async () => {
    setLoading(true);
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      console.log('🔍 BusinessProfilesScreen - User ID:', userId);
      console.log('🖼️ Current user logo:', currentUser?.logo || '(empty)');
      console.log('🖼️ Current user companyLogo:', currentUser?.companyLogo || '(empty)');
      
      if (!userId) {
        console.log('⚠️ No user ID available, no profiles to load');
        setProfiles([]);
        return;
      }
      
      console.log('🔍 Loading user-specific business profiles for user:', userId);
      
      // Try to get user-specific profiles from API first
      const apiProfiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      // Auto-sync ALL user profile fields to the MAIN/FIRST business profile (user's profile from registration)
      if (apiProfiles.length > 0) {
        // Sort to ensure we get the oldest profile (created during registration)
        const sortedByDate = [...apiProfiles].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        const mainProfile = sortedByDate[0]; // First profile = user's main profile
        const otherProfiles = sortedByDate.slice(1); // All other profiles
        
        // Check if ANY user profile field needs to be synced
        const userName = currentUser?._originalCompanyName || currentUser?.companyName || currentUser?.name;
        const userPhone = currentUser?.phoneNumber || currentUser?.phone;
        const userEmail = currentUser?.email;
        const userAddress = currentUser?._originalAddress || currentUser?.address || '';
        const userWebsite = currentUser?._originalWebsite || currentUser?.website || '';
        const userCategory = currentUser?._originalCategory || currentUser?.category || '';
        const userDescription = currentUser?._originalDescription || currentUser?.description || '';
        const userAlternatePhone = currentUser?._originalAlternatePhone || currentUser?.alternatePhone || '';
        const userLogo = currentUser?.logo || currentUser?.companyLogo || '';
        
        // Check if sync is needed
        const needsSync = 
          mainProfile.name !== userName ||
          mainProfile.phone !== userPhone ||
          mainProfile.email !== userEmail ||
          mainProfile.address !== userAddress ||
          mainProfile.website !== userWebsite ||
          mainProfile.category !== userCategory ||
          mainProfile.description !== userDescription ||
          mainProfile.alternatePhone !== userAlternatePhone ||
          (mainProfile.logo || mainProfile.companyLogo || '') !== userLogo;
        
        if (needsSync) {
          console.log('🔄 Auto-syncing user profile data to MAIN business profile...');
          console.log('📍 Target profile:', mainProfile.name, '(created:', mainProfile.createdAt, ')');
          console.log('📋 Syncing fields:');
          console.log('   - Name:', userName);
          console.log('   - Phone:', userPhone);
          console.log('   - Email:', userEmail);
          console.log('   - Category:', userCategory);
          console.log('   - Logo:', userLogo ? 'Yes' : 'No');
          
          try {
            // Sync ALL user fields to main business profile
            await businessProfileService.updateBusinessProfile(mainProfile.id, {
              name: userName,
              phone: userPhone,
              email: userEmail,
              address: userAddress,
              website: userWebsite,
              category: userCategory,
              description: userDescription,
              alternatePhone: userAlternatePhone,
              companyLogo: userLogo,
            });
            
            // Update the profile in the array
            mainProfile.name = userName;
            mainProfile.phone = userPhone;
            mainProfile.email = userEmail;
            mainProfile.address = userAddress;
            mainProfile.website = userWebsite;
            mainProfile.category = userCategory;
            mainProfile.description = userDescription;
            mainProfile.alternatePhone = userAlternatePhone;
            mainProfile.logo = userLogo;
            mainProfile.companyLogo = userLogo;
            
            console.log(`✅ All user fields synced to MAIN profile: ${userName}`);
            
            // Clear cache after sync
            businessProfileService.clearCache();
            
            // Clear business category posters cache to refresh My Business screen with new category posters
            console.log('🔄 Clearing business category posters cache after profile sync');
            try {
              const businessCategoryPostersApi = require('../services/businessCategoryPostersApi').default;
              businessCategoryPostersApi.clearCache();
            } catch (error) {
              console.error('Failed to clear business category posters cache:', error);
            }
          } catch (error) {
            console.error(`❌ Failed to sync user data to main profile:`, error);
          }
        } else {
          console.log('ℹ️ Main profile already has all current user data, skipping sync');
        }
        
        // REMOVE user's logo FROM other business profiles (they should have their own logos)
        if (userLogo) {
          let removedCount = 0;
          for (const profile of otherProfiles) {
            const profileLogo = profile.logo || profile.companyLogo;
            // If other profile has the user's logo, remove it
            if (profileLogo === userLogo) {
              console.log(`🗑️ Removing user logo from other profile: ${profile.name}`);
              try {
                await businessProfileService.updateBusinessProfile(profile.id, {
                  companyLogo: '', // Clear the logo
                });
                
                // Update in array
                profile.logo = '';
                profile.companyLogo = '';
                
                console.log(`✅ User logo removed from: ${profile.name}`);
                removedCount++;
              } catch (error) {
                console.error(`❌ Failed to remove logo from ${profile.name}:`, error);
              }
            }
          }
          
          if (removedCount > 0) {
            console.log(`✅ Removed user logo from ${removedCount} other business profiles`);
            businessProfileService.clearCache();
          }
        }
      }
      
      if (apiProfiles.length > 0) {
        // Sort profiles by creation date - OLDEST first (so first profile created stays at index 0)
        const sortedProfiles = apiProfiles.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Cache all profiles for instant search filtering
        setAllProfiles(sortedProfiles);
        setProfiles(sortedProfiles);
        
        // Set the first profile (oldest) as the main/primary profile (from registration)
        // This is set only once when profiles are initially loaded
        if (!mainProfileId && sortedProfiles[0]?.id) {
          setMainProfileId(sortedProfiles[0].id);
          console.log('📍 Main profile ID set to:', sortedProfiles[0].id, '-', sortedProfiles[0].name);
        }
        
        console.log('✅ Loaded user-specific business profiles from API:', sortedProfiles.length);
        console.log('🔍 First profile (Your Profile):', sortedProfiles[0]?.name, '- Created:', sortedProfiles[0]?.createdAt);
        
        // Log logo URLs for debugging
        sortedProfiles.forEach((profile, index) => {
          console.log(`🖼️ Profile ${index + 1} - ${profile.name}:`);
          console.log(`   - Logo: ${profile.logo || '(empty)'}`);
          console.log(`   - CompanyLogo: ${profile.companyLogo || '(empty)'}`);
        });
      } else {
        // No profiles found from API
        setAllProfiles([]);
        setProfiles([]);
        console.log('📋 No business profiles found for user');
      }
    } catch (error) {
      console.error('Error loading business profiles:', error);
      // No profiles available due to error
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [mainProfileId]);

  useEffect(() => {
    loadBusinessProfiles();
  }, [loadBusinessProfiles]);

  // Refresh profiles when screen comes into focus (e.g., returning from Profile edit)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 BusinessProfilesScreen focused - refreshing profiles and images...');
      setImageRefreshKey(Date.now()); // Force image refresh
      loadBusinessProfiles();
    }, [loadBusinessProfiles])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setImageRefreshKey(Date.now()); // Force image refresh on pull-to-refresh
    await loadBusinessProfiles();
    setRefreshing(false);
  }, [loadBusinessProfiles]);

  // Instant search filter using cached profiles (no API call needed)
  const filterProfiles = useCallback((query: string) => {
    if (!query || query.trim() === '') {
      // No search query - show all profiles
      setProfiles(allProfiles);
      console.log('📋 Showing all profiles:', allProfiles.length);
      return;
    }

    const lowercaseQuery = query.toLowerCase().trim();
    
    // Filter cached profiles by company name, business category, or mobile number
    const filtered = allProfiles.filter(profile => {
      const matchesName = profile.name?.toLowerCase().includes(lowercaseQuery);
      const matchesCategory = profile.category?.toLowerCase().includes(lowercaseQuery);
      const matchesPhone = profile.phone?.toLowerCase().includes(lowercaseQuery);
      
      return matchesName || matchesCategory || matchesPhone;
    });
    
    setProfiles(filtered);
    console.log('🔍 Instant search results:', filtered.length, 'profiles found for query:', query);
  }, [allProfiles]);

  // Debounced search effect - automatically filter as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterProfiles(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterProfiles]);

  const handleDeleteProfile = useCallback((profileId: string) => {
    setProfileToDelete(profileId);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteProfile = useCallback(async () => {
    if (!profileToDelete) return;
    
    try {
      await businessProfileService.deleteBusinessProfile(profileToDelete);
      // Update both displayed profiles and cached profiles
      setProfiles(prev => prev.filter(p => p.id !== profileToDelete));
      setAllProfiles(prev => prev.filter(p => p.id !== profileToDelete));
      setSuccessMessage('Business profile deleted successfully');
      setShowSuccessModal(true);
      console.log('✅ Business profile deleted:', profileToDelete);
      
      // Refresh the profiles list to ensure consistency
      setTimeout(() => {
        loadBusinessProfiles();
      }, 1000);
    } catch (error) {
      console.error('Error deleting profile:', error);
      setErrorMessage('Failed to delete profile. Please try again.');
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
      setProfileToDelete(null);
    }
  }, [profileToDelete]);

  const handleEditProfile = useCallback((profile: any) => {
    setEditingProfile(profile);
    setShowForm(true);
  }, []);

  const handleAddProfile = useCallback(() => {
    setEditingProfile(null);
    setShowBottomSheet(true);
  }, []);

  const handleFormSubmit = useCallback(async (formData: any) => {
    setFormLoading(true);
    try {
      if (editingProfile) {
        // Update existing profile
        console.log('🔄 Updating profile with ID:', editingProfile.id);
        console.log('📤 Form data being sent:', formData);
        
        const updatedProfile = await businessProfileService.updateBusinessProfile(editingProfile.id, formData);
        console.log('✅ Updated profile received:', updatedProfile);
        
        // Update both displayed profiles and cached profiles
        const updateFn = (prev: any[]) => prev.map(p => p.id === editingProfile.id ? updatedProfile : p);
        setProfiles(updateFn);
        setAllProfiles(updateFn);
        
        setSuccessMessage('Business profile updated successfully');
        setShowSuccessModal(true);
        console.log('✅ Business profile updated:', editingProfile.id);
        
        // Clear business category posters cache to refresh My Business screen with new category posters
        console.log('🔄 Clearing business category posters cache after profile update');
        try {
          const businessCategoryPostersApi = require('../services/businessCategoryPostersApi').default;
          businessCategoryPostersApi.clearCache();
        } catch (error) {
          console.error('Failed to clear business category posters cache:', error);
        }
        
        // Refresh the profiles list to ensure consistency
        setTimeout(() => {
          console.log('🔄 Refreshing profiles list after update...');
          loadBusinessProfiles();
        }, 1000);
      } else {
        // Create new profile
        const newProfile = await businessProfileService.createBusinessProfile(formData);
        // Add to both displayed profiles and cached profiles
        setProfiles(prev => [...prev, newProfile]);
        setAllProfiles(prev => [...prev, newProfile]);
        setSuccessMessage('Business profile created successfully');
        setShowSuccessModal(true);
        console.log('✅ Business profile created:', newProfile.id);
        
        // Refresh the profiles list to ensure consistency
        setTimeout(() => {
          loadBusinessProfiles();
        }, 1000);
      }
      
      setShowForm(false);
      setShowBottomSheet(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('Failed to save profile. Please try again.');
      setShowErrorModal(true);
    } finally {
      setFormLoading(false);
    }
  }, [editingProfile]);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setShowBottomSheet(false);
    setEditingProfile(null);
  }, []);

  const renderBusinessCard = useCallback(({ item, index }: { item: any; index: number }) => {
    // Check if this is the user's main profile (from registration)
    // Use the profile ID to determine, not the index (so it works correctly during search)
    const isUserOwnProfile = mainProfileId !== null && item.id === mainProfileId;
    
    return (
      <View style={[styles.businessCard, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.cardHeader}>
          <View style={styles.businessInfoWithLogo}>
            {/* Business Logo */}
            <View style={styles.logoContainer}>
              {item.companyLogo || item.logo ? (
                <Image
                  source={{ 
                    uri: `${item.companyLogo || item.logo}?t=${imageRefreshKey}`,
                    cache: 'reload' // Force reload from network, not cache
                  }}
                  style={styles.businessLogo}
                  resizeMode="cover"
                  key={`${item.id}-logo-${imageRefreshKey}`} // Force re-render with refresh key
                  onError={(error) => {
                    console.log(`❌ Failed to load logo for ${item.name}:`, error.nativeEvent);
                  }}
                  onLoad={() => {
                    console.log(`✅ Logo loaded for ${item.name}`);
                  }}
                />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Icon name="business" size={24} color={theme.colors.primary} />
                </View>
              )}
            </View>
            
            <View style={styles.businessInfo}>
              <Text style={[styles.businessName, { color: theme.colors.text }]}>
                {item.name || 'Business Name'}
                {isUserOwnProfile && (
                  <Text style={[styles.userBadge, { color: theme.colors.primary }]}> (Your Profile)</Text>
                )}
              </Text>
              {item.category && (
                <Text style={[styles.businessCategory, { color: theme.colors.primary }]}>
                  {item.category}
                </Text>
              )}
            </View>
          </View>
          
          {/* Only show edit/delete buttons for additional business profiles, not user's own profile */}
          {!isUserOwnProfile && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.colors.primary}20` }]}
                onPress={() => handleEditProfile(item)}
              >
                <Icon name="edit" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.colors.error}20` }]}
                onPress={() => handleDeleteProfile(item.id)}
              >
                <Icon name="delete" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

      {item.description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      )}

      <View style={styles.contactInfo}>
        {item.phone && (
          <View style={styles.contactItem}>
            <Icon name="phone" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.phone}
            </Text>
          </View>
        )}
        {item.alternatePhone && (
          <View style={styles.contactItem}>
            <Icon name="phone-in-talk" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.alternatePhone} (Alt)
            </Text>
          </View>
        )}
        {item.email && (
          <View style={styles.contactItem}>
            <Icon name="email" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
          </View>
        )}
        {item.address && (
          <View style={styles.contactItem}>
            <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.address}
            </Text>
          </View>
        )}
        {item.website && (
          <View style={styles.contactItem}>
            <Icon name="language" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.website}
            </Text>
          </View>
        )}
      </View>

      {item.services && item.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={[styles.servicesTitle, { color: theme.colors.text }]}>Services:</Text>
          <View style={styles.servicesList}>
            {item.services.slice(0, 3).map((service: string, index: number) => (
              <View key={`${item.id}-service-${index}-${service}`} style={[styles.serviceTag, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Text style={[styles.serviceText, { color: theme.colors.primary }]}>{service}</Text>
              </View>
            ))}
            {item.services.length > 3 && (
              <View key={`${item.id}-more-services`} style={[styles.serviceTag, { backgroundColor: `${theme.colors.textSecondary}20` }]}>
                <Text style={[styles.serviceText, { color: theme.colors.textSecondary }]}>
                  +{item.services.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
    );
  }, [mainProfileId, imageRefreshKey, theme, handleEditProfile, handleDeleteProfile]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + responsiveSpacing.sm }]}>
          <Text style={styles.headerTitle}>Business Profiles</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.cardBackground }]}
            onPress={handleAddProfile}
          >
            <Icon name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.cardBackground }]}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search business profiles..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Business Profiles List */}
        <FlatList
          data={profiles}
          renderItem={renderBusinessCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContainer, 
            { paddingBottom: 120 + insets.bottom },
            profiles.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="business-center" size={80} color={theme.colors.primary} style={styles.emptyStateIcon} />
                <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                  {searchQuery ? 'No Profiles Found' : 'No Business Profiles'}
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.colors.text }]}>
                  {searchQuery 
                    ? `No profiles match "${searchQuery}". Try a different search term.`
                    : 'You haven\'t created any business profiles yet. Tap the + button to create your first profile.'
                  }
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAddProfile}
                  >
                    <Icon name="add" size={20} color="#ffffff" />
                    <Text style={styles.emptyStateButtonText}>Create Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />

        {/* Business Profile Form Modal */}
        <BusinessProfileForm
          visible={showForm}
          profile={editingProfile}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          loading={formLoading}
        />

        {/* Bottom Sheet for Add Profile */}
        <BottomSheet
          title="Add Business Profile"
          visible={showBottomSheet}
          onClose={handleFormClose}
        >
          <BusinessProfileForm
            visible={showBottomSheet}
            profile={null}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
            loading={formLoading}
          />
        </BottomSheet>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSuccessModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping inside modal
            >
              <View style={[styles.successModalContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.successModalHeader}>
                  <View style={[styles.successIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Icon name="check-circle" size={Math.min(screenWidth * 0.08, 32)} color={theme.colors.primary} />
                  </View>
                  <Text 
                    style={[styles.successModalTitle, { color: theme.colors.text }]}
                  >
                    Success
                  </Text>
                  <TouchableOpacity 
                    style={[styles.closeModalButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => setShowSuccessModal(false)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={Math.min(screenWidth * 0.06, 24)} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.successModalContent}>
                  <Text style={[styles.successModalMessage, { color: theme.colors.text }]}>
                    {successMessage}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.successModalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.successModalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeleteModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping inside modal
            >
              <View style={[styles.deleteModalContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.deleteModalHeader}>
                  <View style={[styles.deleteIconContainer, { backgroundColor: '#ff444420' }]}>
                    <Icon name="warning" size={Math.min(screenWidth * 0.08, 32)} color="#ff4444" />
                  </View>
                  <Text 
                    style={[styles.deleteModalTitle, { color: theme.colors.text }]}
                  >
                    Delete Profile
                  </Text>
                  <TouchableOpacity 
                    style={[styles.closeModalButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => setShowDeleteModal(false)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={Math.min(screenWidth * 0.06, 24)} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.deleteModalContent}>
                  <Text style={[styles.deleteModalMessage, { color: theme.colors.text }]}>
                    Are you sure you want to delete this business profile? This action cannot be undone.
                  </Text>
                </View>
                
                <View style={styles.deleteModalButtons}>
                  <TouchableOpacity 
                    style={[styles.deleteModalCancelButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={[styles.deleteModalCancelText, { color: theme.colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.deleteModalDeleteButton, { backgroundColor: '#ff4444' }]}
                    onPress={confirmDeleteProfile}
                  >
                    <Text style={styles.deleteModalDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Error Modal */}
        <Modal
          visible={showErrorModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowErrorModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping inside modal
            >
              <View style={[styles.errorModalContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.errorModalHeader}>
                  <View style={[styles.errorIconContainer, { backgroundColor: '#ff444420' }]}>
                    <Icon name="error-outline" size={Math.min(screenWidth * 0.08, 32)} color="#ff4444" />
                  </View>
                  <Text 
                    style={[styles.errorModalTitle, { color: theme.colors.text }]}
                  >
                    Error
                  </Text>
                  <TouchableOpacity 
                    style={[styles.closeModalButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => setShowErrorModal(false)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={Math.min(screenWidth * 0.06, 24)} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.errorModalContent}>
                  <Text style={[styles.errorModalMessage, { color: theme.colors.text }]}>
                    {errorMessage}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.errorModalButton, { backgroundColor: '#ff4444' }]}
                  onPress={() => setShowErrorModal(false)}
                >
                  <Text style={styles.errorModalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveLayout.headerPaddingHorizontal,
    paddingTop: Math.max(responsiveSpacing.md, screenHeight * 0.02),
    paddingBottom: Math.max(responsiveSpacing.md, screenHeight * 0.02),
  },
  headerTitle: {
    fontSize: responsiveText.heading,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    width: Math.max(44, screenWidth * 0.1),
    height: Math.max(44, screenWidth * 0.1),
    borderRadius: Math.max(22, screenWidth * 0.05),
    justifyContent: 'center',
    alignItems: 'center',
    ...responsiveShadow.medium,
  },
  searchContainer: {
    paddingHorizontal: responsiveLayout.containerPaddingHorizontal,
    marginBottom: Math.max(responsiveSpacing.md, screenHeight * 0.02),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Math.max(25, screenWidth * 0.06),
    paddingHorizontal: Math.max(responsiveSpacing.md, screenWidth * 0.04),
    paddingVertical: Math.max(responsiveSpacing.sm, screenHeight * 0.012),
    ...responsiveShadow.medium,
  },
  searchInput: {
    flex: 1,
    marginLeft: Math.max(responsiveSpacing.sm, screenWidth * 0.03),
    fontSize: responsiveText.body,
  },
  listContainer: {
    paddingHorizontal: responsiveLayout.containerPaddingHorizontal,
    paddingBottom: 100, // Add padding to account for tab bar
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing.xl,
    paddingVertical: screenHeight * 0.1,
  },
  emptyStateIcon: {
    opacity: 0.5,
    marginBottom: responsiveSpacing.lg,
  },
  emptyStateTitle: {
    fontSize: responsiveText.title,
    fontWeight: '700',
    marginBottom: responsiveSpacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: responsiveText.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: responsiveSpacing.xl,
    opacity: 0.85,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing.xl,
    paddingVertical: responsiveSpacing.md,
    borderRadius: 25,
    ...responsiveShadow.medium,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: responsiveText.body,
    fontWeight: '600',
    marginLeft: responsiveSpacing.sm,
  },
  businessCard: {
    borderRadius: responsiveSize.cardBorderRadius,
    padding: responsiveSize.cardPadding,
    marginBottom: responsiveSize.cardMarginBottom,
    ...responsiveShadow.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: screenHeight * 0.015,
  },
  businessInfoWithLogo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    marginRight: screenWidth * 0.03,
  },
  businessLogo: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoPlaceholder: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.005,
  },
  userBadge: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    fontWeight: '500',
    fontStyle: 'italic',
  },
  businessCategory: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    fontWeight: '600',
    marginBottom: screenHeight * 0.005,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    borderRadius: screenWidth * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: screenWidth * 0.02,
  },
  description: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    lineHeight: 20,
    marginBottom: screenHeight * 0.015,
  },
  contactInfo: {
    marginBottom: screenHeight * 0.015,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.005,
  },
  contactText: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    marginLeft: screenWidth * 0.02,
  },
  servicesContainer: {
    marginTop: screenHeight * 0.01,
  },
  servicesTitle: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    fontWeight: '600',
    marginBottom: screenHeight * 0.008,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    paddingHorizontal: screenWidth * 0.03,
    paddingVertical: screenHeight * 0.005,
    borderRadius: 15,
    marginRight: screenWidth * 0.02,
    marginBottom: screenHeight * 0.005,
  },
  serviceText: {
    fontSize: Math.min(screenWidth * 0.025, 10),
    fontWeight: '500',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    borderRadius: Math.min(screenWidth * 0.06, 24),
    padding: Math.min(screenWidth * 0.05, 20),
    width: '100%',
    maxWidth: Math.min(screenWidth * 0.9, 400),
    minWidth: Math.min(screenWidth * 0.8, 320),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 25,
    alignSelf: 'center',
  },
  successModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Math.min(screenHeight * 0.02, 16),
    paddingBottom: Math.min(screenHeight * 0.015, 12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: Math.min(screenWidth * 0.12, 48),
  },
  successIconContainer: {
    width: Math.min(screenWidth * 0.12, 48),
    height: Math.min(screenWidth * 0.12, 48),
    borderRadius: Math.min(screenWidth * 0.06, 24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Math.min(screenWidth * 0.04, 16),
  },
  successModalTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '700',
    flex: 1,
    marginHorizontal: Math.min(screenWidth * 0.02, 8),
    textAlign: 'center',
  },
  successModalContent: {
    paddingVertical: Math.min(screenHeight * 0.01, 8),
    marginBottom: Math.min(screenHeight * 0.02, 16),
  },
  successModalMessage: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    lineHeight: Math.min(screenWidth * 0.05, 20),
    textAlign: 'center',
    opacity: 0.9,
  },
  successModalButton: {
    borderRadius: Math.min(screenWidth * 0.03, 12),
    paddingVertical: Math.min(screenHeight * 0.018, 14),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successModalButtonText: {
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: '600',
    color: '#ffffff',
  },
  // Delete Modal Styles (matching login screen error modal)
  deleteModalContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    padding: screenWidth * 0.06,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
    position: 'relative',
  },
  deleteIconContainer: {
    width: Math.min(screenWidth * 0.18, 72),
    height: Math.min(screenWidth * 0.18, 72),
    borderRadius: Math.min(screenWidth * 0.09, 36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: screenHeight * 0.015,
  },
  deleteModalTitle: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: '700',
    textAlign: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: -screenHeight * 0.01,
    right: -screenWidth * 0.02,
    width: Math.min(screenWidth * 0.08, 32),
    height: Math.min(screenWidth * 0.08, 32),
    borderRadius: Math.min(screenWidth * 0.04, 16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    marginBottom: screenHeight * 0.025,
  },
  deleteModalMessage: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.06, 24),
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: Math.min(screenWidth * 0.03, 12),
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: screenHeight * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteModalCancelText: {
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: '600',
  },
  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: screenHeight * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteModalDeleteText: {
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: '600',
    color: '#ffffff',
  },
  // Error Modal Styles (matching login screen)
  errorModalContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    padding: screenWidth * 0.06,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorModalHeader: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
    position: 'relative',
  },
  errorIconContainer: {
    width: Math.min(screenWidth * 0.18, 72),
    height: Math.min(screenWidth * 0.18, 72),
    borderRadius: Math.min(screenWidth * 0.09, 36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: screenHeight * 0.015,
  },
  errorModalTitle: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: '700',
    textAlign: 'center',
  },
  errorModalContent: {
    marginBottom: screenHeight * 0.025,
  },
  errorModalMessage: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.06, 24),
  },
  errorModalButton: {
    paddingVertical: screenHeight * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorModalButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: '600',
  },
});

export default BusinessProfilesScreen; 