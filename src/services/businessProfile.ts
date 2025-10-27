import api from './api';
import eventMarketersBusinessProfileService from './eventMarketersBusinessProfileService';

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  logo?: string;
  companyLogo?: string;
  banner?: string;
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessProfileData {
  name: string;                    // Company Name (required)
  description?: string;            // Company Description (optional)
  category: string;                // Business Category (required) - Event Planners, Decorators, Sound Suppliers, Light Suppliers, Video Services
  address: string;                 // Company Address (required)
  phone: string;                   // Mobile Number (required)
  alternatePhone?: string;         // Alternative Mobile Number (optional)
  email: string;                   // Email ID (required)
  website?: string;                // Company Website URL (optional)
  companyLogo?: string;           // Company Logo (optional)
}

class BusinessProfileService {
  private profilesCache: BusinessProfile[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Get user-specific business profiles (with caching)
  async getUserBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
    // Check cache first
    if (this.profilesCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('✅ [CACHE] Returning cached business profiles');
      return this.profilesCache;
    }

    try {
      console.log('📡 [BUSINESS PROFILES] Fetching from server...');
      
      // First check if backend is available with a quick health check
      try {
        await api.get('/health', { timeout: 5000 });
      } catch (healthError: any) {
        throw new Error('Backend server not available');
      }
      
      const response = await api.get(`/api/mobile/business-profile/${userId}`);
      
      if (response.data.success) {
        const profiles = response.data.data.profiles;
        
        if (profiles && profiles.length > 0) {
          // Convert backend profiles to frontend format (optimized - no per-item logging)
          const businessProfiles: BusinessProfile[] = profiles.map((profile: any) => ({
            id: profile.id,
            name: profile.name || profile.businessName,
            description: profile.description || '',
            category: profile.category,
            address: profile.address || '',
            phone: profile.phone || '',
            alternatePhone: profile.alternatePhone || '',
            email: profile.email || '',
            website: profile.website || '',
            logo: profile.logo || '',
            companyLogo: profile.logo || '',
            banner: '',
            services: [],
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }));
          
          // Cache the result
          this.profilesCache = businessProfiles;
          this.cacheTimestamp = Date.now();
          
          console.log(`✅ [BUSINESS PROFILES] Fetched and cached ${businessProfiles.length} profiles`);
          return businessProfiles;
        }
        return [];
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching business profiles:', error);
      
      // If it's a network/timeout error, throw it so the calling code can handle it
      if (error instanceof Error && (
        error.message === 'Backend server not available' ||
        error.message === 'TIMEOUT' ||
        error.message === 'NETWORK_ERROR' ||
        error.message.includes('timeout')
      )) {
        throw error;
      }
      
      return [];
    }
  }

  // Get all business profiles with caching
  async getBusinessProfiles(): Promise<BusinessProfile[]> {
    // Check if cache is valid
    if (this.profilesCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Returning cached business profiles');
      return this.profilesCache;
    }

    try {
      console.log('Fetching business profiles from API...');
      const response = await api.get('/api/mobile/business-profile');
      
      if (response.data.success) {
        const profiles = response.data.data.profiles.map((profile: any) => ({
          id: profile.id,
          name: profile.businessName,
          description: profile.description || '',
          category: profile.category,
          address: profile.address || '',
          phone: profile.phone || '',
          alternatePhone: profile.alternatePhone || '',
          email: profile.email || '',
          website: profile.website || '',
          logo: profile.logo || '',
          companyLogo: profile.logo || '',
          banner: '',
          services: [],
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }));
        this.profilesCache = profiles;
        this.cacheTimestamp = Date.now();
        console.log('✅ Business profiles loaded from API:', profiles.length, 'profiles');
        return profiles;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching business profiles from API:', error);
      // Return cached data if available, otherwise empty array
      if (this.profilesCache) {
        console.log('⚠️ Using cached profiles due to API error');
        return this.profilesCache;
      }
      console.log('⚠️ No profiles available due to API error');
      return [];
    }
  }

  // Get single business profile
  async getBusinessProfile(id: string): Promise<BusinessProfile> {
    try {
      console.log('Fetching business profile by ID:', id);
      const response = await api.get(`/api/mobile/business-profile/${id}`);
      
      if (response.data.success) {
        const profile = response.data.data;
        const mappedProfile = {
          id: profile.id,
          name: profile.businessName,
          description: profile.description || '',
          category: profile.category,
          address: profile.address || '',
          phone: profile.phone || '',
          alternatePhone: profile.alternatePhone || '',
          email: profile.email || '',
          website: profile.website || '',
          logo: profile.logo || '',
          companyLogo: profile.logo || '',
          banner: '',
          services: [],
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };
        console.log('✅ Business profile loaded from API:', mappedProfile.name);
        return mappedProfile;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching business profile from API:', error);
      console.log('⚠️ No profile available due to API error');
      // Throw error instead of returning mock data
      throw new Error(`Business profile with ID ${id} not found`);
    }
  }

  // Create new business profile
  async createBusinessProfile(data: CreateBusinessProfileData): Promise<BusinessProfile> {
    try {
      console.log('Creating business profile via API:', data.name);
      
      // Map frontend data to backend format
      const backendData = {
        businessName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        category: data.category,
        logo: data.companyLogo || '',
        description: data.description || '',
        website: data.website || ''
      };
      
      const response = await api.post('/api/mobile/business-profile', backendData);
      
      if (response.data.success) {
        console.log('✅ Business profile created via API:', response.data.data.id);
        // Clear cache to force refresh
        this.clearCache();
        
        // Map backend response to frontend format
        const backendProfile = response.data.data;
        const newProfile: BusinessProfile = {
          id: backendProfile.id,
          name: backendProfile.businessName,
          description: backendProfile.description || '',
          category: backendProfile.category,
          address: backendProfile.address || '',
          phone: backendProfile.phone || '',
          alternatePhone: backendProfile.alternatePhone || '',
          email: backendProfile.email || '',
          website: backendProfile.website || '',
          companyLogo: backendProfile.logo || '',
          logo: backendProfile.logo || '',
          banner: '',
          services: [],
          createdAt: backendProfile.createdAt,
          updatedAt: backendProfile.updatedAt,
        };
        return newProfile;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error creating business profile via API:', error);
      console.log('⚠️ Business profile creation failed due to API error');
      // Throw error instead of creating mock profile
      throw new Error('Failed to create business profile');
    }
  }

  // Update business profile
  async updateBusinessProfile(id: string, data: Partial<CreateBusinessProfileData>): Promise<BusinessProfile> {
    try {
      console.log('Updating business profile via API:', id);
      
      // Map frontend data to backend format - only include fields that are provided
      const backendData: any = {};
      
      if (data.name !== undefined) backendData.businessName = data.name;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.phone !== undefined) backendData.phone = data.phone;
      if (data.address !== undefined) backendData.address = data.address;
      if (data.category !== undefined) backendData.category = data.category;
      if (data.companyLogo !== undefined) backendData.logo = data.companyLogo;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.website !== undefined) backendData.website = data.website;
      
      console.log('🔍 Making PUT request to:', `/api/mobile/business-profile/${id}`);
      console.log('📤 Request data (partial update):', backendData);
      
      const response = await api.put(`/api/mobile/business-profile/${id}`, backendData);
      
      if (response.data.success) {
        console.log('✅ Business profile updated via API:', response.data.data.businessName);
        // Clear cache to force refresh
        this.clearCache();
        
        // Map backend response to frontend format
        const backendProfile = response.data.data;
        const updatedProfile: BusinessProfile = {
          id: backendProfile.id,
          name: backendProfile.businessName,
          description: backendProfile.description || '',
          category: backendProfile.category,
          address: backendProfile.address || '',
          phone: backendProfile.phone || '',
          alternatePhone: backendProfile.alternatePhone || '',
          email: backendProfile.email || '',
          website: backendProfile.website || '',
          companyLogo: backendProfile.logo || '',
          logo: backendProfile.logo || '',
          banner: '',
          services: [],
          createdAt: backendProfile.createdAt,
          updatedAt: backendProfile.updatedAt,
        };
        return updatedProfile;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error updating business profile via API:', error);
      console.log('⚠️ Business profile update failed due to API error');
      // Throw error instead of returning mock profile
      throw new Error('Failed to update business profile');
    }
  }

  // Delete business profile
  async deleteBusinessProfile(id: string): Promise<void> {
    try {
      console.log('Deleting business profile via API:', id);
      console.log('🔍 Making DELETE request to:', `/api/mobile/business-profile/${id}`);
      const response = await api.delete(`/api/mobile/business-profile/${id}`);
      
      if (response.data.success) {
        console.log('✅ Business profile deleted via API:', id);
        // Clear cache to force refresh
        this.clearCache();
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error: any) {
      console.error('❌ Error deleting business profile via API:', error);
      
      // If endpoint doesn't exist (404), handle gracefully
      if (error.response?.status === 404) {
        console.log('⚠️ Delete endpoint not implemented on backend (404)');
        console.log('⚠️ Clearing cache to allow frontend-only removal');
        // Clear cache so the profile list can be refreshed
        this.clearCache();
        // Don't throw - allow the deletion to succeed on frontend only
        return;
      }
      
      console.log('⚠️ Business profile deletion failed due to API error');
      // Throw error for other types of failures
      throw new Error('Failed to delete business profile');
    }
  }

  // Upload image (logo or banner) using business profile upload endpoint
  async uploadImage(profileId: string, imageType: 'logo' | 'banner', imageUri: string): Promise<{ url: string }> {
    try {
      console.log('Uploading business profile image via API:', imageType, 'for profile:', profileId);
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${imageType}_${Date.now()}.jpg`,
      } as any);

      const response = await api.post(`/api/mobile/business-profile/${profileId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('✅ Business profile image uploaded via API:', response.data.data.url);
        // Clear cache to force refresh
        this.clearCache();
        return { url: response.data.data.url };
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error uploading business profile image via API:', error);
      console.log('⚠️ Image upload failed due to API error');
      // Throw error instead of returning mock URL
      throw new Error('Failed to upload image');
    }
  }

  // Search business profiles (API endpoint removed - use client-side filtering)
  // Searches by: Company Name, Business Category, Mobile Number
  // If userId is provided, searches only that user's profiles
  async searchBusinessProfiles(query: string, userId?: string): Promise<BusinessProfile[]> {
    console.log('⚠️ searchBusinessProfiles - API endpoint removed');
    console.log('⚠️ GET /api/mobile/business-profile?search={query} is no longer supported');
    console.log('🔍 Performing client-side search on query:', query);
    console.log('🔍 User ID:', userId || 'ALL PROFILES');
    console.log('🔍 Search fields: Company Name, Business Category, Mobile Number');
    
    try {
      // Get profiles (user-specific or all)
      let profilesToSearch: BusinessProfile[];
      
      if (userId) {
        console.log('📋 Fetching profiles for user:', userId);
        profilesToSearch = await this.getUserBusinessProfiles(userId);
      } else {
        console.log('📋 Fetching all profiles (no userId provided)');
        profilesToSearch = await this.getBusinessProfiles();
      }
      
      if (!query || query.trim() === '') {
        console.log('📋 Empty query - returning all fetched profiles:', profilesToSearch.length);
        return profilesToSearch;
      }
      
      const lowercaseQuery = query.toLowerCase().trim();
      
      // Filter profiles by company name, business category, or mobile number
      const filtered = profilesToSearch.filter(profile => {
        const matchesName = profile.name.toLowerCase().includes(lowercaseQuery);
        const matchesCategory = profile.category.toLowerCase().includes(lowercaseQuery);
        const matchesPhone = profile.phone.toLowerCase().includes(lowercaseQuery);
        
        return matchesName || matchesCategory || matchesPhone;
      });
      
      console.log('✅ Client-side search completed:', filtered.length, 'results found');
      console.log('📊 Search breakdown:');
      console.log('   - By Company Name:', filtered.filter(p => p.name.toLowerCase().includes(lowercaseQuery)).length);
      console.log('   - By Category:', filtered.filter(p => p.category.toLowerCase().includes(lowercaseQuery)).length);
      console.log('   - By Mobile:', filtered.filter(p => p.phone.toLowerCase().includes(lowercaseQuery)).length);
      
      return filtered;
    } catch (error) {
      console.error('❌ Error during client-side search:', error);
      return [];
    }
  }

  // Get business profiles by category
  async getBusinessProfilesByCategory(category: string): Promise<BusinessProfile[]> {
    try {
      console.log('Fetching business profiles by category via API:', category);
      const response = await api.get(`/api/mobile/business-profile?category=${encodeURIComponent(category)}`);
      
      if (response.data.success) {
        const backendProfiles = response.data.data.profiles;
        
        // Map backend profiles to frontend format
        const profiles = backendProfiles.map((profile: any) => ({
          id: profile.id,
          name: profile.businessName,
          description: profile.description || '',
          category: profile.category,
          address: profile.address || '',
          phone: profile.phone || '',
          alternatePhone: profile.alternatePhone || '',
          email: profile.email || '',
          website: profile.website || '',
          logo: profile.logo || '',
          companyLogo: profile.logo || '',
          banner: '',
          services: [],
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }));
        
        console.log('✅ Business profiles by category loaded via API:', profiles.length, 'profiles');
        return profiles;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching business profiles by category via API:', error);
      console.log('⚠️ No profiles available for category due to API error');
      // Return empty array instead of mock data
      return [];
    }
  }

  // Verify business profile
  async verifyBusinessProfile(id: string): Promise<BusinessProfile> {
    try {
      // This would need a specific verification endpoint
      console.log('⚠️ Business profile verification not implemented - API endpoint needed');
      throw new Error('Business profile verification not available');
    } catch (error) {
      console.error('Error verifying business profile:', error);
      throw error;
    }
  }

  // Clear cache (useful for testing or when data needs to be refreshed)
  clearCache(): void {
    this.profilesCache = null;
    this.cacheTimestamp = 0;
  }

  // Mock data method removed - using only API data
}

export default new BusinessProfileService(); 