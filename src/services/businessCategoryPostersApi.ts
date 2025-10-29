import api from './api';
import authService from './auth';

export interface BusinessCategoryPoster {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  imageUrl: string;
  downloadUrl: string;

  downloads: number;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCategoryPostersResponse {
  success: boolean;
  data: {
    posters: BusinessCategoryPoster[];
    category: string;
    total: number;
  };
  message: string;
}

class BusinessCategoryPostersApiService {
  private postersCache: Map<string, { data: BusinessCategoryPoster[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get posters for a specific business category
   */
  async getPostersByCategory(category: string): Promise<BusinessCategoryPostersResponse> {
    try {
      const cacheKey = `category_${category}`;
      const now = Date.now();
      
      // Check cache first
      if (this.postersCache.has(cacheKey)) {
        const cached = this.postersCache.get(cacheKey)!;
        const cacheAge = now - cached.timestamp;
        
        if (cacheAge < this.CACHE_DURATION) {
          console.log(`✅ [CACHE] Returning ${cached.data.length} cached posters for: ${category}`);
          return {
            success: true,
            data: {
              posters: cached.data,
              category,
              total: cached.data.length
            },
            message: 'Posters fetched from cache'
          };
        }
      }

      console.log(`📡 [CATEGORY POSTERS API] Fetching posters for: ${category}`);
      console.log(`📡 [CATEGORY POSTERS API] Endpoint: /api/mobile/posters/category/${encodeURIComponent(category)}`);
      
      const response = await api.get(`/api/mobile/posters/category/${encodeURIComponent(category)}`);
      
      // ===== PRINT COMPLETE API RESPONSE =====
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📦 [CATEGORY POSTERS API] COMPLETE RESPONSE FOR: ${category}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Response Status:', response.status);
      console.log('📋 Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('📋 Full Response Data:', JSON.stringify(response.data, null, 2));
      console.log('═══════════════════════════════════════════════════════');
      
      if (response.data.success) {
        const posters = response.data.data.posters;
        
        console.log('✅ [CATEGORY POSTERS API] Response Details:');
        console.log('   - Success:', response.data.success);
        console.log('   - Message:', response.data.message);
        console.log('   - Category:', response.data.data.category || category);
        console.log('   - Total Posters:', response.data.data.total);
        console.log('   - Posters Count:', posters.length);
        
        // Log first poster as example
        if (posters.length > 0) {
          console.log('📸 [FIRST POSTER EXAMPLE]:');
          console.log('   Raw Data:', JSON.stringify(posters[0], null, 2));
          console.log('   - ID:', posters[0].id);
          console.log('   - Title:', posters[0].title);
          console.log('   - Description:', posters[0].description);
          console.log('   - Category:', posters[0].category);
          console.log('   - Thumbnail URL:', posters[0].thumbnailUrl || posters[0].thumbnail);
          console.log('   - Image URL:', posters[0].imageUrl);
          console.log('   - Download URL:', posters[0].downloadUrl);
          console.log('   - Downloads:', posters[0].downloads);
          console.log('   - Is Premium:', posters[0].isPremium);
          console.log('   - Tags:', posters[0].tags);
        }
        
        // Convert backend response to frontend format and fix URLs (optimized - no per-item logging)
        const baseUrl = 'https://eventmarketersbackend.onrender.com';
        const postersWithAbsoluteUrls = posters.map((poster: any) => {
          // Backend returns 'thumbnailUrl', frontend expects 'thumbnail'
          const thumbnailUrl = poster.thumbnailUrl || poster.thumbnail;
          const imageUrl = poster.imageUrl;
          const downloadUrl = poster.downloadUrl;
          
          return {
            id: poster.id,
            title: poster.title,
            description: poster.description,
            category: poster.category,
            thumbnail: thumbnailUrl && !thumbnailUrl.startsWith('http') 
              ? `${baseUrl}${thumbnailUrl}` 
              : thumbnailUrl,
            imageUrl: imageUrl && !imageUrl.startsWith('http')
              ? `${baseUrl}${imageUrl}`
              : imageUrl,
            downloadUrl: downloadUrl && !downloadUrl.startsWith('http')
              ? `${baseUrl}${downloadUrl}`
              : downloadUrl,
            downloads: poster.downloads || 0,
            isPremium: poster.isPremium || false,
            tags: poster.tags || [],
            createdAt: poster.createdAt,
            updatedAt: poster.updatedAt || poster.createdAt,
          } as BusinessCategoryPoster;
        });
        
        // Cache the results with absolute URLs
        this.postersCache.set(cacheKey, {
          data: postersWithAbsoluteUrls,
          timestamp: now
        });
        
        console.log(`✅ [CATEGORY POSTERS API] Fetched and cached ${postersWithAbsoluteUrls.length} posters`);
        
        // Log processed data after URL conversion
        if (postersWithAbsoluteUrls.length > 0) {
          console.log('🔧 [PROCESSED POSTER EXAMPLE] After URL conversion:');
          console.log('   Processed Data:', JSON.stringify(postersWithAbsoluteUrls[0], null, 2));
          console.log('   - Thumbnail (absolute):', postersWithAbsoluteUrls[0].thumbnail);
          console.log('   - Image URL (absolute):', postersWithAbsoluteUrls[0].imageUrl);
          console.log('   - Download URL (absolute):', postersWithAbsoluteUrls[0].downloadUrl);
        }
        console.log('═══════════════════════════════════════════════════════');
        
        return {
          ...response.data,
          data: {
            ...response.data.data,
            posters: postersWithAbsoluteUrls
          }
        };
      } else {
        console.log('⚠️ [CATEGORY POSTERS API] Response Success = false');
        console.log('⚠️ Error from API:', response.data.error);
        console.log('═══════════════════════════════════════════════════════');
        throw new Error(response.data.error || 'Failed to fetch posters');
      }
    } catch (error: any) {
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌ [CATEGORY POSTERS API] ERROR OCCURRED');
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌ Error Type:', error.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Details:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('❌ Error Response Status:', error.response.status);
        console.error('❌ Error Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('❌ Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      console.error('❌ Full Error Stack:', error.stack);
      console.log('═══════════════════════════════════════════════════════');
      
      // Return empty data when API fails
      return {
        success: false,
        data: {
          posters: [],
          category,
          total: 0
        },
        message: 'No posters available - API endpoint not found'
      };
    }
  }

  /**
   * Get user's business category and fetch relevant posters (optimized logging)
   */
  async getUserCategoryPosters(): Promise<BusinessCategoryPostersResponse> {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('👤 [USER CATEGORY POSTERS] STARTING REQUEST');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📡 [USER CATEGORY POSTERS] Fetching user category...');
      
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      console.log('👤 Current User ID:', userId);
      console.log('👤 Current User Data:', JSON.stringify(currentUser, null, 2));
      
      if (!userId) {
        console.log('⚠️ [USER CATEGORY POSTERS] No user ID, using General category');
        console.log('═══════════════════════════════════════════════════════');
        return this.getPostersByCategory('General');
      }

      // Get user's business profiles to determine category
      console.log('🔍 [USER CATEGORY POSTERS] Fetching business profiles for user:', userId);
      const businessProfileService = (await import('./businessProfile')).default;
      const userProfiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      console.log('📋 [USER CATEGORY POSTERS] User Profiles Count:', userProfiles.length);
      if (userProfiles.length > 0) {
        console.log('📋 [USER CATEGORY POSTERS] All User Profiles:', JSON.stringify(userProfiles, null, 2));
        const primaryCategory = userProfiles[0].category;
        console.log(`✅ [USER CATEGORY POSTERS] Using primary category: ${primaryCategory}`);
        console.log('📊 Primary Profile Details:', JSON.stringify(userProfiles[0], null, 2));
        console.log('═══════════════════════════════════════════════════════');
        return this.getPostersByCategory(primaryCategory);
      } else {
        console.log('⚠️ [USER CATEGORY POSTERS] No profiles found, using General category');
        console.log('═══════════════════════════════════════════════════════');
        return this.getPostersByCategory('General');
      }
    } catch (error) {
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌ [USER CATEGORY POSTERS] ERROR:', error);
      console.error('❌ Error Details:', JSON.stringify(error, null, 2));
      console.log('═══════════════════════════════════════════════════════');
      // Return empty data when there's an error
      return {
        success: false,
        data: {
          posters: [],
          category: 'General',
          total: 0
        },
        message: 'No posters available - unable to determine user category'
      };
    }
  }

  /**
   * Download a poster
   */
  async downloadPoster(posterId: string): Promise<{ success: boolean; message: string; downloadUrl?: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Track the download
      const downloadResponse = await api.post('/api/mobile/downloads/track', {
        mobileUserId: userId,
        resourceId: posterId,
        resourceType: 'POSTER',
        fileUrl: `https://example.com/posters/${posterId}.jpg`
      });

      if (downloadResponse.data.success) {
        console.log('✅ Poster download tracked successfully:', posterId);
        return { 
          success: true, 
          message: 'Poster download tracked successfully',
          downloadUrl: `https://example.com/posters/${posterId}.jpg`
        };
      } else {
        throw new Error(downloadResponse.data.error || 'Failed to track download');
      }
    } catch (error: any) {
      console.error('❌ Error downloading poster:', error);
      return { success: false, message: error.message || 'Failed to download poster' };
    }
  }

  /**
   * Get mock posters for different business categories
   */
  // Mock data method removed - using only API data

  /**
   * Clear cache
   */
  clearCache(): void {
    this.postersCache.clear();
    console.log('🗑️ Business category posters cache cleared');
  }
}

export default new BusinessCategoryPostersApiService();
