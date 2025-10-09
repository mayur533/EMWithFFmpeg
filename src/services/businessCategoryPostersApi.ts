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
  likes: number;
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
        console.log('💾 [CACHE CHECK] Cache exists for:', category);
        console.log('💾 [CACHE CHECK] Cache age (ms):', cacheAge);
        console.log('💾 [CACHE CHECK] Cache duration (ms):', this.CACHE_DURATION);
        console.log('💾 [CACHE CHECK] Is valid:', cacheAge < this.CACHE_DURATION);
        console.log('💾 [CACHE CHECK] Cached posters count:', cached.data.length);
        
        if (cacheAge < this.CACHE_DURATION) {
          console.log('✅ [CACHE HIT] Returning cached posters');
          if (cached.data.length > 0) {
            console.log('📸 [CACHE] First cached poster thumbnail:', cached.data[0]?.thumbnail);
            console.log('📸 [CACHE] First cached poster full:', JSON.stringify(cached.data[0], null, 2));
          }
          return {
            success: true,
            data: {
              posters: cached.data,
              category,
              total: cached.data.length
            },
            message: 'Posters fetched from cache'
          };
        } else {
          console.log('⏰ [CACHE EXPIRED] Cache too old, fetching fresh data');
        }
      } else {
        console.log('❌ [CACHE MISS] No cache for category:', category);
      }

      console.log('📡 [CATEGORY POSTERS API] Calling: /api/mobile/posters/category/' + category);
      const response = await api.get(`/api/mobile/posters/category/${encodeURIComponent(category)}`);
      
      console.log('✅ [CATEGORY POSTERS API] Response received');
      console.log('📊 [CATEGORY POSTERS API] Full Response:', JSON.stringify(response.data, null, 2));
      console.log('📊 [CATEGORY POSTERS API] Success:', response.data.success);
      console.log('📊 [CATEGORY POSTERS API] Category:', category);
      
      if (response.data.success) {
        const posters = response.data.data.posters;
        console.log('📊 [CATEGORY POSTERS API] Posters count:', posters.length);
        
        if (posters.length > 0) {
          console.log('📊 [CATEGORY POSTERS API] First poster:', JSON.stringify(posters[0], null, 2));
        }
        
        // Convert backend response to frontend format and fix URLs
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
            likes: poster.likes || 0,
            downloads: poster.downloads || 0,
            isPremium: poster.isPremium || false,
            tags: poster.tags || [],
            createdAt: poster.createdAt,
            updatedAt: poster.updatedAt || poster.createdAt,
          } as BusinessCategoryPoster;
        });
        
        console.log('🔧 [CATEGORY POSTERS API] Converted relative paths to absolute URLs');
        if (postersWithAbsoluteUrls.length > 0) {
          console.log('📸 [CATEGORY POSTERS API] First converted poster:', JSON.stringify(postersWithAbsoluteUrls[0], null, 2));
          console.log('📸 [CATEGORY POSTERS API] Thumbnail URL:', postersWithAbsoluteUrls[0]?.thumbnail);
          console.log('📸 [CATEGORY POSTERS API] Image URL:', postersWithAbsoluteUrls[0]?.imageUrl);
        }
        
        // Cache the results with absolute URLs
        this.postersCache.set(cacheKey, {
          data: postersWithAbsoluteUrls,
          timestamp: now
        });
        
        console.log('✅ [CATEGORY POSTERS API] Posters fetched and cached:', postersWithAbsoluteUrls.length);
        return {
          ...response.data,
          data: {
            ...response.data.data,
            posters: postersWithAbsoluteUrls
          }
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch posters');
      }
    } catch (error: any) {
      console.error('❌ [CATEGORY POSTERS API] Error:', error);
      console.error('❌ [CATEGORY POSTERS API] Error details:', JSON.stringify(error, null, 2));
      
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
   * Get user's business category and fetch relevant posters
   */
  async getUserCategoryPosters(): Promise<BusinessCategoryPostersResponse> {
    try {
      console.log('🎯 [getUserCategoryPosters] Starting...');
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      console.log('🎯 [getUserCategoryPosters] User ID:', userId);
      
      if (!userId) {
        console.log('🎯 [getUserCategoryPosters] No user ID, using General category');
        return this.getPostersByCategory('General');
      }

      // Get user's business profiles to determine category
      console.log('🎯 [getUserCategoryPosters] Fetching business profiles...');
      const businessProfileService = (await import('./businessProfile')).default;
      const userProfiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      console.log('🎯 [getUserCategoryPosters] Profiles found:', userProfiles.length);
      
      if (userProfiles.length > 0) {
        const primaryCategory = userProfiles[0].category;
        console.log('🎯 [getUserCategoryPosters] Primary category:', primaryCategory);
        console.log('🎯 [getUserCategoryPosters] Calling getPostersByCategory...');
        return this.getPostersByCategory(primaryCategory);
      } else {
        console.log('🎯 [getUserCategoryPosters] No profiles, using General category');
        return this.getPostersByCategory('General');
      }
    } catch (error) {
      console.error('❌ Error getting user category posters:', error);
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
   * Like a poster
   */
  async likePoster(posterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.post(`/api/mobile/likes`, {
        resourceType: 'POSTER',
        resourceId: posterId,
        mobileUserId: userId
      });

      if (response.data.success) {
        console.log('✅ Poster liked successfully:', posterId);
        return { success: true, message: 'Poster liked successfully' };
      } else {
        throw new Error(response.data.error || 'Failed to like poster');
      }
    } catch (error: any) {
      console.error('❌ Error liking poster:', error);
      return { success: false, message: error.message || 'Failed to like poster' };
    }
  }

  /**
   * Unlike a poster
   */
  async unlikePoster(posterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.delete(`/api/mobile/likes`, {
        data: {
          resourceType: 'POSTER',
          resourceId: posterId,
          mobileUserId: userId
        }
      });

      if (response.data.success) {
        console.log('✅ Poster unliked successfully:', posterId);
        return { success: true, message: 'Poster unliked successfully' };
      } else {
        throw new Error(response.data.error || 'Failed to unlike poster');
      }
    } catch (error: any) {
      console.error('❌ Error unliking poster:', error);
      return { success: false, message: error.message || 'Failed to unlike poster' };
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
