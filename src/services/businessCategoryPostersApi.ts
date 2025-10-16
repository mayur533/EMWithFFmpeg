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
      const response = await api.get(`/api/mobile/posters/category/${encodeURIComponent(category)}`);
      
      if (response.data.success) {
        const posters = response.data.data.posters;
        
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
      console.log('📡 [USER CATEGORY POSTERS] Fetching...');
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ [USER CATEGORY POSTERS] No user ID, using General category');
        return this.getPostersByCategory('General');
      }

      // Get user's business profiles to determine category
      const businessProfileService = (await import('./businessProfile')).default;
      const userProfiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      if (userProfiles.length > 0) {
        const primaryCategory = userProfiles[0].category;
        console.log(`✅ [USER CATEGORY POSTERS] Using category: ${primaryCategory}`);
        return this.getPostersByCategory(primaryCategory);
      } else {
        console.log('⚠️ [USER CATEGORY POSTERS] No profiles, using General category');
        return this.getPostersByCategory('General');
      }
    } catch (error) {
      console.error('❌ [USER CATEGORY POSTERS] Error:', error);
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
